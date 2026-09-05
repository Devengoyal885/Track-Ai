"""
TrackAI — Delhi Road Route Definitions

GPS polylines for simulated vehicle movement along real Delhi road corridors.
Each route is a list of (latitude, longitude) waypoints that vehicles traverse.
"""

from typing import List, Tuple
import random
import math

# Type alias for a GPS point
GpsPoint = Tuple[float, float]

# ────────────────────────────────────────────────────────
# Route definitions — real Delhi road corridors
# ────────────────────────────────────────────────────────

ROUTES = {
    "rajpath_corridor": {
        "name": "Kartavya Path Corridor",
        "description": "Rashtrapati Bhavan to India Gate",
        "waypoints": [
            (28.6145, 77.1990),  # Rashtrapati Bhavan
            (28.6147, 77.2030),
            (28.6148, 77.2070),
            (28.6145, 77.2100),  # Near Kartavya Path camera
            (28.6143, 77.2140),
            (28.6140, 77.2180),
            (28.6137, 77.2220),
            (28.6135, 77.2260),
            (28.6129, 77.2295),  # India Gate
        ],
    },
    "ring_road_north": {
        "name": "Ring Road (North Segment)",
        "description": "ITO to Kashmere Gate via Ring Road",
        "waypoints": [
            (28.6280, 77.2450),  # ITO
            (28.6310, 77.2400),
            (28.6340, 77.2370),
            (28.6380, 77.2340),
            (28.6420, 77.2320),
            (28.6460, 77.2300),
            (28.6510, 77.2280),
            (28.6560, 77.2270),
            (28.6620, 77.2265),
            (28.6692, 77.2260),  # Kashmere Gate
        ],
    },
    "cp_to_ito": {
        "name": "CP to ITO",
        "description": "Connaught Place to ITO via Barakhamba",
        "waypoints": [
            (28.6315, 77.2167),  # Connaught Place
            (28.6320, 77.2200),
            (28.6325, 77.2230),
            (28.6330, 77.2250),  # Barakhamba Road
            (28.6335, 77.2280),
            (28.6340, 77.2310),  # Minto Road
            (28.6330, 77.2350),
            (28.6310, 77.2390),
            (28.6290, 77.2420),
            (28.6280, 77.2450),  # ITO
        ],
    },
    "janpath_south": {
        "name": "Janpath South Corridor",
        "description": "CP to India Gate via Janpath",
        "waypoints": [
            (28.6315, 77.2167),  # Connaught Place
            (28.6290, 77.2175),
            (28.6270, 77.2180),
            (28.6250, 77.2180),  # Janpath-Tolstoy junction
            (28.6220, 77.2185),
            (28.6200, 77.2190),
            (28.6170, 77.2200),
            (28.6150, 77.2230),
            (28.6140, 77.2260),
            (28.6129, 77.2295),  # India Gate
        ],
    },
    "aiims_to_saket": {
        "name": "AIIMS to Saket",
        "description": "AIIMS Flyover to Saket via Ring Road South",
        "waypoints": [
            (28.5672, 77.2100),  # AIIMS
            (28.5630, 77.2110),
            (28.5590, 77.2120),
            (28.5550, 77.2125),
            (28.5520, 77.2130),
            (28.5494, 77.2001),  # Hauz Khas
            (28.5400, 77.2050),
            (28.5340, 77.2100),
            (28.5300, 77.2120),
            (28.5237, 77.2139),  # Saket Metro
        ],
    },
    "ito_to_akshardham": {
        "name": "ITO to Akshardham",
        "description": "ITO to Akshardham via NH24",
        "waypoints": [
            (28.6280, 77.2450),  # ITO
            (28.6260, 77.2470),
            (28.6230, 77.2480),
            (28.6200, 77.2485),
            (28.6170, 77.2490),  # Pragati Maidan
            (28.6155, 77.2530),
            (28.6150, 77.2580),
            (28.6145, 77.2640),
            (28.6138, 77.2700),
            (28.6127, 77.2773),  # Akshardham
        ],
    },
    "civil_lines_to_cp": {
        "name": "Civil Lines to CP",
        "description": "Civil Lines to Connaught Place via GT Road",
        "waypoints": [
            (28.6810, 77.2210),  # Civil Lines
            (28.6770, 77.2220),
            (28.6730, 77.2230),
            (28.6692, 77.2260),  # Kashmere Gate
            (28.6640, 77.2250),
            (28.6580, 77.2240),
            (28.6510, 77.2230),
            (28.6440, 77.2220),
            (28.6380, 77.2200),
            (28.6315, 77.2167),  # Connaught Place
        ],
    },
    "outer_ring_west": {
        "name": "Outer Ring Road West",
        "description": "Rajouri Garden to Hauz Khas via Outer Ring",
        "waypoints": [
            (28.6493, 77.1215),  # Rajouri Garden
            (28.6400, 77.1300),
            (28.6300, 77.1400),
            (28.6200, 77.1500),
            (28.6100, 77.1600),
            (28.6000, 77.1700),
            (28.5800, 77.1800),
            (28.5650, 77.1900),
            (28.5550, 77.1950),
            (28.5494, 77.2001),  # Hauz Khas
        ],
    },
}


def get_all_routes() -> dict:
    """Return all route definitions."""
    return ROUTES


def get_route_names() -> List[str]:
    """Return all route keys."""
    return list(ROUTES.keys())


def get_route(name: str) -> dict:
    """Get a specific route by name."""
    return ROUTES.get(name, ROUTES["cp_to_ito"])


def get_random_route() -> Tuple[str, dict]:
    """Get a random route."""
    name = random.choice(list(ROUTES.keys()))
    return name, ROUTES[name]


def interpolate_position(
    waypoints: List[GpsPoint],
    progress: float,  # 0.0 to 1.0
) -> GpsPoint:
    """
    Interpolate a position along the route based on progress (0 to 1).
    Returns (lat, lng) at the given progress point.
    """
    if progress <= 0:
        return waypoints[0]
    if progress >= 1:
        return waypoints[-1]

    # Calculate total route distance (simplified using Euclidean approximation)
    segment_lengths = []
    total_length = 0
    for i in range(len(waypoints) - 1):
        dx = waypoints[i + 1][0] - waypoints[i][0]
        dy = waypoints[i + 1][1] - waypoints[i][1]
        length = math.sqrt(dx * dx + dy * dy)
        segment_lengths.append(length)
        total_length += length

    # Find the segment at the given progress
    target_distance = progress * total_length
    accumulated = 0
    for i, seg_len in enumerate(segment_lengths):
        if accumulated + seg_len >= target_distance:
            # Interpolate within this segment
            seg_progress = (target_distance - accumulated) / seg_len if seg_len > 0 else 0
            lat = waypoints[i][0] + seg_progress * (waypoints[i + 1][0] - waypoints[i][0])
            lng = waypoints[i][1] + seg_progress * (waypoints[i + 1][1] - waypoints[i][1])
            return (lat, lng)
        accumulated += seg_len

    return waypoints[-1]


def find_nearest_camera_id(lat: float, lng: float, cameras: list) -> int:
    """Find the nearest camera to a given position."""
    min_dist = float("inf")
    nearest_id = cameras[0].id if cameras else 1
    for cam in cameras:
        dx = cam.latitude - lat
        dy = cam.longitude - lng
        dist = dx * dx + dy * dy
        if dist < min_dist:
            min_dist = dist
            nearest_id = cam.id
    return nearest_id
