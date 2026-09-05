"""Detection API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta

from ..database import get_db
from ..models.detection import Detection
from ..schemas import DetectionOut

router = APIRouter(prefix="/api/detections", tags=["detections"])


@router.get("/recent", response_model=List[DetectionOut])
def get_recent_detections(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """Get the most recent detections across all cameras."""
    detections = (
        db.query(Detection)
        .order_by(Detection.timestamp.desc())
        .limit(limit)
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
