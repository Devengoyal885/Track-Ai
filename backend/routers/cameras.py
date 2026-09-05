"""Camera API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.camera import Camera
from ..schemas import CameraOut

router = APIRouter(prefix="/api/cameras", tags=["cameras"])


@router.get("", response_model=List[CameraOut])
def list_cameras(db: Session = Depends(get_db)):
    """Get all cameras with their current status."""
    cameras = db.query(Camera).order_by(Camera.name).all()
    return cameras


@router.get("/{camera_id}", response_model=CameraOut)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    """Get a single camera by ID."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera
