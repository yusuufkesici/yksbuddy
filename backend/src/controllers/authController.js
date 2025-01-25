const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcı adı ve email kontrolü
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Bu kullanıcı adı veya email zaten kullanımda'
      });
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      username,
      email,
      password,
      registrationIp: req.ip
    });

    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    logger.info(`Yeni kullanıcı kaydı: ${username}`);

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    logger.error('Kayıt hatası:', error);
    res.status(500).json({
      message: 'Kayıt sırasında bir hata oluştu'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Kullanıcı durumunu güncelle
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    // Token oluştur
    const token = generateToken(user._id);

    logger.info(`Kullanıcı girişi: ${username}`);

    res.json({
      message: 'Giriş başarılı',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    logger.error('Giriş hatası:', error);
    res.status(500).json({
      message: 'Giriş sırasında bir hata oluştu'
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    
    // Kullanıcı durumunu güncelle
    user.status = 'offline';
    user.lastSeen = new Date();
    await user.save();

    logger.info(`Kullanıcı çıkışı: ${user.username}`);

    res.json({
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    logger.error('Çıkış hatası:', error);
    res.status(500).json({
      message: 'Çıkış sırasında bir hata oluştu'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Profil getirme hatası:', error);
    res.status(500).json({
      message: 'Profil bilgileri alınırken bir hata oluştu'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const user = req.user;

    if (username) {
      // Kullanıcı adı kontrolü
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Bu kullanıcı adı zaten kullanımda'
        });
      }

      user.username = username;
    }

    if (email) {
      // Email kontrolü
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Bu email zaten kullanımda'
        });
      }

      user.email = email;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    logger.info(`Profil güncellendi: ${user.username}`);

    res.json({
      message: 'Profil güncellendi',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      message: 'Profil güncellenirken bir hata oluştu'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
}; 