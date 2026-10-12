# NetPath AI

An educational packet-journey simulator built with Flask, React, SQLite and scikit-learn. It models routing, loss, delay, TTL expiry and TCP recovery. It does not capture live network traffic or configure real hardware.

The project scope is a **dataset-based educational application**. Live network integration is not a completion requirement. The UI has three pages: Dashboard, Simulator and History. All seven presets are available from the Scenario Preset control on the existing Simulator page.

## What the AI does

- Isolation Forest detects unusual combinations of eight telemetry features.
- Random Forest classifies synthetic telemetry as HEALTHY, WARNING or CRITICAL.
- Explicit metric rules produce the explanations and recommendations. Rules can raise the model's health severity when measured inputs exceed configured thresholds or a simulated packet is dropped.
- Models are trained on 4,000 generated samples, with 800 held out. Reported accuracy applies only to that synthetic distribution. It is not a validation against real network incidents.
- `confidence` is null because no calibrated confidence probability is available. `health_confidence` is the raw, uncalibrated Random Forest class score for `model_health_status`, which may differ from the final rule-adjusted health. The UI labels this as a model class score.
- Missing/incompatible models use clearly labeled rules. No percentage is invented for fallback results. No diagnosis can establish damaged cables, overloaded routers or a nonoptimal route from these metrics alone.

Feature order: `packet_size`, `latency`, `packet_loss`, `throughput`, `retransmissions`, `hops`, `ttl`, `jitter`. Manual `/api/ai/analyze` requests must supply all eight finite, valid values.

## Simulation behavior

The graph has bidirectional links and uses Dijkstra over configured link **costs**. Path latency is the sum of link delays; the slowest link constrains bandwidth. Delay, throughput and retransmission counts are educational estimates, not a packet-level TCP implementation or measured QoS.

`hops` counts traversed graph links. TTL decreases only at intermediate forwarding routers. Expired TTL and unrecovered loss stop the journey before destination decapsulation. `routing.path` is the planned route; `traversed_path` is the path actually reached. TCP recovery is represented by an aggregate retry event; it does not replay every link for every retry.

Source/destination IPs must match devices in the topology. Presets start from an independent topology. Manual device toggles affect later manual runs in the current backend process. Presets do not change those manual controls.

Protocol headers and bitstreams are illustrations. CRC32 samples are explicitly labeled; they are **not** real IPv4/TCP/UDP checksums or full-frame Ethernet FCS. ICMP has protocol number 1 and no transport ports. The configurable packet size is a telemetry parameter rather than a serialized wire-packet length.

## Run locally

Python 3.10+ and Node.js 18+ are required. The saved models use the scikit-learn version pinned in `backend/requirements.txt`.

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. The backend defaults to 127.0.0.1:5000 and debug mode is off.

Environment options:

- `PORT`, `HOST`: backend binding; default `5000`, `127.0.0.1`.
- `FLASK_DEBUG=1`: enable local development debugging deliberately.
- `NETPATH_DB_FILE`: alternate SQLite database path, useful for isolated tests.
- `NETPATH_ALLOWED_ORIGINS`: comma-separated browser origins. Defaults to localhost/127.0.0.1 on ports 3000 and 4173. Configure the actual frontend origin when deployed separately.
- `VITE_API_URL`: frontend API base including `/api`; defaults to the Vite `/api` proxy.

This is a local, single-process educational application. It has no user authentication or per-user history/topology isolation. Do not expose its history mutation APIs as a public multi-user service without adding authentication and shared state. CORS/origin checks are not authentication. Multiple backend workers currently have separate manual topology state.

## Verify and train

```powershell
cd backend
python -m pytest tests -q
python -m ai.train_model
python -m ai.evaluate
```

Training regenerates all three model artifacts and records the runtime version, confusion matrix and classification reports in `models/training_metrics.json`. Evaluation runs each of the seven presets 30 times with a fixed seed and writes `models/scenario_evaluation.json`. These are simulator checks, not independent real-world validation.

Training also saves the exact dataset split in `backend/models/dataset/`:

- `train.csv`: 3,200 samples used by the health classifier. The anomaly detector trains on the normal subset of these rows.
- `test.csv`: 800 held-out samples, never used to fit either model or the scaler.
- `test_predictions.csv`: expected labels, raw model predictions and scores for each test sample.

Stable sample IDs connect predictions to input rows. The metadata records the seed and CSV checksums, and the regression suite verifies that the splits do not overlap and the saved predictions match model inference. Recommendations explain metric thresholds and suggest comparisons within the simulator.

For a project demonstration: run Normal Baseline, compare High Latency and Packet Loss, run Router Failure to show the alternate path, then open History. Use the saved test predictions and confusion matrix to explain model accuracy and false positives. No extra service or external AI API is required.

```powershell
cd frontend
npm test
npm run build
npm audit
```

## Project layout

- `backend/ai`: synthetic generator, training, inference and repeatable evaluation.
- `backend/simulation`: graph, packet journeys, illustrative encapsulation, metrics and seven presets.
- `backend/routes`: API endpoints and request handling.
- `backend/database`: SQLite history and summary aggregation.
- `backend/tests`: isolated API, AI, simulation and persistence regression tests.
- `frontend/src/pages`: Dashboard, PacketSimulator and HistoryReports.
- `frontend/src/components`: navigation, topology map and AI explanation card.
- `frontend/tests`: API-client error-handling tests.
- `AUDIT.md`: audit findings, verification evidence and remaining limitations.

Developed by Hrushikesh Thombare and Gayatri Rajput.
