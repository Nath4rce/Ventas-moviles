const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../config/database-sqlite');
const { validateProduct, validateProductId, validateSearch } = require('../middleware/validation');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

// GET /api/products - Obtener todos los productos con filtros
router.get('/', validateSearch, optionalAuth, (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT p.*, u.name as seller_name, u.student_id as seller_id
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    let params = [];
    let paramCount = 0;

    // Aplicar filtros
    if (q) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Ordenar por fecha de creación (más recientes primero)
    query += ` ORDER BY p.created_at DESC`;

    // Aplicar paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    db.all(query, params, (err, products) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos'
        });
      }

      // Obtener total de productos para paginación
      let countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.status = 'active'
      `;
      let countParams = [];
      let countParamCount = 0;

      if (q) {
        countQuery += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
        countParams.push(`%${q}%`, `%${q}%`);
      }

      if (category) {
        countQuery += ` AND p.category = ?`;
        countParams.push(category);
      }

      if (minPrice) {
        countQuery += ` AND p.price >= ?`;
        countParams.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        countQuery += ` AND p.price <= ?`;
        countParams.push(parseFloat(maxPrice));
      }

      db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
          console.error('Error al contar productos:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
          });
        }

        const total = countResult.total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
          success: true,
          data: {
            products,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: total,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', validateProductId, optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    db.get(`
      SELECT p.*, u.name as seller_name, u.student_id as seller_id, u.email as seller_email
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ? AND p.status = 'active'
    `, [id], (err, product) => {
      if (err) {
        console.error('Error al obtener producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener producto'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    });
  } catch (error) {
    console.error('Error en GET /products/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', authenticateToken, requireRole(['seller', 'admin']), upload.single('image'), validateProduct, (req, res) => {
  try {
    const { title, description, price, category, stock = 1 } = req.body;
    const sellerId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const db = getDatabase();
    
    db.run(`
      INSERT INTO products (title, description, price, category, image_url, stock, seller_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, parseFloat(price), category, imageUrl, parseInt(stock), sellerId], function(err) {
      if (err) {
        console.error('Error al crear producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al crear producto'
        });
      }

      const productId = this.lastID;

      // Obtener el producto creado con información del vendedor
      db.get(`
        SELECT p.*, u.name as seller_name, u.student_id as seller_id
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.id = ?
      `, [productId], (err, product) => {
        if (err) {
          console.error('Error al obtener producto creado:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al obtener producto creado'
          });
        }

        res.status(201).json({
          success: true,
          message: 'Producto creado exitosamente',
          data: { product }
        });
      });
    });
  } catch (error) {
    console.error('Error en POST /products:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authenticateToken, validateProductId, upload.single('image'), validateProduct, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const db = getDatabase();

    // Verificar que el producto existe y el usuario tiene permisos
    db.get(`
      SELECT * FROM products WHERE id = ?
    `, [id], (err, product) => {
      if (err) {
        console.error('Error al verificar producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al verificar producto'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Solo el vendedor o admin pueden actualizar
      if (product.seller_id !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este producto'
        });
      }

      // Preparar datos para actualización
      const updateData = {
        title: title || product.title,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        category: category || product.category,
        stock: stock !== undefined ? parseInt(stock) : product.stock,
        image_url: req.file ? `/uploads/${req.file.filename}` : product.image_url,
        updated_at: new Date().toISOString()
      };

      db.run(`
        UPDATE products 
        SET title = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ?, updated_at = ?
        WHERE id = ?
      `, [
        updateData.title,
        updateData.description,
        updateData.price,
        updateData.category,
        updateData.stock,
        updateData.image_url,
        updateData.updated_at,
        id
      ], function(err) {
        if (err) {
          console.error('Error al actualizar producto:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al actualizar producto'
          });
        }

        // Obtener el producto actualizado
        db.get(`
          SELECT p.*, u.name as seller_name, u.student_id as seller_id
          FROM products p
          JOIN users u ON p.seller_id = u.id
          WHERE p.id = ?
        `, [id], (err, updatedProduct) => {
          if (err) {
            console.error('Error al obtener producto actualizado:', err);
            return res.status(500).json({
              success: false,
              message: 'Error al obtener producto actualizado'
            });
          }

          res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: { product: updatedProduct }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error en PUT /products/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', authenticateToken, validateProductId, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const db = getDatabase();

    // Verificar que el producto existe y el usuario tiene permisos
    db.get(`
      SELECT * FROM products WHERE id = ?
    `, [id], (err, product) => {
      if (err) {
        console.error('Error al verificar producto:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al verificar producto'
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Solo el vendedor o admin pueden eliminar
      if (product.seller_id !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este producto'
        });
      }

      // Eliminar imagen si existe
      if (product.image_url) {
        const imagePath = path.join(process.cwd(), product.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Marcar producto como inactivo en lugar de eliminarlo
      db.run(`
        UPDATE products 
        SET status = 'inactive', updated_at = ?
        WHERE id = ?
      `, [new Date().toISOString(), id], function(err) {
        if (err) {
          console.error('Error al eliminar producto:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
          });
        }

        res.json({
          success: true,
          message: 'Producto eliminado exitosamente'
        });
      });
    });
  } catch (error) {
    console.error('Error en DELETE /products/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/user/:userId - Obtener productos de un usuario específico
router.get('/user/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Solo el propio usuario o admin pueden ver sus productos
    if (parseInt(userId) !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estos productos'
      });
    }

    const db = getDatabase();

    db.all(`
      SELECT p.*, u.name as seller_name, u.student_id as seller_id
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, [userId], (err, products) => {
      if (err) {
        console.error('Error al obtener productos del usuario:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos del usuario'
        });
      }

      res.json({
        success: true,
        data: { products }
      });
    });
  } catch (error) {
    console.error('Error en GET /products/user/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
