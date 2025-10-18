const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireBuyer, requireSeller, canModifyProduct } = require('../middleware/auth');
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
      request.input('categoriaId', sql.Int, categoria_id);
      whereConditions.push('p.categoria_id = @categoriaId');
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

    // Consulta principal
    const pool = await getPool();
    const request = pool.request();

    // Agregar parámetros dinámicamente
    let paramIndex = 0;
    if (categoria_id) {
      request.input('categoriaId', sql.Int, parseInt(categoria_id));
      whereConditions[whereConditions.findIndex(c => c.includes('categoria_id'))] = 'p.categoria_id = @categoriaId';
    }
    if (precio_min) {
      request.input('precioMin', sql.Decimal(10, 2), parseFloat(precio_min));
      whereConditions[whereConditions.findIndex(c => c.includes('precio >='))] = 'p.precio >= @precioMin';
    }
    if (precio_max) {
      request.input('precioMax', sql.Decimal(10, 2), parseFloat(precio_max));
      whereConditions[whereConditions.findIndex(c => c.includes('precio <='))] = 'p.precio <= @precioMax';
    }
    if (search) {
      request.input('search', sql.NVarChar(255), `%${search}%`);
      whereConditions[whereConditions.findIndex(c => c.includes('LIKE'))] = '(p.titulo LIKE @search OR p.descripcion LIKE @search)';
    }

    whereConditions[0] = 'p.is_active = 1'; // Cambiar TRUE a 1
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    request.input('offset', sql.Int, parseInt(offset));
    request.input('limit', sql.Int, parseInt(limit));

    const productsQuery = `
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.rating_promedio,
        p.total_resenas,
        p.is_active,   
        p.created_at,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre as vendedor_nombre,
        u.id_institucional as vendedor_id_institucional,
        u.telefono as vendedor_telefono,
        u.avatar_url as vendedor_avatar,
        (SELECT TOP 1 imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = 1) as imagen_principal
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
      ORDER BY p.${sortField} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(productsQuery);
    const products = result.recordset;

    // Contar total de productos
    const countRequest = pool.request();
    if (categoria_id) countRequest.input('categoriaId', sql.Int, parseInt(categoria_id));
    if (precio_min) countRequest.input('precioMin', sql.Decimal(10, 2), parseFloat(precio_min));
    if (precio_max) countRequest.input('precioMax', sql.Decimal(10, 2), parseFloat(precio_max));
    if (search) countRequest.input('search', sql.NVarChar(255), `%${search}%`);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.vendedor_id = u.id
      ${whereClause}
    `;

    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    // Obtener imágenes para cada producto
    for (let product of products) {
      const imgResult = await pool.request()
        .input('productoId', sql.Int, product.id)
        .query('SELECT imagen_url, orden FROM producto_imagenes WHERE producto_id = @productoId ORDER BY orden');
      product.imagenes = imgResult.recordset.map(img => img.imagen_url);
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
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT id, nombre, descripcion, icono FROM categorias WHERE is_active = 1 ORDER BY nombre');

    res.json({
      success: true,
      data: { categories: result.recordset }
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

    const pool = await getPool();
    const result = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT 
          p.id,
          p.titulo,
          p.descripcion,
          p.precio,
          p.rating_promedio,
          p.total_resenas,
          p.created_at,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          u.nombre as vendedor_nombre,
          u.id_institucional as vendedor_id_institucional,
          u.telefono as vendedor_telefono,
          u.avatar_url as vendedor_avatar
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        JOIN usuarios u ON p.vendedor_id = u.id
        WHERE p.id = @productId AND p.is_active = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = result.recordset[0];

    // Obtener imágenes del producto
    const imgResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT imagen_url, orden, is_principal FROM producto_imagenes WHERE producto_id = @productId ORDER BY orden');

    const images = imgResult.recordset;

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
router.post('/', authenticateToken, requireSeller, validateProduct, async (req, res) => {
  try {
    const { titulo, descripcion, precio, categoria_id, imagenes } = req.body;
    const vendedorId = req.user.id;

    const pool = await getPool();

    const checkProduct = await pool.request()
      .input('vendedorId', sql.Int, vendedorId)
      .query('SELECT id FROM productos WHERE vendedor_id = @vendedorId AND is_active = 1');

    if (checkProduct.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un producto activo. Debes desactivarlo antes de crear uno nuevo.'
      });
    }

    const checkCategory = await pool.request()
      .input('categoriaId', sql.Int, categoria_id)
      .query('SELECT id FROM categorias WHERE id = @categoriaId AND is_active = 1');

    if (checkCategory.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const insertResult = await pool.request()
      .input('titulo', sql.NVarChar(255), titulo)
      .input('descripcion', sql.NVarChar(sql.MAX), descripcion)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('categoriaId', sql.Int, categoria_id)
      .input('vendedorId', sql.Int, vendedorId)
      .query(`INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id) 
              OUTPUT INSERTED.id
              VALUES (@titulo, @descripcion, @precio, @categoriaId, @vendedorId)`);

    const productId = insertResult.recordset[0].id;

    if (imagenes && imagenes.length > 0) {
      for (let i = 0; i < imagenes.length; i++) {
        await pool.request()
          .input('productoId', sql.Int, productId)
          .input('imagenUrl', sql.NVarChar(500), imagenes[i])
          .input('orden', sql.Int, i + 1)
          .input('isPrincipal', sql.Bit, i === 0 ? 1 : 0)
          .query('INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES (@productoId, @imagenUrl, @orden, @isPrincipal)');
      }
    }

    const newProductResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query(`
        SELECT 
          p.id,
          p.titulo,
          p.descripcion,
          p.precio,
          p.rating_promedio,
          p.total_resenas,
          p.created_at,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          u.nombre as vendedor_nombre,
          u.id_institucional as vendedor_id_institucional,
          u.telefono as vendedor_telefono,
          u.avatar_url as vendedor_avatar
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        JOIN usuarios u ON p.vendedor_id = u.id
        WHERE p.id = @productId
      `);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: newProductResult.recordset[0] }
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
    const { titulo, descripcion, precio, categoria_id, imagenes } = req.body;

    const pool = await getPool();

    // Verificar que la categoría existe
    if (categoria_id) {
      const checkCategory = await pool.request()
        .input('categoriaId', sql.Int, categoria_id)
        .query('SELECT id FROM categorias WHERE id = @categoriaId AND is_active = 1');

      if (checkCategory.recordset.length === 0) {
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

    if (updateFields.length === 0 && (!imagenes || imagenes.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    if (updateFields.length > 0) {
      const request = pool.request().input('productId', sql.Int, productId);

      if (titulo) request.input('titulo', sql.NVarChar(255), titulo);
      if (descripcion) request.input('descripcion', sql.NVarChar(sql.MAX), descripcion);
      if (precio !== undefined) request.input('precio', sql.Decimal(10, 2), precio);
      if (categoria_id) request.input('categoriaId', sql.Int, categoria_id);

      await request.query(`UPDATE productos SET ${updateFields.join(', ')}, updated_at = GETDATE() WHERE id = @productId`);
    }

    // Actualizar imágenes si se proporcionan
    if (imagenes && imagenes.length > 0) {
      await pool.request()
        .input('productId', sql.Int, productId)
        .query('DELETE FROM producto_imagenes WHERE producto_id = @productId');

      for (let i = 0; i < imagenes.length; i++) {
        await pool.request()
          .input('productId', sql.Int, productId)
          .input('imagenUrl', sql.NVarChar(500), imagenes[i])
          .input('orden', sql.Int, i + 1)
          .input('isPrincipal', sql.Bit, i === 0 ? 1 : 0)
          .query('INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES (@productId, @imagenUrl, @orden, @isPrincipal)');
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
    const pool = await getPool();
    await pool.request()
      .input('productId', sql.Int, productId)
      .query('UPDATE productos SET is_active = 0 WHERE id = @productId');

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

    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          p.id,
          p.titulo,
          p.descripcion,
          p.precio,
          p.rating_promedio,
          p.total_resenas,
          p.is_active,
          p.created_at,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          (SELECT TOP 1 imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = 1) as imagen_principal
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.vendedor_id = @userId
        ORDER BY p.created_at DESC
      `);

    res.json({
      success: true,
      data: { products: result.recordset }
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