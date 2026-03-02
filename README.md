# ImgHarvest

_Note: This will be available soon hosted on Choreo WSO2, and deployments are underway._

This project leverages a modern web and microservices stack to provide a seamless AI-powered image dataset building experience. It works by having an AI agent refine user search queries, fetching images via a SerpApi integration, and using parallel client-side processing to package the selected images into a ZIP file.

---

## Features

- **Smart Search** — Powered by SerpApi Google Images engine
- **AI Query Refinement** — "Refine with AI" button uses Groq (Llama 3.3 70B) to turn messy keywords into precise, laser-focused search queries
- **Review Gallery** — Browse results in a responsive grid, select/deselect individual images with checkboxes
- **Real-Time Progress** — Indeterminate progress bar during search, per-image determinate progress during download
- **Client-Side ZIP** — Images downloaded in parallel (5 at a time) via CORS proxy, zipped client-side with JSZip
- **Session Context** — Email-tagged sessions persisted in localStorage

## Tech Stack

The technology stack driving this project includes Next.js 15 for the frontend framework, Tailwind CSS for styling, Lucide React for UI icons, JSZip for client-side archive processing, Ballerina (bal) for the robust backend service, Java Interop for server-side ZIP creation capabilities, Groq API (Llama 3.3 70B) for AI-powered query refinement, and SerpApi (Google Images) for executing image searches.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Ballerina](https://ballerina.io/downloads/) Swan Lake
- [Java JDK](https://adoptium.net/) 17+
- API Keys: [SerpApi](https://serpapi.com/) + [Groq](https://console.groq.com/keys) (free)

### 1. Configure the backend

```bash
cd backend/image_service
```

Edit `Config.toml` with your API keys:

```toml
serpApiKey = "your-serpapi-key"
groqApiKey = "gsk_your-groq-key"
```

### 2. Build Java dependencies & start the backend

```bash
# Windows
build_java.bat

# Start the Ballerina service
bal run
```

Service starts on `http://localhost:9090`

### 3. Start the Next.js frontend

```bash
cd frontend
npm install          # first time only
npm run dev
```

App opens at `http://localhost:3000`

## Project Structure

```
img-harvest/
├── backend/image_service/
│   ├── scraper_service.bal      ← Main HTTP service (search, refine, download)
│   ├── serpapi_client.bal       ← SerpApi integration
│   ├── ai_refiner.bal           ← Groq/LLM query refinement agent
│   ├── types.bal                ← Shared record types
│   ├── libs/                    ← Java interop (ZipCreator)
│   ├── Config.toml              ← API keys configuration
│   └── Ballerina.toml           ← Project manifest
│
└── frontend/
    ├── src/app/
    │   ├── page.tsx             ← Main page (search, gallery, download flow)
    │   └── api/
    │       ├── search/          ← Proxy → backend /api/search
    │       ├── refine/          ← Proxy → backend /api/refine
    │       ├── download/        ← Proxy → backend /api/download
    │       └── proxy-image/     ← CORS-safe image fetch proxy
    ├── src/components/
    │   ├── Header.tsx           ← App header with session email
    │   ├── SearchForm.tsx       ← Search input + AI refine button
    │   ├── ImageGallery.tsx     ← Image grid with selection
    │   ├── DownloadBar.tsx      ← Sticky download bar with progress
    │   └── ProgressBar.tsx      ← Animated progress component
    ├── src/contexts/
    │   └── SessionContext.tsx   ← Session/email state management
    └── .env.local               ← BACKEND_URL config
```

## Environment Variables

| Variable      | File                                | Description                                                             |
| ------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `serpApiKey`  | `backend/image_service/Config.toml` | SerpApi key ([serpapi.com](https://serpapi.com))                        |
| `groqApiKey`  | `backend/image_service/Config.toml` | Groq API key ([console.groq.com](https://console.groq.com/keys)) — free |
| `BACKEND_URL` | `frontend/.env.local`               | Backend URL (default: `http://localhost:9090`)                          |

## How It Works

```
User types keywords
        │
        ▼
  ┌─────────────┐     ┌──────────────────┐
  │ "Refine     │────▶│ Groq Llama 3.3   │──▶ Refined query
  │  with AI"   │     │ (AI agent)       │
  └─────────────┘     └──────────────────┘
        │
        ▼
  ┌─────────────┐     ┌──────────────────┐
  │  Search     │────▶│ SerpApi          │──▶ Image URLs + thumbnails
  └─────────────┘     │ (Google Images)  │
                      └──────────────────┘
        │
        ▼
  Review & select images in gallery
        │
        ▼
  ┌─────────────┐     ┌──────────────────┐
  │  Download   │────▶│ Client-side      │──▶ ZIP file
  │  (parallel) │     │ JSZip (5 at a    │
  └─────────────┘     │ time via proxy)  │
                      └──────────────────┘
```

## License

This project is licensed under the GNU General Public License.

---

Created by Daham Dissanayake
