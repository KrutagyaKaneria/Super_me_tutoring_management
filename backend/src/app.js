const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const config = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const adminUserRoutes = require('./routes/admin.user.routes');
const adminFeeRoutes = require('./routes/admin.fee.routes');
const adminReportRoutes = require('./routes/admin.report.routes');
const adminDashboardRoutes = require('./routes/admin.dashboard.routes');
const tutorRoutes = require('./routes/tutor.routes');
const coordinatorRoutes = require('./routes/coordinator.routes');
const studentRoutes = require('./routes/student.routes');
const parentRoutes = require('./routes/parent.routes');

const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/fee-config', adminFeeRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);

// Unhandled Route Fallback
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
