"""Detection ORM model — a single sighting of a vehicle at a camera."""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    plate_number = Column(String(20), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=None)
    confidence = Column(Float, default=0.95)  # OCR confidence 0-1
    vehicle_type = Column(String(50), default="car")
    image_hash = Column(String(64), default=None)  # perceptual hash for re-id

    # Relationships
    vehicle = relationship("Vehicle", back_populates="detections")
    camera = relationship("Camera", back_populates="detections")

    def __repr__(self):
        return f"<Detection {self.plate_number} @ camera {self.camera_id}>"
