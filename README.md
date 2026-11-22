# Fieldnote — multilingual farming assistant

A mobile friendly agricultural advisory app with a React/Vite interface and an Express API. It brings weather, government mandi records, soil based crop suggestions, and an AI assistant together in one place. Provider data is never replaced with sample prices or forecasts: missing integrations are shown as unavailable.

## Requirements

- Node.js 18 or newer (for the server's built in `fetch`)
- npm
- Optional: MongoDB, Gemini API key, OpenWeather API key, and data.gov.in API key/resource ID

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add whichever service credentials you have.
3. Start the frontend and API: `npm run dev`
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The frontend proxies `/api` requests to `http://localhost:3001`. To run the built app, use `npm run build` followed by `npm start`; Express serves the built frontend and API on the configured port.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Express port (defaults to 3001) |
| `MONGODB_URI` | Optional MongoDB connection string for soil/chat persistence |
| `GEMINI_API_KEY` | Server-side Google Gemini key for the chat assistant |
| `GEMINI_MODEL` | Gemini model name (defaults to `gemini-2.0-flash`) |
| `OPENWEATHER_API_KEY` | Server-side OpenWeather key for current weather and forecast |
| `DATA_GOV_API_KEY` | data.gov.in API key for mandi records |
| `MANDI_RESOURCE_ID` | data.gov.in resource UUID for the selected market dataset |

API keys stay on the server. Weather uses OpenWeather current conditions and its 5-day/3-hour forecast endpoint. Mandi searches use the configured data.gov.in resource; the resource needs the expected commodity, state, district, market, arrival date, and price fields. Without credentials or provider data, the app reports the limitation clearly.

## Main API routes

- `GET /api/health` — API and MongoDB status
- `GET /api/weather?location=Guntur` — current weather and grouped forecast
- `GET /api/mandi?crop=paddy&state=Andhra%20Pradesh` — available market records
- `POST /api/recommendations` — general soil based crop options
- `POST /api/chat` — Gemini response using the selected language and available context
- `POST /api/soil` — persist a soil profile when MongoDB is connected

The browser speech recognition and speech synthesis APIs provide voice input/output where supported. English, Telugu, and Hindi are available as language selections; speech recognition quality depends on browser and device support.

## Data and advisory notes

Crop suggestions are general starting points based on entered soil type and pH; they do not account for a verified local planting calendar, water availability, or a laboratory soil report. Mandi data reflects the configured upstream records and can be stale or incomplete. Confirm market and field decisions locally. For serious disease concerns or uncertain chemical treatments, consult an agricultural expert.
