const winston = require('winston');
const path = require('path');

// Log dosyası yapılandırması
const logConfig = {
  transports: [
    // Konsol çıktısı
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    }),
    
    // Dosya çıktısı
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    }),
    
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    })
  ],
  
  // Hata yakalandığında uygulama çökmesin
  exitOnError: false
};

// Logger oluştur
const logger = winston.createLogger(logConfig);

// Geliştirme ortamında daha detaylı loglar
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logs initialized in development mode');
}

module.exports = logger; 