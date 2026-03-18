# Taklimakan Desert Vegetation Tracker

Interactive monitoring of vegetation change, afforestation projects, and desert containment around the Taklimakan Desert using Sentinel-2 satellite data via Google Earth Engine.

## Architecture

- **Frontend:** React + Vite (illustrated SVG map, Leaflet satellite playground, Recharts)
- **Backend:** FastAPI (Python) — serves API + built frontend in production
- **Data:** Google Earth Engine (Sentinel-2 NDVI) with demo fallback

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+

### Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # edit to add GEE credentials (optional)
python -m uvicorn main:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API calls to the backend on port 8001.

### Production Build

```bash
bash build.sh  # builds frontend → backend/static
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker

```bash
docker build -t desert-tracker .
docker run -p 8000:8000 desert-tracker
```

## GEE Setup (Optional)

Without GEE credentials, the app runs in demo mode with simulated data. To enable real satellite data:

1. Create a GCP project and enable the Earth Engine API
2. Create a service account and download the JSON key
3. Set `GEE_SERVICE_ACCOUNT_KEY` in your `.env` file
4. See `backend/.env.example` for full details

## Project Structure

```
backend/
  main.py              # FastAPI app, CORS, error handlers
  routers/             # API route handlers
    analysis.py        # NDVI timeseries, grid, change detection
    dashboard_routes.py # Dashboard stats, satellite preview/image
    features.py        # Map features, dashboard summary
  services/            # Business logic
    gee_service.py     # Google Earth Engine integration
    ndvi_service.py    # Demo data generation
  tests/               # pytest test suite

frontend/
  src/
    api/client.js      # API client with error handling + timeout
    components/        # React components
    hooks/             # Custom hooks (useMapState, useDataCache)
    i18n/              # English/Chinese translations
    data/              # Map shape data
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEE_SERVICE_ACCOUNT_KEY` | Path to GEE service account JSON key | - |
| `GEE_SERVICE_ACCOUNT_EMAIL` | Service account email | - |
| `GEE_PROJECT` | GCP project ID (alternative to key) | - |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `PORT` | Server port | `8000` |
