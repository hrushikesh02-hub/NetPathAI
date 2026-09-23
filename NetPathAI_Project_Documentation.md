# 📘 NetPath AI: Comprehensive Project Understanding & Documentation Guide

> **Note for Student/Presenter:** This document is generated after analyzing the actual codebase of **NetPath AI**. It contains all details required to understand, present, demonstrate, and answer questions about this project for college project reports, presentations (PPT), and viva examinations.

---

## 1. PROJECT OVERVIEW

* **Project Name:** NetPath AI: AI-Based Packet Journey Visualizer for Intelligent Network Analysis
* **One-Line Definition:** An educational, interactive network simulation platform that animates 7-layer OSI / TCP-IP packet encapsulation, computes dynamic Dijkstra shortest paths, and analyzes network QoS telemetry using Machine Learning (Isolation Forest & Random Forest).
* **Problem the Project Solves:** Computer Networking theory (OSI model, framing, IP routing, TCP handshakes, congestion control) is abstract and difficult for students to visualize. Traditional command-line tools like `traceroute` or complex packet capture tools like `Wireshark` do not visually animate step-by-step PDU header transformations across dynamic network topologies alongside real-time AI anomaly detection.
* **Why This Project is Needed:** It bridges the gap between theoretical textbook concepts and practical network telemetry analysis by offering an interactive, visual, and AI-assisted sandbox environment.
* **Main Objective:** To provide a visual, real-time web simulator for network packet encapsulation/decapsulation, dynamic pathfinding (Dijkstra algorithm), fault tolerance (router failover), and AI-driven QoS telemetry anomaly detection.
* **Target Users:**
  1. Computer Science & Engineering Students studying Computer Networks.
  2. Networking Instructors and Professors for classroom demonstrations.
  3. Network Engineers & AI/ML Enthusiasts studying network anomaly detection algorithms.
* **Real-World Use Case:** Simulating enterprise network topology behavior, analyzing packet drop points during network congestion or cable faults, visualizing route failover when a core router crashes, and diagnosing QoS bottlenecks using machine learning.
* **Key Features:**
  1. **Interactive Packet Simulator:** Configure source/destination IP, MAC, ports, TTL, and protocol (TCP/UDP/HTTP/DNS/ICMP) to simulate end-to-end packet journeys.
  2. **Dynamic Dijkstra Shortest Path Router:** Graph-based topology solver that recalculates optimal network paths upon node/link failure in real-time.
  3. **7-Layer OSI & 4-Layer TCP/IP Encapsulation Visualizer:** Step-by-step breakdown of Data → Segment → Datagram → Frame → Bitstream signal transformations.
  4. **Wireshark-Style Protocol Inspector:** Displays raw hexadecimal payload dumps, Ethernet headers, IPv4 header checksums, and TCP flag states.
  5. **Hybrid AI/ML Telemetry Engine:** Uses Scikit-learn **Isolation Forest** (unsupervised anomaly detection) and **Random Forest** (health classification into `HEALTHY`, `WARNING`, `CRITICAL`) with natural language root-cause diagnostic advice.
  6. **7 Educational Scenarios:** Presets for Normal HTTP Traffic, Packet Drops, Router Failover, Congestion Bottlenecks, UDP Video Streaming, High Latency Satellite, and TTL Expiration Loops.
  7. **SQLite Telemetry History & Printable Executive Reports:** Persists simulation logs and generates printable PDF/audit diagnostic reports.
* **Main Advantages:** Zero physical hardware setup required, runs completely in browser and lightweight local backend, combines algorithmic graph routing with machine learning, highly visual and interactive.
* **What Makes This Project Unique:** Unlike static network diagrams, NetPath AI dynamically recalculates headers, re-executes Dijkstra pathfinding on hardware failures, simulates TCP fast retransmissions, and uses a trained ML model to explain root-cause network issues in simple English.

---

## 2. PROJECT FUNCTIONALITY

### What the Application Does
NetPath AI takes packet parameters (IPs, Ports, Payload, Protocol, TTL) from the user, computes the optimal route through a virtual network topology using Dijkstra's algorithm, builds step-by-step OSI/TCP-IP layer headers, calculates QoS metrics (Latency, Packet Loss, Throughput, Retransmissions, Jitter), passes these telemetry metrics to an AI inference engine, and displays an animated visual journey along with Wireshark-style header details and diagnostic reports.

### What Happens When the Application Starts
1. **Backend (`app.py`):**
   - Initializes Flask server on `http://127.0.0.1:5000`.
   - Initializes SQLite database `netpath_ai.db` and creates `simulation_history` table if missing.
   - Loads Scikit-learn models (`scaler.joblib`, `isolation_forest.joblib`, `health_classifier.joblib`). If missing, cleanly loads the Heuristic Fallback Engine.
   - Builds the default graph topology (PC1, Laptop1, AP1, SW1, R1, R2, R3, SW2, Server1).
2. **Frontend (`main.jsx` / `App.jsx`):**
   - Launches React single-page app on `http://localhost:3000`.
   - Loads the top Navigation Bar and defaults to the **Dashboard (`/`)** view.
   - Automatically queries `/api/health` and `/api/metrics` to fetch real-time server health and summary telemetry KPIs.

### Complete Step-by-Step User Flow (Input → Processing → Output)

```
[ User Input ]
  │ User enters Source/Dest IP, Ports, Protocol, Payload in /simulator
  ▼
[ Frontend Validation & API Call ]
  │ React sends POST /api/packet/journey request to Flask Backend
  ▼
[ Backend Processing ]
  │ 1. Validate IPv4/Port inputs
  │ 2. Dijkstra Algorithm calculates optimal node path (PC1 -> SW1 -> R1 -> R2 -> SW2 -> Server1)
  │ 3. Encapsulation Engine generates L7-L1 headers & Hex dumps
  │ 4. Metrics Engine calculates Latency, Loss, Throughput, Retransmissions
  │ 5. AI Engine (Isolation Forest & Random Forest) evaluates telemetry features
  │ 6. SQLite DB saves simulation record
  ▼
[ Response & Output ]
  │ Flask returns JSON with path, steps, headers, metrics, and AI diagnosis
  ▼
[ Visual Rendering ]
  │ React animates packet traversing the Canvas topology, highlights OSI layers,
  │ populates Wireshark packet breakdown, and renders AI Diagnostic Card.
```

---

## 3. HOW THE PROJECT WORKS

### Complete Working Architecture Flow

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|   React 19 SPA (Dashboard, Simulator, Topology, AI Analyzer, Details)   |
+-------------------------------------------------------------------------+
                                    │
                         HTTP REST API Requests
                         (JSON via Axios / Fetch)
                                    ▼
+-------------------------------------------------------------------------+
|                           FLASK BACKEND SERVER                          |
|                       (python app.py on Port 5000)                      |
|                                                                         |
|  +-------------------+  +-----------------------+  +-----------------+  |
|  |  Routing Engine   |  | Encapsulation Engine  |  | Metrics Engine  |  |
|  | (Dijkstra Graph)  |  | (OSI L7-L1 Header Gen)|  | (QoS Physics)   |  |
|  +-------------------+  +-----------------------+  +-----------------+  |
|                                   │                                     |
|                                   ▼                                     |
|  +-------------------------------------------------------------------+  |
|  |                        AI Telemetry Analyzer                      |  |
|  |   Primary: Isolation Forest & Random Forest ML Models (.joblib)   |  |
|  |   Secondary: Heuristic Network Rule-Based Fallback Engine         |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    │
                      SQL Queries (Insert / Select)
                                    ▼
