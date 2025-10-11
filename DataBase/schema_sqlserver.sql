-- =============================================
-- VENTAS MOVILES UPB - SQL SERVER SCHEMA
-- Base de datos para marketplace estudiantil
-- Version: 2.0 (SQL Server Migration)
-- =============================================

-- Crear base de datos
USE master;
GO

IF DB_ID('ventasmoviles_upb') IS NOT NULL
BEGIN
    ALTER DATABASE ventasmoviles_upb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ventasmoviles_upb;
END
GO

CREATE DATABASE ventasmoviles_upb;
GO

USE ventasmoviles_upb;
GO

-- =============================================
-- TABLA: categorias
-- Almacena las categorías de productos
-- =============================================
CREATE TABLE categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL UNIQUE,
    descripcion NVARCHAR(500),
    icono NVARCHAR(50), -- Nombre del icono (FontAwesome)
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Índice para búsquedas activas
CREATE INDEX idx_categorias_active ON categorias(is_active) WHERE is_active = 1;
GO

-- =============================================
-- TABLA: usuarios
-- Almacena información de usuarios del sistema
-- CAMBIOS: Eliminado 'nrc', renombrado student_id → id_institucional
-- =============================================
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_institucional CHAR(9) NOT NULL UNIQUE, -- ID único UPB (ej: 000497849)
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    nombre NVARCHAR(255) NOT NULL,
    telefono NVARCHAR(20), -- Teléfono de contacto (WhatsApp)
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'seller', 'buyer')) DEFAULT 'buyer',
    avatar_url NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Índices para búsquedas frecuentes
    INDEX idx_id_institucional (id_institucional),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_active (is_active) WHERE is_active = 1
);
GO

-- =============================================
-- TABLA: productos
-- Almacena información de productos publicados
-- =============================================
CREATE TABLE productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(MAX) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_promedio BETWEEN 0 AND 5),
    total_resenas INT DEFAULT 0 CHECK (total_resenas >= 0),
    vistas INT DEFAULT 0 CHECK (vistas >= 0),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys (CASCADE solo en categoría)
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) ON DELETE CASCADE,
    CONSTRAINT fk_productos_vendedor FOREIGN KEY (vendedor_id) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    
    -- Índices optimizados
    INDEX idx_productos_categoria (categoria_id),
    INDEX idx_productos_vendedor (vendedor_id),
    INDEX idx_productos_precio (precio),
    INDEX idx_productos_rating (rating_promedio),
    INDEX idx_productos_active (is_active) WHERE is_active = 1,
    INDEX idx_productos_created (created_at DESC)
);
GO

-- =============================================
-- TABLA: producto_imagenes
-- Almacena imágenes asociadas a productos
-- =============================================
CREATE TABLE producto_imagenes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL,
    imagen_url NVARCHAR(500) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    is_principal BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT fk_imagenes_producto FOREIGN KEY (producto_id) 
        REFERENCES productos(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_imagenes_producto (producto_id),
    INDEX idx_imagenes_principal (producto_id, is_principal) WHERE is_principal = 1
);
GO

-- =============================================
-- TABLA: resenas
-- Almacena reseñas de productos
-- =============================================
CREATE TABLE resenas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comentario NVARCHAR(1000),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys (sin CASCADE para evitar múltiples rutas)
    CONSTRAINT fk_resenas_producto FOREIGN KEY (producto_id) 
        REFERENCES productos(id) ON DELETE NO ACTION,
    CONSTRAINT fk_resenas_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    
    -- Un usuario solo puede reseñar un producto una vez
    CONSTRAINT uq_resena_usuario_producto UNIQUE (producto_id, usuario_id),
    
    -- Índices
    INDEX idx_resenas_producto (producto_id),
    INDEX idx_resenas_usuario (usuario_id),
    INDEX idx_resenas_rating (rating)
);
GO

-- =============================================
-- TABLA: notificaciones
-- Sistema de notificaciones dirigidas
-- CAMBIOS: nrc_especifico → id_institucional_especifico
-- =============================================
CREATE TABLE notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo NVARCHAR(255) NOT NULL,
    mensaje NVARCHAR(MAX) NOT NULL,
    tipo NVARCHAR(30) NOT NULL CHECK (tipo IN ('info', 'success', 'warning', 'danger')) DEFAULT 'info',
    destinatario_tipo NVARCHAR(20) NOT NULL CHECK (destinatario_tipo IN ('all', 'sellers', 'buyers', 'id_institucional_especifico')) DEFAULT 'all',
    id_institucional_especifico CHAR(9), -- ID institucional para notificaciones dirigidas
    is_site_wide BIT NOT NULL DEFAULT 0, -- Notificación global del sitio
    created_by INT, -- Admin que creó la notificación
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys
    CONSTRAINT fk_notificaciones_creator FOREIGN KEY (created_by) 
        REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Validación: si destinatario_tipo es 'id_institucional_especifico', debe tener id_institucional_especifico
    CONSTRAINT chk_notificacion_destinatario CHECK (
        (destinatario_tipo = 'id_institucional_especifico' AND id_institucional_especifico IS NOT NULL) OR
        (destinatario_tipo != 'id_institucional_especifico')
    ),
    
    -- Índices
    INDEX idx_notificaciones_tipo (destinatario_tipo),
    INDEX idx_notificaciones_id_institucional (id_institucional_especifico),
    INDEX idx_notificaciones_created (created_at DESC),
);
GO

