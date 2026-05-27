# EdgeAI — Déploiement et monitoring de modèles IA sur hardware edge

> Vos modèles tournent à 60 FPS sur Jetson Nano. Monitored. Versionnés. Déployés en 1 clic.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![ONNX](https://img.shields.io/badge/ONNX_Runtime-1.18-005CED?style=flat)](https://onnxruntime.ai)
[![TensorRT](https://img.shields.io/badge/TensorRT-8.6-76B900?style=flat&logo=nvidia)](https://developer.nvidia.com/tensorrt)

---

## Vue d'ensemble

EdgeAI est une plateforme MLOps spécialisée dans le déploiement et le monitoring de modèles IA sur hardware edge (NVIDIA Jetson, Raspberry Pi, Intel NUC, caméras IP industrielles). Elle optimise automatiquement les modèles (ONNX export, TensorRT quantization), gère les déploiements OTA (over-the-air), et monitore les performances GPU/CPU en temps réel sur chaque device.

**Domaine :** Edge AI / Embedded ML / Industrial IoT  
**Port VM :** 3028 | **Sous-domaine :** edgeai.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Fleet dashboard, device monitoring, deploy |
| Backend | FastAPI (Python 3.11), Uvicorn | API fleet management, deploy pipeline |
| Model Optimization | ONNX Runtime 1.18, TensorRT 8.6 | Quantization INT8/FP16, engine build |
| Edge Agent | Python (gRPC) | Agent léger sur device (Jetson/Pi) |
| Deployment | Docker + MQTT (Eclipse Mosquitto) | OTA deployment, config push |
| Monitoring | Prometheus + FastAPI | Metrics GPU/CPU/latency |
| Base de données | PostgreSQL 16 | Devices, modèles, déploiements |
| Cache | Redis 7 | Metrics stream |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3028) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
onnxruntime==1.18.0
onnx==1.16.0
paho-mqtt==2.0.0
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
pydantic==2.7.1
prometheus-client==0.20.0
httpx==0.27.0
grpcio==1.64.0
numpy==1.26.4
```

---

## Architecture mono-repo

```
edgeai/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Fleet dashboard devices
│   │   ├── devices/[id]/         # Device monitoring temps réel
│   │   ├── models/               # Registre modèles + versions
│   │   ├── deployments/          # Historique + status déploiements
│   │   └── optimize/             # Pipeline optimisation ONNX/TRT
│   └── src/components/
│       ├── DeviceCard.tsx        # Status device + métriques
│       ├── LatencyChart.tsx      # Latence inférence en temps réel
│       ├── GPUGauge.tsx          # Utilisation GPU/CPU/mémoire
│       ├── DeployTimeline.tsx    # OTA deployment progress
│       └── ModelVersionTable.tsx # Comparaison versions (FPS, accuracy)
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── devices.py        # Fleet management
│   │   │   ├── models.py         # Model registry + versions
│   │   │   ├── deployments.py    # OTA deploy pipeline
│   │   │   └── metrics.py        # Métriques temps réel
│   │   ├── services/
│   │   │   ├── optimizer.py      # ONNX export + TRT quantization
│   │   │   ├── ota_manager.py    # OTA via MQTT
│   │   │   ├── fleet_monitor.py  # Aggregation métriques devices
│   │   │   └── benchmark.py      # Benchmark latence par device
│   │   └── models/
│   │       └── device.py
│   ├── requirements.txt
│   └── Dockerfile
├── edge-agent/                   # Agent léger (Python gRPC)
│   ├── agent.py
│   └── Dockerfile.jetson
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1b2631', 'primaryTextColor': '#76b900', 'primaryBorderColor': '#76b900', 'lineColor': '#76b900', 'secondaryColor': '#17202a'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3028)"]
        NEXT["Next.js 14\nFleet Dashboard"]
        API["FastAPI"]

        subgraph OPT["⚡ Optimization Pipeline"]
            ONNX["ONNX Runtime\nExport + validation"]
            TRT["TensorRT\nINT8 quantization"]
            BENCH["Benchmark\nFPS + accuracy"]
        end

        PG[("PostgreSQL\nDevices + Models")]
        REDIS[("Redis\nMetrics stream")]
        MQTT[("Eclipse Mosquitto\nOTA broker")]
    end

    subgraph EDGE["🔧 Edge Devices"]
        JETSON["NVIDIA Jetson\nTensorRT engine"]
        PI["Raspberry Pi\nONNX Runtime"]
        NUC["Intel NUC\nOpenVINO"]
    end

    API --> MQTT
    MQTT --> JETSON
    MQTT --> PI
    MQTT --> NUC
    JETSON --> MQTT
    PI --> MQTT
```

### Séquence — Déploiement OTA d'un nouveau modèle YOLOv8

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1b2631', 'primaryTextColor': '#76b900', 'lineColor': '#76b900'}}}%%
sequenceDiagram
    participant ENG as ML Engineer
    participant API as FastAPI
    participant OPT as Optimizer
    participant MQTT as MQTT Broker
    participant DEV as Jetson Device
    participant AGENT as Edge Agent

    ENG->>API: POST /models/upload {model: yolov8n.pt, target: [jetson_nano, jetson_orin]}

    API->>OPT: export_onnx(yolov8n.pt)
    OPT-->>API: yolov8n.onnx (validated)

    API->>OPT: build_tensorrt(yolov8n.onnx, precision=INT8, device=jetson_nano)
    Note over OPT: Calibration dataset INT8, engine build ~3 min
    OPT-->>API: yolov8n_jetson.trt (2.1x faster than ONNX)

    API->>OPT: benchmark(yolov8n_jetson.trt, jetson_nano_specs)
    OPT-->>API: {fps: 62, latency_ms: 16, accuracy_map: 0.48}

    ENG->>API: POST /deployments {model_version: "v2.1", devices: ["jetson-01", "jetson-02"]}

    API->>MQTT: publish("devices/jetson-01/deploy", {model_url, checksum, version})
    MQTT->>AGENT: deliver deploy payload
    AGENT->>DEV: download + verify checksum
    AGENT->>DEV: swap model (zero-downtime, keep old as fallback)
    AGENT-->>MQTT: publish("devices/jetson-01/status", {deployed: v2.1, fps: 62, gpu_util: 78%})
    MQTT-->>API: metrics update
    API-->>ENG: deployment_complete {device: jetson-01, fps: 62, status: healthy}
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1b2631', 'primaryTextColor': '#76b900', 'lineColor': '#76b900'}}}%%
erDiagram
    DEVICE {
        uuid id PK
        string name
        string hardware_type
        string ip_address
        string status
        string current_model_version
        float gpu_util_pct
        float cpu_util_pct
        int memory_mb
        float temperature_c
        timestamp last_seen
    }
    MODEL {
        uuid id PK
        string name
        string framework
        string task_type
        string onnx_s3_key
        string trt_s3_key
        string version
        float map_score
        timestamp created_at
    }
    DEPLOYMENT {
        uuid id PK
        uuid model_id FK
        uuid device_id FK
        string status
        float fps_achieved
        float latency_ms
        boolean is_rollback
        timestamp deployed_at
    }
    METRIC {
        uuid id PK
        uuid device_id FK
        float fps
        float latency_ms
        float gpu_util_pct
        float temperature_c
        int inferences_count
        timestamp recorded_at
    }

    DEVICE ||--o{ DEPLOYMENT : "receives"
    DEVICE ||--o{ METRIC : "emits"
    MODEL ||--o{ DEPLOYMENT : "deployed_as"
```

---

## PRD

### Problème
Déployer des modèles IA sur des devices edge (caméras industrielles, Jetson, robots) est un processus manuel et fragile : export ONNX à la main, SCP vers chaque device, pas de monitoring de performance, pas de rollback facile. Une caméra qui tombe en inférence est invisible jusqu'à ce qu'un opérateur la trouve physiquement.

### Solution
EdgeAI automatise toute la chaîne : optimisation ONNX/TensorRT, déploiement OTA par MQTT, monitoring temps réel des FPS/GPU/température, et rollback automatique si les performances chutent. La flotte entière est visible dans un seul dashboard.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| ML Engineer | Déployer et monitorer des modèles vision sur une flotte |
| Ops Industriel | Dashboard santé devices + alertes pannes |
| DevOps | Gestion versions, rollback, audit trail déploiements |

### OKRs
- Déploiement OTA < 5 minutes (device Jetson Nano)
- Disponibilité monitoring : 99.9%
- Détection device offline : < 30 secondes

---

## User Stories

```
US-01 [ML Engineer] En tant que ML Engineer,
      je veux uploader un nouveau modèle YOLOv8
      et le voir automatiquement optimisé (TensorRT INT8) pour Jetson
      avec les métriques FPS/mAP avant déploiement
      afin de valider les gains avant de toucher la production.

US-02 [ML Engineer] En tant que ML Engineer,
      je veux déployer un modèle sur 20 Jetson Nano simultanément
      via OTA sans downtime
      avec rollback automatique si FPS chute > 20%
      afin de déployer en confiance.

US-03 [Ops] En tant que responsable opérations,
      je veux voir en temps réel la température GPU et le FPS
      de chaque device sur la carte du site industriel
      afin d'identifier immédiatement les anomalies.

US-04 [DevOps] En tant que DevOps,
      je veux voir l'historique complet des déploiements
      (qui a déployé quoi, quand, sur quels devices, avec quels résultats)
      afin d'auditer les changements en production.

US-05 [ML Engineer] En tant que ML Engineer,
      je veux comparer côte à côte les performances de 3 versions
      de mon modèle sur le même device (FPS, latence, mAP)
      afin de choisir objectivement la meilleure version.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Optimisation auto | Upload PyTorch → ONNX export → TRT build automatique | ✅ Pipeline steps |
| R2 | Précision TRT | INT8 (plus rapide, ±2% accuracy) ou FP16 (intermédiaire) | ✅ Precision toggle |
| R3 | Rollback auto | FPS chute > 20% en prod → rollback version précédente | ✅ Rollback trigger |
| R4 | Heartbeat | Agent envoie heartbeat toutes les 10s → offline si absent 30s | ✅ Heartbeat badge |
| R5 | OTA checksums | SHA256 vérifié avant activation du nouveau modèle | ✅ Checksum display |
| R6 | Blue/Green | Ancien modèle conservé comme fallback jusqu'à validation | ✅ Blue/green status |
| R7 | Throttle temp | Si température > 80°C → réduire batch_size automatiquement | ✅ Thermal throttle |
| R8 | Compatibilité HW | Profils hardware : Jetson Nano / Orin / Xavier / Pi / NUC | ✅ HW profile select |
| R9 | Benchmark obligatoire | Déploiement bloqué si benchmark échoue ou FPS < seuil | ✅ Bench gate |
| R10 | Changelog | Chaque version de modèle = notes de changement + auteur | ✅ Version notes |

---

## Spécification API

**Base URL :** `http://edgeai.wikolabs.com/api/v1`

### POST /models/upload
```
Content-Type: multipart/form-data
file: yolov8n.pt, name: "Detection Défauts v2", targets: ["jetson_nano", "jetson_orin"]
// Response: {"model_id": "m_xyz", "status": "optimizing", "eta_seconds": 180}
```

### GET /devices/fleet
```json
// Response: {"devices": [{"id": "d_01", "name": "Jetson-Factory-01", "status": "online", "model": "v2.1", "fps": 62, "gpu_util": 78, "temperature_c": 71}]}
```

### POST /deployments
```json
{"model_version_id": "mv_xyz", "device_ids": ["d_01", "d_02"], "strategy": "blue_green"}
// Response: {"deployment_id": "dep_abc", "status": "in_progress", "device_count": 2}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Fleet Map** | Carte du site avec devices colorés (vert/orange/rouge selon santé) |
| **GPU Gauge** | Jauge GPU% + température en temps réel par device |
| **Latency Chart** | Recharts LineChart FPS × temps sur 24h |
| **OTA Progress** | Barre progression déploiement par device |
| **Model Comparison** | Tableau 3 versions × 4 métriques (FPS, mAP, taille, latence) |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: edgeai, POSTGRES_USER: ea_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  mosquitto:
    image: eclipse-mosquitto:2
    volumes: [./mosquitto.conf:/mosquitto/config/mosquitto.conf]
    expose: ["1883", "9001"]
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://ea_user:${POSTGRES_PASSWORD}@postgres/edgeai
      REDIS_URL: redis://redis:6379
      MQTT_BROKER: mosquitto
    depends_on: [postgres, redis, mosquitto]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3028:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] Fleet dashboard + device monitoring
- [ ] ONNX export pipeline
- [ ] OTA deployment via MQTT

### Phase 2 — Optimisation
- [ ] TensorRT INT8/FP16 build
- [ ] Benchmark automatique
- [ ] Rollback automatique

### Phase 3 — Intelligence
- [ ] Anomaly detection (dégradation progressive)
- [ ] Prédiction durée de vie device (température, cycles)
- [ ] Intégration Docker Hub registre modèles

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
