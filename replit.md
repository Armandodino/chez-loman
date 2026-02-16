# Chez Loman - Restaurant Website

## Overview
Modern restaurant website for "Chez Loman" - an Ivorian cuisine restaurant in Yopougon, Abidjan. Features a public-facing website, admin panel, and business dashboard.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Shadcn/UI, Framer Motion (CRA + CRACO)
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (requires MONGO_URL environment variable)
- **AI**: DeepSeek API (optional, for business insights)

## Project Structure
```
├── backend/
│   ├── server.py          # FastAPI backend with all API routes
│   ├── ai_service.py      # DeepSeek AI integration
│   ├── requirements.txt   # Python dependencies
│   └── uploads/           # Uploaded files directory
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with routing
│   │   ├── components/    # Reusable components (Navbar, Footer, etc.)
│   │   ├── pages/         # Page components (Home, Menu, Admin, Dashboard)
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── craco.config.js    # CRACO configuration (webpack, devserver)
│   └── package.json       # Node.js dependencies
```

## Environment Variables
- `MONGO_URL` (required): MongoDB connection string - must be set as a secret for the app to work with data
- `DB_NAME` (default: "chezloman"): MongoDB database name
- `REACT_APP_BACKEND_URL` (set to empty string): Uses relative /api paths, works with proxy in dev and static serving in prod
- `DEEPSEEK_API_KEY` (optional): For AI business insights in the dashboard

## Deployment
- Build: `cd frontend && npm run build`
- Run: FastAPI serves both API and built frontend static files
- Deployment target: autoscale

## Running
- Frontend: Port 5000 (dev server with CRACO)
- Backend: Port 8001 (uvicorn)
- Frontend proxies `/api` requests to backend via CRA proxy setting

## Recent Changes
- 2026-02-16: Cash Register (Caisse) + Dark/Light Mode
  - Added CashSale model and 4 API endpoints (POST/GET/DELETE ventes, GET stats)
  - Added "Caisse" tab in Admin panel for recording in-person sales (especes/mobile money)
  - Daily stats: revenue, payment breakdown, top dishes, average ticket
  - Added Dark/Light mode toggle (ThemeProvider context, Sun/Moon button in Navbar)
  - CSS-based light mode overrides for all pages
  - Added ScrollToTop component
  - Added comment system with admin moderation
- 2026-02-15: Initial Replit setup
  - Configured CRACO dev server for Replit (allowedHosts, port 5000)
  - Added proxy in package.json to forward API requests to backend
  - Fixed backend module import (ai_service)
  - Made MONGO_URL gracefully handle missing value

## User Preferences
- Language: French (communication and UI)
- Deployment platform: Render (connected to GitHub repo Armandodino/chez-loman)
- User manages code locally via PowerShell and pushes to GitHub
