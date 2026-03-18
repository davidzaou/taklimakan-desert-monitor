"""Tests for input validation — invalid inputs should return 422."""

import pytest
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app

client = TestClient(app)

VALID_GEOMETRY = {
    "type": "Polygon",
    "coordinates": [[[80, 37], [81, 37], [81, 38], [80, 38], [80, 37]]],
}


# ─── Timeseries validation ──────────────────────

def test_timeseries_valid():
    res = client.post("/api/timeseries", json={
        "geometry": VALID_GEOMETRY,
        "start_year": 2020,
        "end_year": 2024,
    })
    assert res.status_code == 200


def test_timeseries_invalid_geometry_type():
    res = client.post("/api/timeseries", json={
        "geometry": {"type": "LineString", "coordinates": [[80, 37], [81, 38]]},
        "start_year": 2020,
        "end_year": 2024,
    })
    assert res.status_code == 422


def test_timeseries_geometry_outside_bbox():
    res = client.post("/api/timeseries", json={
        "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        "start_year": 2020,
        "end_year": 2024,
    })
    assert res.status_code == 422


def test_timeseries_year_out_of_range():
    res = client.post("/api/timeseries", json={
        "geometry": VALID_GEOMETRY,
        "start_year": 2000,
        "end_year": 2024,
    })
    assert res.status_code == 422


def test_timeseries_start_after_end():
    res = client.post("/api/timeseries", json={
        "geometry": VALID_GEOMETRY,
        "start_year": 2024,
        "end_year": 2020,
    })
    assert res.status_code == 422


# ─── Grid validation ────────────────────────────

def test_grid_valid():
    res = client.post("/api/grid", json={
        "geometry": VALID_GEOMETRY,
        "year": 2024,
        "resolution": 10,
    })
    assert res.status_code == 200


def test_grid_resolution_too_high():
    res = client.post("/api/grid", json={
        "geometry": VALID_GEOMETRY,
        "year": 2024,
        "resolution": 9999,
    })
    assert res.status_code == 422


def test_grid_resolution_too_low():
    res = client.post("/api/grid", json={
        "geometry": VALID_GEOMETRY,
        "year": 2024,
        "resolution": 1,
    })
    assert res.status_code == 422


# ─── Satellite preview validation ────────────────

def test_sat_preview_valid():
    res = client.post("/api/satellite/preview", json={
        "bounds": [79, 36, 81, 38],
        "year": 2024,
        "resolution": 30,
    })
    assert res.status_code == 200


def test_sat_preview_invalid_bounds():
    res = client.post("/api/satellite/preview", json={
        "bounds": [0, 0, 1, 1],
        "year": 2024,
    })
    assert res.status_code == 422


def test_sat_preview_bounds_wrong_length():
    res = client.post("/api/satellite/preview", json={
        "bounds": [79, 36],
        "year": 2024,
    })
    assert res.status_code == 422


# ─── Satellite image validation ──────────────────

def test_sat_image_width_too_large():
    res = client.post("/api/satellite/image", json={
        "bounds": [79, 36, 81, 38],
        "year": 2024,
        "width": 10000,
    })
    assert res.status_code == 422


def test_sat_image_invalid_band():
    res = client.post("/api/satellite/image", json={
        "bounds": [79, 36, 81, 38],
        "year": 2024,
        "band": "infrared",
    })
    assert res.status_code == 422


# ─── Global error handler ───────────────────────

def test_422_error_format():
    """Validation errors should return structured JSON."""
    res = client.post("/api/timeseries", json={
        "geometry": "not a dict",
        "start_year": 2020,
        "end_year": 2024,
    })
    assert res.status_code == 422
    data = res.json()
    assert "errors" in data or "detail" in data
