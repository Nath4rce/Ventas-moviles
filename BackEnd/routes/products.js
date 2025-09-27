const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireBuyer, canModifyProduct } = require('../middleware/auth');
const { validateProduct, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// GET /api/products - Obtener todos los productos con filtros
router.get('/', validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      categoria_id, 
      precio_min, 
      precio_max, 
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.is_active = TRUE'];
    let queryParams = [];

    // Filtros
    if (categoria_id) {
      whereConditions.push('p.categoria_id = ?');
      queryParams.push(categoria_id);
    }

    if (precio_min) {
      whereConditions.push('p.precio >= ?');
      queryParams.push(precio_min);
    }

    if (precio_max) {
      whereConditions.push('p.precio <= ?');
      queryParams.push(precio_max);
    }

    if (search) {
      whereConditions.push('(p.titulo LIKE ? OR p.descripcion LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Ordenamiento válido
    const validSortFields = ['created_at', 'precio', 'rating_promedio', 'titulo'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal
    const productsQuery = `
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.telefono_whatsapp,
        p.created_at,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre as vendedor_nombre,
        u.student_id as vendedor_id,
        u.avatar_url as vendedor_avatar,
        (SELECT imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = TRUE LIMIT 1) as imagen_principal
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const products = await query(productsQuery, queryParams);

    // Contar total de productos
    const countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2); // Remover limit y offset
    const [countResult] = await query(countQuery, countParams);
    const total = countResult.total;

    // Obtener imágenes para cada producto
    for (let product of products) {
      const images = await query(
        'SELECT imagen_url, orden FROM producto_imagenes WHERE producto_id = ? ORDER BY orden',
        [product.id]
      );
      product.imagenes = images.map(img => img.imagen_url);
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/categories - Obtener categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(
      'SELECT id, nombre, descripcion, icono FROM categorias WHERE is_active = TRUE ORDER BY nombre'
    );

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const productId = req.params.id;

    const products = await query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.telefono_whatsapp,
        p.created_at,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre as vendedor_nombre,
        u.student_id as vendedor_id,
        u.avatar_url as vendedor_avatar
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      WHERE p.id = ? AND p.is_active = TRUE
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = products[0];

    // Obtener imágenes del producto
    const images = await query(
      'SELECT imagen_url, orden, is_principal FROM producto_imagenes WHERE producto_id = ? ORDER BY orden',
      [productId]
    );

    product.imagenes = images.map(img => ({
      url: img.imagen_url,
      orden: img.orden,
      isPrincipal: img.is_principal
    }));

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', authenticateToken, requireBuyer, validateProduct, async (req, res) => {
  try {
    const { titulo, descripcion, precio, categoria_id, telefono_whatsapp, imagenes } = req.body;
    const vendedorId = req.user.id;

    // Verificar si el usuario ya tiene un producto activo
    const existingProduct = await query(
      'SELECT id FROM productos WHERE vendedor_id = ? AND is_active = TRUE',
      [vendedorId]
    );

    if (existingProduct.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un producto activo. Debes desactivarlo antes de crear uno nuevo.'
      });
    }

    // Verificar que la categoría existe
    const category = await query(
      'SELECT id FROM categorias WHERE id = ? AND is_active = TRUE',
      [categoria_id]
    );

    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Insertar producto
    const result = await query(
      `INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, telefono_whatsapp) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion, precio, categoria_id, vendedorId, telefono_whatsapp]
    );

    const productId = result.insertId;

    // Insertar imágenes si se proporcionan
    if (imagenes && imagenes.length > 0) {
      for (let i = 0; i < imagenes.length; i++) {
        await query(
          'INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES (?, ?, ?, ?)',
          [productId, imagenes[i], i + 1, i === 0]
        );
      }
    }

    // Obtener producto creado
    const newProduct = await query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.telefono_whatsapp,
        p.created_at,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre as vendedor_nombre,
        u.student_id as vendedor_id,
        u.avatar_url as vendedor_avatar
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      WHERE p.id = ?
    `, [productId]);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: newProduct[0] }
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authenticateToken, canModifyProduct, validateProduct, async (req, res) => {
  try {
    const productId = req.params.id;
    const { titulo, descripcion, precio, categoria_id, telefono_whatsapp, imagenes } = req.body;

    // Verificar que la categoría existe
    if (categoria_id) {
      const category = await query(
        'SELECT id FROM categorias WHERE id = ? AND is_active = TRUE',
        [categoria_id]
      );

      if (category.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
    }

    // Actualizar producto
    const updateFields = [];
    const updateValues = [];

    if (titulo) {
      updateFields.push('titulo = ?');
      updateValues.push(titulo);
    }

    if (descripcion) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }

    if (precio !== undefined) {
      updateFields.push('precio = ?');
      updateValues.push(precio);
    }

    if (categoria_id) {
      updateFields.push('categoria_id = ?');
      updateValues.push(categoria_id);
    }

    if (telefono_whatsapp !== undefined) {
      updateFields.push('telefono_whatsapp = ?');
      updateValues.push(telefono_whatsapp);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(productId);

    await query(
      `UPDATE productos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Actualizar imágenes si se proporcionan
    if (imagenes && imagenes.length > 0) {
      // Eliminar imágenes existentes
      await query('DELETE FROM producto_imagenes WHERE producto_id = ?', [productId]);

      // Insertar nuevas imágenes
      for (let i = 0; i < imagenes.length; i++) {
        await query(
          'INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES (?, ?, ?, ?)',
          [productId, imagenes[i], i + 1, i === 0]
        );
      }
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/products/:id - Eliminar/desactivar producto
router.delete('/:id', authenticateToken, canModifyProduct, async (req, res) => {
  try {
    const productId = req.params.id;

    // Desactivar producto en lugar de eliminarlo
    await query(
      'UPDATE productos SET is_active = FALSE WHERE id = ?',
      [productId]
    );

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/user/:userId - Obtener productos de un usuario específico
router.get('/user/:userId', validateId, async (req, res) => {
  try {
    const userId = req.params.userId;

    const products = await query(`
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.telefono_whatsapp,
        p.is_active,
        p.created_at,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        (SELECT imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = TRUE LIMIT 1) as imagen_principal
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.vendedor_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Error al obtener productos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
