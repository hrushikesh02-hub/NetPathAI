# NetPath AI: AI-Based Packet Journey Visualizer for Intelligent Network Analysis

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-green.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-orange.svg)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Executive Summary & Purpose

**NetPath AI** is an educational and interactive Computer Networks simulation platform engineered to bridge the conceptual gap between theoretical networking models (OSI 7-Layer and TCP/IP 4-Layer architectures) and real-world telemetry analysis. 

The application visually animates how network packets travel from source hosts through switches, access points, and multi-router mesh topologies to destination servers. Additionally, it integrates a Machine Learning Telemetry Engine (**Isolation Forest** for unsupervised anomaly detection and **Random Forest** for network health classification) to evaluate Quality of Service (QoS) metrics and synthesize actionable engineering diagnoses in natural language.

> [!NOTE]
> **Academic Simulation Disclaimer:**
> NetPath AI is a software-based educational simulator designed for conceptual visualization, algorithm study, and interactive pedagogy. It does not replace low-level kernel packet filtering (eBPF/DPDK) or live physical routing hardware configurations.

---

## 2. Architecture & Algorithmic Explanations

### 2.1 Network Topology & Dijkstra Shortest Path
The network is modeled as a weighted directed graph $G = (V, E)$ where vertices $V$ represent network nodes (PCs, Switches, Routers, Servers) and edges $E$ represent physical or wireless links weighted by base transmission latency $w(u, v)$.

$$\text{cost}(u, v) = \text{latency}(u, v) + \text{congestion\_penalty}(u, v)$$

Upon any node or link state change (e.g., Core Router R2 failure), the simulation engine dynamically executes Dijkstra's algorithm to recalculate the optimal least-cost path:

```python
# Priority queue based edge relaxation
if dist[u] + weight(u, v) < dist[v]:
    dist[v] = dist[u] + weight(u, v)
    parent[v] = u
```

### 2.2 Protocol Data Unit (PDU) Encapsulation & Decapsulation
At each hop in the network trajectory, the packet undergoes rigorous protocol transformations:
1. **Application Layer (Layer 7):** Generates application data payload (HTTP GET, DNS query, etc.).
2. **Transport Layer (Layer 4):** Adds Source/Destination ports, Sequence/Ack numbers, and calculates TCP/UDP pseudo-header checksum.
3. **Network Layer (Layer 3):** Encapsulates into an IPv4 datagram with TTL, Source IP, and Destination IP; decrements TTL at every intermediate routing hop and recalculates the IPv4 One's Complement Header Checksum.
4. **Data Link Layer (Layer 2):** Encapsulates into an Ethernet Frame with Source MAC, Next-Hop Destination MAC, and computes the 32-bit CRC Frame Check Sequence (FCS).
5. **Physical Layer (Layer 1):** Converts the binary frame into hexadecimal and digital bitstream signals.

### 2.3 Artificial Intelligence & Machine Learning Architecture
The AI engine evaluates network telemetry features across an 8-dimensional space:
$$\vec{x} = [\text{Latency}, \text{Packet Loss}, \text{Throughput}, \text{Retransmissions}, \text{Packet Size}, \text{TTL}, \text{Hops}, \text{Jitter}]$$

- **Isolation Forest (Unsupervised Anomaly Detection):** Identifies outlier telemetry patterns by recursively partitioning feature dimensions using random decision trees. Normal instances require many splits; anomalies isolate near the root with short average path lengths $h(x)$.
- **Random Forest Classifier (Network State Classifier):** Evaluates multi-tree ensemble consensus to classify current network state into `HEALTHY`, `WARNING`, or `CRITICAL`.
- **Heuristic Diagnostic Rule Engine:** Synthesizes actionable root-cause diagnoses and engineering recommendations (e.g., recommending BBR congestion control, MTU adjustments, or queue buffer tuning).

---

## 3. Repository Structure

```
NetPathAI/
├── backend/
│   ├── ai/
│   │   ├── analyzer.py            # ML inference & heuristic fallback engine
│   │   ├── dataset.py             # Synthetic telemetry generator (5,000 samples)
│   │   └── train_model.py         # Isolation Forest & Random Forest training pipeline
│   ├── database/
│   │   └── db.py                  # SQLite schema, persistence, and audit logging
│   ├── models/
│   │   ├── isolation_forest.joblib# Persisted Scikit-learn anomaly model
│   │   ├── random_forest.joblib   # Persisted Scikit-learn classifier model
│   │   └── scaler.joblib          # Standard feature scaler
│   ├── routes/
│   │   └── api_routes.py          # Flask REST API endpoints
│   ├── simulation/
│   │   ├── encapsulation.py       # 7-layer OSI & TCP/IP header generator
│   │   ├── metrics.py             # QoS telemetry physics & loss calculations
│   │   ├── packet_engine.py       # Journey orchestration & trajectory tracking
│   │   ├── scenarios.py           # 7 pre-configured educational scenarios
│   │   └── topology.py            # Graph data structure & Dijkstra algorithm
│   ├── tests/
│   │   └── test_netpath.py        # 14 Pytest unit and integration test suites
│   ├── app.py                     # Flask application entry point
│   └── requirements.txt           # Python dependency specifications
├── frontend/
│   ├── public/                    # Static assets & icons
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── AIExplanationCard.jsx
│   │   │   ├── LayerStackVisualizer.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PacketHeaderViewer.jsx
│   │   │   ├── PathTimeline.jsx
│   │   │   └── TopologyCanvas.jsx
│   │   ├── pages/                 # 10 Application views
│   │   │   ├── AboutDocs.jsx
│   │   │   ├── AIAnalyzer.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HistoryReports.jsx
│   │   │   ├── LayerVisualizer.jsx
│   │   │   ├── NetworkMetrics.jsx
│   │   │   ├── NetworkTopology.jsx
│   │   │   ├── PacketDetails.jsx
│   │   │   ├── PacketSimulator.jsx
│   │   │   └── SimulationScenarios.jsx
│   │   ├── services/
│   │   │   └── api.js             # REST API client
│   │   ├── utils/
│   │   │   └── constants.js       # Protocols & Syllabus constants
│   │   ├── App.jsx                # Application root with React Router
│   │   ├── index.css              # Custom Tailwind & Glassmorphism styles
│   │   └── main.jsx               # React DOM entry point
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tailwind.config.js         # Tailwind theme configuration
│   └── vite.config.js             # Vite configuration with /api proxy
└── README.md                      # Comprehensive project documentation
```

---

## 4. Quickstart & Installation Guide

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### Step 1: Clone & Setup Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run automated tests
pytest

# Start the Flask REST server (runs on http://127.0.0.1:5000)
python app.py
```

### Step 2: Setup & Launch Frontend
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser to explore NetPath AI.

---

## 5. Authors
Developed by Hrushikesh Thombare and Gayatri Rajput.
