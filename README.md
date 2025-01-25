# YKS Buddy Chat

Modern ve kullanıcı dostu bir mesajlaşma uygulaması. WhatsApp Web benzeri arayüzü ve Discord tarzı çevrimiçi kullanıcı listesi ile tam kapsamlı bir iletişim deneyimi sunar.

## 🚀 Özellikler

- 👤 Güvenli Kayıt ve Giriş Sistemi
- 💬 Gerçek Zamanlı Mesajlaşma (Socket.IO)
- 📸 Fotoğraf Paylaşımı
- 👥 Çevrimiçi Kullanıcı Listesi
- 📊 Kullanıcı Durumu Takibi (online/offline/away)
- ✍️ "Yazıyor..." Göstergesi
- 📱 Responsive Tasarım

## 🛠️ Kullanılan Teknolojiler

### Frontend
- React.js + TypeScript
- Tailwind CSS (UI tasarımı)
- Socket.io-client (gerçek zamanlı iletişim)
- Zustand (state yönetimi)
- Formik + Yup (form yönetimi ve validasyon)
- React Router (sayfa yönlendirme)
- React Hot Toast (bildirimler)

### Backend
- Node.js + Express.js
- TypeScript
- Socket.IO (WebSocket bağlantıları)
- JWT (kimlik doğrulama)
- Bcrypt (şifre hashleme)
- Winston (loglama)
- Express Rate Limit (rate limiting)
- Express Validator (input validasyonu)
- Multer (dosya yükleme)

### Veritabanı & Depolama
- MongoDB (ana veritabanı)
- Mongoose (ODM)
- AWS S3 (medya depolama) - Hazır ama henüz aktif değil

### DevOps & Deployment
- Nginx (reverse proxy, SSL)
- PM2 (process yönetimi)
- GitHub Actions (CI/CD) - Yakında eklenecek

## 📝 Yapılanlar ve Yapılacaklar

### ✅ Tamamlananlar
- [x] Temel auth sistemi (kayıt/giriş)
- [x] Gerçek zamanlı mesajlaşma
- [x] Çevrimiçi kullanıcı listesi
- [x] Kullanıcı durumu yönetimi
- [x] Mesaj geçmişi
- [x] Responsive UI
- [x] Nginx yapılandırması
- [x] PM2 entegrasyonu

### 📋 Yapılacaklar
- [ ] AWS S3 entegrasyonu
- [ ] Dosya paylaşımı
- [ ] Mesaj silme/düzenleme
- [ ] Emoji reaksiyonları
- [ ] Grup sohbetleri
- [ ] Sesli/görüntülü görüşme
- [ ] Ekran paylaşımı
- [ ] Okundu bilgisi
- [ ] Push notifications

## 🔧 Kurulum

1. Repoyu klonlayın
```bash
git clone https://github.com/yusuufkesici/yksbuddy.git
cd yksbuddy
```

2. Backend bağımlılıklarını yükleyin
```bash
cd backend
npm install
```

3. Frontend bağımlılıklarını yükleyin
```bash
cd frontend
npm install
```

4. Gerekli ortam değişkenlerini ayarlayın
```bash
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yks-buddy-chat
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

5. MongoDB'yi başlatın
```bash
sudo systemctl start mongod
```

6. Backend'i başlatın
```bash
cd backend
npm run build
pm2 start dist/index.js --name yks-buddy-chat
```

7. Frontend'i başlatın
```bash
cd frontend
npm run dev
```

## 📡 Nginx Yapılandırması

1. Nginx yapılandırma dosyasını oluşturun:
```bash
sudo nano /etc/nginx/sites-available/test.yksbuddy.com
```

2. Aşağıdaki yapılandırmayı ekleyin:
```nginx
server {
    listen 80;
    server_name test.yksbuddy.com;

    # Frontend
    root /var/www/test.yksbuddy.com/frontend/dist;
    index index.html;

    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json;
    gzip_disable "MSIE [1-6]\.";

    # Frontend route'ları
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API endpoint'leri
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket bağlantısı
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Medya dosyaları
    location /uploads {
        alias /var/www/test.yksbuddy.com/uploads;
        try_files $uri =404;
    }
}
```

3. Symbolic link oluşturun:
```bash
sudo ln -s /etc/nginx/sites-available/test.yksbuddy.com /etc/nginx/sites-enabled/
```

4. Nginx'i yeniden başlatın:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rate limiting
- CORS koruması
- XSS ve CSRF koruması
- Input validasyonu
- Güvenli WebSocket bağlantıları

## 📦 Veritabanı Şeması

### User
- username (string, unique)
- email (string, unique)
- password (string, hashed)
- avatar (string, url)
- status (enum: online/offline/away)
- lastSeen (date)

### Message
- sender (User reference)
- content (string)
- type (enum: text/image/file)
- mediaUrl (string, optional)
- readBy (User references)
- reactions (Array of {user, emoji})
- replyTo (Message reference, optional)
- createdAt (date)

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.