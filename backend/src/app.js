'use strict';
const express = require('express');
const cors = require('cors');
const swaggerDocument = require('../../swagger/swagger.json');
const { router } = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const app = express();

const buildAllowedOrigins = () => {
  const origins = new Set(['https://fe-kms.vercel.app', 'http://localhost:5173']);
  if (process.env.CORS_ALLOWED_ORIGINS) {
    process.env.CORS_ALLOWED_ORIGINS.split(',').forEach(o => origins.add(o.trim()));
  }
  if (process.env.FRONTEND_URL) {
    origins.add(process.env.FRONTEND_URL.trim());
  }
  return [...origins];
};

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} is not allowed`));
  },
  credentials: true,
};

app.use((req, res, next) => {
  logger.info('Incoming request', { method: req.method, path: req.path });
  next();
});

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerDocument));
app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>TodoLista API Docs</title>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  SwaggerUIBundle({
    url: '/api-docs/swagger.json',
    dom_id: '#swagger-ui',
    persistAuthorization: true,
    tryItOutEnabled: true,
  });
</script>
</body>
</html>`);
});

app.use('/api', router);

app.use(errorHandler);

module.exports = app;
