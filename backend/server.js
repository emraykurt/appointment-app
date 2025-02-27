// Temel paketlerin import edilmesi
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
require('dotenv').config();

// Express uygulamasını oluşturma
const app = express();

// Middleware'lerin ayarlanması
app.use(cors({
  origin: '*', // Tüm originlere izin ver (geliştirme aşamasında)
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));


app.use(express.json());

// MongoDB bağlantı adresi
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment';

// MongoDB'ye bağlanma
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// Appointment (Randevu) şeması
const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

const User = mongoose.model("User", userSchema);

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Yetkisiz" });

  try {
    const decoded = jwt.verify(token, process.env.JWTSecret); 
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Geçersiz token" });
  }
};

// Girdi doğrulama middleware'i
const validateAppointmentInput = [
  body('name').trim().notEmpty().withMessage('Ad Soyad alanı zorunludur'),
  body('date').notEmpty().withMessage('Tarih alanı zorunludur')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Tarih formatı YYYY-MM-DD olmalıdır'),
  body('time').notEmpty().withMessage('Saat alanı zorunludur')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Saat formatı HH:MM olmalıdır')
];

// ROUTE: Kullanıcı Kaydı
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Önce e-posta ve kullanıcı adının kullanımda olup olmadığını kontrol et
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });
    
    if (existingUser) {
      // Hangi alanın duplicate olduğunu kontrol et
      if (existingUser.email === email) {
        return res.status(400).json({ 
          msg: "error", 
          error: "Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta adresi deneyin." 
        });
      }
      
      if (existingUser.username === username) {
        return res.status(400).json({ 
          msg: "error", 
          error: "Bu kullanıcı adı zaten kullanımda. Lütfen farklı bir kullanıcı adı deneyin." 
        });
      }
      
      return res.status(400).json({ 
        msg: "error", 
        error: "Bu hesap bilgileri zaten kullanımda." 
      });
    }
    
    // Kullanıcı bilgileri uygunsa hesabı oluştur
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role: role || "user" 
    });
    
    await user.save();
    
    res.status(201).json({ msg: "Kullanıcı başarıyla oluşturuldu" });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    
    // MongoDB duplicate key hatası kontrolü
    if (error.code === 11000) {
      // Duplicate key hatası hangi alan için olduğunu kontrol et
      const keyPattern = error.keyPattern;
      if (keyPattern.email) {
        return res.status(400).json({ 
          msg: "error", 
          error: "Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta adresi deneyin."
        });
      }
      if (keyPattern.username) {
        return res.status(400).json({ 
          msg: "error", 
          error: "Bu kullanıcı adı zaten kullanımda. Lütfen farklı bir kullanıcı adı deneyin."
        });
      }
      
      return res.status(400).json({ 
        msg: "error", 
        error: "Bu hesap bilgileri zaten kullanımda." 
      });
    }
    
    // Diğer hatalar için genel mesaj
    res.status(500).json({ 
      msg: "error", 
      error: "Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin." 
    });
  }
});

// ROUTE: Kullanıcı Girişi
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Geçersiz şifre" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWTSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE: Yeni randevu oluşturma
app.post(
  "/api/appointments",
  authMiddleware,
  validateAppointmentInput,
  async (req, res) => {
    try {
      const { name, date, time } = req.body;
      const userId = req.user.id;

      const existingAppointment = await Appointment.findOne({ date, time });
      if (existingAppointment) {
        return res.status(409).json({
          msg: "error",
          error: "Bu tarih ve saatte zaten bir randevu bulunmaktadır.",
        });
      }

      const newAppointment = new Appointment({ name, date, time, userId });
      await newAppointment.save();

      res.status(201).json({ msg: "ok", data: newAppointment });
    } catch (error) {
      res.status(500).json({
        msg: "error",
        error: "Sunucu hatası: Randevu oluşturulamadı",
      });
    }
  }
);

// ROUTE: Tüm randevuları getirme
app.get("/api/appointments", authMiddleware, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === "admin") {
      appointments = await Appointment.find().sort({ date: 1, time: 1 });
    } else {
      appointments = await Appointment.find({ userId: req.user.id }).sort({
        date: 1,
        time: 1,
      });
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      msg: "error",
      error: "Sunucu hatası: Randevular getirilemedi",
    });
  }
});

// ROUTE: Tüm dolu randevu slotlarını getirme (kullanıcı bilgisi olmadan)
app.get('/api/available-slots', authMiddleware, async (req, res) => {
  try {
    // Tüm randevuları tarih ve zaman bilgisiyle çek (kimin aldığı bilgisi olmadan)
    const allAppointments = await Appointment.find({}, 'date time');
    
    // Sadece tarih ve zaman bilgisini içeren bir dizi döndür
    const bookedSlots = allAppointments.map(appointment => ({
      date: appointment.date,
      time: appointment.time
    }));
    
    res.json(bookedSlots);
  } catch (error) {
    console.error('Randevu slotları alınırken hata oluştu:', error);
    res.status(500).json({ 
      msg: 'error', 
      error: 'Sunucu hatası: Randevu slotları alınamadı' 
    });
  }
});

// ROUTE: Randevu silme
app.delete('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        msg: 'error', 
        error: 'Randevu bulunamadı' 
      });
    }
    
    res.json({ msg: 'ok', id: req.params.id });
  } catch (error) {
    console.error('Randevu silme hatası:', error);
    res.status(500).json({ 
      msg: 'error', 
      error: 'Sunucu hatası: Randevu silinemedi' 
    });
  }
});

// ROUTE: Müsait slotları getirme
app.get('/api/slots', async (req, res) => {
  try {
    // Tüm randevuları çekme
    const appointments = await Appointment.find({}, 'date time');
    
    // Tüm olası slotları oluşturma
    const allSlots = [];
    
    // Şu anki tarih
    const today = new Date();
    
    // Sonraki 7 gün için slotlar oluşturma
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(today.getDate() + day);
      
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // 08:00 - 18:00 arası 30'ar dakikalık slotlar
      for (let hour = 8; hour < 18; hour++) {
        for (let minute of [0, 30]) {
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          allSlots.push({ date: formattedDate, time });
        }
      }
    }
    
    // Müsait slotları filtreleme (randevusu olmayan slotlar)
    const availableSlots = allSlots.filter(slot => {
      return !appointments.some(
        appointment => appointment.date === slot.date && appointment.time === slot.time
      );
    });
    
    res.json(availableSlots);
  } catch (error) {
    console.error('Slotları getirme hatası:', error);
    res.status(500).json({ 
      msg: 'error', 
      error: 'Sunucu hatası: Müsait slotlar getirilemedi' 
    });
  }
});

// ROUTE: Kullanıcı bilgilerini getir
app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Kullanıcı bilgilerini getir (şifre hariç)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        msg: 'error', 
        error: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata oluştu:', error);
    res.status(500).json({ 
      msg: 'error', 
      error: 'Sunucu hatasi: Kullanıcı bilgileri alınamadı' 
    });
  }
});



// Port tanımlaması ve sunucuyu başlatma
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

// Vercel için Express uygulamasını dışa aktarın
module.exports = app;