+-------------------------------------------------------------------------+
|                        SQLITE3 DATABASE ENGINE                          |
|                 (netpath_ai.db -> simulation_history)                   |
+-------------------------------------------------------------------------+
```

---

## 4. TECHNOLOGY STACK

| Technology | Purpose | Where Used |
| :--- | :--- | :--- |
| **Python 3.10+** | Backend runtime environment | Entire `backend/` directory |
| **Flask 3.0+** | REST API Web Framework | `backend/app.py`, `backend/routes/api_routes.py` |
| **Flask-CORS** | Cross-Origin Resource Sharing handler | `backend/app.py` |
| **Scikit-learn 1.4+** | Machine Learning algorithms (Isolation Forest, Random Forest, StandardScaler) | `backend/ai/analyzer.py`, `backend/ai/train_model.py` |
| **Pandas & NumPy** | Synthetic dataset creation & array feature scaling | `backend/ai/dataset.py` |
| **Joblib** | Serialization and loading of trained `.joblib` ML models | `backend/ai/analyzer.py`, `backend/models/` |
| **SQLite3** | Embedded lightweight relational database storage | `backend/database/db.py`, `netpath_ai.db` |
| **Pytest 8.0+** | Automated testing framework for unit and integration tests | `backend/tests/test_netpath.py` |
| **React 19** | Frontend User Interface library | Entire `frontend/src/` component hierarchy |
| **Vite 6** | Frontend build tool & local dev server with proxy support | `frontend/vite.config.js` |
| **React Router DOM 7** | Client-side page navigation routing | `frontend/src/App.jsx` |
| **Tailwind CSS 3.4** | Utility-first styling & glassmorphism dark theme UI | `frontend/src/index.css`, `frontend/tailwind.config.js` |
| **Lucide React** | UI Icon set | Used across all page components |
| **Recharts** | Interactive charts for network QoS telemetry visualization | `frontend/src/pages/NetworkMetrics.jsx`, `frontend/src/pages/AIAnalyzer.jsx` |

---

## 5. PROJECT ARCHITECTURE

### Component Architecture Breakdown
1. **Frontend Architecture:** Component-driven Single Page Application (SPA) built using React 19 and React Router 7. State management is handled locally per page and component using standard React `useState` and `useEffect` hooks, making API requests via `fetch` wrapped in `frontend/src/services/api.js`.
2. **Backend Architecture:** Modular Flask REST API following standard Blueprint pattern (`/api`). Includes separate decoupled simulation subsystems: `NetworkTopology`, `EncapsulationEngine`, `PacketEngine`, `NetworkMetricsEngine`, and `NetworkAIAnalyzer`.
3. **Database Architecture:** Embedded SQLite3 file `netpath_ai.db` managed via native `sqlite3` standard library with `sqlite3.Row` row factory for JSON dict conversion.
4. **API Architecture:** Stateless RESTful HTTP endpoints returning standard structured JSON responses containing `success: bool`, data payloads, and explicit HTTP error status codes (`200`, `400`, `404`, `422`, `500`).
5. **AI/ML Architecture:** Hybrid dual-mode inference engine:
   - **Mode A (Machine Learning):** Standardized 8-feature vector scaling → **Isolation Forest** (Anomaly score & boolean flag) + **Random Forest Classifier** (`HEALTHY`, `WARNING`, `CRITICAL` probabilities).
   - **Mode B (Rule-Based Heuristic Fallback):** Safe fallback rules evaluating threshold logic on loss, latency, retransmissions, throughput, and jitter if ML dependencies or `.joblib` files are unavailable.
6. **Authentication Architecture:** **None** (Open educational simulation tool, single-tenant local operation).

---

## 6. FOLDER & FILE STRUCTURE

```
NetPathAI/
├── backend/                        # Flask Backend Application
│   ├── ai/                         # Machine Learning Subsystem
│   │   ├── analyzer.py             # ML Inference & Rule-Based Fallback Engine
│   │   ├── dataset.py              # Synthetic telemetry generator (5,000 samples)
│   │   └── train_model.py          # Model training pipeline script
│   ├── database/                   # Data Layer
│   │   └── db.py                   # SQLite schema, queries, metrics calculation
│   ├── models/                     # Trained Machine Learning Artifacts
│   │   ├── health_classifier.joblib# Trained Random Forest classifier model
│   │   ├── isolation_forest.joblib # Trained Isolation Forest anomaly model
│   │   └── scaler.joblib           # Feature standard scaler
│   ├── routes/                     # API Layer
│   │   └── api_routes.py           # Blueprint for all /api REST endpoints
│   ├── simulation/                 # Simulation Subsystems
│   │   ├── encapsulation.py        # 7-layer OSI & 4-layer TCP/IP generator
│   │   ├── metrics.py              # Network physics & QoS telemetry engine
│   │   ├── packet_engine.py        # End-to-end journey orchestrator
│   │   ├── scenarios.py            # Preset educational scenario definitions
│   │   └── topology.py             # Graph data structure & Dijkstra algorithm
│   ├── tests/                      # Automated Verification
│   │   └── test_netpath.py         # 14 Pytest unit and integration tests
│   ├── app.py                      # Flask server main entry point
│   ├── netpath_ai.db               # SQLite database storage file
│   └── requirements.txt            # Python dependencies
├── frontend/                       # React Frontend Application
│   ├── public/                     # Static public assets
│   ├── src/                        # Source React files
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── AIExplanationCard.jsx# AI Diagnosis & Recommendation Card
│   │   │   ├── LayerStackVisualizer.jsx# 7-Layer OSI & 4-Layer TCP-IP stack
│   │   │   ├── MetricCard.jsx       # Dashboard summary KPI tile
│   │   │   ├── Navbar.jsx           # Top header navigation bar
│   │   │   ├── PacketHeaderViewer.jsx# Wireshark-style protocol header inspector
│   │   │   ├── PathTimeline.jsx     # Step-by-step trajectory timeline
│   │   │   └── TopologyCanvas.jsx   # SVG/HTML canvas graph visualizer
│   │   ├── pages/                  # 10 Main Application Views
│   │   │   ├── AboutDocs.jsx        # Syllabus alignment & Viva Q&A guide
│   │   │   ├── AIAnalyzer.jsx       # Interactive ML sandbox view
│   │   │   ├── Dashboard.jsx        # Summary KPI dashboard
│   │   │   ├── HistoryReports.jsx   # Audit logs & printable report generator
│   │   │   ├── LayerVisualizer.jsx  # PDU layer breakdown page
│   │   │   ├── NetworkMetrics.jsx   # QoS time-series analytics charts
│   │   │   ├── NetworkTopology.jsx  # Interactive topology graph & router control
│   │   │   ├── PacketDetails.jsx    # Raw Wireshark packet hex dump inspector
│   │   │   ├── PacketSimulator.jsx  # Core simulation input & animation page
│   │   │   └── SimulationScenarios.jsx# 7 preset educational scenarios
│   │   ├── services/
│   │   │   └── api.js              # Fetch REST API client wrapper
│   │   ├── utils/
│   │   │   └── constants.js        # Syllabus topics & default constant data
│   │   ├── App.jsx                 # Main layout & router entry point
│   │   ├── index.css               # Tailwind CSS & Glassmorphic dark styling
│   │   └── main.jsx                # React DOM render entry point
│   ├── package.json                # Frontend npm scripts & dependencies
│   ├── tailwind.config.js          # Tailwind CSS styling configuration
│   └── vite.config.js              # Vite server & /api backend proxy config
└── README.md                      # Main project documentation
```

### Detailed File Analysis (Important Files)

1. **`backend/app.py`**
   - **Purpose:** Main entry point for Flask server.
   - **What it does:** Configures CORS, initializes SQLite DB tables, loads REST blueprint, handles 404/500 errors, starts server on port 5000.
   - **Connected to:** `routes/api_routes.py`, `database/db.py`.

2. **`backend/routes/api_routes.py`**
   - **Purpose:** API controller exposing REST endpoints.
   - **What it does:** Maps routes (`/api/packet/journey`, `/api/topology`, `/api/ai/analyze`, `/api/history`, `/api/scenarios`) to internal engine functions.
   - **Connected to:** All engines in `backend/simulation/`, `backend/ai/`, and `backend/database/`.

3. **`backend/simulation/topology.py`**
   - **Purpose:** Graph topology representation & Dijkstra pathfinding engine.
   - **What it does:** Stores nodes (PC, Switch, Router, Server) and links, calculates shortest path using a min-heap priority queue ($O((V+E)\log V)$), and supports node disabling (router failure).
   - **Connected to:** `backend/simulation/packet_engine.py`.

4. **`backend/simulation/encapsulation.py`**
   - **Purpose:** Protocol Data Unit (PDU) encapsulation/decapsulation builder.
   - **What it does:** Generates L7 Application payload, L4 TCP/UDP ports/flags/checksum, L3 IPv4 headers/TTL/One's complement header checksum, L2 Ethernet MAC frames/CRC-32 FCS, and L1 digital bitstream hex representation.
   - **Connected to:** `backend/simulation/packet_engine.py`.

5. **`backend/ai/analyzer.py`**
   - **Purpose:** Telemetry analysis & natural language diagnosis engine.
   - **What it does:** Runs scaled feature vectors through Isolation Forest and Random Forest ML models. If models are absent, executes a fallback heuristic rule engine. Formulates natural language explanations.
   - **Connected to:** `backend/models/`, `backend/routes/api_routes.py`.

6. **`backend/database/db.py`**
   - **Purpose:** SQLite database persistence layer.
   - **What it does:** Saves simulation records, fetches audit logs, clears history, and calculates aggregate metrics for the dashboard.
   - **Connected to:** `netpath_ai.db`.

7. **`frontend/src/pages/PacketSimulator.jsx`**
   - **Purpose:** Main simulation page.
   - **What it does:** Renders form controls to build custom packets, initiates journey execution, animates node traversal, displays step-by-step progress, and shows AI diagnosis.
   - **Connected to:** `frontend/src/services/api.js`.

8. **`frontend/src/pages/AIAnalyzer.jsx`**
   - **Purpose:** Interactive AI telemetry sandbox view.
   - **What it does:** Provides interactive range sliders for Latency, Loss, Throughput, Retransmissions, Jitter, Hops, TTL, and size to test ML inference live in real time.
   - **Connected to:** `POST /api/ai/analyze`.

---

## 7. USER ROLES

* **Role Implementation Status:** **Single-Role System (No Authentication / Multi-Tenancy)**.
* **Explanation:** NetPath AI is built as an open educational laboratory simulator. All users accessing the application have full administrative and operational access to simulate packets, toggle node status, run scenarios, test AI models, and manage simulation history logs.

---

## 8. COMPLETE USER WORKFLOW

```
Launch Application (http://localhost:3000)
       │
       ▼
Dashboard View (View System Health, Total Packets, Avg Latency, Network Health Badge)
       │
       ├──► 1. Open Packet Simulator (/simulator)
       │       - Adjust Source/Dest IP, Ports, Payload, Protocol
       │       - Click "GENERATE & SIMULATE PACKET"
       │       - View dynamic Dijkstra trajectory animation on network canvas
       │       - Inspect 7-Layer OSI encapsulation stack and AI Telemetry Card
       │
       ├──► 2. Open Network Topology (/topology)
       │       - View full node & link layout (PC1, Laptop1, AP1, SW1, R1, R2, R3, SW2, Server1)
       │       - Click "FAIL ROUTER R2" button to disable core router
       │       - Observe dynamic recalculation of Dijkstra path via backup Router R3
       │
       ├──► 3. Open AI Analyzer (/ai-analyzer)
       │       - Drag Latency, Packet Loss, and Retransmission sliders
       │       - Observe live ML classification update (HEALTHY / WARNING / CRITICAL)
       │       - Review natural language root-cause cause & engineering recommendation
       │
       ├──► 4. Open Wireshark Packet Inspector (/packet-details)
       │       - View raw Ethernet, IPv4, TCP/UDP headers and hex dumps
       │
       ├──► 5. Run Educational Scenarios (/scenarios)
       │       - Select pre-configured scenario (e.g. TTL Expiration, Packet Loss, Failover)
       │       - Click "RUN SCENARIO" to observe preset network anomalies
       │
       └──► 6. View History & Reports (/history)
               - Inspect chronological SQLite simulation log table
               - Click "EXPORT / PRINT REPORT" to print executive report
```

---

## 9. FEATURE-BY-FEATURE EXPLANATION

### 1. Dynamic Packet Simulator & Trajectory Animator
1. **Purpose:** To visualize end-to-end packet transmission across an enterprise network.
2. **Who Uses It:** Students & instructors.
3. **Input:** Source IP, Destination IP, Source Port, Destination Port, Payload, Packet Size, Protocol (TCP/UDP), TTL.
4. **Processing:**
   - Input validation (Regex check for IPv4, Port bounds).
   - Dijkstra shortest path solver calculates sequence of network nodes.
   - Encapsulation engine builds header parameters.
   - Trajectory steps generated for UI state updates.
5. **Backend/API Involved:** `POST /api/packet/journey`.
6. **Database Involved:** Saves simulation output to `simulation_history` in `netpath_ai.db`.
7. **Output:** Complete trajectory JSON with metrics, path array, encapsulation steps, and AI analysis.
8. **What the User Sees:** Animated packet moving along nodes on an SVG canvas, step-by-step OSI layer stack, and summary metrics.
9. **Real-World Importance:** Explains how packets transition across real network hardware.
10. **Limitations:** Animation speed is fixed to simulated intervals; does not capture physical layer electromagnetic interference directly.

### 2. Graph Topology & Link-State Router Failover Engine
1. **Purpose:** To demonstrate dynamic routing and fault tolerance using Dijkstra's algorithm.
2. **Who Uses It:** Network engineering students.
3. **Input:** Node failure toggle (e.g., set Router R2 status to offline).
4. **Processing:** Node status updated in `NetworkTopology` instance. `heapq`-based Dijkstra algorithm re-executes to recalculate shortest weighted path avoiding offline nodes.
5. **Backend/API Involved:** `GET /api/topology`, `POST /api/topology/failure`.
6. **Database Involved:** None (in-memory topology graph state).
7. **Output:** Recalculated path node array (e.g., rerouted from `R1 -> R2 -> SW2` to `R1 -> R3 -> SW2`).
8. **What the User Sees:** Node color turns red (offline), and green path line shifts to backup router R3.
9. **Real-World Importance:** Demonstrates routing protocol behavior (OSPF/IS-IS link-state rerouting during link outages).
10. **Limitations:** Pre-defined node topology (9 nodes); graph addition of custom nodes is not exposed in UI.

### 3. Hybrid AI Telemetry & Anomaly Diagnostics Engine
1. **Purpose:** To detect telemetry anomalies and classify network health using Machine Learning.
2. **Who Uses It:** Students studying AI applications in networking.
3. **Input:** 8 telemetry features: `[packet_size, latency, packet_loss, throughput, retransmissions, hops, ttl, jitter]`.
4. **Processing:** Standardized feature vector → Isolation Forest prediction (-1 for anomaly) → Random Forest classifier (`HEALTHY`, `WARNING`, `CRITICAL`) → Heuristic explanation generator.
5. **Backend/API Involved:** `POST /api/ai/analyze`.
6. **Database Involved:** None for sandbox analysis; stored during packet simulation runs.
7. **Output:** JSON containing `is_anomaly`, `health_status`, `risk_level`, `confidence`, `reason`, `recommendation`.
8. **What the User Sees:** Real-time ML diagnostic card, risk gauge badge, feature weight distribution chart, and English recommendations.
9. **Real-World Importance:** Automated AIOps (Artificial Intelligence for IT Operations) and automated network root-cause diagnosis.
10. **Limitations:** Trained on 5,000 synthetic dataset samples generated by `ai/dataset.py`.

### 4. 7-Layer OSI & 4-Layer TCP/IP Encapsulation Visualizer
1. **Purpose:** To show how data payloads are wrapped with headers at each protocol layer.
2. **Who Uses It:** Students studying fundamental OSI 7-layer model.
3. **Input:** Packet payload and application protocol.
4. **Processing:** Generates application header (L7), TCP/UDP segment headers (L4), IPv4 datagram headers & One's complement checksum (L3), Ethernet MAC frame & CRC-32 FCS (L2), and binary bit stream (L1).
5. **Backend/API Involved:** `POST /api/packet/create`.
6. **Database Involved:** None.
7. **Output:** Structured layer stack representation.
8. **What the User Sees:** Interactive vertical stack showing encapsulated headers at each layer.
9. **Real-World Importance:** Essential core topic for Computer Networks exams and technical interviews.
10. **Limitations:** Visual simulation of protocol headers rather than raw binary socket stream.

### 5. Wireshark-Style Protocol Inspector
1. **Purpose:** To inspect raw packet headers and hexadecimal memory representation.
2. **Who Uses It:** Students practicing packet analysis.
3. **Input:** Simulation record details.
4. **Processing:** Hex dump conversion of packet payload and formatted fields.
5. **Backend/API Involved:** Built from simulation output JSON.
6. **Database Involved:** Reads history from `netpath_ai.db`.
7. **Output:** Protocol field tree view and 16-byte hex grid with ASCII representation.
8. **What the User Sees:** Dark-themed Wireshark packet detail panel.
9. **Real-World Importance:** Familiarizes students with industry-standard diagnostic tools.
10. **Limitations:** Inspector displays simulated protocol fields rather than parsing live `.pcap` files.

### 6. Preset Educational Scenarios
1. **Purpose:** To provide instant 1-click demonstrations of key network phenomena.
2. **Who Uses It:** Instructors presenting in lectures.
3. **Input:** Scenario selection (e.g. *TTL Expiration Loop*, *Severe Packet Loss*, *Core Router Failure*).
4. **Processing:** Loads preset parameters and scenario flags, runs packet journey, returns full results.
5. **Backend/API Involved:** `GET /api/scenarios`, `POST /api/scenario/run`.
6. **Database Involved:** Saves run result to `simulation_history`.
7. **Output:** Scenario execution result and visual rendering.
8. **What the User Sees:** Dedicated scenario selection cards with 1-click "Run Experiment" buttons.
9. **Real-World Importance:** Accelerates classroom demonstrations.
10. **Limitations:** Fixed set of 7 pre-configured scenarios.

### 7. SQLite Telemetry History & Printable Executive Report Generator
1. **Purpose:** To log historical simulation telemetry and generate print-ready diagnostic reports.
2. **Who Uses It:** Students submitting lab assignments and project documentation.
3. **Input:** Filter queries, search terms, report export action.
4. **Processing:** SQLite queries (`SELECT`, `DELETE`), browser print styling `@media print`.
5. **Backend/API Involved:** `GET /api/history`, `DELETE /api/history/<id>`, `POST /api/history/clear`.
6. **Database Involved:** `netpath_ai.db` (`simulation_history` table).
7. **Output:** Filtered history table and printable executive PDF view.
8. **What the User Sees:** Data table with search/delete actions and clean printable report modal.
9. **Real-World Importance:** Provides audit trail capabilities for network incident reports.
10. **Limitations:** Browser-native print-to-PDF rendering rather than server-side PDF library generator.

---

## 10. DATABASE

* **Database Engine:** SQLite 3 (Embedded relational database)
* **File Location:** `backend/netpath_ai.db`

### Table Schema: `simulation_history`

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique record ID |
| `packet_id` | TEXT | UNIQUE NOT NULL | Generated packet ID (e.g. `PKT-A1B2C3`) |
| `source_ip` | TEXT | NOT NULL | Source IPv4 address |
| `destination_ip` | TEXT | NOT NULL | Destination IPv4 address |
| `protocol` | TEXT | NOT NULL | Transport protocol (`TCP` / `UDP`) |
| `app_protocol` | TEXT | NULLABLE | Application protocol (`HTTP`, `DNS`, etc.) |
| `payload` | TEXT | NULLABLE | Text payload message |
| `packet_size` | INTEGER | NULLABLE | Size in bytes |
| `latency` | REAL | NULLABLE | Simulated round-trip time (ms) |
| `packet_loss` | REAL | NULLABLE | Simulated packet loss percentage |
| `throughput` | REAL | NULLABLE | Measured bandwidth throughput (Mbps) |
| `retransmissions` | INTEGER | NULLABLE | Number of TCP retransmit cycles |
| `hops` | INTEGER | NULLABLE | Total routing hop count |
| `ttl` | INTEGER | NULLABLE | Time To Live header value |
| `jitter` | REAL | NULLABLE | Latency variation (ms) |
| `status` | TEXT | NULLABLE | Delivery status (`DELIVERED`, `DROPPED`) |
| `ai_status` | TEXT | NULLABLE | Anomaly flag (`normal` / `anomaly`) |
| `ai_health` | TEXT | NULLABLE | Classification (`HEALTHY`, `WARNING`, `CRITICAL`) |
| `ai_risk` | TEXT | NULLABLE | Risk evaluation (`low`, `moderate`, `high`, `critical`) |
| `ai_confidence` | REAL | NULLABLE | ML prediction confidence (0.0 to 1.0) |
| `ai_reason` | TEXT | NULLABLE | Natural language root-cause diagnosis |
| `ai_recommendation` | TEXT | NULLABLE | Engineering recommendation |
| `path_taken` | TEXT | NULLABLE | Node traversal string (e.g. `PC1 -> SW1 -> R1 -> R2 -> SW2 -> Server1`) |
| `timestamp` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

* **Data Lifetime:**
  - **Created:** Automatically when a simulation or scenario is executed.
  - **Updated:** Replaced if `packet_id` collides (`INSERT OR REPLACE`).
  - **Deleted:** Single record deletion via `DELETE /api/history/<id>` or bulk wipe via `POST /api/history/clear`.

---

## 11. API DOCUMENTATION

| Method | Endpoint | Purpose | Auth | Input | Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend & ML service status | None | None | `{ status: "healthy", ml_model_active: bool, ... }` |
| `GET` | `/api/topology` | Fetch complete graph topology | None | None | `{ success: true, topology: { nodes, links } }` |
| `POST` | `/api/topology/failure` | Toggle node active/offline status | None | `{ node_id: "R2", is_active: false }` | `{ success: true, new_status: "offline", recalculated_path: {...} }` |
| `POST` | `/api/packet/create` | Validate fields & build encapsulation | None | Packet parameters JSON | `{ success: true, packet_data: {...}, encapsulation: {...} }` |
| `POST` | `/api/packet/journey` | Execute full journey simulation | None | Packet parameters & scenario flags | `{ success: true, simulation: {...}, ai_analysis: {...} }` |
| `POST` | `/api/ai/analyze` | Run ML inference on telemetry | None | Telemetry feature dict | `{ success: true, analysis: { health_status, risk_level, reason, ... } }` |
| `GET` | `/api/metrics` | Fetch dashboard KPI summary | None | None | `{ success: true, summary: { total_packets, avg_latency, network_health, ... } }` |
| `GET` | `/api/scenarios` | List preset educational scenarios | None | None | `{ success: true, scenarios: [...] }` |
| `POST` | `/api/scenario/run` | Execute preset scenario by ID | None | `{ scenario_id: "ROUTER_FAILURE" }` | `{ success: true, simulation: {...}, ai_analysis: {...} }` |
| `GET` | `/api/history` | Fetch simulation history logs | None | Query params `limit`, `offset` | `{ success: true, count: int, history: [...] }` |
| `GET` | `/api/history/<id>` | Fetch single simulation record | None | Path param `record_id` | `{ success: true, record: {...} }` |
| `DELETE`| `/api/history/<id>` | Delete single history record | None | Path param `record_id` | `{ success: true }` |
| `POST` | `/api/history/clear` | Wipe all history records | None | None | `{ success: true, message: "History cleared." }` |

---

## 12. AUTHENTICATION & SECURITY

* **Current Implementation:**
  - **Authentication:** None (Designed for local educational laboratory sandbox execution).
  - **Authorization:** None (All endpoints public).
  - **Input Validation:** Rigorous backend regex validation on IPv4 addresses (`IP_REGEX`), numeric port boundaries (`1–65535`), packet sizes (`64–9000 bytes`), and TTL range (`1–255`) implemented in `PacketEngine.validate_packet_input()`.
  - **SQL Injection Prevention:** Parameterized SQL queries (`?` placeholders) used across all SQLite database operations in `backend/database/db.py`.
  - **CORS Security:** Flask-CORS enabled globally for API endpoints.

* **Future Security Improvements:**
  - Implement JWT (JSON Web Tokens) or session-based user authentication.
  - Add Role-Based Access Control (RBAC) separating Student and Instructor roles.
  - Implement API rate-limiting using Flask-Limiter to prevent request flooding.

---

## 13. AI/ML EXPLANATION

### Why AI/ML is Used
In real-world networks, identifying network anomalies (such as bufferbloat, link degradation, asymmetric duplex mismatch, or micro-burst congestion) from raw 8-dimensional telemetry metrics is difficult using simple fixed thresholds. Unsupervised Machine Learning isolates statistical anomalies, while ensemble classification predicts overall network health status.

### Machine Learning Architecture
1. **Model 1: Isolation Forest (Unsupervised Anomaly Detection)**
   - **Algorithm:** `sklearn.ensemble.IsolationForest`
   - **Purpose:** Identifies telemetry outliers by calculating average tree path isolation depth $h(x)$. Anomaly score is computed from decision function.
2. **Model 2: Random Forest Classifier (Supervised Health State Classifier)**
   - **Algorithm:** `sklearn.ensemble.RandomForestClassifier`
   - **Purpose:** Predicts multi-class health state (`HEALTHY`, `WARNING`, `CRITICAL`) and returns class probabilities.
3. **Model 3: StandardScaler**
   - **Algorithm:** `sklearn.preprocessing.StandardScaler`
   - **Purpose:** Standardizes 8 telemetry features to zero mean and unit variance.

### 8 Telemetry Features Evaluated
$$\vec{x} = [\text{packet\_size}, \text{latency}, \text{packet\_loss}, \text{throughput}, \text{retransmissions}, \text{hops}, \text{ttl}, \text{jitter}]$$

### Natural Language Diagnostic Generator
After predictions are generated, `NetworkAIAnalyzer.generate_explanation()` evaluates domain-specific engineering rules to construct English root-cause diagnosis statements and actionable recommendations (e.g. recommending Active Queue Management CoDel, checking TCP MSS/MTU negotiation, or auditing OSPF cost metrics).

### Complete AI Inference Flow Example

```
Incoming Telemetry Metrics:
{ latency: 280ms, packet_loss: 18.5%, throughput: 28Mbps, retransmissions: 5, hops: 4 }
                           │
                           ▼
StandardScaler normalizes features to Z-scores
                           │
                           ▼
Isolation Forest returns score (-0.18) -> Flagged as ANOMALY (Confidence: 91%)
                           │
                           ▼
Random Forest Classifier predicts state -> CRITICAL (Probabilities: [0.05, 0.15, 0.80])
                           │
                           ▼
Diagnostic Generator synthesizes explanation:
"Reason: Severe packet drop rate detected (18.5%) exceeding SLA threshold. Elevated latency (280ms).
 Possible Cause: Interface queue buffer overflow or physical link noise.
 Recommendation: Inspect switch interface queue depth and verify CRC error counters."
```

---

## 14. EXTERNAL APIs & SERVICES

* **External APIs Used:** **None**.
* **Explanation:** NetPath AI is 100% self-contained and operates entirely offline without external third-party web services, cloud APIs, or external SaaS dependencies. All simulations, path calculations, machine learning inferences, and database operations run locally on the user's system.

---

## 15. RUNNING THE PROJECT

### Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### Installation & Execution Commands

#### 1. Backend Server Setup
```powershell
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate Virtual Environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# (For Linux/macOS use: source venv/bin/activate)

# Install Python dependencies
pip install -r requirements.txt

# Start Flask Backend Server
python app.py
```
*Backend URL:* **`http://127.0.0.1:5000`**

#### 2. Frontend Application Setup
Open a second terminal window:
```powershell
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite Development Server
npm run dev
```
*Frontend URL:* **`http://localhost:3000`**

---

## 16. HOW TO OPERATE / DEMO THE PROJECT

### Live Presentation & Demonstration Script

* **Step 1 → Open Application Dashboard (`/`):**
  - Point out the **"Engine Online"** and **"Isolation Forest ML Active"** health badges.
  - Highlight the KPI cards (Total Packets, Average Latency, Network Health).
  - *Internal Action:* React fetched system state via `GET /api/health` and `GET /api/metrics`.

* **Step 2 → Open Packet Simulator (`/simulator`):**
  - Keep default settings (Source IP `192.168.1.10`, Dest IP `192.168.2.20`, HTTP protocol).
  - Click **"GENERATE & SIMULATE PACKET"**.
  - *Internal Action:* Backend executes Dijkstra pathfinding (`PC1 -> SW1 -> R1 -> R2 -> SW2 -> Server1`), calculates telemetry physics, runs AI inference, and saves the run to SQLite.

* **Step 3 → Explain Topology Canvas Traversal:**
  - Watch the packet step visually across nodes on the canvas.
  - Explain how the graph solver identified Core Router R2 as the primary least-cost path.

* **Step 4 → Inspect Layer Stack Visualizer:**
  - Click the **"OSI / TCP-IP Layer Stack"** tab.
  - Demonstrate descending encapsulation (Data → Segment → Datagram → Frame → Bitstream).

* **Step 5 → Demonstrate Core Router Hardware Failure (`/topology`):**
  - Navigate to **"Network Topology"**.
  - Click **"FAIL ROUTER R2"** to simulate a core router crash.
  - Observe how the green active path line reroutes to **backup Router R3**.
  - *Internal Action:* Dijkstra graph solver updated adjacency matrix excluding disabled node `R2` and recalculated optimal path via `R3`.

* **Step 6 → Demonstrate Interactive AI Telemetry Sandbox (`/ai-analyzer`):**
  - Navigate to **"AI Analyzer"**.
  - Drag the **Packet Loss slider to 22%** and **Latency slider to 310 ms**.
  - Show how the ML badge updates live to **`CRITICAL`** with a red risk gauge.
  - Read the natural language AI diagnosis and recommendation generated by the engine.

* **Step 7 → View Wireshark Packet Breakdown (`/packet-details`):**
  - Navigate to **"Packet Details"**.
  - Show Ethernet MAC addresses, IPv4 header checksums, TCP ports, and raw hexadecimal payload dumps.

* **Step 8 → Execute Educational Scenario (`/scenarios`):**
  - Navigate to **"Scenarios"**.
  - Click **"RUN SCENARIO"** on *TTL Expiration Loop*.
  - Show packet drop when TTL reaches 0 and explanation of ICMP Time Exceeded message.

* **Step 9 → View Audit Logs & Print Executive Report (`/history`):**
  - Navigate to **"History & Reports"**.
  - Show chronological SQLite log table.
  - Click **"EXPORT / PRINT REPORT"** to display executive printable report modal.

---

## 17. SAMPLE DEMO SCENARIOS

### Scenario A: Normal Enterprise Web Traffic
* **User Action:** Simulate standard HTTP GET request from `PC1` (`192.168.1.10`) to `Server1` (`192.168.2.20`) with 0% packet loss.
* **System Processing:** Dijkstra calculates path `PC1 -> SW1 -> R1 -> R2 -> SW2 -> Server1`. Metrics compute latency 24 ms, loss 0%, throughput 480 Mbps. Isolation Forest marks status as `normal`. Random Forest predicts `HEALTHY`.
* **Output:** Green success notification, 100% path trajectory completion, optimal telemetry badge.
* **Real-World Benefit:** Establishes baseline measurement for normal operational conditions.

### Scenario B: Core Router Failure & Automatic Rerouting
* **User Action:** User toggles Primary Core Router `R2` to offline status, then clicks simulate packet.
* **System Processing:** Dijkstra detects `R2` disabled, recomputes graph traversal using backup path `R1 -> R3 -> SW2`. Telemetry factors slight backup link latency increase (+12 ms). Isolation Forest marks status as `normal` (path available), Random Forest predicts `HEALTHY` or `WARNING`.
* **Output:** Packet successfully arrives at `Server1` via secondary core router `R3`.
* **Real-World Benefit:** Demonstrates automated high-availability (HA) network failover and link-state routing convergence.

---

## 18. INPUT → PROCESS → OUTPUT TABLE

| Feature | Input Parameters | Internal Processing | Generated Output |
| :--- | :--- | :--- | :--- |
| **Packet Simulation** | IPs, Ports, Protocol, Payload, Size, TTL | Dijkstra pathfinding + PDU Encapsulation + Telemetry calculation + AI inference | Visual canvas traversal, layer stack, AI diagnosis card |
| **Router Failure** | Node ID (`R2`), active boolean status | Update node graph state, re-run min-heap Dijkstra solver | Updated topology layout and rerouted path array |
| **AI Telemetry Analysis**| 8 QoS metrics (latency, loss, throughput, retx, etc.) | Standard scaling + Isolation Forest score + Random Forest classification | Health state badge, risk level, natural language root-cause report |
| **Scenario Execution** | Scenario ID string | Load preset parameters & flags, run simulation pipeline | Automated execution results and educational summary |
| **History Audit & Export**| Filter query / Record ID | SQLite `SELECT` query / Browser window print execution | Tabular history log table & printable executive report |

---

## 19. ERROR HANDLING

* **Invalid IPv4 / Port Input:** Validated via regex. Returns `422 Unprocessable Entity` with specific field errors. Frontend displays inline red validation error messages.
* **Network Partitioning / Unreachable Destination:** If all routing paths to destination are blocked by node failures, Dijkstra returns `success: false`. Backend returns `400 Bad Request` with message *"No available route found due to network partitioning"*.
* **Missing Machine Learning Models:** If `.joblib` files are missing or unreadable, `NetworkAIAnalyzer` catches the exception and automatically engages the **Rule-Based Fallback Engine**, printing a fallback message without crashing the server.
* **Database Connection Errors:** SQLite operations wrapped in `try-except` blocks. If database writes fail, API returns `500 Internal Server Error` with formatted JSON error details.

---

## 20. CURRENT IMPLEMENTATION STATUS

### Fully Implemented
- Complete 7-Layer OSI & 4-Layer TCP/IP Encapsulation and Decapsulation builder.
- Dijkstra Shortest Path routing solver with dynamic link weight calculation.
- Router node failure toggle and automatic path rerouting.
- Scikit-learn Machine Learning Anomaly Detection (Isolation Forest) & Classification (Random Forest).
- Robust Heuristic Rule-Based Fallback AI Engine.
- Wireshark-style protocol header & hex dump viewer.
- Interactive AI Telemetry Sandbox with live sliders.
- Recharts QoS time-series metrics visualizations.
- 7 Educational preset scenarios.
- SQLite database persistence, history audit logging, and clear options.
- Executive printable PDF report generator.
- 14 Pytest unit & integration test suites.

### Partially Implemented
- **Custom Topology Canvas Dragging:** Nodes are rendered at fixed coordinates defined in `topology.py`; freeform user node dragging/adding is not currently available in the UI.

### UI / Mock / Demo Only
- **None:** All visual UI elements in NetPath AI are backed by actual backend simulation calculations, graph pathfinding, ML inference, or SQLite database queries.

---

## 21. LIMITATIONS

1. **Simulated Physics Engine:** QoS telemetry metrics (latency, jitter, drop rates) are calculated mathematically based on hop distance and simulation flags rather than sniffing live hardware interface drivers.
2. **Fixed 9-Node Reference Topology:** The default topology consists of 9 pre-defined nodes (`PC1`, `Laptop1`, `AP1`, `SW1`, `R1`, `R2`, `R3`, `SW2`, `Server1`). Adding arbitrary custom nodes via UI is not supported.
3. **Synthetic Training Data:** Machine Learning models are trained on 5,000 synthetic telemetry samples generated by `ai/dataset.py` rather than live production enterprise network traces.

---

## 22. FUTURE SCOPE

* **Short-Term Improvements:**
  - Drag-and-drop interactive canvas editor allowing users to place custom routers, switches, and hosts.
  - CSV export option for simulation history logs.
* **AI/ML Improvements:**
  - Deep Learning LSTM (Long Short-Term Memory) neural networks for predicting future network congestion trends based on historical telemetry time-series.
* **Security & Scalability Improvements:**
  - Multi-user authentication (JWT) and student submission portals for lab assignments.
  - Containerization using Docker and Docker-Compose for single-command deployment.

---

## 23. PROJECT ADVANTAGES

1. **High Pedagogical Value:** Makes abstract OSI layer encapsulation and Dijkstra routing algorithms visual, tangible, and easy to understand.
2. **Zero Dependencies & Robust Fallback:** Runs completely locally without requiring cloud subscriptions or internet access; includes automatic rule-based fallback if ML models are absent.
3. **Comprehensive Feature Set:** Integrates packet visualizer, Wireshark header inspector, ML sandbox, and scenario runner into a unified web application.

---

## 24. REAL-WORLD APPLICATIONS

1. **Higher Education Laboratories:** Used in undergraduate and graduate Computer Science and Computer Networks laboratory courses.
2. **Network Engineering Training:** Training junior network administrators on link-state routing behavior, failover mechanisms, and basic QoS metrics.
3. **AIOps & Network Monitoring Research:** Benchmarking unsupervised anomaly detection algorithms (Isolation Forest) against network telemetry datasets.

---

## 25. PROJECT NOVELTY & UNIQUENESS

* **Dynamic Algorithmic Rerouting:** Automatically recalculates Dijkstra shortest path and updates PDU headers in real-time when network hardware fails.
* **Dual-Layer AI Diagnostic Engine:** Combines Machine Learning statistical inference with domain-specific engineering heuristic rules to produce clear English explanations.
* **Wireshark + Visual Simulator Integration:** Combines visual canvas graph animation with low-level protocol header hex dumps in a single tool.

---

## 26. VIVA PREPARATION (20 KEY QUESTIONS & ANSWERS)

### Q1: What is NetPath AI?
> **Answer:** NetPath AI is an educational interactive web platform that visually animates network packet transmission across 7 OSI / 4 TCP-IP layers, executes dynamic Dijkstra pathfinding, and evaluates QoS metrics using Machine Learning.

### Q2: Which algorithm is used for network pathfinding in your project?
> **Answer:** Dijkstra's Algorithm, implemented using a min-heap priority queue with time complexity $O((V + E) \log V)$.

### Q3: What happens when a core router (e.g. Router R2) fails during simulation?
> **Answer:** The topology solver sets node status to offline, excluding it from the adjacency matrix. Dijkstra's algorithm immediately recalculates the optimal alternate path via backup Router R3.

### Q4: Why did you choose Isolation Forest for anomaly detection?
> **Answer:** Isolation Forest is an unsupervised anomaly detection algorithm. Network anomalies are rare and often unlabelled; Isolation Forest isolates anomalous points near the tree root without requiring labelled training datasets.

### Q5: What machine learning model is used for network health classification?
> **Answer:** Random Forest Classifier (`sklearn.ensemble.RandomForestClassifier`), which evaluates feature consensus across decision trees to classify network state into `HEALTHY`, `WARNING`, or `CRITICAL`.

### Q6: What features are fed into the Machine Learning model?
> **Answer:** 8 telemetry features: Packet Size, Latency, Packet Loss %, Throughput, Retransmissions, Hops, TTL, and Jitter.

### Q7: What happens if the Machine Learning `.joblib` model files fail to load?
> **Answer:** The application catches the exception and automatically engages a Heuristic Rule-Based Fallback Engine, ensuring zero downtime and continuous operation.

### Q8: What database engine is used in this project?
> **Answer:** SQLite 3, an embedded relational database stored locally in `backend/netpath_ai.db`.

### Q9: How does the application perform PDU encapsulation?
> **Answer:** `EncapsulationEngine` generates headers descending from Application (L7) -> Transport (L4) -> Network (L3) -> Data Link (L2) -> Physical (L1), calculating IPv4 One's Complement Checksums and CRC-32 FCS values.

### Q10: What framework is used for the backend API?
> **Answer:** Python Flask 3.0 with Flask-CORS and Blueprint routing.

### Q11: What library is used for the frontend user interface?
> **Answer:** React 19 bundled with Vite 6 and styled using Tailwind CSS 3.4.

### Q12: How are real-time telemetry metrics visualized?
> **Answer:** Interactive time-series area charts and throughput histograms rendered using the Recharts library.

### Q13: What happens when an IP packet's TTL reaches 0?
> **Answer:** The intermediate router discards the packet to prevent infinite routing loops and triggers an ICMP Time Exceeded event, demonstrated in our *TTL Expiration* scenario.

### Q14: How does TCP handle packet loss in your simulator?
> **Answer:** When a packet drop is simulated on a link, TCP Retransmission Timeouts (RTO) or Fast Retransmit are triggered, resending the segment and incrementing the retransmission counter.

### Q15: How are input packet fields validated?
> **Answer:** Backend regex checks validate IPv4 address formats, numeric port ranges (1–65535), packet sizes (64–9000 bytes), and TTL values (1–255).

### Q16: How do frontend and backend communicate?
> **Answer:** Asynchronous HTTP REST API calls returning JSON responses, configured via Vite dev server proxy (`/api -> http://127.0.0.1:5000`).

### Q17: Can this project be used for classroom lab demonstrations?
> **Answer:** Yes, it includes 7 preset scenarios, an interactive AI sandbox, and printable PDF report generation specifically designed for academic lectures and lab assignments.

### Q18: What is the computational complexity of your Dijkstra routing solver?
> **Answer:** $O((V + E) \log V)$ where $V$ is the number of network nodes (routers/switches/hosts) and $E$ is the number of physical interconnect links.

### Q19: Is any cloud service or third-party API required to run this app?
> **Answer:** No, NetPath AI is 100% self-contained and operates completely offline on local hardware.

### Q20: What are the main future scope enhancements?
> **Answer:** Implementing interactive drag-and-drop custom topology node creation, LSTM deep learning models for time-series throughput forecasting, and Docker containerization.

---

## 27. RECOMMENDED PRESENTATION (PPT) STRUCTURE

```
Slide 1:  Title & Team Overview
          - Project Name: NetPath AI
          - Subtitle: AI-Based Packet Journey Visualizer & Intelligent Network Telemetry

Slide 2:  Introduction & Problem Statement
          - Theoretical computer network models (OSI/TCP-IP) are abstract and hard to visualize.
          - Command-line tools (traceroute, ping) lack visual layer-by-layer PDU encapsulation.
          - Need for an interactive visual simulator with integrated AI diagnostics.

Slide 3:  Project Objectives
          - Animate 7-layer OSI / 4-layer TCP-IP packet encapsulation in real-time.
          - Implement dynamic Dijkstra shortest path router solver with instant router failover.
          - Integrate Isolation Forest ML & Random Forest for automated QoS anomaly detection.

Slide 4:  Curriculum & Syllabus Alignment
          - Unit I: Physical & Data Link Fundamentals (Topologies, OSI vs TCP/IP).
          - Unit II: Framing & Error Control (Ethernet IEEE 802.3, MAC, CRC-32).
          - Unit III: Network Layer (IPv4, TTL, Dijkstra Shortest Path).
          - Unit IV: Transport Layer (TCP 3-Way Handshake, RTO Retransmissions).
          - Unit V: Application & Network Intelligence (HTTP, QoS, Isolation Forest AI).

Slide 5:  System Architecture
          - Text-based block diagram showing React Frontend -> Flask REST API -> Dijkstra/Encapsulation Engines -> Machine Learning Models -> SQLite DB.

Slide 6:  Technology Stack
          - Table showing Python, Flask, Scikit-learn, React 19, Vite 6, Tailwind CSS, SQLite.

Slide 7:  Dynamic Routing & Router Failover Mechanism
          - Dijkstra min-heap algorithm $O((V+E)\log V)$.
          - Demonstration of path rerouting from Primary Router R2 to Backup Router R3 upon link outage.

Slide 8:  7-Layer OSI & 4-Layer TCP/IP Encapsulation
          - PDU header generation breakdown (Data -> Segment -> Datagram -> Frame -> Bits).
          - Wireshark protocol inspector and hexadecimal dump view.

Slide 9:  Machine Learning & AI Diagnostic Architecture
          - 8-dimensional telemetry feature vector.
          - Isolation Forest (Unsupervised Anomaly Score) + Random Forest (Health Classifier).
          - Natural language root-cause diagnosis synthesis.

Slide 10: Live Demonstration Screenshots / Video
          - Screenshot of Canvas Visualizer, AI Telemetry Card, and Wireshark Header View.

Slide 11: Results & Key Features
          - Real-time packet journey visualizer.
          - 7 Educational scenarios.
          - Printable PDF executive diagnostic report.

Slide 12: Advantages & Real-World Applications
          - University Computer Networks laboratories.
          - Network engineering training.
          - Zero external dependencies; 100% offline operation.

Slide 13: Limitations & Future Scope
          - Fixed 9-node default graph; future scope includes drag-and-drop topology builder.
          - Synthetic ML dataset; future scope includes deep learning LSTM network forecasting.

Slide 14: Conclusion & Q&A
          - Summary statement and invitation for examiner questions.
```

---

## 28. PROJECT REPORT OUTLINE

```
CHAPTER 1: INTRODUCTION
  1.1 Overview & Motivation
  1.2 Problem Statement
  1.3 Project Objectives
  1.4 Organization of the Report

CHAPTER 2: LITERATURE SURVEY & THEORETICAL BACKGROUND
  2.1 Review of OSI 7-Layer and TCP/IP 4-Layer Reference Models
  2.2 Overview of Graph Pathfinding Algorithms (Dijkstra's Algorithm)
  2.3 Anomaly Detection in Network Telemetry using Machine Learning
  2.4 Comparative Analysis of Existing Network Simulators (Cisco Packet Tracer, Wireshark, GNS3)

CHAPTER 3: SYSTEM REQUIREMENTS & SPECIFICATIONS
  3.1 Functional Requirements
  3.2 Non-Functional Requirements
  3.3 Software Requirements (Python 3.10+, Flask, Scikit-Learn, React 19, Vite, SQLite)
  3.4 Hardware Requirements

CHAPTER 4: SYSTEM ARCHITECTURE & DESIGN
  4.1 High-Level System Architecture
  4.2 Graph Topology & Dijkstra Solver Module Design
  4.3 Protocol Data Unit (PDU) Encapsulation Engine Design
  4.4 Machine Learning Anomaly Detection Subsystem Design
  4.5 Database Schema & Entity-Relationship (ER) Design

CHAPTER 5: IMPLEMENTATION DETAILS
  5.1 Backend REST API Implementation (Flask & Blueprints)
  5.2 Simulation & Encapsulation Engine Implementation
  5.3 Machine Learning Model Training & Rule-Based Fallback Engine
  5.4 Frontend User Interface Implementation (React SPA & Tailwind CSS)

CHAPTER 6: TESTING & VERIFICATION
  6.1 Automated Unit & Integration Testing (Pytest Suite)
  6.2 Scenario-Based Validation (Router Failover, Packet Loss, TTL Expiration)
  6.3 Machine Learning Precision & Performance Evaluation

CHAPTER 7: RESULTS & DISCUSSION
  7.1 Dashboard & Telemetry KPI Renders
  7.2 Wireshark Header Inspection & Hex Dumps
  7.3 Executive Printable Diagnostic Reports

CHAPTER 8: CONCLUSION & FUTURE SCOPE
  8.1 Conclusion
  8.2 Limitations
  8.3 Future Enhancements

REFERENCES
  - Academic textbooks, Scikit-Learn documentation, React documentation, RFC standards.
```

---

## 29. ONE-PAGE QUICK REFERENCE CHEAT SHEET

* **Project Name:** NetPath AI
* **Purpose:** Interactive network packet journey simulator with 7-layer OSI encapsulation, dynamic Dijkstra routing, and Machine Learning telemetry analysis.
* **Target Users:** Computer Science Students, Networking Instructors, Network Engineers.
* **Tech Stack:**
  - **Frontend:** React 19, Vite 6, Tailwind CSS 3.4, Lucide Icons, Recharts.
  - **Backend:** Python 3.10, Flask 3.0, Flask-CORS, Pytest.
  - **Machine Learning:** Scikit-learn (Isolation Forest, Random Forest Classifier, StandardScaler), Joblib.
  - **Database:** SQLite 3 (`netpath_ai.db`).
* **Main Workflow:**
  1. User submits packet parameters at `/simulator`.
  2. Flask validates input & Dijkstra computes shortest node path.
  3. Encapsulation Engine builds L7-L1 headers & hex dumps.
  4. Telemetry metrics calculated (latency, loss, throughput, retransmissions).
  5. Isolation Forest & Random Forest evaluate features; Heuristic engine formulates diagnosis.
  6. SQLite stores run record; React renders animated canvas traversal & diagnostic cards.
* **How to Start:**
  - Backend: `cd backend` → `.\venv\Scripts\Activate.ps1` → `python app.py` (Port 5000)
  - Frontend: `cd frontend` → `npm install` → `npm run dev` (Port 3000)
* **Top 3 Advantages:** Highly visual, zero external cloud dependencies, includes automatic heuristic rule fallback if ML models are absent.

---

## 30. FINAL 2-MINUTE VIVA PRESENTATION SPEECH

> *"Good morning respected examiners. My project is **NetPath AI: AI-Based Packet Journey Visualizer for Intelligent Network Analysis**.*
> 
> *In traditional Computer Networks courses, understanding how packets travel through layers and network devices is very abstract. Command-line tools like `ping` or `traceroute` do not visually show layer-by-layer header encapsulation, dynamic route recalculation, or AI-driven diagnostic advice.*
> 
> *To solve this, I built **NetPath AI** using **React 19** for the frontend, **Flask** for the backend, **SQLite** for database logging, and **Scikit-learn** for Machine Learning.*
> 
> *Here is how it works:*
> *When a user inputs packet details, our backend executes **Dijkstra's Algorithm** on a network graph to calculate the optimal path. If a core router fails, the engine automatically recalculates the route using a backup router.*
> 
> *Simultaneously, our Encapsulation Engine builds step-by-step headers for all 7 OSI layers—calculating IPv4 header checksums and CRC-32 Frame Check Sequences. The resulting telemetry metrics are fed into an **Isolation Forest** model for unsupervised anomaly detection and a **Random Forest Classifier** to assess network health. The system then outputs natural language diagnostic advice explaining root-cause network issues.*
> 
> *The project includes 7 educational scenarios, a Wireshark-style protocol header inspector, an interactive ML sandbox, and printable executive reports.*
> 
> *Thank you, and I am now open to your questions."*
