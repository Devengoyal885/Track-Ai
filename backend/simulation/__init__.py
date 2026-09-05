"""Simulation package initialization."""

from .routes import ROUTES, get_all_routes, get_route, interpolate_position
from .plates import generate_plate, generate_vehicle_type, generate_vehicle_color
from .engine import simulation_engine, SimulatedVehicle

__all__ = [
    "ROUTES",
    "get_all_routes",
    "get_route",
    "interpolate_position",
    "generate_plate",
    "generate_vehicle_type",
    "generate_vehicle_color",
    "simulation_engine",
    "SimulatedVehicle",
]
