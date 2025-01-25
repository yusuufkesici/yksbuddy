declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      FRONTEND_URL: string;
      UPLOAD_DIR: string;
    }
  }
}

export {}; 