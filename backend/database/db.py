"""
SQLite Database Storage and Telemetry Logging for NetPath AI.
Persists simulation journeys, AI classification records, and dashboard metrics.
"""

import os
import sqlite3
import json
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "netpath_ai.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initializes schema for simulation history and telemetry metrics."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS simulation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                packet_id TEXT UNIQUE NOT NULL,
                source_ip TEXT NOT NULL,
                destination_ip TEXT NOT NULL,
                protocol TEXT NOT NULL,
                app_protocol TEXT,
                payload TEXT,
                packet_size INTEGER,
                latency REAL,
                packet_loss REAL,
                throughput REAL,
                retransmissions INTEGER,
                hops INTEGER,
                ttl INTEGER,
                jitter REAL,
                status TEXT,
                ai_status TEXT,
                ai_health TEXT,
                ai_risk TEXT,
                ai_confidence REAL,
                ai_reason TEXT,
                ai_recommendation TEXT,
                path_taken TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

def save_simulation_record(data: Dict[str, Any]) -> int:
    """Inserts a new simulation record into SQLite."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        path_str = data.get("path_taken")
        if isinstance(path_str, list):
            path_str = " -> ".join(path_str)
            
        cursor.execute("""
            INSERT OR REPLACE INTO simulation_history (
                packet_id, source_ip, destination_ip, protocol, app_protocol,
                payload, packet_size, latency, packet_loss, throughput,
                retransmissions, hops, ttl, jitter, status,
                ai_status, ai_health, ai_risk, ai_confidence,
                ai_reason, ai_recommendation, path_taken
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("packet_id"),
            data.get("source_ip"),
            data.get("destination_ip"),
            data.get("protocol", "TCP"),
            data.get("app_protocol", "HTTP"),
            data.get("payload", ""),
            int(data.get("packet_size", 1024)),
            float(data.get("latency", 0.0)),
            float(data.get("packet_loss", 0.0)),
            float(data.get("throughput", 0.0)),
            int(data.get("retransmissions", 0)),
            int(data.get("hops", 0)),
            int(data.get("ttl", 64)),
            float(data.get("jitter", 0.0)),
            data.get("status", "DELIVERED"),
            data.get("ai_status", "normal"),
            data.get("ai_health", "HEALTHY"),
            data.get("ai_risk", "low"),
            float(data.get("ai_confidence", 0.95)),
            data.get("ai_reason", ""),
            data.get("ai_recommendation", ""),
            path_str
        ))
        conn.commit()
        return cursor.lastrowid

def get_simulation_history(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Fetches ordered simulation history entries."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM simulation_history
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def get_simulation_by_id(record_id: int) -> Optional[Dict[str, Any]]:
    """Fetches single simulation journey report."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM simulation_history WHERE id = ? OR packet_id = ?", (record_id, str(record_id)))
        row = cursor.fetchone()
        return dict(row) if row else None

def delete_simulation_record(record_id: int) -> bool:
    """Deletes single history record."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM simulation_history WHERE id = ? OR packet_id = ?", (record_id, str(record_id)))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_history() -> bool:
    """Clears entire history."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM simulation_history")
        conn.commit()
        return True

def get_dashboard_summary() -> Dict[str, Any]:
    """Computes real-time statistics and summary cards for Dashboard."""
    init_database()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(*) as total_packets,
                SUM(CASE WHEN status LIKE '%DELIVERED%' THEN 1 ELSE 0 END) as successful_packets,
                SUM(CASE WHEN status LIKE '%DROPPED%' OR packet_loss >= 100.0 THEN 1 ELSE 0 END) as lost_packets,
                AVG(latency) as avg_latency,
                AVG(packet_loss) as avg_packet_loss,
                AVG(throughput) as avg_throughput,
                SUM(CASE WHEN ai_status = 'anomaly' OR ai_health != 'HEALTHY' THEN 1 ELSE 0 END) as anomaly_count
            FROM simulation_history
        """)
        row = cursor.fetchone()
        
        total = row["total_packets"] or 0
        successful = row["successful_packets"] or 0
        lost = row["lost_packets"] or 0
        avg_lat = round(row["avg_latency"] or 24.5, 2)
        avg_loss = round(row["avg_packet_loss"] or 0.2, 2)
        avg_tp = round(row["avg_throughput"] or 450.0, 2)
        anomalies = row["anomaly_count"] or 0

        # Calculate current network health status
        if total == 0:
            health = "HEALTHY"
            health_badge = "emerald"
        elif avg_loss > 12.0 or avg_lat > 250.0 or (anomalies / total > 0.4):
            health = "CRITICAL"
            health_badge = "red"
        elif avg_loss > 3.0 or avg_lat > 120.0 or (anomalies / total > 0.15):
            health = "WARNING"
            health_badge = "amber"
        else:
            health = "HEALTHY"
            health_badge = "emerald"

        # Recent 10 history records
        cursor.execute("SELECT * FROM simulation_history ORDER BY id DESC LIMIT 10")
        recent_rows = [dict(r) for r in cursor.fetchall()]

        return {
            "total_packets": total,
            "successful_packets": successful,
            "lost_packets": lost,
            "avg_latency": avg_lat,
            "avg_packet_loss": avg_loss,
            "avg_throughput": avg_tp,
            "anomaly_count": anomalies,
            "network_health": health,
            "health_badge": health_badge,
            "recent_packets": recent_rows
        }
