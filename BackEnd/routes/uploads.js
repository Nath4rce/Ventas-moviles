const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // <- el archivo anterior
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// POST /api/uploads  -> subir imagen a Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" }, // carpeta en cloudinary
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    console.error("Error subiendo imagen:", err);
    res.status(500).json({ message: "Error subiendo imagen" });
  }
});

// DELETE /api/uploads/:public_id  -> borrar imagen de Cloudinary
router.delete('/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    const result = await cloudinary.uploader.destroy(public_id);
    return res.json({ deleted: true, result });
  } catch (err) {
    console.error("Error eliminando imagen:", err);
    res.status(500).json({ message: "Error eliminando imagen" });
  }
});

module.exports = router;
