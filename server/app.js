const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ProManage API'
  });
});

// TODO: Mount routers here
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/projects', require('./routes/projectRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));

// TODO: Mount global error handler here
app.use(require('./middleware/errorHandler'));

module.exports = app;
