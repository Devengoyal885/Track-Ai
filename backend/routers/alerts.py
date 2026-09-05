"""Alert API routes."""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.alert import Alert
from ..schemas import AlertOut, AlertStatusUpdate

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(
    status: Optional[str] = Query(None),
    alert_type: Optional[str] = Query(None, alias="type"),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    """Get alerts with optional filters."""
    query = db.query(Alert)

    if status:
        query = query.filter(Alert.status == status)
    if alert_type:
        query = query.filter(Alert.type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.timestamp.desc()).offset(offset).limit(limit).all()

    result = []
    for a in alerts:
        camera_name = a.camera.name if a.camera else None
        result.append(
            AlertOut(
                id=a.id,
                type=a.type,
                severity=a.severity,
                status=a.status,
                title=a.title,
                description=a.description,
                plate_number=a.plate_number,
                camera_id=a.camera_id,
                vehicle_id=a.vehicle_id,
                latitude=a.latitude,
                longitude=a.longitude,
                timestamp=a.timestamp,
                camera_name=camera_name,
            )
        )
    return result


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(
    alert_id: int,
    body: AlertStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update the status of an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if body.status not in ("new", "reviewed", "resolved"):
        raise HTTPException(status_code=400, detail="Invalid status")

    alert.status = body.status
    db.commit()
    db.refresh(alert)

    camera_name = alert.camera.name if alert.camera else None
    return AlertOut(
        id=alert.id,
        type=alert.type,
        severity=alert.severity,
        status=alert.status,
        title=alert.title,
        description=alert.description,
        plate_number=alert.plate_number,
        camera_id=alert.camera_id,
        vehicle_id=alert.vehicle_id,
        latitude=alert.latitude,
        longitude=alert.longitude,
        timestamp=alert.timestamp,
        camera_name=camera_name,
    )
