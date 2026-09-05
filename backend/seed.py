"""Seed the database with Delhi camera locations, zones, sample vehicles, detections, and alerts."""

import random
from datetime import datetime, timezone, timedelta
from .database import SessionLocal, init_db
from .models import Camera, Zone, Vehicle, Detection, Alert
from .models.alert import AlertSeverity, AlertType, AlertStatus
from .simulation.plates import (
    generate_plate,
    generate_vehicle_type,
    generate_vehicle_color,
    BLACKLISTED_PLATES,
    BLACKLIST_REASONS,
)

ZONES = [
    {"name": "Central Delhi", "description": "Connaught Place & surroundings", "center_lat": 28.6315, "center_lng": 77.2167, "congestion_level": 72, "color": "#EF4444"},
    {"name": "New Delhi", "description": "India Gate, Rajpath, Government area", "center_lat": 28.6129, "center_lng": 77.2295, "congestion_level": 55, "color": "#F59E0B"},
    {"name": "South Delhi", "description": "Hauz Khas, Saket, AIIMS area", "center_lat": 28.5494, "center_lng": 77.2001, "congestion_level": 48, "color": "#38BDF8"},
    {"name": "East Delhi", "description": "ITO, Pragati Maidan, Akshardham", "center_lat": 28.6280, "center_lng": 77.2550, "congestion_level": 65, "color": "#818CF8"},
    {"name": "North Delhi", "description": "Kashmere Gate, Civil Lines", "center_lat": 28.6692, "center_lng": 77.2260, "congestion_level": 40, "color": "#10B981"},
    {"name": "West Delhi", "description": "Rajouri Garden, Janakpuri", "center_lat": 28.6493, "center_lng": 77.1215, "congestion_level": 35, "color": "#06B6D4"},
]

CAMERAS = [
    # Central Delhi
    {"name": "CAM-CP-01", "location_name": "Connaught Place Inner Circle", "latitude": 28.6315, "longitude": 77.2167, "zone_idx": 0, "camera_type": "ANPR"},
    {"name": "CAM-CP-02", "location_name": "Barakhamba Road Junction", "latitude": 28.6330, "longitude": 77.2250, "zone_idx": 0, "camera_type": "ANPR"},
    {"name": "CAM-CP-03", "location_name": "Minto Road Crossing", "latitude": 28.6355, "longitude": 77.2310, "zone_idx": 0, "camera_type": "CCTV"},
    # New Delhi
    {"name": "CAM-IG-01", "location_name": "India Gate Roundabout", "latitude": 28.6129, "longitude": 77.2295, "zone_idx": 1, "camera_type": "ANPR"},
    {"name": "CAM-RP-01", "location_name": "Kartavya Path (Rajpath)", "latitude": 28.6145, "longitude": 77.2090, "zone_idx": 1, "camera_type": "Speed"},
    {"name": "CAM-ND-01", "location_name": "Janpath - Tolstoy Marg Junction", "latitude": 28.6250, "longitude": 77.2180, "zone_idx": 1, "camera_type": "ANPR"},
    # South Delhi
    {"name": "CAM-HK-01", "location_name": "Hauz Khas Village Entrance", "latitude": 28.5494, "longitude": 77.2001, "zone_idx": 2, "camera_type": "CCTV"},
    {"name": "CAM-AI-01", "location_name": "AIIMS Flyover", "latitude": 28.5672, "longitude": 77.2100, "zone_idx": 2, "camera_type": "ANPR"},
    {"name": "CAM-SK-01", "location_name": "Saket Metro Station", "latitude": 28.5237, "longitude": 77.2139, "zone_idx": 2, "camera_type": "ANPR"},
    # East Delhi
    {"name": "CAM-ITO-01", "location_name": "ITO Crossing", "latitude": 28.6280, "longitude": 77.2450, "zone_idx": 3, "camera_type": "ANPR"},
    {"name": "CAM-PM-01", "location_name": "Pragati Maidan Gate", "latitude": 28.6170, "longitude": 77.2490, "zone_idx": 3, "camera_type": "Speed"},
    {"name": "CAM-AD-01", "location_name": "Akshardham Temple Road", "latitude": 28.6127, "longitude": 77.2773, "zone_idx": 3, "camera_type": "CCTV"},
    # North Delhi
    {"name": "CAM-KG-01", "location_name": "Kashmere Gate ISBT", "latitude": 28.6692, "longitude": 77.2260, "zone_idx": 4, "camera_type": "ANPR"},
    {"name": "CAM-CL-01", "location_name": "Civil Lines Main Road", "latitude": 28.6810, "longitude": 77.2210, "zone_idx": 4, "camera_type": "ANPR"},
    # West Delhi
    {"name": "CAM-RG-01", "location_name": "Rajouri Garden Metro", "latitude": 28.6493, "longitude": 77.1215, "zone_idx": 5, "camera_type": "ANPR"},
]


