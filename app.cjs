const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./src/docs/openapi.json');

const authRoutes = require('./src/routes/auth.routes.cjs');
const pengaduanRoutes = require('./src/routes/pengaduan.routes.cjs');
const { notFoundHandler, errorHandler } = require('./src/middleware/error.middleware.cjs');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Endpoint informasi dasar API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Selamat datang di SIMADU REST API',
    dokumentasi: 'http://localhost:3000/api-docs'
  });
});

// Halaman Dokumentasi Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Daftarkan Routes Utama
app.use('/api/auth', authRoutes);
app.use('/api/pengaduan', pengaduanRoutes);

// Penanganan 404 & Global Error Handler (wajib di posisi paling bawah)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;