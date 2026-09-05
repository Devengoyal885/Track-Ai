"""
TrackAI — Indian License Plate Generator

Generates realistic Indian vehicle registration numbers.
Format: XX 00 YY 0000
  XX = State code (e.g., DL, MH, KA, UP)
  00 = District number (01-99)
  YY = Series letters (AA-ZZ)
  0000 = Registration number (0001-9999)
"""

import random
import string


# Common Indian state/UT codes with weightings toward Delhi (SIH context)
STATE_CODES = [
    "DL", "DL", "DL", "DL", "DL",  # Heavy bias toward Delhi
    "HR", "HR", "UP", "UP",
    "RJ", "MH", "KA", "TN",
    "GJ", "MP", "WB", "PB",
]

# District numbers per state (simplified)
DISTRICT_RANGE = {
    "DL": (1, 14),
    "HR": (1, 90),
    "UP": (1, 80),
    "RJ": (1, 50),
    "MH": (1, 50),
    "KA": (1, 70),
    "TN": (1, 99),
    "GJ": (1, 38),
    "MP": (1, 50),
    "WB": (1, 80),
    "PB": (1, 65),
}

# Vehicle types with distribution
VEHICLE_TYPES = [
    ("car", 0.55),
    ("motorcycle", 0.20),
    ("truck", 0.10),
    ("bus", 0.08),
    ("auto", 0.07),
]

# Vehicle colors
VEHICLE_COLORS = [
    "White", "Silver", "Black", "Grey", "Red",
    "Blue", "Brown", "Green", "Yellow", "Orange",
]


def generate_plate() -> str:
    """Generate a random Indian license plate number."""
    state = random.choice(STATE_CODES)
    district_range = DISTRICT_RANGE.get(state, (1, 99))
    district = random.randint(*district_range)
    series = random.choice(string.ascii_uppercase) + random.choice(string.ascii_uppercase)
    number = random.randint(1, 9999)
    return f"{state} {district:02d} {series} {number:04d}"


def generate_vehicle_type() -> str:
    """Generate a random vehicle type based on distribution."""
    r = random.random()
    cumulative = 0
    for vtype, prob in VEHICLE_TYPES:
        cumulative += prob
        if r <= cumulative:
            return vtype
    return "car"


def generate_vehicle_color() -> str:
    """Generate a random vehicle color."""
    return random.choice(VEHICLE_COLORS)


# Pre-generate a pool of blacklisted plates for simulation
BLACKLISTED_PLATES = [
    generate_plate() for _ in range(5)
]
BLACKLIST_REASONS = [
    "Stolen vehicle - reported 3 days ago",
    "Wanted in hit-and-run case",
    "Expired registration - impound order",
    "Associated with robbery suspect",
    "Outstanding traffic violations (12+)",
]
