"""Alert ORM model — system-generated alerts for notable events."""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from ..database import Base


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, enum.Enum):
    BLACKLIST_HIT = "blacklist_hit"
    CONGESTION = "congestion"
    ANOMALY = "anomaly"
    SPEEDING = "speeding"


class AlertStatus(str, enum.Enum):
    NEW = "new"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False, default=AlertSeverity.MEDIUM.value)
    status = Column(String(20), nullable=False, default=AlertStatus.NEW.value)
    title = Column(String(200), nullable=False)
    description = Column(String(500), default="")
    plate_number = Column(String(20), default=None, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    latitude = Column(Float, default=None)
    longitude = Column(Float, default=None)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    camera = relationship("Camera")
    vehicle = relationship("Vehicle")

    def __repr__(self):
        return f"<Alert {self.type}: {self.title}>"
