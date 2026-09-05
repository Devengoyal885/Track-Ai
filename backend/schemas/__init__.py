"""Pydantic schemas for API request/response serialization."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Zone ──────────────────────────────────────────────
class ZoneOut(BaseModel):
    id: int
    name: str
    description: str
    center_lat: float
    center_lng: float
    congestion_level: int
    color: str

    class Config:
        from_attributes = True


# ── Camera ────────────────────────────────────────────
class CameraOut(BaseModel):
    id: int
    name: str
    location_name: str
    latitude: float
    longitude: float
    zone_id: Optional[int] = None
    is_online: bool
    camera_type: str
    last_detection_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Vehicle ───────────────────────────────────────────
class VehicleOut(BaseModel):
    id: int
    plate_number: str
    vehicle_type: str
    color: str
    is_blacklisted: bool
    blacklist_reason: Optional[str] = None
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VehicleSearch(BaseModel):
    id: int
    plate_number: str
    vehicle_type: str
    detection_count: int = 0


# ── Detection ─────────────────────────────────────────
class DetectionOut(BaseModel):
    id: int
    vehicle_id: int
    camera_id: int
    plate_number: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = None
    confidence: float
    vehicle_type: str
    camera_name: Optional[str] = None
    camera_location: Optional[str] = None

    class Config:
        from_attributes = True


# ── Alert ─────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    type: str
    severity: str
    status: str
    title: str
    description: str
    plate_number: Optional[str] = None
    camera_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime
    camera_name: Optional[str] = None

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    status: str  # new, reviewed, resolved


# ── Stats ─────────────────────────────────────────────
class StatsOut(BaseModel):
    vehicles_tracked_today: int
    active_cameras: int
    average_speed: float
    open_alerts: int
    total_detections_today: int


# ── Analytics ─────────────────────────────────────────
class TrafficFlowPoint(BaseModel):
    hour: int
    count: int


class CongestionData(BaseModel):
    zone_name: str
    congestion_level: int
    color: str


class BusiestRoute(BaseModel):
    route_name: str
    vehicle_count: int


class IncidentPoint(BaseModel):
    date: str
    count: int


# ── CV Pipeline ───────────────────────────────────────
class DetectionResult(BaseModel):
    plate_text: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    vehicle_type: str
    plate_bbox: Optional[List[float]] = None


class CVResponse(BaseModel):
    detections: List[DetectionResult]
    annotated_image: str  # base64 encoded
    processing_time_ms: float
