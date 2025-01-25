const Message = require('../models/Message');
const logger = require('../utils/logger');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

const getMessages = async (req, res) => {
  try {
    const { limit = 100, before } = req.query;
    const query = {};

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'username avatar')
      .populate('readBy', 'username')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username'
        }
      });

    res.json(messages.reverse());
  } catch (error) {
    logger.error('Mesaj getirme hatası:', error);
    res.status(500).json({
      message: 'Mesajlar alınırken bir hata oluştu'
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, type = 'text', replyTo } = req.body;
    const sender = req.user._id;

    const message = new Message({
      sender,
      content,
      type,
      replyTo
    });

    if (req.file && (type === 'image' || type === 'file')) {
      const fileUrl = await uploadToS3(req.file);
      message.mediaUrl = fileUrl;
    }

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('readBy', 'username')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username'
        }
      });

    // WebSocket ile mesajı diğer kullanıcılara gönder
    req.app.get('io').emit('message:new', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    logger.error('Mesaj gönderme hatası:', error);
    res.status(500).json({
      message: 'Mesaj gönderilirken bir hata oluştu'
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Mesaj bulunamadı'
      });
    }

    // Mesajı sadece gönderen silebilir
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Bu mesajı silme yetkiniz yok'
      });
    }

    // Medya dosyasını S3'ten sil
    if (message.type !== 'text' && message.mediaUrl) {
      await deleteFromS3(message.mediaUrl);
    }

    await message.remove();

    // WebSocket ile mesajın silindiğini diğer kullanıcılara bildir
    req.app.get('io').emit('message:delete', messageId);

    res.json({
      message: 'Mesaj silindi'
    });
  } catch (error) {
    logger.error('Mesaj silme hatası:', error);
    res.status(500).json({
      message: 'Mesaj silinirken bir hata oluştu'
    });
  }
};

const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Mesaj bulunamadı'
      });
    }

    // Kullanıcının önceki reaksiyonunu kaldır
    message.reactions = message.reactions.filter(
      reaction => reaction.user.toString() !== userId.toString()
    );

    // Yeni reaksiyon ekle
    if (emoji) {
      message.reactions.push({
        user: userId,
        emoji
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('reactions.user', 'username');

    // WebSocket ile reaksiyon güncellemesini diğer kullanıcılara bildir
    req.app.get('io').emit('message:reaction', updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    logger.error('Reaksiyon ekleme hatası:', error);
    res.status(500).json({
      message: 'Reaksiyon eklenirken bir hata oluştu'
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Mesaj bulunamadı'
      });
    }

    // Mesaj zaten okunmuşsa işlem yapma
    if (message.readBy.includes(userId)) {
      return res.json(message);
    }

    message.readBy.push(userId);
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('readBy', 'username');

    // WebSocket ile okundu bilgisini diğer kullanıcılara bildir
    req.app.get('io').emit('message:read', updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    logger.error('Okundu işaretleme hatası:', error);
    res.status(500).json({
      message: 'Mesaj okundu olarak işaretlenirken bir hata oluştu'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage,
  reactToMessage,
  markAsRead
}; 