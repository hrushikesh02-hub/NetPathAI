"""
NetPath AI - Flask Backend Server Entrypoint.
Initializes database, registers API routes, configures CORS, and handles errors gracefully.
"""

import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

from database.db import init_database
from routes.api_routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024
    
    origins = [origin.strip() for origin in os.environ.get(
        "NETPATH_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173"
    ).split(",") if origin.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}})

    @app.before_request
    def restrict_browser_origins():
        origin = request.headers.get("Origin")
        if request.path.startswith("/api/") and origin and origin not in origins and origin != request.host_url.rstrip("/"):
            return jsonify(success=False, error="Origin not allowed."), 403

    # Register blueprints
    app.register_blueprint(api_bp)

    # Initialize SQLite tables
    try:
        init_database()
        print("NetPath AI SQLite Database initialized.")
    except Exception as e:
        print(f"Warning: SQLite init error ({e})")

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "error": "Internal Server Error"}), 500

    @app.route("/")
    def index():
        return jsonify({
            "service": "NetPath AI Backend API",
            "status": "online",
            "version": "1.0.0",
            "docs": "/api/health"
        })

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting NetPath AI Backend on http://127.0.0.1:{port}")
    app.run(host=os.environ.get("HOST", "127.0.0.1"), port=port,
            debug=os.environ.get("FLASK_DEBUG") == "1")
