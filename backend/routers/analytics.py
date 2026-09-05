"""Analytics API routes — pre-computed stats for charts."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import List
from datetime import datetime, timezone, timedelta

from ..database import get_db
from ..models.detection import Detection
from ..models.alert import Alert
from ..models.vehicle import Vehicle
from ..models.camera import Camera
from ..models.zone import Zone
from ..schemas import (
    StatsOut,
    TrafficFlowPoint,
    CongestionData,
    BusiestRoute,
    IncidentPoint,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    """Get current dashboard stats."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    vehicles_today = (
        db.query(func.count(distinct(Detection.vehicle_id)))
        .filter(Detection.timestamp >= today_start)
        .scalar()
    ) or 0

    active_cameras = (
        db.query(func.count(Camera.id)).filter(Camera.is_online == True).scalar()
    ) or 0

    avg_speed = (
        db.query(func.avg(Detection.speed_kmh))
        .filter(Detection.timestamp >= today_start)
        .filter(Detection.speed_kmh.isnot(None))
        .scalar()
    ) or 0.0

    open_alerts = (
        db.query(func.count(Alert.id)).filter(Alert.status == "new").scalar()
    ) or 0

    total_detections = (
        db.query(func.count(Detection.id))
        .filter(Detection.timestamp >= today_start)
        .scalar()
    ) or 0

    return StatsOut(
        vehicles_tracked_today=vehicles_today,
        active_cameras=active_cameras,
        average_speed=round(float(avg_speed), 1),
        open_alerts=open_alerts,
        total_detections_today=total_detections,
    )


@router.get("/traffic-flow", response_model=List[TrafficFlowPoint])
def get_traffic_flow(db: Session = Depends(get_db)):
    """Get hourly vehicle detection counts for the last 24 hours."""
    now = datetime.now(timezone.utc)
    points = []
    for h in range(24):
        hour_start = now.replace(
            hour=h, minute=0, second=0, microsecond=0
        ) - timedelta(days=0 if h <= now.hour else 1)
        hour_end = hour_start + timedelta(hours=1)

        count = (
            db.query(func.count(Detection.id))
            .filter(Detection.timestamp >= hour_start)
            .filter(Detection.timestamp < hour_end)
            .scalar()
        ) or 0
        points.append(TrafficFlowPoint(hour=h, count=count))

    return points


@router.get("/congestion", response_model=List[CongestionData])
def get_congestion(db: Session = Depends(get_db)):
    """Get congestion levels by zone."""
    zones = db.query(Zone).order_by(Zone.congestion_level.desc()).all()
    return [
        CongestionData(
            zone_name=z.name,
            congestion_level=z.congestion_level,
            color=z.color,
        )
        for z in zones
    ]


@router.get("/busiest-routes", response_model=List[BusiestRoute])
def get_busiest_routes(db: Session = Depends(get_db)):
    """Get the top 5 busiest camera locations by detection count."""
    results = (
        db.query(
            Camera.location_name,
            func.count(Detection.id).label("count"),
        )
        .join(Detection)
        .group_by(Camera.location_name)
        .order_by(func.count(Detection.id).desc())
        .limit(5)
        .all()
    )
    return [
        BusiestRoute(route_name=loc, vehicle_count=c) for loc, c in results
    ]


@router.get("/incidents", response_model=List[IncidentPoint])
def get_incidents(days: int = 7, db: Session = Depends(get_db)):
    """Get incident (alert) counts by day for the last N days."""
    now = datetime.now(timezone.utc)
    points = []
    for d in range(days):
        day = now - timedelta(days=days - 1 - d)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        count = (
            db.query(func.count(Alert.id))
            .filter(Alert.timestamp >= day_start)
            .filter(Alert.timestamp < day_end)
            .scalar()
        ) or 0
        points.append(IncidentPoint(date=day_start.strftime("%Y-%m-%d"), count=count))

    return points
