# Personal AI – Second Brain

Dein lokales, privates KI-Gedächtnis. Läuft vollständig auf deinem Gerät.

## Voraussetzungen

- Docker Desktop (Windows)
- Git

## Schnellstart

```bash
# 1. Repo klonen
git clone https://github.com/tobi936/personal-ai.git
cd personal-ai

# 2. .env anlegen (WICHTIG: muss vor dem ersten Start existieren)
copy .env.example .env

# 3. Starten
# Beim ersten Start werden llama3.2:3b (~2 GB) + nomic-embed-text (~270 MB) geladen
docker compose up --build
```

Öffne dann: **http://localhost:3000**

> **Hinweis:** Der erste Start dauert 5–10 Minuten je nach Internetverbindung (Modelle werden einmalig heruntergeladen).

## GPU-Support (NVIDIA)

Falls du eine NVIDIA-GPU mit installiertem [nvidia-container-toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) hast:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build
```

## Am Handy nutzen (PWA)

1. PC und Handy im selben WLAN
2. Auf dem Handy `http://<PC-IP-Adresse>:3000` aufrufen
3. "Zum Homescreen hinzufügen" (iOS Safari / Android Chrome)

## Modell wechseln

In `.env`:
```env
OLLAMA_MODEL=mistral:7b
```

Dann `docker compose restart ollama ollama-init backend`

## Architektur (Phase 1)

```
frontend  (Next.js PWA)         :3000
backend   (FastAPI + LangGraph) :8000
ollama    (LLM Engine)          :11434
chromadb  (Vector Store)        :8001
```

## Roadmap

- **Phase 2**: Kalender & Mail-Integration (read-only)
- **Phase 3**: Multi-Agent-Orchestrierung (Recherche, Planung)
- **Cloud-Modelle**: `OLLAMA_MODEL=claude-sonnet-4-6` + API-Key in `.env`
