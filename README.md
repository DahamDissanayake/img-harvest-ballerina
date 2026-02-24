# ImgHarvest

**ML-Ready Image Dataset Builder** — Search the web, review results, and download ZIP-packaged, format-converted image datasets in seconds.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Lucide-React → `http://localhost:3000`
- **Backend**: Ballerina Swan Lake → `http://localhost:9090`
- **Image Source**: SerpApi (Google Images engine)
- **Conversion**: Java Interop (ImageIO + TwelveMonkeys WebP)

## Quick Start

### 1. Build the Java converter (once)

```bat
cd backend/image_service
build_java.bat        # downloads TwelveMonkeys JARs, compiles, packages JAR
```

### 2. Start the Ballerina backend

```bat
set SERPAPI_KEY=your_serpapi_api_key_here
cd backend/image_service
bal run
```

Service starts on `http://localhost:9090`

### 3. Start the Next.js frontend

```bat
cd frontend
npm install           # first time only
npm run dev
```

App opens at `http://localhost:3000`

## Features

- 🔍 **Search & Scrape** — powered by SerpApi Google Images
- 🖼 **Review Gallery** — checkbox-select or deselect individual images
- 🔄 **Format Conversion** — PNG / JPG / WebP via Java ImageIO
- 📦 **ZIP Download** — all selected images packaged server-side
- 👤 **Session Context** — email-tagged sessions persisted in localStorage

## Project Structure

```
img-harvest/
├── backend/image_service/
│   ├── scraper_service.bal    ← Main HTTP service (search + download)
│   ├── serpapi_client.bal     ← SerpApi integration
│   ├── image_processor.bal    ← Java Interop bridge
│   ├── types.bal              ← Shared record types
│   ├── libs/ImageConverter.java
│   └── build_java.bat
└── frontend/
    ├── src/app/               ← Next.js App Router pages + API routes
    ├── src/components/        ← Header, SearchForm, ImageGallery, DownloadBar
    └── src/contexts/          ← SessionContext
```

## Environment Variables

| Variable      | Where                 | Description                                              |
| ------------- | --------------------- | -------------------------------------------------------- |
| `SERPAPI_KEY` | Backend (env var)     | Your SerpApi key                                         |
| `BACKEND_URL` | `frontend/.env.local` | Ballerina service URL (default: `http://localhost:9090`) |
