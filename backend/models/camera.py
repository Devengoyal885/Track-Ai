"""Camera ORM model — a traffic/ANPR camera in the city."""

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    location_name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    is_online = Column(Boolean, default=True)
    camera_type = Column(String(50), default="ANPR")  # ANPR, CCTV, Speed
    last_detection_at = Column(DateTime, default=None)
    installed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone", backref="cameras")
    detections = relationship("Detection", back_populates="camera")

    def __repr__(self):
        return f"<Camera {self.name} @ {self.location_name}>"
