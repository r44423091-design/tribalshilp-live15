# TribalShilp

A mobile-friendly science exhibition experience celebrating Indian tribal agriculture, crafts, heritage and artisan learning.

## Run locally

```bash
npm install
cp .env.example .env
# Add your Gemini API key to .env (optional; required for live AI features)
npm run dev
```

The app is built with React, Vite, Tailwind CSS and Lucide React. Create a production build with `npm run build`.

## Gemini API key

`VITE_GEMINI_API_KEY` is consumed in the browser by `src/utils/gemini.js` for leaf photo analysis and the TribalRoots guide. Vite-exposed variables are included in client-side code and are **not secret**. For a public deployment, use a backend or serverless proxy that keeps the API key private, and apply quotas/abuse controls. The app displays a friendly setup message if the key is missing.

The marketplace, mandi prices and certificate are exhibition demos. The certificate hash/QR preview is not an official authenticity verification; mandi prices are illustrative, not live data. Speech playback uses the browser's built-in speech synthesis when available.
