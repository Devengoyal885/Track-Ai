"""Vehicle ORM model — a tracked vehicle identified by its plate."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(String(20), nullable=False, unique=True, index=True)
    vehicle_type = Column(String(50), default="car")  # car, truck, bus, motorcycle
    color = Column(String(30), default="unknown")
    is_blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(String(255), default=None)
    first_seen_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    detections = relationship("Detection", back_populates="vehicle")

    def __repr__(self):
        return f"<Vehicle {self.plate_number}>"
