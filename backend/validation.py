"""Strict validation for public JSON inputs."""
import math


def number(value, name, minimum, maximum, integer=False):
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValueError(f"{name} must be a finite number.")
    try:
        result = float(value)
    except (ValueError, OverflowError):
        raise ValueError(f"{name} must be a finite number.") from None
    if not math.isfinite(result) or not minimum <= result <= maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}.")
    if integer and not result.is_integer():
        raise ValueError(f"{name} must be an integer.")
    return int(result) if integer else result


def scenario_flags(value):
    if not isinstance(value, dict):
        raise ValueError("scenario_flags must be an object.")
    flags = dict(value)
    for key in ("weak_link", "simulate_drop"):
        if key in flags and not isinstance(flags[key], bool):
            raise ValueError(f"{key} must be a boolean.")
    for key, high in (("congestion_factor", 1), ("loss_override", 100), ("propagation_delay_ms", 10000)):
        if key in flags and not (key == "loss_override" and flags[key] is None):
            flags[key] = number(flags[key], key, 0, high)
    node = flags.get("disable_router")
    if node is not None and node not in ("R1", "R2", "R3"):
        raise ValueError("disable_router must name R1, R2 or R3.")
    return flags
