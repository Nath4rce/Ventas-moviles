const cloudinary = require('cloudinary').v2;
<<<<<<< HEAD
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
=======
require('dotenv').config();
>>>>>>> 6ee0c46f24d5297786953a80e9d246339e5de386

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
<<<<<<< HEAD
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ventas_moviles_upb/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { cloudinary, upload };
=======
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = cloudinary;
>>>>>>> 6ee0c46f24d5297786953a80e9d246339e5de386
