 const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const clothesDataPath = path.join(__dirname, 'clothes.json');

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Route to handle uploading clothes
app.post('/upload-clothes', upload.array('images', 10), (req, res) => {
  const { season, gender, type, subType } = req.body;
  const files = req.files.map((file) => ({
    filename: file.filename,
    path: `http://192.168.158.139:5000/uploads/${file.filename}`,
  }));

  const newEntry = {
    id: Date.now(),
    season,
    gender,
    type,
    subType,
    images: files,
  };

  let clothes = [];
  if (fs.existsSync(clothesDataPath)) {
    clothes = JSON.parse(fs.readFileSync(clothesDataPath, 'utf8'));
  }

  clothes.push(newEntry);
  fs.writeFileSync(clothesDataPath, JSON.stringify(clothes, null, 2));

  console.log('✅ Upload received:', newEntry);
  res.status(201).json({ message: 'Upload successful', entry: newEntry });
});

// Route to get all uploaded clothes
app.get('/clothes', (req, res) => {
  if (fs.existsSync(clothesDataPath)) {
    const clothes = JSON.parse(fs.readFileSync(clothesDataPath, 'utf8'));
    res.json(clothes);
  } else {
    res.json([]);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
