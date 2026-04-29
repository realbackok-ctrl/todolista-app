'use strict';
const express = require('express');
const cors = require('cors');
const swaggerDocument = require('../../swagger/swagger.json');
const { router } = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const app = express();

const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || true,
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
