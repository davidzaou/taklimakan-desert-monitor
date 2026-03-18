"""Desert Vegetation Change Tracker - Backend API."""

import os
import logging
import traceback
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from rate_limit import limiter
from routers.analysis import router as analysis_router
from routers.features import router as features_router
from routers.dashboard_routes import router as dashboard_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Taklimakan Desert Monitor",
    description="Interactive monitoring of vegetation, projects, and desert containment around the Taklimakan Desert",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS: env-driven allowlist, default to localhost dev server ---
_cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
_cors_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global exception handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " → ".join(str(l) for l in err.get("loc", []))
        errors.append({"field": loc, "message": err.get("msg", ""), "type": err.get("type", "")})
    return JSONResponse(status_code=422, content={"detail": "Validation error", "errors": errors})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s:\n%s", request.method, request.url.path, traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(analysis_router)
app.include_router(features_router)
app.include_router(dashboard_router)

# Serve built frontend in production
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    @app.get("/")
    def root():
        return {"name": "Taklimakan Desert Monitor API", "version": "1.0.0", "docs": "/docs"}
