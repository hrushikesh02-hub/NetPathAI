# NetPath AI audit and repair — 12 October 2026

## Verdict

**Confirmed project scope:** a dataset-based educational simulator with the existing three UI pages. Real-network integration and production deployment are outside the completion criteria. The limitations below describe boundaries, not requirements to add integrations or pages.

The project uses genuine trained Isolation Forest and Random Forest models. Its recommendations are deterministic rules, not learned causal explanations or an LLM. Before repair, invented confidence percentages, unsupported hardware diagnoses, fabricated offline dashboard values and incorrect simulation telemetry made the output misleading.

The repaired pipeline loads compatible models, validates inputs, exposes raw model results separately from metric safeguards, and explains observable evidence without claiming a proven physical cause. It is suitable for educational simulation. It has **not** been validated as a diagnostic system for real networks.

## Repairs

- **Backend import compatibility:** replaced the undefined `Tuple_Result` annotation, which fails with eager annotation evaluation on supported older Python versions.
- **Model compatibility:** saved artifacts were produced by scikit-learn 1.9.0 while the installed runtime was 1.9.1. Pinned 1.9.1, regenerated artifacts, added feature-order/class validation and reject unsupported model-version loads. Runtime inference failures now update the advertised ML availability.
- **Misleading AI certainty:** removed arbitrary Isolation Forest score-to-confidence conversion and fixed 88–95% fallback percentages. `confidence` is null; the displayed class score is explicitly uncalibrated and associated with the raw model class.
- **Unsupported advice:** replaced statements about working cables, overloaded routers and unnecessarily long routes with threshold evidence and qualified investigation steps. Added explanations for jitter, modest loss/retransmissions, zero throughput, TTL exhaustion and packet delivery failures. Severe rule evidence cannot be overridden by a healthy classifier result.
- **API failures:** reject non-object/malformed JSON, missing telemetry, NaN/infinity, invalid ranges, unsupported protocols, fractional integer fields, nonboolean fault flags and invalid pagination. Return actionable 4xx responses. Limit request size.
- **Routing identity and state:** selected device IPs now match simulated endpoints; laptop presets take the wireless path. Runs use topology snapshots, presets do not mutate manual state, and disabled links are excluded from routing.
- **Telemetry:** removed double multiplication of summed route latency, use route bottleneck bandwidth and modeled link loss, preserve initial TTL, and decrement TTL only at intermediate routers. The satellite preset now explicitly adds propagation delay.
- **Delivery consistency:** unrecoverable TCP loss, UDP/ICMP drops and TTL expiration stop before destination decapsulation. Forced TCP recovery reports retransmission. The frontend animates the reached path and displays actual delivery status and zero loss correctly.
- **Persistence:** close SQLite connections, avoid replacing history on reused caller packet IDs, preserve null confidence and true zero averages, and show unknown health when there is no data. Tests use separate temporary databases.
- **Frontend failures:** remove invented healthy offline metrics, surface failed history reads/deletions, distinguish ML/rules/offline states, update restored topology, associate form labels, and ignore late simulation responses after navigation.
- **Protocol accuracy:** correctly identify ICMP as IP protocol 1 without transport ports; preview UTF-8 bytes correctly; label illustrative CRC32 fields rather than presenting them as real protocol checksums. Corrected documentation that claimed nonexistent pages/tests and full wire-format packet processing.
- **Local service protection:** disable debug and public binding by default, restrict browser origins, and make the health endpoint check database availability.
- **Dependencies:** fixed selector-parser and source-map-js advisories, reducing the npm audit from eight findings to five. Production dependencies have no npm advisories in this audit.

## Verification

Dataset completion follow-up: the exact training/test split and per-sample test predictions are now exported to `backend/models/dataset/`, with seed and checksums in training metadata. The latest suite passes **95 backend tests** on Python 3.14.3, including split isolation and prediction reproducibility, plus **4 frontend tests** and the production build. Browser verification confirmed all seven presets on the existing Simulator page and successfully ran High Latency. No UI page or real-network integration was added.

