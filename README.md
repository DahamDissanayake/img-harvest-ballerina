# ImgHarvest

**ML-Ready Image Dataset Builder** — Search the web, review results, and download ZIP-packaged, format-converted image datasets in seconds.

## Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Lucide-React → `http://localhost:3000`
- **Backend**: Python FastAPI + Pillow → `http://localhost:8000`
- **Image Source**: SerpApi (Google Images engine)
- **Conversion**: Pillow (PNG / JPG / WebP)

## Quick Start

### 1. Start the Python backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # then add your SERPAPI_KEY
uvicorn main:app --reload --port 8000
```

Service starts on `http://localhost:8000`

### 2. Start the Next.js frontend

```bash
cd frontend
npm install                   # first time only
npm run dev
```

App opens at `http://localhost:3000`

## Features

- 🔍 **Search & Scrape** — powered by SerpApi Google Images
- 🖼 **Review Gallery** — checkbox-select or deselect individual images
- 🔄 **Format Conversion** — PNG / JPG / WebP via Pillow
- 📦 **ZIP Download** — all selected images packaged server-side
- 👤 **Session Context** — email-tagged sessions persisted in localStorage

## Project Structure

```
img-harvest/
├── backend/
│   ├── main.py               ← FastAPI app (search + download endpoints)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/app/              ← Next.js App Router pages + API routes
    ├── src/components/       ← Header, SearchForm, ImageGallery, DownloadBar
    └── src/contexts/         ← SessionContext
```

## Environment Variables

| Variable      | Where                 | Description                                              |
| ------------- | --------------------- | -------------------------------------------------------- |
| `SERPAPI_KEY` | `backend/.env`        | Your SerpApi key from [serpapi.com](https://serpapi.com) |
| `BACKEND_URL` | `frontend/.env.local` | FastAPI service URL (default: `http://localhost:8000`)   |
