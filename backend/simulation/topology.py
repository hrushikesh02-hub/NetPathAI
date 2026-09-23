"""
Network Topology and Graph Routing Module for NetPath AI.
Implements Dijkstra's Algorithm for dynamic pathfinding and link-state fault tolerance.
"""

import heapq
from typing import Dict, List, Any, Optional, Tuple

class NetworkTopology:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.links: List[Dict[str, Any]] = []
        self.disabled_nodes: set = set()
        self.disabled_links: set = set()
        self.initialize_default_topology()

    def initialize_default_topology(self):
        """Initializes the reference enterprise topology."""
        self.nodes = {
            "PC1": {
                "id": "PC1",
                "label": "Host PC 1",
                "type": "pc",
                "ip": "192.168.1.10",
                "mac": "00:1A:2B:3C:4D:5E",
                "subnet": "192.168.1.0/24",
                "status": "online",
                "x": 80,
                "y": 150
            },
            "Laptop1": {
                "id": "Laptop1",
                "label": "Engineering Laptop",
                "type": "laptop",
                "ip": "192.168.1.15",
                "mac": "00:1A:2B:3C:4D:5F",
                "subnet": "192.168.1.0/24",
                "status": "online",
                "x": 80,
                "y": 300
            },
            "AP1": {
                "id": "AP1",
                "label": "Access Point 1",
                "type": "access_point",
                "ip": "192.168.1.2",
                "mac": "00:1A:2B:3C:4D:02",
                "subnet": "192.168.1.0/24",
                "status": "online",
                "x": 220,
                "y": 300
            },
            "SW1": {
                "id": "SW1",
                "label": "Access Switch 1",
                "type": "switch",
                "ip": "192.168.1.254",
                "mac": "00:50:56:C0:00:01",
                "subnet": "192.168.1.0/24",
                "status": "online",
                "x": 250,
                "y": 150
            },
            "R1": {
                "id": "R1",
                "label": "Edge Router 1",
                "type": "router",
                "ip": "192.168.1.1",
                "mac": "00:0C:29:1A:8B:01",
                "subnet": "10.0.0.0/30",
                "status": "online",
                "x": 420,
                "y": 150
            },
            "R2": {
                "id": "R2",
                "label": "Core Router 2 (Primary)",
                "type": "router",
                "ip": "10.0.0.2",
                "mac": "00:0C:29:1A:8B:02",
                "subnet": "10.0.0.0/30",
                "status": "online",
                "x": 580,
                "y": 80
            },
            "R3": {
                "id": "R3",
                "label": "Core Router 3 (Backup/Secondary)",
                "type": "router",
                "ip": "10.0.1.2",
                "mac": "00:0C:29:1A:8B:03",
                "subnet": "10.0.1.0/30",
                "status": "online",
                "x": 580,
                "y": 240
            },
            "SW2": {
                "id": "SW2",
                "label": "DataCenter Switch 2",
                "type": "switch",
                "ip": "192.168.2.254",
                "mac": "00:50:56:C0:00:02",
                "subnet": "192.168.2.0/24",
                "status": "online",
                "x": 750,
                "y": 150
            },
            "Server1": {
                "id": "Server1",
                "label": "Enterprise Web Server",
                "type": "server",
                "ip": "192.168.2.20",
                "mac": "00:1A:2B:3C:99:AA",
                "subnet": "192.168.2.0/24",
                "status": "online",
                "x": 920,
                "y": 150
            }
        }

        self.links = [
            {"source": "PC1", "target": "SW1", "cost": 1, "latency": 2, "bandwidth": 1000, "loss_prob": 0.0},
            {"source": "Laptop1", "target": "AP1", "cost": 3, "latency": 8, "bandwidth": 300, "loss_prob": 0.01},
            {"source": "AP1", "target": "SW1", "cost": 1, "latency": 2, "bandwidth": 1000, "loss_prob": 0.0},
            {"source": "SW1", "target": "R1", "cost": 2, "latency": 3, "bandwidth": 1000, "loss_prob": 0.0},
            # Primary fast route through R2
            {"source": "R1", "target": "R2", "cost": 5, "latency": 10, "bandwidth": 500, "loss_prob": 0.0},
            {"source": "R2", "target": "SW2", "cost": 5, "latency": 10, "bandwidth": 500, "loss_prob": 0.0},
            # Alternate / Backup route through R3 (slightly higher latency)
            {"source": "R1", "target": "R3", "cost": 10, "latency": 22, "bandwidth": 250, "loss_prob": 0.02},
            {"source": "R3", "target": "SW2", "cost": 10, "latency": 22, "bandwidth": 250, "loss_prob": 0.02},
            # Final leg to Server
            {"source": "SW2", "target": "Server1", "cost": 1, "latency": 2, "bandwidth": 1000, "loss_prob": 0.0},
        ]

    def set_node_status(self, node_id: str, is_active: bool):
        """Toggles active/disabled status of a network node."""
        if node_id in self.nodes:
            if not is_active:
                self.disabled_nodes.add(node_id)
                self.nodes[node_id]["status"] = "offline"
            else:
                self.disabled_nodes.discard(node_id)
                self.nodes[node_id]["status"] = "online"

    def get_adjacency(self) -> Dict[str, List[Tuple[str, float, float]]]:
        """Builds graph adjacency list ignoring offline nodes & links."""
        adj: Dict[str, List[Tuple[str, float, float]]] = {k: [] for k in self.nodes}
        for link in self.links:
            s = link["source"]
            t = link["target"]
            if s in self.disabled_nodes or t in self.disabled_nodes:
                continue
            cost = float(link.get("cost", 1))
            latency = float(link.get("latency", 2))
            adj[s].append((t, cost, latency))
            adj[t].append((s, cost, latency))
        return adj

    def find_shortest_path(self, start: str, end: str) -> Dict[str, Any]:
        """Dijkstra's shortest path algorithm."""
        adj = self.get_adjacency()
        if start not in adj or end not in adj:
            return {"success": False, "path": [], "latency": 0, "hops": 0, "message": "Invalid endpoints"}

        if start in self.disabled_nodes or end in self.disabled_nodes:
            return {"success": False, "path": [], "latency": 0, "hops": 0, "message": "Source or Destination node is offline"}

        distances = {node: float("inf") for node in self.nodes}
        latencies = {node: float("inf") for node in self.nodes}
        previous = {node: None for node in self.nodes}
        distances[start] = 0
        latencies[start] = 0

        pq = [(0, start)]

        while pq:
            current_dist, current_node = heapq.heappop(pq)
            if current_dist > distances[current_node]:
                continue
            if current_node == end:
                break

            for neighbor, cost, link_lat in adj.get(current_node, []):
                new_dist = current_dist + cost
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    latencies[neighbor] = latencies[current_node] + link_lat
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (new_dist, neighbor))

        if distances[end] == float("inf"):
            return {
                "success": False,
                "path": [],
                "hops": 0,
                "latency": 0,
                "cost": 0,
                "message": f"No available route found between {start} and {end} due to network partitioning or node failure."
            }

        # Reconstruct path
        path = []
        curr = end
        while curr is not None:
            path.append(curr)
            curr = previous[curr]
        path.reverse()

        node_details = [self.nodes[n] for n in path]

        return {
            "success": True,
            "path": path,
            "node_details": node_details,
            "hops": len(path) - 1,
            "cost": distances[end],
            "latency": round(latencies[end], 2),
            "message": "Optimal route calculated using Dijkstra's Algorithm."
        }

    def get_all_paths(self, start: str, end: str, max_depth: int = 8) -> List[List[str]]:
        """Finds all viable simple paths for educational comparison."""
        adj = self.get_adjacency()
        all_paths = []

        def dfs(current: str, target: str, visited: set, path: list):
            if len(path) > max_depth:
                return
            if current == target:
                all_paths.append(list(path))
                return
            for neighbor, _, _ in adj.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    path.append(neighbor)
                    dfs(neighbor, target, visited, path)
                    path.pop()
                    visited.remove(neighbor)

        if start not in self.disabled_nodes and end not in self.disabled_nodes:
            dfs(start, end, {start}, [start])
        return all_paths

    def to_dict(self) -> Dict[str, Any]:
        """Returns topology state for visualization."""
        return {
            "nodes": list(self.nodes.values()),
            "links": self.links,
            "disabled_nodes": list(self.disabled_nodes)
        }
