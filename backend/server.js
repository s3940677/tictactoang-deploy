require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/shared/config/db');
const { initSocket } = require('./src/shared/socket/socket');
const authRoutes    = require('./src/modules/auth/auth.routes');
const adminRoutes   = require('./src/modules/admin/admin.routes');
const profileRoutes = require('./src/modules/profile/profile.routes');
const gameRoutes    = require('./src/modules/game/game.routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));

// Stripe webhook requires raw body for signature verification — mount BEFORE express.json()
const profileController = require('./src/modules/profile/profile.controller');
app.post(
    '/api/profile/subscription/stripe/webhook',
    express.raw({ type: 'application/json' }),
    profileController.stripeWebhook
);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use('/api/auth',    authRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/game',    gameRoutes);

// Serve React frontend in production
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
