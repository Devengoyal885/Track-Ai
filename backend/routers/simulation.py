"""
Simulation API routes — control simulation state, speed, spawn vehicles, and trigger alerts.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from ..simulation.engine import simulation_engine
from ..simulation.routes import ROUTES

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


class SpawnVehicleRequest(BaseModel):
    plate_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    is_blacklisted: bool = False
    blacklist_reason: Optional[str] = None
    route_key: Optional[str] = None


class SpeedRequest(BaseModel):
    speed_multiplier: float


class TriggerAlertRequest(BaseModel):
    type: str = "blacklist_hit"
    severity: str = "critical"
    title: str = "Operator Alert"
    description: str = "Triggered from TrackAI mission control"
    plate_number: Optional[str] = None


@router.get("/status")
def get_simulation_status():
    """Get the current simulation engine status and vehicle count."""
    return {
        "is_running": simulation_engine.is_running,
        "speed_multiplier": simulation_engine.speed_multiplier,
        "active_vehicle_count": len(simulation_engine.vehicles),
        "available_routes": list(ROUTES.keys()),
    }


@router.post("/start")
async def start_simulation():
    """Start or resume the simulation."""
    await simulation_engine.resume()
    return {"status": "started", "is_running": True}


@router.post("/pause")
async def pause_simulation():
    """Pause the simulation."""
    await simulation_engine.pause()
    return {"status": "paused", "is_running": False}


@router.post("/speed")
def set_speed(body: SpeedRequest):
    """Set simulation speed multiplier (0.5 to 5.0)."""
    simulation_engine.set_speed(body.speed_multiplier)
    return {"status": "ok", "speed_multiplier": simulation_engine.speed_multiplier}


@router.post("/spawn")
def spawn_vehicle(body: SpawnVehicleRequest):
    """Spawn a custom vehicle into the live simulation."""
    vehicle = simulation_engine.spawn_vehicle(
        plate_number=body.plate_number,
        vehicle_type=body.vehicle_type,
        is_blacklisted=body.is_blacklisted,
        blacklist_reason=body.blacklist_reason,
        route_key=body.route_key,
    )
    return {"status": "spawned", "vehicle": vehicle}


@router.post("/trigger-alert")
async def trigger_alert(body: TriggerAlertRequest):
    """Trigger an emergency alert immediately."""
    alert = await simulation_engine.trigger_custom_alert(
        alert_type=body.type,
        severity=body.severity,
        title=body.title,
        description=body.description,
        plate_number=body.plate_number,
    )
    return {"status": "alert_triggered", "alert": alert}


@router.post("/reset")
async def reset_simulation():
    """Reset simulated vehicles to starting positions."""
    await simulation_engine.reset()
    return {"status": "reset", "active_vehicle_count": len(simulation_engine.vehicles)}
