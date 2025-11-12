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
    destinatario_tipo NVARCHAR(35) NOT NULL CHECK (destinatario_tipo IN ('all', 'sellers', 'buyers', 'id_institucional_especifico')) DEFAULT 'all',
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
-- TABLA: sanciones_usuarios
-- =============================================
CREATE TABLE sanciones_usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    motivo NVARCHAR(50) NOT NULL CHECK (motivo IN (
        'venta_sin_autorizacion',
        'producto_no_autorizado',
        'venta_estacionaria',
        'incumplimiento_horario',
        'recipiente_no_conforme',
        'productos_prohibidos',
        'publicidad_no_autorizada',
        'subarrendamiento',
        'otro'
    )),
    descripcion NVARCHAR(1000) NOT NULL,
    tipo_suspension NVARCHAR(20) NOT NULL CHECK (tipo_suspension IN ('temporal', 'permanente')) DEFAULT 'temporal',
    fecha_inicio DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_fin DATETIME2 NULL,
    dias_suspension INT NULL,
    sancionado_por INT NOT NULL,
    notificacion_enviada BIT DEFAULT 0,
    esta_activa BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT fk_sancion_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    CONSTRAINT fk_sancion_admin FOREIGN KEY (sancionado_por) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    
    INDEX idx_sancion_usuario (usuario_id),
    INDEX idx_sancion_activa (esta_activa) WHERE esta_activa = 1
);
GO

-- =============================================
-- TABLA: inhabilitaciones_productos
-- =============================================
CREATE TABLE inhabilitaciones_productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL,
    motivo NVARCHAR(50) NOT NULL CHECK (motivo IN (
        'producto_prohibido',
        'informacion_incorrecta',
        'imagenes_inadecuadas',
        'precio_no_conforme',
        'categoria_incorrecta',
        'productos_vencidos',
        'recipiente_no_conforme',
        'otro'
    )),
    feedback NVARCHAR(1000) NOT NULL,
    inhabilitado_por INT NOT NULL,
    notificacion_enviada BIT DEFAULT 0,
    apelacion_pendiente BIT DEFAULT 0,
    apelacion_mensaje NVARCHAR(1000) NULL,
    apelacion_fecha DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT fk_inhab_producto FOREIGN KEY (producto_id) 
        REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT fk_inhab_admin FOREIGN KEY (inhabilitado_por) 
        REFERENCES usuarios(id) ON DELETE NO ACTION,
    
    INDEX idx_inhab_producto (producto_id),
    INDEX idx_inhab_apelacion (apelacion_pendiente) WHERE apelacion_pendiente = 1
);
GO

-- =============================================
-- VISTA: sanciones_activas
-- =============================================
CREATE VIEW vw_sanciones_activas AS
SELECT 
    s.*,
    u.nombre AS usuario_nombre,
    u.id_institucional,
    u.email,
    a.nombre AS admin_nombre,
    CASE 
        WHEN s.tipo_suspension = 'permanente' THEN 1
        WHEN s.fecha_fin IS NULL THEN 1
        WHEN s.fecha_fin > GETDATE() THEN 1
        ELSE 0
    END AS sancion_vigente
