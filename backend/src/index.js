require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

// Middleware
const { authenticateToken } = require('./middleware/auth');

// Utils
const { setupWebSocket } = require('./utils/websocket');
const logger = require('./utils/logger');

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // her IP için limit
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// WebSocket setup
setupWebSocket(io);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('MongoDB bağlantısı başarılı'))
.catch(err => logger.error('MongoDB bağlantı hatası:', err));

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Bir şeyler ters gitti!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Sunucu ${PORT} portunda çalışıyor`);
}); 