Dataset completion follow-up: the exact training/test split and per-sample test predictions are now exported to `backend/models/dataset/`, with seed and checksums in training metadata. The latest suite passes **95 backend tests** on Python 3.14.3, including split isolation and prediction reproducibility, plus **4 frontend tests** and the production build. Browser verification confirmed all seven presets on the existing Simulator page and successfully ran High Latency. No UI page or real-network integration was added.

- Backend: **93 regression checks passed on each of Python 3.12.14 and 3.14.3**, including all seven scenarios, real model loading/inference, fallback behavior, invalid requests, delivery consistency, TTL, topology isolation and history persistence.
- Frontend: **4 API-client checks passed**; production build passed after source and dependency changes.
- Browser: verified normal simulation, zero-loss display, explicit score limitations, a manual laptop route with the correct source device, packet-loss/recovery diagnostics, and offline dashboard errors with unknown health instead of fabricated metrics.
- Reproducible model evaluation: **210 runs**, 30 per preset, seed 42, with **zero fallback runs**. Normal: 0/30 model anomalies and 30/30 healthy classifications. Each of the six fault presets: 30/30 model anomalies. Raw classifications were WARNING for high latency, router failure and weak link, and CRITICAL for packet loss, congestion and high retransmission. Rule safeguards raise weak-link final severity to CRITICAL because its modeled throughput is below 20 Mbps.
- Held-out synthetic training split: anomaly accuracy **96.125%**, health classifier accuracy **99.875%** over 800 samples. The anomaly confusion matrix records 31 false positives among 440 synthetic normal samples; a high aggregate accuracy does not eliminate false alarms.

Run instructions are in `README.md`. Machine-readable reports are `backend/models/training_metrics.json` and `backend/models/scenario_evaluation.json`.

## Remaining limitations

1. **No real-world validation or causal evidence.** Training and evaluation both use synthetic data. A manual laptop run with 1% modeled wireless loss was an Isolation Forest outlier while classified HEALTHY by Random Forest; the UI correctly explains the disagreement without asserting a fault. Other legitimate combinations, jumbo packets and unusual TTL values can also be outside the learned distribution. Real telemetry, labeled incidents, calibration and workload-specific thresholds are needed before relying on these suggestions operationally.
2. **Five development dependency advisories remain.** These are the `braces` issue and its Tailwind 3 dependency chain (`chokidar`, `micromatch`, `fast-glob`, `tailwindcss`). No patched braces version exists in the registry at audit time. npm proposes a breaking Tailwind 4 migration; this audit preserves the existing styling stack. The affected code handles build/watch patterns, not the shipped browser application. Production-only npm audit is clean. Python packages did not receive a separate vulnerability-database scan.
3. **Local/single-process architecture.** No authentication, user isolation or shared topology store is implemented. Manual topology state is process-local and resets on restart. Public/multi-worker deployment needs an explicit authentication and persistence design; origin filtering does not replace it.
4. **Educational network model.** It estimates rates and delays and summarizes TCP retries; it does not implement congestion-control dynamics, real packet serialization, live capture or physical fault localization. Illustrative protocol fields are now labeled accordingly.
5. **Existing historical results are unchanged.** Previously saved confidence values and diagnoses are not retrospectively reinterpreted. New results use the corrected semantics.

## Reference checks

- [scikit-learn Isolation Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html): its decision function is an anomaly score, not a calibrated probability.
- [scikit-learn model persistence](https://scikit-learn.org/stable/model_persistence.html): cross-version model loading is unsupported.
- [RFC 1812](https://www.rfc-editor.org/info/rfc1812/): router TTL forwarding behavior.
- [Braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): remaining unpatched build dependency.
- [Selector-parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf): addressed using the patched parser override.
