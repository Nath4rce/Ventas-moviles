-- =============================================
-- NUEVO ARCHIVO SEMILLA - VENTAS ESTUDIANTILES UPB (v2)
-- =============================================

USE ventasmoviles_upb;
GO

-- =============================================
-- 1. LIMPIAR DATOS EXISTENTES
-- =============================================
DELETE FROM favoritos;
DELETE FROM notificaciones_leidas;
DELETE FROM notificaciones;
DELETE FROM resenas;
DELETE FROM producto_imagenes;
DELETE FROM productos;
DELETE FROM categorias;
DELETE FROM usuarios WHERE id > 4; -- Mantener usuarios base
DELETE FROM categorias WHERE id > 3; -- Mantener categorías base
GO

DBCC CHECKIDENT ('categorias', RESEED, 0);
DBCC CHECKIDENT ('productos', RESEED, 0);
DBCC CHECKIDENT ('producto_imagenes', RESEED, 0);
DBCC CHECKIDENT ('resenas', RESEED, 0);
DBCC CHECKIDENT ('notificaciones', RESEED, 0);
DBCC CHECKIDENT ('notificaciones_leidas', RESEED, 0);
DBCC CHECKIDENT ('usuarios', RESEED, 4);
GO

-- =============================================
-- 2. INSERTAR CATEGORÍAS
-- =============================================
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Alimentos', 'Comidas caseras, bebidas y dulces hechos por estudiantes', 'fa-utensils'),
('Papelería', 'Stickers, cuadernos, bolígrafos y materiales de oficina', 'fa-pencil-alt'),
('Accesorios', 'Pines, llaveros, detalles y artículos decorativos', 'fa-gem');
GO


-- =============================================
-- 2. INSERTAR USUARIOS ADICIONALES
-- =============================================
PRINT 'Insertando usuarios adicionales...';

INSERT INTO usuarios (id_institucional, email, password_hash, nombre, telefono, rol, is_active) VALUES
-- Vendedores adicionales
('000222333', 'ana.martinez@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Ana Martínez', '3014445566', 'seller', 1),
('000444555', 'pedro.gomez@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Pedro Gómez', '3025556677', 'seller', 1),
('000666777', 'laura.silva@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Laura Silva', '3036667788', 'seller', 1),

-- Compradores adicionales
('000888999', 'carlos.lopez@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Carlos López', '3047778899', 'buyer', 1),
('000111222', 'sofia.ramirez@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Sofía Ramírez', '3058889900', 'buyer', 1),
('000333444', 'david.herrera@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'David Herrera', '3069990011', 'buyer', 1),
('000555666', 'isabella.castro@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Isabella Castro', '3070001122', 'buyer', 1);
GO


-- =============================================
-- 3. INSERTAR PRODUCTOS (cada vendedor tiene uno)
-- =============================================
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, vistas, is_active) VALUES
('Galletas Caseras de Avena', 'Galletas elaboradas por estudiantes de gastronomía, con chispas de chocolate.', 3500, 1, 2, 35, 1),
('Brownie Artesanal', 'Brownie hecho con cacao colombiano y nueces, porción individual.', 4000, 1, 4, 28, 1),
('Stickers UPB', 'Set de stickers personalizados con frases universitarias.', 5000, 2, 5, 42, 1),
('Pin de Ingeniería', 'Pin metálico con el logo de Ingeniería UPB, ideal para mochilas.', 7000, 3, 6, 21, 1),
('Pulsera Artesanal', 'Pulsera tejida a mano por estudiantes de diseño.', 6000, 3, 7, 15, 1);
GO

-- =============================================
-- 4. INSERTAR IMÁGENES DE PRODUCTOS
-- =============================================
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES
(1, '/images/products/alimentos/galletas-avena.jpg', 1, 1),
(2, '/images/products/alimentos/brownie-artesanal.jpg', 1, 1),
(3, '/images/products/papeleria/stickers-upb.jpg', 1, 1),
(4, '/images/products/accesorios/pin-ingenieria.jpg', 1, 1),
(5, '/images/products/accesorios/pulsera-artesanal.jpg', 1, 1);
GO

-- =============================================
-- 5. INSERTAR RESEÑAS (todos los compradores opinan)
-- =============================================
INSERT INTO resenas (producto_id, usuario_id, rating, comentario) VALUES
(1, 8, 5, 'Deliciosas, se nota que son caseras y recién horneadas.'),
(2, 9, 4, 'El brownie está muy bueno, aunque un poco dulce para mi gusto.'),
(3, 10, 5, 'Los stickers están geniales, los pegué en mi portátil.'),
(4, 3, 5, 'Excelente calidad del pin, metálico y duradero.'),
(5, 3, 4, 'La pulsera tiene un diseño muy bonito y colorido.');
GO

-- =============================================
-- 6. INSERTAR NOTIFICACIONES
-- =============================================
INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, is_site_wide, created_by) VALUES
('¡Bienvenido a Ventas Estudiantiles UPB!', 'Explora productos creados por tus compañeros.', 'info', 'all', NULL, 1, 1),
('Recordatorio de Publicación', 'Cada estudiante puede vender solo un producto activo.', 'warning', 'sellers', NULL, 0, 1),
('Descuento en Papelería', 'Aprovecha un 10% de descuento esta semana en artículos de papelería.', 'success', 'buyers', NULL, 0, 1),
('Producto Destacado', 'Tu producto "Brownie Artesanal" está entre los más vistos.', 'success', 'id_institucional_especifico', '000123456', 0, 1),
('Verificación de Inventario', 'Revisa la disponibilidad de tu producto para evitar cancelaciones.', 'warning', 'id_institucional_especifico', '000497849', 0, 1),
('Mantenimiento Programado', 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.', 'info', 'all', NULL, 1, 1),
('Alerta de Seguridad', 'Se detectó un intento de acceso no autorizado a tu cuenta.', 'danger', 'id_institucional_especifico', '000333333', 0, 1);
GO

-- =============================================
-- 7. REPORTE FINAL
-- =============================================
PRINT '=============================================';
PRINT 'ARCHIVO SEMILLA EJECUTADO EXITOSAMENTE';
PRINT '=============================================';
SELECT 
    (SELECT COUNT(*) FROM categorias) AS total_categorias,
    (SELECT COUNT(*) FROM productos) AS total_productos,
    (SELECT COUNT(*) FROM producto_imagenes) AS total_imagenes,
    (SELECT COUNT(*) FROM resenas) AS total_resenas,
    (SELECT COUNT(*) FROM notificaciones) AS total_notificaciones;
GO
