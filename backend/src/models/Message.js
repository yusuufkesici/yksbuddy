const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Mesaj içeriğini temizle
messageSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.content = this.content.trim();
  }
  next();
});

// Mesaj silindiğinde medya dosyasını da sil
messageSchema.pre('remove', async function(next) {
  if (this.type !== 'text' && this.mediaUrl) {
    try {
      // AWS S3'ten dosyayı sil
      // Bu kısmı AWS S3 entegrasyonundan sonra implement edeceğiz
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema); 