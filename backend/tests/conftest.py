import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest


@pytest.fixture
def client(tmp_path, monkeypatch):
    from database import db
    monkeypatch.setattr(db, "DB_FILE", str(tmp_path / "history.db"))
    from app import create_app
    from routes import api_routes
    from simulation.topology import NetworkTopology
    monkeypatch.setattr(api_routes, "global_topology", NetworkTopology())
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()
