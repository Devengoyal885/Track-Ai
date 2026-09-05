"""Zone ORM model — a geographic area grouping cameras."""

from sqlalchemy import Column, Integer, String, Float
from ..database import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(255), default="")
    # Center point for map display
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    # Congestion level (0-100), updated by simulation
    congestion_level = Column(Integer, default=0)
    color = Column(String(7), default="#38BDF8")  # hex color for map

    def __repr__(self):
        return f"<Zone {self.name}>"
