const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// AWS S3 yapılandırması
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || 'eu-central-1'
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Dosya uzantısına göre MIME tipini belirle
const getMimeType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Dosyayı S3'e yükle
const uploadToS3 = async (file) => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: `uploads/${filename}`,
      Body: file.buffer,
      ContentType: getMimeType(file.originalname),
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    logger.info(`Dosya S3'e yüklendi: ${result.Location}`);
    
    return result.Location;
  } catch (error) {
    logger.error('S3 yükleme hatası:', error);
    throw new Error('Dosya yüklenirken bir hata oluştu');
  }
};

// S3'ten dosya sil
const deleteFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('/').pop();
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: `uploads/${key}`
    };

    await s3.deleteObject(params).promise();
    logger.info(`Dosya S3'ten silindi: ${key}`);
  } catch (error) {
    logger.error('S3 silme hatası:', error);
    throw new Error('Dosya silinirken bir hata oluştu');
  }
};

// Dosya boyutunu kontrol et
const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => { // Varsayılan 5MB
  if (file.size > maxSize) {
    throw new Error('Dosya boyutu çok büyük');
  }
  return true;
};

// Dosya tipini kontrol et
const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Desteklenmeyen dosya tipi');
  }
  return true;
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  validateFileSize,
  validateFileType
}; 