const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Mevcut POST endpoint'i
app.post('/resize', upload.single('image'), (req, res) => {
  // ... (mevcut POST /resize endpoint'i kodu buraya gelecek)
});

// Güncellenen GET endpoint'i
app.get('/resize', async (req, res) => {
  const { width, height, type, size, imageUrl } = req.query;

  if (!width || !height || !imageUrl) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = response.data;

    let sharpInstance = sharp(imageBuffer).resize({
      width: parseInt(width),
      height: parseInt(height),
      fit: 'cover'
    });

    // Eğer type belirtilmişse, o formata dönüştür
    if (type) {
      sharpInstance = sharpInstance.toFormat(type);
    }

    // Eğer size belirtilmişse, kaliteyi ayarla
    if (size) {
      const quality = parseInt(size);
      sharpInstance = sharpInstance.jpeg({ quality }).png({ quality });
    }

    const resizedImage = await sharpInstance.toBuffer();

    const fileSize = resizedImage.length;
    const outputType = type || 'jpeg'; // Varsayılan olarak jpeg

    res.type(`image/${outputType}`);
    res.set({
      'Content-Length': fileSize,
      'X-Image-Width': width,
      'X-Image-Height': height,
      'X-Image-Type': outputType,
      'X-Image-Size': fileSize
    });
    res.send(resizedImage);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});