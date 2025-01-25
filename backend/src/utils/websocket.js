const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

const connectedUsers = new Map();
const userSockets = new Map();

const setupWebSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Yetkilendirme gerekli'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Kullanıcı bulunamadı'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Geçersiz token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;

    // Kullanıcıyı çevrimiçi olarak işaretle
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Bağlantı haritalarını güncelle
    connectedUsers.set(user._id.toString(), user);
    userSockets.set(user._id.toString(), socket.id);

    // Tüm kullanıcılara çevrimiçi durumunu bildir
    io.emit('user:online', {
      userId: user._id,
      username: user.username,
      avatar: user.avatar
    });

    // Yeni bağlanan kullanıcıya mevcut çevrimiçi kullanıcıları gönder
    socket.emit('users:list', Array.from(connectedUsers.values()).map(u => ({
      userId: u._id,
      username: u.username,
      avatar: u.avatar,
      status: u.status
    })));

    logger.info(`WebSocket bağlantısı: ${user.username}`);

    // Yazıyor... durumu
    socket.on('typing:start', () => {
      socket.broadcast.emit('user:typing', {
        userId: user._id,
        username: user.username
      });
    });

    socket.on('typing:stop', () => {
      socket.broadcast.emit('user:typing:stop', {
        userId: user._id
      });
    });

    // Kullanıcı durumu değişikliği
    socket.on('status:change', async (status) => {
      if (['online', 'away'].includes(status)) {
        user.status = status;
        await user.save();
        
        io.emit('user:status', {
          userId: user._id,
          status
        });
      }
    });

    // Bağlantı koptuğunda
    socket.on('disconnect', async () => {
      // Kullanıcıyı çevrimdışı olarak işaretle
      user.status = 'offline';
      user.lastSeen = new Date();
      await user.save();

      // Bağlantı haritalarını güncelle
      connectedUsers.delete(user._id.toString());
      userSockets.delete(user._id.toString());

      // Tüm kullanıcılara çevrimdışı durumunu bildir
      io.emit('user:offline', {
        userId: user._id,
        lastSeen: user.lastSeen
      });

      logger.info(`WebSocket bağlantısı koptu: ${user.username}`);
    });

    // Otomatik away durumu için zamanlayıcı
    let awayTimeout;
    
    socket.on('activity', () => {
      clearTimeout(awayTimeout);
      
      if (user.status === 'away') {
        user.status = 'online';
        user.save();
        
        io.emit('user:status', {
          userId: user._id,
          status: 'online'
        });
      }

      awayTimeout = setTimeout(async () => {
        if (connectedUsers.has(user._id.toString())) {
          user.status = 'away';
          await user.save();
          
          io.emit('user:status', {
            userId: user._id,
            status: 'away'
          });
        }
      }, 5 * 60 * 1000); // 5 dakika
    });
  });

  return {
    connectedUsers,
    userSockets
  };
};

module.exports = {
  setupWebSocket
}; 