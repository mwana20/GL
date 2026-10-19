import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Body parsers with high payload support for image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    const isNetlifyOrigin = origin && /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin);
    const isConfiguredOrigin = origin && allowedOrigins.includes(origin);

    if (origin && (isNetlifyOrigin || isConfiguredOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Static files for uploaded media
  const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, 'public', 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Mount API router
  app.use('/api', apiRouter);

  if (!isProd) {
    // In development: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // In production: serve dist directory
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GL Real Estates Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
