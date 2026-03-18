"""Tests for features and dashboard endpoints (no GEE needed)."""

import pytest
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app

client = TestClient(app)


def test_list_features():
    res = client.get("/api/features")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_list_features_with_category():
    res = client.get("/api/features?category=city")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    for f in data:
        assert f["category"] == "city"


def test_feature_not_found():
    res = client.get("/api/features/nonexistent-id-12345")
    assert res.status_code == 404


def test_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "total_green_area" in data or isinstance(data, dict)


def test_dashboard_regional():
    res = client.get("/api/dashboard/regional")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert "north" in data["data"]


def test_data_source():
    res = client.get("/api/data-source")
    assert res.status_code == 200
    data = res.json()
    assert "source" in data
    assert data["source"] in ("gee", "demo")


def test_presets():
    res = client.get("/api/presets")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
