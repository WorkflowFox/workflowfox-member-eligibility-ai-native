.PHONY: frontend backend test test-frontend test-backend help

help:
	@echo "Available targets:"
	@echo "  make frontend     - Start the React/Vite frontend"
	@echo "  make backend      - Start the FastAPI backend on port 8092"
	@echo "  make test         - Run all tests (frontend and backend)"
	@echo "  make test-frontend - Run the frontend test suite (Vitest)"
	@echo "  make test-backend  - Run the backend test suite (pytest)"
	@echo "  make help         - Show this message"

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8092

test: test-frontend test-backend

test-frontend:
	cd frontend && npm test

test-backend:
	cd backend && uv run pytest
