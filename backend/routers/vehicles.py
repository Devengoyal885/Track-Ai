"""Vehicle API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models.vehicle import Vehicle
from ..models.detection import Detection
from ..schemas import VehicleOut, VehicleSearch, DetectionOut

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("/search", response_model=List[VehicleSearch])
def search_vehicles(
    q: str = Query("", min_length=0),
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """Search vehicles by plate number substring."""
    query = db.query(
        Vehicle,
        func.count(Detection.id).label("detection_count"),
    ).outerjoin(Detection).group_by(Vehicle.id)

    if q:
        query = query.filter(Vehicle.plate_number.ilike(f"%{q}%"))

    results = query.order_by(Vehicle.last_seen_at.desc()).limit(limit).all()

    return [
        VehicleSearch(
            id=v.id,
            plate_number=v.plate_number,
            vehicle_type=v.vehicle_type,
            detection_count=count,
        )
        for v, count in results
    ]


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get vehicle details by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.get("/{vehicle_id}/trajectory", response_model=List[DetectionOut])
def get_trajectory(vehicle_id: int, db: Session = Depends(get_db)):
    """Get all detections for a vehicle, ordered by timestamp (trajectory)."""
    detections = (
        db.query(Detection)
        .filter(Detection.vehicle_id == vehicle_id)
        .order_by(Detection.timestamp.asc())
        .all()
    )

    result = []
    for d in detections:
        camera_name = d.camera.name if d.camera else None
        camera_location = d.camera.location_name if d.camera else None
        result.append(
            DetectionOut(
                id=d.id,
                vehicle_id=d.vehicle_id,
                camera_id=d.camera_id,
                plate_number=d.plate_number,
                timestamp=d.timestamp,
                latitude=d.latitude,
                longitude=d.longitude,
                speed_kmh=d.speed_kmh,
                confidence=d.confidence,
                vehicle_type=d.vehicle_type,
                camera_name=camera_name,
                camera_location=camera_location,
            )
        )
    return result
