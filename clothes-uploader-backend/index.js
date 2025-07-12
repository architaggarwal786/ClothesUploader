const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const Clothes = require('./models/Clothes');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload clothes
app.post('/upload-clothes', upload.array('images', 10), async (req, res) => {
  const { season, gender, type, subType } = req.body;
  const files = req.files.map(file => ({
    filename: file.filename,
    path: `http://192.168.158.139:5000/uploads/${file.filename}` // Use your local IP here
  }));

  try {
    const newClothes = new Clothes({
      season, gender, type, subType, images: files
    });
    await newClothes.save();
    res.status(201).json({ message: 'Upload successful', entry: newClothes });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all clothes
app.get('/clothes', async (req, res) => {
  try {
    const clothes = await Clothes.find().sort({ createdAt: -1 });
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clothes' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
