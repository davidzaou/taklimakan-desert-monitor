"""API routes for map features and dashboard."""

from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.dashboard_service import get_dashboard_stats
from services.features_service import get_feature_by_id, get_features

router = APIRouter(prefix="/api", tags=["features"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/features")
@limiter.limit("60/minute")
def list_features(
    request: Request,
    category: str = Query(default=None),
    search: str = Query(default=None),
):
    """List all map features, optionally filtered by category or search text."""
    return get_features(category=category, search=search)


@router.get("/features/{feature_id}")
@limiter.limit("60/minute")
def get_feature(feature_id: str, request: Request):
    """Get a single feature by ID."""
    feature = get_feature_by_id(feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature


@router.get("/dashboard")
@limiter.limit("60/minute")
def dashboard(request: Request):
    """Get dashboard summary statistics."""
    return get_dashboard_stats()
