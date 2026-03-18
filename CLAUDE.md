# CLAUDE.md — Desert Tracker

## Key Conventions

- **Backend:** FastAPI + Pydantic, Python 3.12. All GEE-calling endpoints are async with `asyncio.to_thread()`. Input validation via Pydantic field validators. Rate limiting via slowapi.
- **Frontend:** React 19 + Vite 8. No TypeScript. Components in `frontend/src/components/`. Hooks in `frontend/src/hooks/`.
- **i18n:** All user-facing strings go through `useLanguage().t(key)` with keys defined in `frontend/src/i18n/translations.js`. Some component data constants use inline `lang === "zh" ? ... : ...` patterns.
- **Error handling:** API client (`frontend/src/api/client.js`) throws `ApiError` with structured messages. Catch blocks should surface errors to users, never swallow silently.
- **CORS:** Env-driven allowlist via `CORS_ORIGINS`, not `*`.

## Running Tests

```bash
cd backend && pytest tests/ -v
cd frontend && npm run lint && npm run build
```

## Important Files

- `backend/main.py` — App setup, CORS, rate limiting, exception handlers
- `frontend/src/App.jsx` — Main app shell, uses lazy loading for views
- `frontend/src/hooks/useMapState.js` — Core map state + API orchestration
- `frontend/src/components/IllustratedMap.jsx` — 800+ LOC SVG tile map (memoized)
