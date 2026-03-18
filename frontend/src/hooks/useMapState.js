import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchFeatures,
  fetchTimeseries,
  fetchAnalysis,
  fetchGrid,
  fetchNdviGridCache,
} from "../api/client";
import useDataCache from "./useDataCache";

const ALL_CATEGORIES = new Set(["vegetation", "desert", "city", "project", "water"]);

export default function useMapState(goToMap) {
  // Features — cached across view switches
  const { data: rawFeatures } = useDataCache("features", fetchFeatures);
  const features = Array.isArray(rawFeatures) ? rawFeatures : [];

  // Map-panel data
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [changeData, setChangeData] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [gridYear1, setGridYear1] = useState([]);
  const [gridYear2, setGridYear2] = useState([]);
  const [compareYears, setCompareYears] = useState(null);

  // UI state
  const [activeFilters, setActiveFilters] = useState(new Set(ALL_CATEGORIES));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [mapYear, setMapYear] = useState(2024);
  const [showSatBg, setShowSatBg] = useState(false);
  const [error, setError] = useState(null);

  const [loadingTs, setLoadingTs] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [ndviGrid, setNdviGrid] = useState(null);

  // AbortController for stale requests
  const abortRef = useRef(null);

  // Poll for cached NDVI grid
  useEffect(() => {
    let pollId;
    let retries = 0;
    const MAX_RETRIES = 5;
    function pollNdvi() {
      fetchNdviGridCache().then((res) => {
        retries = 0; // reset on success
        if (res.status === "ready" && res.data) {
          setNdviGrid(res.data);
        } else if (res.status === "loading") {
          pollId = setTimeout(pollNdvi, 5000);
        }
      }).catch(() => {
        retries++;
        if (retries < MAX_RETRIES) {
          pollId = setTimeout(pollNdvi, 5000 * retries);
        }
      });
    }
    pollNdvi();
    return () => clearTimeout(pollId);
  }, []);

  // Derived
  const filteredFeatures = features.filter((f) => {
    if (!activeFilters.has(f.category)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name_en.toLowerCase().includes(q) || f.name_zh.includes(q);
    }
    return true;
  });

  function handleToggleFilter(category) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  const handleFeatureClick = useCallback(async (feature) => {
    // Abort previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedFeature(feature);
    setPanelOpen(true);
    setChangeData(null);
    setGridYear1([]);
    setGridYear2([]);
    setCompareYears(null);
    setError(null);

    if (feature.geometry) {
      setLoadingTs(true);
      try {
        const [tsResult, gridResult] = await Promise.all([
          fetchTimeseries(feature.geometry, undefined, undefined, controller.signal),
          fetchGrid(feature.geometry, selectedYear, undefined, controller.signal),
        ]);
        setTimeseriesData(tsResult.data);
        setGridData(gridResult.data);
      } catch (err) {
        if (err.name !== "ApiError" || err.status !== 0) {
          setError(err.message);
        }
      }
      setLoadingTs(false);
    } else {
      setTimeseriesData([]);
      setGridData([]);
    }
  }, [selectedYear]);

  async function handleYearChange(year) {
    setSelectedYear(year);
    if (!selectedFeature?.geometry) return;
    try {
      const gridResult = await fetchGrid(selectedFeature.geometry, year);
      setGridData(gridResult.data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCompare(year1, year2) {
    if (!selectedFeature?.geometry) return;
    setLoadingChange(true);
    setCompareYears({ year1, year2 });
    setError(null);
    try {
      const [result, g1, g2] = await Promise.all([
        fetchAnalysis(selectedFeature.geometry, year1, year2),
        fetchGrid(selectedFeature.geometry, year1),
        fetchGrid(selectedFeature.geometry, year2),
      ]);
      setChangeData(result.data);
      setGridYear1(g1.data);
      setGridYear2(g2.data);
    } catch (err) {
      setError(err.message);
    }
    setLoadingChange(false);
  }

  function handleSelectFeatureAndGoToMap(feature) {
    goToMap();
    handleFeatureClick(feature);
  }

  function handleMapYearChange(yearOrFn) {
    if (typeof yearOrFn === "function") {
      setMapYear((prev) => yearOrFn(prev));
    } else {
      setMapYear(yearOrFn);
    }
  }

  return {
    features,
    filteredFeatures,
    activeFilters,
    searchQuery,
    setSearchQuery,
    selectedFeature,
    panelOpen,
    setPanelOpen,
    selectedYear,
    mapYear,
    showSatBg,
    setShowSatBg,
    ndviGrid,
    timeseriesData,
    changeData,
    gridData,
    gridYear1,
    gridYear2,
    compareYears,
    loadingTs,
    loadingChange,
    error,
    setError,
    handleToggleFilter,
    handleFeatureClick,
    handleYearChange,
    handleCompare,
    handleSelectFeatureAndGoToMap,
    handleMapYearChange,
  };
}