def seed_database():
    """Seed zones, cameras, and rich historical data into the database."""
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_zones = db.query(Zone).count()
        if existing_zones > 0:
            print("Database already seeded.")
            return

        # Create zones
        zone_objects = []
        for z_data in ZONES:
            zone = Zone(**z_data)
            db.add(zone)
            zone_objects.append(zone)
        db.flush()

        # Create cameras
        camera_objects = []
        now = datetime.now(timezone.utc)
        for c_data in CAMERAS:
            c_copy = dict(c_data)
            zone_idx = c_copy.pop("zone_idx")
            camera = Camera(
                **c_copy,
                zone_id=zone_objects[zone_idx].id,
                is_online=True,
                installed_at=now - timedelta(days=90),
                last_detection_at=now,
            )
            db.add(camera)
            camera_objects.append(camera)
        db.flush()

        # Create sample vehicles
        sample_vehicles = []
        # Flagged vehicles
        for i, plate in enumerate(BLACKLISTED_PLATES):
            v = Vehicle(
                plate_number=plate,
                vehicle_type="car",
                color=generate_vehicle_color(),
                is_blacklisted=True,
                blacklist_reason=BLACKLIST_REASONS[i % len(BLACKLIST_REASONS)],
                first_seen_at=now - timedelta(days=random.randint(5, 20)),
                last_seen_at=now - timedelta(minutes=random.randint(5, 60)),
            )
            db.add(v)
            sample_vehicles.append(v)

        # Regular vehicles
        for _ in range(25):
            v = Vehicle(
                plate_number=generate_plate(),
                vehicle_type=generate_vehicle_type(),
                color=generate_vehicle_color(),
                is_blacklisted=False,
                first_seen_at=now - timedelta(days=random.randint(1, 15)),
                last_seen_at=now - timedelta(minutes=random.randint(2, 120)),
            )
            db.add(v)
            sample_vehicles.append(v)
        db.flush()

        # Create realistic historical detections over last 24 hours
        for v in sample_vehicles:
            num_sightings = random.randint(3, 8)
            t = now - timedelta(hours=random.randint(2, 22))
            for _ in range(num_sightings):
                cam = random.choice(camera_objects)
                t += timedelta(minutes=random.randint(8, 25))
                if t > now:
                    break
                det = Detection(
                    vehicle_id=v.id,
                    camera_id=cam.id,
                    plate_number=v.plate_number,
                    timestamp=t,
                    latitude=cam.latitude + random.uniform(-0.001, 0.001),
                    longitude=cam.longitude + random.uniform(-0.001, 0.001),
                    speed_kmh=round(random.uniform(35.0, 78.0), 1),
                    confidence=round(random.uniform(0.93, 0.99), 3),
                    vehicle_type=v.vehicle_type,
                )
                db.add(det)

        # Create sample alerts
        for v in sample_vehicles[:3]:  # Blacklisted hits
            cam = random.choice(camera_objects)
            alert = Alert(
                type=AlertType.BLACKLIST_HIT.value,
                severity=AlertSeverity.CRITICAL.value,
                status=random.choice([AlertStatus.NEW.value, AlertStatus.REVIEWED.value]),
                title=f"Blacklisted Vehicle Detected: {v.plate_number}",
                description=f"Wanted vehicle sighted at {cam.name} ({cam.location_name}). Reason: {v.blacklist_reason}",
                plate_number=v.plate_number,
                camera_id=cam.id,
                vehicle_id=v.id,
                latitude=cam.latitude,
                longitude=cam.longitude,
                timestamp=now - timedelta(minutes=random.randint(10, 180)),
            )
            db.add(alert)

        # Speeding alerts
        for _ in range(4):
            v = random.choice(sample_vehicles[3:])
            cam = random.choice(camera_objects)
            speed = random.randint(82, 98)
            alert = Alert(
                type=AlertType.SPEEDING.value,
                severity=AlertSeverity.HIGH.value,
                status=random.choice([AlertStatus.NEW.value, AlertStatus.REVIEWED.value]),
                title=f"Speed Violation Clocked: {speed} km/h",
                description=f"Vehicle {v.plate_number} exceeded speed limit (70 km/h) at {cam.name}.",
                plate_number=v.plate_number,
                camera_id=cam.id,
                vehicle_id=v.id,
                latitude=cam.latitude,
                longitude=cam.longitude,
                timestamp=now - timedelta(minutes=random.randint(30, 360)),
            )
            db.add(alert)

        db.commit()
        print(f"[OK] Seeded {len(ZONES)} zones, {len(CAMERAS)} cameras, {len(sample_vehicles)} vehicles, detections, and alerts.")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()