FROM sanciones_usuarios s
INNER JOIN usuarios u ON s.usuario_id = u.id
INNER JOIN usuarios a ON s.sancionado_por = a.id
WHERE s.esta_activa = 1;
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
-- SP: Sancionar usuario
-- =============================================
CREATE PROCEDURE sp_sancionar_usuario
    @usuario_id INT,
    @motivo NVARCHAR(50),
    @descripcion NVARCHAR(1000),
    @tipo_suspension NVARCHAR(20),
    @dias_suspension INT = NULL,
    @fecha_fin DATETIME2 = NULL,
    @admin_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Calcular fecha_fin si se proporcionaron días
        IF @dias_suspension IS NOT NULL AND @fecha_fin IS NULL
        BEGIN
            SET @fecha_fin = DATEADD(DAY, @dias_suspension, GETDATE());
        END
        
        -- Insertar sanción
        INSERT INTO sanciones_usuarios 
        (usuario_id, motivo, descripcion, tipo_suspension, fecha_inicio, fecha_fin, dias_suspension, sancionado_por)
        VALUES 
        (@usuario_id, @motivo, @descripcion, @tipo_suspension, GETDATE(), @fecha_fin, @dias_suspension, @admin_id);
        
        DECLARE @sancion_id INT = SCOPE_IDENTITY();
        
        -- Desactivar usuario
        UPDATE usuarios SET is_active = 0 WHERE id = @usuario_id;
        
        -- Crear notificación
        DECLARE @id_institucional CHAR(9) = (SELECT id_institucional FROM usuarios WHERE id = @usuario_id);
        DECLARE @titulo NVARCHAR(255) = N'Tu cuenta ha sido suspendida';
        DECLARE @mensaje NVARCHAR(MAX) = N'Tu cuenta ha sido suspendida por: ' + @descripcion;
        
        IF @tipo_suspension = 'temporal' AND @fecha_fin IS NOT NULL
        BEGIN
            SET @mensaje = @mensaje + N'. Suspensión vigente hasta el ' + 
                          CONVERT(NVARCHAR(50), @fecha_fin, 103) + N'.';
        END
        ELSE
        BEGIN
            SET @mensaje = @mensaje + N'. Suspensión permanente hasta nuevo aviso.';
        END
        
        INSERT INTO notificaciones 
        (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, created_by)
        VALUES 
        (@titulo, @mensaje, 'danger', 'id_institucional_especifico', @id_institucional, @admin_id);
        
        UPDATE sanciones_usuarios SET notificacion_enviada = 1 WHERE id = @sancion_id;
        
        COMMIT TRANSACTION;
        
        SELECT @sancion_id AS sancion_id, 1 AS success;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =============================================
-- SP: Inhabilitar producto
-- =============================================
CREATE PROCEDURE sp_inhabilitar_producto
    @producto_id INT,
    @motivo NVARCHAR(50),
    @feedback NVARCHAR(1000),
    @admin_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Insertar inhabilitación
        INSERT INTO inhabilitaciones_productos 
        (producto_id, motivo, feedback, inhabilitado_por)
        VALUES 
        (@producto_id, @motivo, @feedback, @admin_id);
        
        DECLARE @inhab_id INT = SCOPE_IDENTITY();
        
        -- Desactivar producto
        UPDATE productos SET is_active = 0 WHERE id = @producto_id;
        
        -- Obtener info
        DECLARE @vendedor_id INT = (SELECT vendedor_id FROM productos WHERE id = @producto_id);
        DECLARE @producto_titulo NVARCHAR(255) = (SELECT titulo FROM productos WHERE id = @producto_id);
        DECLARE @id_institucional CHAR(9) = (SELECT id_institucional FROM usuarios WHERE id = @vendedor_id);
        
        -- Crear notificación
        DECLARE @titulo NVARCHAR(255) = N'Producto inhabilitado: ' + @producto_titulo;
        DECLARE @mensaje NVARCHAR(MAX) = N'Tu producto "' + @producto_titulo + 
            N'" ha sido inhabilitado. Motivo: ' + @feedback + 
            N'. Realiza las correcciones y solicita apelación.';
        
        INSERT INTO notificaciones 
        (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, created_by)
        VALUES 
        (@titulo, @mensaje, 'warning', 'id_institucional_especifico', @id_institucional, @admin_id);
        
        UPDATE inhabilitaciones_productos SET notificacion_enviada = 1 WHERE id = @inhab_id;
        
        COMMIT TRANSACTION;
        
        SELECT @inhab_id AS inhabilitacion_id, 1 AS success;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =============================================
-- SP: Apelar inhabilitación
-- =============================================
CREATE PROCEDURE sp_apelar_inhabilitacion
    @producto_id INT,
    @mensaje_apelacion NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE inhabilitaciones_productos
    SET 
        apelacion_pendiente = 1,
        apelacion_mensaje = @mensaje_apelacion,
        apelacion_fecha = GETDATE()
    WHERE producto_id = @producto_id
    AND apelacion_pendiente = 0;
    
    SELECT @@ROWCOUNT AS affected_rows;
END;
GO

PRINT 'Tablas y SPs creados exitosamente';
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
('max_imagenes_producto', '4', 'Número máximo de imágenes por producto');
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