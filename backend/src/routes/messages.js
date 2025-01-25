const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { validateFileSize, validateFileType } = require('../utils/s3');

// Multer yapılandırması
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    try {
      validateFileType(file);
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  }
});

// Validasyon kuralları
const messageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Mesaj içeriği boş olamaz')
    .isLength({ max: 1000 })
    .withMessage('Mesaj 1000 karakterden uzun olamaz')
];

const reactionValidation = [
  body('emoji')
    .trim()
    .notEmpty()
    .withMessage('Emoji seçilmelidir')
];

// Routes
router.get('/', messageController.getMessages);

router.post('/',
  messageValidation,
  messageController.sendMessage
);

router.post('/media',
  upload.single('file'),
  messageController.sendMessage
);

router.delete('/:messageId',
  messageController.deleteMessage
);

router.post('/:messageId/reactions',
  reactionValidation,
  messageController.reactToMessage
);

router.post('/:messageId/read',
  messageController.markAsRead
);

module.exports = router; 