-- =============================================
-- TABLA: notificaciones_leidas
-- Registra qué notificaciones ha leído cada usuario
-- =============================================
CREATE TABLE notificaciones_leidas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    notificacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    leida_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys
    CONSTRAINT fk_leidas_notificacion FOREIGN KEY (notificacion_id) 
        REFERENCES notificaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_leidas_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Un usuario solo puede marcar como leída una notificación una vez
    CONSTRAINT uq_notificacion_usuario UNIQUE (notificacion_id, usuario_id),
    
    -- Índices
    INDEX idx_leidas_usuario (usuario_id),
    INDEX idx_leidas_notificacion (notificacion_id)
);
GO

-- =============================================
-- TABLA: favoritos
-- Productos marcados como favoritos por usuarios
-- =============================================
CREATE TABLE favoritos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys (sin CASCADE para evitar múltiples rutas)
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) 
        REFERENCES productos(id) ON DELETE NO ACTION,
    
    -- Un usuario solo puede marcar un producto como favorito una vez
    CONSTRAINT uq_favorito_usuario_producto UNIQUE (usuario_id, producto_id),
    
    -- Índices
    INDEX idx_favoritos_usuario (usuario_id),
    INDEX idx_favoritos_producto (producto_id)
);
GO

-- =============================================
-- TABLA: configuracion_sitio
-- Configuración global del sitio
-- =============================================
CREATE TABLE configuracion_sitio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave NVARCHAR(100) NOT NULL UNIQUE,
    valor NVARCHAR(MAX),
    descripcion NVARCHAR(500),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by INT,
    
    -- Foreign Key
    CONSTRAINT fk_config_updater FOREIGN KEY (updated_by) 
        REFERENCES usuarios(id) ON DELETE SET NULL
);
GO

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Actualizar updated_at en categorias
GO
CREATE TRIGGER trg_categorias_updated
ON categorias
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE categorias
    SET updated_at = GETDATE()
    FROM categorias c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- Trigger: Actualizar updated_at en usuarios
GO
CREATE TRIGGER trg_usuarios_updated
ON usuarios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE usuarios
    SET updated_at = GETDATE()
    FROM usuarios u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Trigger: Actualizar updated_at en productos
GO
CREATE TRIGGER trg_productos_updated
ON productos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE productos
    SET updated_at = GETDATE()
    FROM productos p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO

-- Trigger: Actualizar rating_promedio y total_resenas al insertar/actualizar/eliminar reseña
GO
CREATE TRIGGER trg_resenas_update_rating
ON resenas
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Productos afectados por INSERT o UPDATE
    UPDATE productos
    SET 
        rating_promedio = (
            SELECT ISNULL(AVG(CAST(rating AS DECIMAL(3,2))), 0)
            FROM resenas
            WHERE producto_id = productos.id
        ),
        total_resenas = (
            SELECT COUNT(*)
            FROM resenas
            WHERE producto_id = productos.id
        )
    WHERE id IN (
        SELECT DISTINCT producto_id FROM inserted
        UNION
        SELECT DISTINCT producto_id FROM deleted
    );
END;
GO

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedimiento: Obtener notificaciones para un usuario específico
GO
CREATE PROCEDURE sp_obtener_notificaciones_usuario
    @usuario_id INT,
    @id_institucional CHAR(9),
    @rol NVARCHAR(20),
    @solo_no_leidas BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        n.*,
        CASE 
            WHEN nl.id IS NOT NULL THEN 1 
            ELSE 0 
        END AS leida,
        nl.leida_at
    FROM notificaciones n
    LEFT JOIN notificaciones_leidas nl 
        ON n.id = nl.notificacion_id AND nl.usuario_id = @usuario_id
    WHERE 
        (
            n.destinatario_tipo = 'all'
            OR (n.destinatario_tipo = 'sellers' AND @rol = 'seller')
            OR (n.destinatario_tipo = 'buyers' AND @rol = 'buyer')
            OR (n.destinatario_tipo = 'id_institucional_especifico' AND n.id_institucional_especifico = @id_institucional)
        )
        AND (@solo_no_leidas = 0 OR nl.id IS NULL)
    ORDER BY 

        n.created_at DESC;
