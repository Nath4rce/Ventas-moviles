-- =====================================================
-- BASE DE DATOS PARA VENTAS MOVILES UPB - MARKETPLACE
-- =====================================================
-- Este script crea la estructura completa de la base de datos
-- para el sistema de marketplace interno de la universidad

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ventasmoviles_upb;
USE ventasmoviles_upb;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    rol ENUM('admin', 'seller', 'buyer') DEFAULT 'buyer',
    nrc VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_nrc (nrc),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TABLA DE CATEGORÍAS
-- =====================================================
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE PRODUCTOS
-- =====================================================
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    telefono_whatsapp VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_categoria (categoria_id),
    INDEX idx_vendedor (vendedor_id),
    INDEX idx_precio (precio),
    INDEX idx_rating (rating_promedio),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_busqueda (titulo, descripcion)
);

-- =====================================================
-- TABLA DE IMÁGENES DE PRODUCTOS
-- =====================================================
CREATE TABLE producto_imagenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    orden INT DEFAULT 1,
    is_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    
    INDEX idx_producto (producto_id),
    INDEX idx_orden (orden)
);

-- =====================================================
-- TABLA DE RESEÑAS
-- =====================================================
CREATE TABLE resenas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_resena (producto_id, usuario_id),
    INDEX idx_producto (producto_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
    destinatario_tipo ENUM('all', 'sellers', 'students', 'nrc') DEFAULT 'all',
    nrc_especifico VARCHAR(20) NULL,
    is_site_wide BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tipo (tipo),
    INDEX idx_destinatario (destinatario_tipo),
    INDEX idx_nrc (nrc_especifico),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA DE NOTIFICACIONES DE USUARIOS
-- =====================================================
CREATE TABLE usuario_notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notificacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notificacion_id) REFERENCES notificaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_notificacion_usuario (notificacion_id, usuario_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DEL SITIO
-- =====================================================
CREATE TABLE sitio_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE FAVORITOS
-- =====================================================
CREATE TABLE favoritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_favorito (usuario_id, producto_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_producto (producto_id)
);

-- =====================================================
-- TABLA DE SESIONES
-- =====================================================
CREATE TABLE sesiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_usuario (usuario_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Alimentos', 'Comida y bebidas', 'fas fa-utensils'),
('Accesorios', 'Accesorios y complementos', 'fas fa-laptop'),
('Papelería', 'Material escolar y de oficina', 'fas fa-pen');

-- Insertar usuarios de prueba
INSERT INTO usuarios (student_id, email, password_hash, nombre, rol, nrc, is_active) VALUES
('20210001', 'admin@universidad.edu', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6y', 'Administrador', 'admin', '00000', TRUE),
('20210002', 'vendedor@universidad.edu', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6y', 'Juan Vendedor', 'seller', '11111', TRUE),
('20210003', 'comprador@universidad.edu', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6y', 'María Compradora', 'buyer', '12345', TRUE),
('20210004', 'estudiante@universidad.edu', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6y', 'Carlos Estudiante', 'buyer', '67890', TRUE),
('20210005', 'vendedor2@universidad.edu', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6y', 'Ana Vendedora', 'seller', '54321', FALSE);

-- Insertar productos de ejemplo
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, telefono_whatsapp, rating_promedio, total_resenas) VALUES
('Tacos de Pastor', 'Deliciosos tacos de pastor con cebolla y cilantro', 25.00, 1, 2, '5551234567', 4.5, 12),
('Laptop Dell Inspiron', 'Laptop en excelente estado, ideal para estudiantes', 8500.00, 2, 2, '5551234567', 4.2, 8),
('Cuadernos Spiral', 'Paquete de 5 cuadernos de 100 hojas', 120.00, 3, 5, '5559876543', 4.8, 15),
('Hamburguesas Caseras', 'Hamburguesas artesanales con ingredientes frescos', 45.00, 1, 2, '5551234567', 4.7, 20),
('Mouse Inalámbrico', 'Mouse óptico inalámbrico, perfecto para trabajo', 180.00, 2, 5, '5559876543', 4.3, 6);

-- Insertar imágenes de productos
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES
(1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 1, TRUE),
(1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 2, FALSE),
(2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 1, TRUE),
(3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 1, TRUE),
(4, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, TRUE),
(5, 'https://images.unsplash.com/photo-1527864550417-7f91a0614b4c?w=400', 1, TRUE);

-- Insertar reseñas de ejemplo
INSERT INTO resenas (producto_id, usuario_id, rating, comentario) VALUES
(1, 3, 5, 'Excelentes tacos, muy sabrosos y bien preparados'),
(1, 4, 4, 'Buen sabor, pero un poco caros'),
(2, 3, 5, 'Laptop en perfecto estado, muy recomendada'),
(2, 4, 3, 'Funciona bien pero tiene algunos detalles menores'),
(3, 2, 5, 'Cuadernos de muy buena calidad'),
(4, 3, 5, 'Las mejores hamburguesas del campus'),
(4, 4, 4, 'Muy ricas, las recomiendo'),
(5, 2, 4, 'Mouse funcional, buena relación calidad-precio');

-- Insertar notificaciones de ejemplo
INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo) VALUES
('Bienvenido a Ventas Moviles UPB', '¡Bienvenido al marketplace interno de la universidad!', 'info', 'all'),
('Nuevo producto disponible', 'Se ha agregado un nuevo producto que podría interesarte', 'success', 'students'),
('Mantenimiento programado', 'El sitio estará en mantenimiento el próximo fin de semana', 'warning', 'all');

-- Insertar configuración del sitio
INSERT INTO sitio_config (clave, valor, descripcion) VALUES
('site_disabled', 'false', 'Estado del sitio (true/false)'),
('maintenance_message', 'El sitio está en mantenimiento', 'Mensaje de mantenimiento'),
('max_products_per_user', '10', 'Máximo de productos por usuario'),
('min_rating', '1', 'Calificación mínima permitida'),
('max_rating', '5', 'Calificación máxima permitida');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para productos con información completa
CREATE VIEW vista_productos_completos AS
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
    u.nombre as vendedor_nombre,
    u.student_id as vendedor_id,
    u.avatar_url as vendedor_avatar,
    (SELECT imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = TRUE LIMIT 1) as imagen_principal
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN usuarios u ON p.vendedor_id = u.id
WHERE p.is_active = TRUE;

-- Vista para estadísticas del admin
CREATE VIEW vista_estadisticas AS
SELECT 
    (SELECT COUNT(*) FROM usuarios WHERE is_active = TRUE) as total_usuarios,
    (SELECT COUNT(*) FROM productos WHERE is_active = TRUE) as total_productos,
    (SELECT COUNT(*) FROM resenas) as total_resenas,
    (SELECT COUNT(*) FROM notificaciones) as total_notificaciones,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'seller' AND is_active = TRUE) as total_vendedores,
    (SELECT COUNT(*) FROM usuarios WHERE rol = 'buyer' AND is_active = TRUE) as total_estudiantes;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para actualizar rating de producto
DELIMITER //
CREATE PROCEDURE actualizar_rating_producto(IN producto_id_param INT)
BEGIN
    UPDATE productos 
    SET 
        rating_promedio = (SELECT AVG(rating) FROM resenas WHERE producto_id = producto_id_param),
        total_resenas = (SELECT COUNT(*) FROM resenas WHERE producto_id = producto_id_param)
    WHERE id = producto_id_param;
END //
DELIMITER ;

-- Procedimiento para enviar notificación
DELIMITER //
CREATE PROCEDURE enviar_notificacion(
    IN titulo_param VARCHAR(200),
    IN mensaje_param TEXT,
    IN tipo_param ENUM('info', 'success', 'warning', 'danger'),
    IN destinatario_tipo_param ENUM('all', 'sellers', 'students', 'nrc'),
    IN nrc_especifico_param VARCHAR(20)
)
BEGIN
    DECLARE notificacion_id INT;
    
    -- Insertar notificación
    INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, nrc_especifico)
    VALUES (titulo_param, mensaje_param, tipo_param, destinatario_tipo_param, nrc_especifico_param);
    
    SET notificacion_id = LAST_INSERT_ID();
    
    -- Insertar notificaciones para usuarios según el tipo
    IF destinatario_tipo_param = 'all' THEN
        INSERT INTO usuario_notificaciones (notificacion_id, usuario_id)
        SELECT notificacion_id, id FROM usuarios WHERE is_active = TRUE;
    ELSEIF destinatario_tipo_param = 'sellers' THEN
        INSERT INTO usuario_notificaciones (notificacion_id, usuario_id)
        SELECT notificacion_id, id FROM usuarios WHERE rol = 'seller' AND is_active = TRUE;
    ELSEIF destinatario_tipo_param = 'students' THEN
        INSERT INTO usuario_notificaciones (notificacion_id, usuario_id)
        SELECT notificacion_id, id FROM usuarios WHERE rol = 'buyer' AND is_active = TRUE;
    ELSEIF destinatario_tipo_param = 'nrc' THEN
        INSERT INTO usuario_notificaciones (notificacion_id, usuario_id)
        SELECT notificacion_id, id FROM usuarios WHERE nrc = nrc_especifico_param AND is_active = TRUE;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar rating cuando se inserta una reseña
DELIMITER //
CREATE TRIGGER tr_resena_insert
AFTER INSERT ON resenas
FOR EACH ROW
BEGIN
    CALL actualizar_rating_producto(NEW.producto_id);
END //
DELIMITER ;

-- Trigger para actualizar rating cuando se actualiza una reseña
DELIMITER //
CREATE TRIGGER tr_resena_update
AFTER UPDATE ON resenas
FOR EACH ROW
BEGIN
    CALL actualizar_rating_producto(NEW.producto_id);
END //
DELIMITER ;

-- Trigger para actualizar rating cuando se elimina una reseña
DELIMITER //
CREATE TRIGGER tr_resena_delete
AFTER DELETE ON resenas
FOR EACH ROW
BEGIN
    CALL actualizar_rating_producto(OLD.producto_id);
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_productos_busqueda ON productos (is_active, categoria_id, precio);
CREATE INDEX idx_resenas_producto_fecha ON resenas (producto_id, created_at);
CREATE INDEX idx_notificaciones_usuario ON usuario_notificaciones (usuario_id, is_read);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Esta base de datos está diseñada para soportar todas las funcionalidades
-- del marketplace Ventas Moviles UPB, incluyendo:
-- - Gestión completa de usuarios con roles y NRC
-- - Catálogo de productos con imágenes y reseñas
-- - Sistema de notificaciones dirigidas
-- - Estadísticas y reportes
-- - Optimización para consultas frecuentes
-- - Integridad referencial y triggers automáticos
