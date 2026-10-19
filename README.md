<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3cf5e22e-ab9f-49e4-a336-926f52a6c1c4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy with Netlify and Render

Netlify serves the frontend but does not run the Express API in `server.ts`. Deploy
the API as a separate Render web service using the included `render.yaml`. The
service uses a persistent disk for the JSON database; the Render service and disk
may incur charges according to Render's current pricing.

1. Create a Render Blueprint from this repository and deploy the `gl-real-estates-api` service.
2. In Netlify, set `VITE_API_BASE_URL` to the Render service origin, for example
   `https://gl-real-estates-api.onrender.com` (do not add `/api`).
3. Trigger a new Netlify deploy so the frontend is built with the API URL.
4. Verify the backend health endpoint at `https://<render-service>/api/health`.

Netlify `*.netlify.app` origins are allowed by default. If the site uses a custom
domain, set `ALLOWED_ORIGINS` on Render to its full origin, such as
`https://www.example.com`. Multiple origins can be comma-separated.
