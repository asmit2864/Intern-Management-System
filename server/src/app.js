require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./modules/auth/auth.routes');
const candidateRoutes = require('./modules/candidates/candidate.routes');

const offerRoutes = require('./modules/offers/offer.routes');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/offers', offerRoutes);
const boardingRoutes = require('./modules/boarding/boarding.routes');
app.use('/api/boarding', boardingRoutes);

const trainingRoutes = require('./modules/training/training.routes');
const performanceRoutes = require('./modules/performance/performance.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

app.use('/api/training', trainingRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = app;
