import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import config from './config';

// Express uygulamasını oluştur
const app = express();

// CORS ayarları
app.use(cors({
  origin: ['http://test.yksbuddy.com', 'https://test.yksbuddy.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON middleware'i
app.use(express.json());

// HTTP sunucusunu oluştur
const httpServer = createServer(app);

// Socket.IO sunucusunu oluştur
const io = new Server(httpServer, {
  cors: {
    origin: ['http://test.yksbuddy.com', 'https://test.yksbuddy.com'],
    credentials: true
  }
});

// MongoDB'ye bağlan
mongoose.connect(config.mongoUri)
  .then(() => {
    console.error('MongoDB\'ye bağlanıldı');
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// Socket.IO bağlantılarını dinle
io.on('connection', (socket) => {
  console.error('Yeni bir kullanıcı bağlandı');

  socket.on('disconnect', () => {
    console.error('Bir kullanıcı ayrıldı');
  });
});

// Sunucuyu başlat
httpServer.listen(config.port, () => {
  console.error(`Sunucu http://localhost:${config.port} adresinde çalışıyor`);
}); 