"""
TrackAI Backend — FastAPI + Socket.IO Application

Main entry point for the TrackAI backend server.
Run with: uvicorn backend.main:app --reload --port 8000
"""

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import init_db
from .seed import seed_database
from .routers import cameras, vehicles, detections, alerts, analytics, cv, simulation
from .simulation.engine import simulation_engine


# ── Socket.IO server ─────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.cors_origins_list,
    logger=False,
    engineio_logger=False,
)

# Connect simulation engine to Socket.IO
simulation_engine.set_socketio(sio)


@sio.event
async def connect(sid, environ):
    print(f"[Socket.IO] Client connected: {sid}")
    # Immediately send current simulation state to the newly connected client
    vehicle_list = [v.to_dict() for v in simulation_engine.vehicles.values()]
    await sio.emit("simulation_tick", {
        "is_running": simulation_engine.is_running,
        "speed_multiplier": simulation_engine.speed_multiplier,
        "vehicles": vehicle_list,
        "active_vehicle_count": len(vehicle_list),
    }, to=sid)


@sio.event
async def disconnect(sid):
    print(f"[Socket.IO] Client disconnected: {sid}")


# ── FastAPI lifespan ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    # Initialize database tables
    init_db()
    # Seed with camera/zone/sample data
    seed_database()

    # Start simulation engine
    if settings.sim_enabled:
        await simulation_engine.start()

    print("[OK] TrackAI backend started")
    print(f"  API: http://{settings.backend_host}:{settings.backend_port}")
    print(f"  CORS: {settings.cors_origins_list}")
    print(f"  Simulation: {'enabled' if settings.sim_enabled else 'disabled'}")

    yield

    print("TrackAI backend shutting down...")
    if simulation_engine._task:
        simulation_engine._task.cancel()


# ── FastAPI app ───────────────────────────────────────
fastapi_app = FastAPI(
    title="TrackAI API",
    description="City-Wide Intelligent Vehicle Tracking & Traffic Analytics",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
fastapi_app.include_router(cameras.router)
fastapi_app.include_router(vehicles.router)
fastapi_app.include_router(detections.router)
fastapi_app.include_router(alerts.router)
fastapi_app.include_router(analytics.router)
fastapi_app.include_router(cv.router)
fastapi_app.include_router(simulation.router)


@fastapi_app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TrackAI",
        "simulation_running": simulation_engine.is_running,
        "active_vehicles": len(simulation_engine.vehicles),
    }


# ── Mount Socket.IO onto FastAPI ──────────────────────
# Socket.IO ASGI app wraps the FastAPI app
app = socketio.ASGIApp(sio, fastapi_app)
