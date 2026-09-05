"""
TrackAI — Real-Time Simulation Engine

Simulates realistic city-wide vehicle movement across Delhi road corridors.
Handles camera detection triggers, DB persistence, speed violation & blacklist alerts,
and real-time Socket.IO event broadcasting.
"""

import asyncio
import math
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional

from ..database import SessionLocal
from ..models import Camera, Vehicle, Detection, Alert, Zone
from ..models.alert import AlertSeverity, AlertType, AlertStatus
from .routes import ROUTES, interpolate_position
from .plates import (
    generate_plate,
    generate_vehicle_type,
    generate_vehicle_color,
    BLACKLISTED_PLATES,
    BLACKLIST_REASONS,
)


class SimulatedVehicle:
    """Represents an active vehicle moving along a Delhi corridor."""

    def __init__(
        self,
        sim_id: int,
        plate_number: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        color: Optional[str] = None,
        is_blacklisted: bool = False,
        blacklist_reason: Optional[str] = None,
        route_key: Optional[str] = None,
    ):
        self.sim_id = sim_id
        self.is_blacklisted = is_blacklisted

        if is_blacklisted:
            self.plate_number = plate_number or random.choice(BLACKLISTED_PLATES)
            self.blacklist_reason = blacklist_reason or random.choice(BLACKLIST_REASONS)
        else:
            self.plate_number = plate_number or generate_plate()
            self.blacklist_reason = None

        self.vehicle_type = vehicle_type or generate_vehicle_type()
        self.color = color or generate_vehicle_color()

        # Route setup
        self.route_key = route_key or random.choice(list(ROUTES.keys()))
        self.progress = random.uniform(0.0, 0.8)  # Start somewhere along route
        self.speed_kmh = random.uniform(35.0, 75.0) if not is_blacklisted else random.uniform(55.0, 95.0)
        self.base_speed = self.speed_kmh

        # Position & motion
        route = ROUTES[self.route_key]
        self.lat, self.lng = interpolate_position(route["waypoints"], self.progress)
        self.prev_lat, self.prev_lng = self.lat, self.lng
        self.heading = 0.0
        self.last_detected_camera_id: Optional[int] = None
        self.last_detection_time: float = 0.0

    def update_position(self, dt_seconds: float, speed_multiplier: float):
        """Move vehicle along its route based on speed and time delta."""
        # Add slight natural speed variance
        self.speed_kmh = max(20.0, min(110.0, self.base_speed + random.uniform(-4.0, 4.0)))

        # Approximate progression rate (speed in km/h -> route progress fraction)
        # Average route is ~6 km. At 60 km/h, 6 km takes 6 minutes = 360s -> progress delta per sec = 1/360
        route_dist_km = 6.0
        progress_delta = (self.speed_kmh / 3600.0 / route_dist_km) * dt_seconds * speed_multiplier

        self.progress += progress_delta
        if self.progress >= 1.0:
            # Reached route end: either reverse or pick a new connecting route
            self.progress = 0.0
            self.route_key = random.choice(list(ROUTES.keys()))
            self.last_detected_camera_id = None

        route = ROUTES[self.route_key]
        new_lat, new_lng = interpolate_position(route["waypoints"], self.progress)

        # Compute heading angle in degrees (0 = North, 90 = East)
        d_lat = new_lat - self.lat
        d_lng = new_lng - self.lng
        if abs(d_lat) > 1e-6 or abs(d_lng) > 1e-6:
            angle = math.degrees(math.atan2(d_lng, d_lat))
            self.heading = (angle + 360) % 360

        self.prev_lat, self.prev_lng = self.lat, self.lng
        self.lat, self.lng = new_lat, new_lng

    def to_dict(self) -> dict:
        return {
            "id": self.sim_id,
            "plate_number": self.plate_number,
            "vehicle_type": self.vehicle_type,
            "color": self.color,
            "is_blacklisted": self.is_blacklisted,
            "blacklist_reason": self.blacklist_reason,
            "route_key": self.route_key,
            "route_name": ROUTES.get(self.route_key, {}).get("name", "Delhi Corridor"),
            "latitude": round(self.lat, 6),
            "longitude": round(self.lng, 6),
            "speed_kmh": round(self.speed_kmh, 1),
            "heading": round(self.heading, 1),
            "progress": round(self.progress, 3),
        }


class SimulationEngine:
    """Coordinates active simulated vehicles, camera detection checks, and Socket.IO emission."""

    def __init__(self):
        self.is_running: bool = True
        self.speed_multiplier: float = 1.0
        self.interval_seconds: float = 1.5
        self.vehicle_count: int = 18
        self.vehicles: Dict[int, SimulatedVehicle] = {}
        self.sio = None  # Set by main.py
        self._task: Optional[asyncio.Task] = None
        self._next_vehicle_id: int = 1

    def set_socketio(self, sio_instance):
        self.sio = sio_instance

    def initialize_vehicles(self):
        """Populate initial vehicle fleet with a mix of clean and flagged vehicles."""
        self.vehicles.clear()
        self._next_vehicle_id = 1

        # Spawn regular vehicles
        for _ in range(self.vehicle_count - 3):
            v = SimulatedVehicle(sim_id=self._next_vehicle_id, is_blacklisted=False)
            self.vehicles[v.sim_id] = v
            self._next_vehicle_id += 1

        # Spawn 3 blacklisted suspect vehicles for testing alert response
        for i in range(3):
            plate = BLACKLISTED_PLATES[i % len(BLACKLISTED_PLATES)]
            reason = BLACKLIST_REASONS[i % len(BLACKLIST_REASONS)]
            v = SimulatedVehicle(
                sim_id=self._next_vehicle_id,
                plate_number=plate,
                is_blacklisted=True,
                blacklist_reason=reason,
            )
            self.vehicles[v.sim_id] = v
            self._next_vehicle_id += 1

    def spawn_vehicle(
        self,
        plate_number: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        is_blacklisted: bool = False,
        blacklist_reason: Optional[str] = None,
        route_key: Optional[str] = None,
    ) -> dict:
        """Spawn a new custom vehicle dynamically into the live simulation."""
        v = SimulatedVehicle(
            sim_id=self._next_vehicle_id,
            plate_number=plate_number,
            vehicle_type=vehicle_type,
            is_blacklisted=is_blacklisted,
            blacklist_reason=blacklist_reason,
            route_key=route_key,
        )
        self.vehicles[v.sim_id] = v
        self._next_vehicle_id += 1
        return v.to_dict()

    async def start(self):
        """Start the background simulation loop."""
        if self._task and not self._task.done():
            return
        if not self.vehicles:
            self.initialize_vehicles()
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        print("[SimulationEngine] Started simulation loop.")

    async def pause(self):
        """Pause simulation execution."""
        self.is_running = False
        print("[SimulationEngine] Simulation paused.")

    async def resume(self):
        """Resume simulation execution."""
        self.is_running = True
        print("[SimulationEngine] Simulation resumed.")

    def set_speed(self, multiplier: float):
        """Set simulation speed multiplier (e.g. 0.5x, 1.0x, 2.0x, 5.0x)."""
        self.speed_multiplier = max(0.2, min(10.0, multiplier))

    async def reset(self):
        """Reset vehicles to fresh starting locations."""
        self.initialize_vehicles()

    async def trigger_custom_alert(
        self,
        alert_type: str = "blacklist_hit",
        severity: str = "critical",
        title: str = "Manual Incident Alert",
        description: str = "Triggered by operator from Command Center",
        plate_number: Optional[str] = None,
    ) -> dict:
        """Manually trigger an incident alert and broadcast it immediately."""
        db = SessionLocal()
        try:
            cameras = db.query(Camera).filter(Camera.is_online == True).all()
            camera = random.choice(cameras) if cameras else None
            plate = plate_number or random.choice(BLACKLISTED_PLATES)

            vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate).first()
            if not vehicle:
                vehicle = Vehicle(
                    plate_number=plate,
                    vehicle_type="car",
                    color="Black",
                    is_blacklisted=(severity in ("high", "critical")),
                    blacklist_reason=description if severity in ("high", "critical") else None,
                )
                db.add(vehicle)
                db.commit()
                db.refresh(vehicle)

            alert = Alert(
                type=alert_type,
                severity=severity,
                status=AlertStatus.NEW.value,
                title=title,
                description=description,
                plate_number=plate,
                camera_id=camera.id if camera else None,
                vehicle_id=vehicle.id if vehicle else None,
                latitude=camera.latitude if camera else 28.6129,
                longitude=camera.longitude if camera else 77.2295,
                timestamp=datetime.now(timezone.utc),
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)

            alert_dict = {
                "id": alert.id,
                "type": alert.type,
                "severity": alert.severity,
                "status": alert.status,
                "title": alert.title,
                "description": alert.description,
                "plate_number": alert.plate_number,
                "camera_id": alert.camera_id,
                "camera_name": camera.name if camera else "CAM-HQ-01",
                "latitude": alert.latitude,
                "longitude": alert.longitude,
                "timestamp": alert.timestamp.isoformat(),
            }

            if self.sio:
                await self.sio.emit("alert_new", alert_dict)

            return alert_dict
        finally:
            db.close()

    async def _run_loop(self):
        """Main periodic simulation loop."""
        while True:
            try:
                if self.is_running and self.vehicles:
                    await self._step()
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[SimulationEngine] Loop error: {e}")
                await asyncio.sleep(2.0)

    async def _step(self):
        """Advance one simulation tick, perform detection & alert checks, and broadcast updates."""
        dt = self.interval_seconds
        # 1. Update vehicle positions
        for v in self.vehicles.values():
            v.update_position(dt, self.speed_multiplier)

        # 2. Check camera proximities and record detections in DB
        db = SessionLocal()
        new_detections = []
        new_alerts = []

        try:
            cameras = db.query(Camera).filter(Camera.is_online == True).all()

            for v in self.vehicles.values():
                for cam in cameras:
                    # Euclidean distance approximation in degrees (~0.004 deg ~= 400m detection radius)
                    dist = math.sqrt((cam.latitude - v.lat) ** 2 + (cam.longitude - v.lng) ** 2)
                    if dist <= 0.005:  # Within detection zone
                        # Avoid repeating detection if vehicle was just detected at this camera
                        if v.last_detected_camera_id != cam.id:
                            v.last_detected_camera_id = cam.id

                            # Get or create vehicle record
                            db_v = db.query(Vehicle).filter(Vehicle.plate_number == v.plate_number).first()
                            now = datetime.now(timezone.utc)
                            if not db_v:
                                db_v = Vehicle(
                                    plate_number=v.plate_number,
                                    vehicle_type=v.vehicle_type,
                                    color=v.color,
                                    is_blacklisted=v.is_blacklisted,
                                    blacklist_reason=v.blacklist_reason,
                                    first_seen_at=now,
                                    last_seen_at=now,
                                )
                                db.add(db_v)
                                db.flush()
                            else:
                                db_v.last_seen_at = now
                                if v.is_blacklisted and not db_v.is_blacklisted:
                                    db_v.is_blacklisted = True
                                    db_v.blacklist_reason = v.blacklist_reason

                            # Create Detection record
                            confidence = round(random.uniform(0.92, 0.99), 3)
                            detection = Detection(
                                vehicle_id=db_v.id,
                                camera_id=cam.id,
                                plate_number=v.plate_number,
                                timestamp=now,
                                latitude=v.lat,
                                longitude=v.lng,
                                speed_kmh=round(v.speed_kmh, 1),
                                confidence=confidence,
                                vehicle_type=v.vehicle_type,
                            )
                            db.add(detection)
                            cam.last_detection_at = now
                            db.flush()

                            det_payload = {
                                "id": detection.id,
                                "vehicle_id": db_v.id,
                                "camera_id": cam.id,
                                "camera_name": cam.name,
                                "camera_location": cam.location_name,
                                "plate_number": v.plate_number,
                                "timestamp": now.isoformat(),
                                "latitude": round(v.lat, 6),
                                "longitude": round(v.lng, 6),
                                "speed_kmh": round(v.speed_kmh, 1),
                                "confidence": confidence,
                                "vehicle_type": v.vehicle_type,
                                "color": v.color,
                                "is_blacklisted": v.is_blacklisted,
                            }
                            new_detections.append(det_payload)

                            # Check for alert conditions
                            if v.is_blacklisted:
                                alert = Alert(
                                    type=AlertType.BLACKLIST_HIT.value,
                                    severity=AlertSeverity.CRITICAL.value,
                                    status=AlertStatus.NEW.value,
                                    title=f"Blacklisted Vehicle Sighted: {v.plate_number}",
                                    description=f"Wanted vehicle ({v.color} {v.vehicle_type}) captured at {cam.name} ({cam.location_name}). Reason: {v.blacklist_reason or 'Law enforcement flag'}",
                                    plate_number=v.plate_number,
                                    camera_id=cam.id,
                                    vehicle_id=db_v.id,
                                    latitude=v.lat,
                                    longitude=v.lng,
                                    timestamp=now,
                                )
                                db.add(alert)
                                db.flush()
                                new_alerts.append({
                                    "id": alert.id,
                                    "type": alert.type,
                                    "severity": alert.severity,
                                    "status": alert.status,
                                    "title": alert.title,
                                    "description": alert.description,
                                    "plate_number": alert.plate_number,
                                    "camera_id": alert.camera_id,
                                    "camera_name": cam.name,
                                    "latitude": alert.latitude,
                                    "longitude": alert.longitude,
                                    "timestamp": alert.timestamp.isoformat(),
                                })
                            elif v.speed_kmh >= 82.0:
                                alert = Alert(
                                    type=AlertType.SPEEDING.value,
                                    severity=AlertSeverity.HIGH.value,
                                    status=AlertStatus.NEW.value,
                                    title=f"High Speed Violation: {int(v.speed_kmh)} km/h",
                                    description=f"Vehicle {v.plate_number} clocked at {round(v.speed_kmh, 1)} km/h exceeding 70 km/h corridor speed limit at {cam.name}.",
                                    plate_number=v.plate_number,
                                    camera_id=cam.id,
                                    vehicle_id=db_v.id,
                                    latitude=v.lat,
                                    longitude=v.lng,
                                    timestamp=now,
                                )
                                db.add(alert)
                                db.flush()
                                new_alerts.append({
                                    "id": alert.id,
                                    "type": alert.type,
                                    "severity": alert.severity,
                                    "status": alert.status,
                                    "title": alert.title,
                                    "description": alert.description,
                                    "plate_number": alert.plate_number,
                                    "camera_id": alert.camera_id,
                                    "camera_name": cam.name,
                                    "latitude": alert.latitude,
                                    "longitude": alert.longitude,
                                    "timestamp": alert.timestamp.isoformat(),
                                })

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[SimulationEngine] DB error during step: {e}")
        finally:
            db.close()

        # 3. Socket.IO Broadcasts
        if self.sio:
            # Emit live vehicle positions for map animation
            vehicle_list = [v.to_dict() for v in self.vehicles.values()]
            await self.sio.emit("simulation_tick", {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "speed_multiplier": self.speed_multiplier,
                "is_running": self.is_running,
                "vehicles": vehicle_list,
                "active_vehicle_count": len(vehicle_list),
            })

            # Emit new detections as telemetry stream
            for det in new_detections:
                await self.sio.emit("telemetry", det)
                await self.sio.emit("detection_new", det)

            # Emit new alerts
            for alt in new_alerts:
                await self.sio.emit("alert_new", alt)


# Global singleton instance
simulation_engine = SimulationEngine()
