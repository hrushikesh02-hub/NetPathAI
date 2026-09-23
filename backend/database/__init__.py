"""Database package initializer."""
from .db import (
    init_database,
    save_simulation_record,
    get_simulation_history,
    get_simulation_by_id,
    delete_simulation_record,
    clear_all_history,
    get_dashboard_summary
)

__all__ = [
    "init_database",
    "save_simulation_record",
    "get_simulation_history",
    "get_simulation_by_id",
    "delete_simulation_record",
    "clear_all_history",
    "get_dashboard_summary"
]