END;
GO

-- Procedimiento: Estadísticas de productos por vendedor
GO
CREATE PROCEDURE sp_estadisticas_vendedor
    @vendedor_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS total_productos,
        AVG(rating_promedio) AS rating_promedio_general,
        SUM(total_resenas) AS total_resenas,
        SUM(vistas) AS total_vistas,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) AS productos_activos
    FROM productos
    WHERE vendedor_id = @vendedor_id;
END;
GO

-- Procedimiento: Estadísticas generales del sitio (Admin)
GO
CREATE PROCEDURE sp_estadisticas_generales
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE is_active = 1) AS total_usuarios_activos,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'seller' AND is_active = 1) AS total_vendedores,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'buyer' AND is_active = 1) AS total_compradores,
        (SELECT COUNT(*) FROM productos WHERE is_active = 1) AS total_productos_activos,
        (SELECT COUNT(*) FROM resenas) AS total_resenas,
        (SELECT COUNT(*) FROM categorias WHERE is_active = 1) AS total_categorias,
        (SELECT AVG(rating_promedio) FROM productos WHERE total_resenas > 0) AS rating_promedio_global;
END;
GO

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar categorías iniciales (solo las permitidas)
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Comida', 'Alimentos, bebidas y productos comestibles', 'fa-utensils'),
('Papelería', 'Material de oficina, libros y útiles escolares', 'fa-pencil-alt'),
('Accesorios', 'Complementos y artículos diversos', 'fa-glasses');
GO

-- Insertar usuarios de prueba
-- Nota: Las contraseñas deben ser hasheadas con bcrypt en el backend
-- Contraseñas de ejemplo: admin123, seller123, buyer123

INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, is_active) VALUES
('000000001', 'admin@upb.edu.co', '$2a$12$I/BgtbzwtarugDSh5U1nuOU1yGOkNfOhivWRrDU50DonuJtkAiYm6', 'Administrador UPB', 'admin', '3001234567', 1),
('000497849', 'vendedor1@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Juan Pérez Vendedor', 'seller', '3009876543', 1),
('000357854', 'comprador1@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'María García Estudiante', 'buyer', '3107654321', 1),
('000123456', 'vendedor2@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Carlos Rodríguez', 'seller', '3201122334', 1);
GO

-- Insertar configuración inicial del sitio
INSERT INTO configuracion_sitio (clave, valor, descripcion) VALUES
('sitio_activo', 'true', 'Indica si el sitio está activo o en mantenimiento'),
('mensaje_mantenimiento', 'El sitio se encuentra en mantenimiento. Volveremos pronto.', 'Mensaje mostrado durante mantenimiento'),
('max_imagenes_producto', '5', 'Número máximo de imágenes por producto');
GO

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista: Productos con información completa
GO
CREATE VIEW vw_productos_completos AS
SELECT 
    p.*,
    c.nombre AS categoria_nombre,
    u.nombre AS vendedor_nombre,
    u.id_institucional AS vendedor_id_institucional,
    u.email AS vendedor_email,
    u.telefono AS vendedor_telefono,
    u.avatar_url AS vendedor_avatar,
    (SELECT TOP 1 imagen_url FROM producto_imagenes WHERE producto_id = p.id AND is_principal = 1) AS imagen_principal
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
INNER JOIN usuarios u ON p.vendedor_id = u.id;
GO

-- Vista: Estadísticas de usuarios
GO
CREATE VIEW vw_estadisticas_usuarios AS
SELECT 
    u.id,
    u.id_institucional,
    u.nombre,
    u.rol,
    u.email,
    COUNT(DISTINCT p.id) AS total_productos,
    AVG(p.rating_promedio) AS rating_promedio,
    COUNT(DISTINCT r.id) AS total_resenas_recibidas,
    u.is_active,
    u.created_at
FROM usuarios u
LEFT JOIN productos p ON u.id = p.vendedor_id
LEFT JOIN resenas r ON p.id = r.producto_id
GROUP BY u.id, u.id_institucional, u.nombre, u.rol, u.email, u.is_active, u.created_at;
GO

PRINT 'Schema SQL Server creado exitosamente';
PRINT 'Base de datos: ventasmoviles_upb';
PRINT 'Tablas: 10 | Triggers: 4 | Stored Procedures: 3 | Vistas: 2';
GO