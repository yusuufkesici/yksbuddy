# YKS Buddy Chat

Modern ve kullanıcı dostu bir mesajlaşma uygulaması. WhatsApp Web benzeri arayüzü ve Discord tarzı çevrimiçi kullanıcı listesi ile tam kapsamlı bir iletişim deneyimi sunar.

## 🚀 Özellikler

- 👤 Güvenli Kayıt ve Giriş Sistemi
- 💬 Gerçek Zamanlı Mesajlaşma
- 📸 Fotoğraf Paylaşımı
- 👥 Çevrimiçi Kullanıcı Listesi
- 🎙️ Sesli ve Görüntülü Görüşme (Yakında)
- 🖥️ Ekran Paylaşımı (Yakında)

## 🛠️ Kullanılan Teknolojiler

### Frontend
- React.js
- Tailwind CSS
- Socket.io-client
- WebRTC (Sesli/Görüntülü görüşme için)

### Backend
- Node.js
- Express.js
- Socket.io
- JWT (Kimlik doğrulama)
- Bcrypt (Şifre hashleme)

### Veritabanı
- MongoDB

### Depolama
- AWS S3 (Medya dosyaları için)

## 🔧 Kurulum

1. Repoyu klonlayın
```bash
git clone https://github.com/kullaniciadi/yks-buddy-chat.git
cd yks-buddy-chat
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
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_bucket_name

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

5. Uygulamayı başlatın
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## 📝 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Mesajlaşma
- `GET /api/messages` - Son mesajları getir
- `POST /api/messages` - Yeni mesaj gönder
- `POST /api/messages/media` - Medya yükle

### WebSocket Events
- `user:online` - Kullanıcı çevrimiçi olduğunda
- `user:offline` - Kullanıcı çevrimdışı olduğunda
- `message:new` - Yeni mesaj geldiğinde
- `typing:start` - Kullanıcı yazmaya başladığında
- `typing:stop` - Kullanıcı yazmayı bıraktığında

## 🔜 Gelecek Özellikler

- Sesli görüşme
- Görüntülü görüşme
- Ekran paylaşımı
- Dosya paylaşımı
- Özel mesajlaşma
- Grup sohbetleri
- Emoji reaksiyonları
- Mesaj arama
- Okundu bilgisi

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.