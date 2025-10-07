-- =============================================
-- ARCHIVO SEMILLA - DATOS DE PRUEBA
-- VENTAS MOVILES UPB
-- =============================================

USE ventasmoviles_upb;
GO

-- =============================================
-- 1. LIMPIAR DATOS EXISTENTES (opcional)
-- =============================================
/*
DELETE FROM favoritos;
DELETE FROM notificaciones_leidas;
DELETE FROM notificaciones;
DELETE FROM resenas;
DELETE FROM producto_imagenes;
DELETE FROM productos;
DELETE FROM usuarios WHERE id > 4; -- Mantener usuarios base
DELETE FROM categorias WHERE id > 3; -- Mantener categorías base
GO
*/

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
-- 3. INSERTAR PRODUCTOS
-- =============================================
PRINT 'Insertando productos...';

-- Productos de COMIDA
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, vistas, is_active) VALUES
('Café Colombiano Premium', 'Café 100% colombiano tostado, grano entero. Ideal para empezar el día con energía.', 25.00, 1, 2, 45, 1),
('Galletas Artesanales', 'Galletas de avena con chispas de chocolate, horneadas frescas cada día.', 8.50, 1, 2, 32, 1),
('Sandwich Club', 'Sándwich de pollo, tocino, lechuga y tomate con pan artesanal.', 15.00, 1, 3, 67, 1),
('Smoothie de Frutas Tropicales', 'Batido natural de mango, piña y banano. Sin conservantes.', 12.00, 1, 5, 23, 1),
('Brownie de Chocolate', 'Brownie denso y húmedo con nueces. Perfecto para el antojo dulce.', 10.00, 1, 6, 89, 1),
('Ensalada César', 'Ensalada fresca con pollo a la parrilla, crutones y aderezo césar.', 18.00, 1, 7, 41, 1),
('Jugo Natural de Naranja', 'Jugo recién exprimido, rico en vitamina C. Vaso 500ml.', 7.00, 1, 2, 56, 1),
('Bagel con Queso Crema', 'Bagel tostado con queso crema y mermelada de fresa.', 9.50, 1, 5, 34, 1),

-- Productos de PAPELERÍA
('Cuaderno Universitario', 'Cuaderno cuadriculado 100 hojas, pasta dura. Ideal para apuntes.', 12.00, 2, 3, 78, 1),
('Set de Bolígrafos Pastel', 'Paquete de 6 bolígrafos gel en colores pastel. Tinta suave.', 15.00, 2, 3, 91, 1),
('Calculadora Científica', 'Calculadora Casio fx-991EX para ingeniería y matemáticas.', 85.00, 2, 5, 112, 1),
('Mochila Laptop', 'Mochila resistente con compartimento acolchado para laptop 15".', 120.00, 2, 6, 67, 1),
('Resaltadores Stabilo', 'Set de 8 resaltadores en diferentes colores. Punta fina.', 22.00, 2, 7, 45, 1),
('Organizador Semanal', 'Agenda semanal 2024 con planificador de horarios y tareas.', 35.00, 2, 2, 89, 1),
('Tajalápiz Metálico', 'Tajalápiz de metal con depósito para las virutas. Duradero.', 8.00, 2, 5, 23, 1),
('Carpeta de Anillas', 'Carpeta de 3 anillas, capacidad 200 hojas. Color azul.', 18.00, 2, 6, 56, 1),

-- Productos de ACCESORIOS
('Funda para Laptop 14"', 'Funda protectora para laptop, material neopreno. Color gris.', 45.00, 3, 2, 134, 1),
('Soporte para Laptop', 'Soporte metálico ajustable para mejorar ergonomía al estudiar.', 60.00, 3, 3, 78, 1),
('Mouse Inalámbrico', 'Mouse óptico inalámbrico, conexión USB. Batería incluida.', 35.00, 3, 5, 156, 1),
('Lámpara de Escritorio LED', 'Lámpara LED ajustable con 3 niveles de brillo. USB.', 55.00, 3, 6, 92, 1),
('Organizador de Cables', 'Kit organizador de cables con fundas y bridas. Varios colores.', 12.00, 3, 7, 45, 1),
('Base para Celular', 'Base ajustable para celular, ideal para videollamadas.', 15.00, 3, 2, 67, 1),
('Audífonos Diadema', 'Audífonos over-ear para estudio, cancelación de ruido.', 75.00, 3, 3, 123, 1),
('Power Bank 10000mAh', 'Batería externa con carga rápida. Dos puertos USB.', 40.00, 3, 5, 189, 1);
GO

-- =============================================
-- 4. INSERTAR IMÁGENES DE PRODUCTOS
-- =============================================
PRINT 'Insertando imágenes de productos...';

-- Imágenes para productos de comida (IDs 1-8)
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal) VALUES
(1, '/images/products/comida/cafe-premium-1.jpg', 1, 1),
(1, '/images/products/comida/cafe-premium-2.jpg', 2, 0),
(2, '/images/products/comida/galletas-artesanales-1.jpg', 1, 1),
(3, '/images/products/comida/sandwich-club-1.jpg', 1, 1),
(4, '/images/products/comida/smoothie-frutas-1.jpg', 1, 1),
(5, '/images/products/comida/brownie-chocolate-1.jpg', 1, 1),
(6, '/images/products/comida/ensalada-cesar-1.jpg', 1, 1),
(7, '/images/products/comida/jugo-naranja-1.jpg', 1, 1),
(8, '/images/products/comida/bagel-queso-1.jpg', 1, 1),

-- Imágenes para productos de papelería (IDs 9-16)
(9, '/images/products/papeleria/cuaderno-universitario-1.jpg', 1, 1),
(10, '/images/products/papeleria/boligrafos-pastel-1.jpg', 1, 1),
(11, '/images/products/papeleria/calculadora-cientifica-1.jpg', 1, 1),
(12, '/images/products/papeleria/mochila-laptop-1.jpg', 1, 1),
(13, '/images/products/papeleria/resaltadores-stabilo-1.jpg', 1, 1),
(14, '/images/products/papeleria/organizador-semanal-1.jpg', 1, 1),
(15, '/images/products/papeleria/tajalapiz-metalico-1.jpg', 1, 1),
(16, '/images/products/papeleria/carpeta-anillas-1.jpg', 1, 1),

-- Imágenes para productos de accesorios (IDs 17-24)
(17, '/images/products/accesorios/funda-laptop-1.jpg', 1, 1),
(18, '/images/products/accesorios/soporte-laptop-1.jpg', 1, 1),
(19, '/images/products/accesorios/mouse-inalambrico-1.jpg', 1, 1),
(20, '/images/products/accesorios/lampara-escritorio-1.jpg', 1, 1),
(21, '/images/products/accesorios/organizador-cables-1.jpg', 1, 1),
(22, '/images/products/accesorios/base-celular-1.jpg', 1, 1),
(23, '/images/products/accesorios/audifonos-diadema-1.jpg', 1, 1),
(24, '/images/products/accesorios/power-bank-1.jpg', 1, 1);
GO

-- =============================================
-- 5. INSERTAR RESEÑAS
-- =============================================
PRINT 'Insertando reseñas...';

INSERT INTO resenas (producto_id, usuario_id, rating, comentario) VALUES
-- Reseñas para productos populares
(1, 4, 5, 'Excelente café, muy fresco y aromático. Lo recomiendo totalmente.'),
(1, 8, 4, 'Buen café, aunque un poco fuerte para mi gusto.'),
(3, 4, 5, 'El sándwich está delicioso y muy bien preparado.'),
(11, 9, 5, 'La calculadora es perfecta para mis clases de cálculo.'),
(17, 10, 4, 'Buena funda, protege bien mi laptop.'),
(19, 8, 5, 'Mouse muy cómodo y la batería dura bastante.'),
(24, 9, 5, 'El power bank carga muy rápido, excelente compra.'),

-- Más reseñas variadas
(2, 4, 4, 'Galletas ricas, pero un poco dulces para mi gusto.'),
(5, 10, 5, 'El brownie está espectacular, muy chocolatoso.'),
(9, 8, 4, 'Cuaderno de buena calidad, las hojas no se salen.'),
(12, 4, 5, 'Mochila muy resistente y con buen espacio.'),
(14, 9, 3, 'La agenda está bien, pero esperaba más secciones.'),
(18, 10, 5, 'El soporte ha mejorado mucho mi postura al estudiar.'),
(20, 8, 4, 'Buena lámpara, la luz es muy natural.'),
(23, 4, 5, 'Los audífonos tienen muy buen sonido y son cómodos.'),

-- Reseñas adicionales para tener más datos
(4, 9, 4, 'Smoothie refrescante, perfecto para el calor.'),
(6, 10, 3, 'La ensalada estaba buena pero el pollo un poco seco.'),
(7, 8, 5, 'Jugo natural y delicioso, como hecho en casa.'),
(10, 4, 4, 'Los bolígrafos escriben suave, colores bonitos.'),
(13, 9, 5, 'Resaltadores de muy buena calidad, no traspasan.'),
(15, 10, 4, 'Tajalápiz funcional y duradero.'),
(16, 8, 3, 'Carpeta normal, cumple su función.'),
(21, 4, 5, 'Kit organizador muy útil, mis cables ya no se enredan.'),
(22, 9, 4, 'Base práctica para las clases en línea.');
GO

-- =============================================
-- 6. INSERTAR FAVORITOS
-- =============================================
PRINT 'Insertando productos favoritos...';

INSERT INTO favoritos (usuario_id, producto_id) VALUES
-- Usuario 4 (comprador1) tiene varios favoritos
(4, 1), (4, 3), (4, 11), (4, 17), (4, 19),
-- Usuario 8 (carlos.lopez) 
(8, 5), (8, 9), (8, 12), (8, 24),
-- Usuario 9 (sofia.ramirez)
(9, 2), (9, 6), (9, 14), (9, 20),
-- Usuario 10 (david.herrera)
(10, 7), (10, 13), (10, 18), (10, 23),
-- Usuario 11 (isabella.castro)
(11, 4), (11, 8), (11, 10), (11, 21);
GO

-- =============================================
-- 7. INSERTAR NOTIFICACIONES
-- =============================================
PRINT 'Insertando notificaciones...';

INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, is_site_wide, created_by) VALUES
-- Notificación global para todos
('¡Bienvenidos a Ventas Móviles UPB!', 'La plataforma está oficialmente activa. Puedes comenzar a publicar productos y realizar compras.', 'info', 'all', NULL, 1, 1),

-- Notificación para vendedores
('Recordatorio para Vendedores', 'Recuerda mantener actualizada la información de tus productos y responder a las consultas de los compradores.', 'warning', 'sellers', NULL, 0, 1),

-- Notificación para compradores
('Ofertas Especiales', 'Esta semana tenemos descuentos especiales en productos de papelería. ¡No te los pierdas!', 'success', 'buyers', NULL, 0, 1),

-- Notificación específica para un usuario
('Producto Agotado', 'Tu producto "Café Colombiano Premium" se ha agotado. Considera actualizar el inventario.', 'danger', 'id_institucional_especifico', '000497849', 0, 1),

-- Notificación de mantenimiento
('Mantenimiento Programado', 'El próximo sábado el sistema estará en mantenimiento de 2:00 AM a 6:00 AM.', 'info', 'all', NULL, 1, 1);
GO

-- =============================================
-- 8. MARCAR NOTIFICACIONES COMO LEÍDAS
-- =============================================
PRINT 'Marcando notificaciones como leídas...';

INSERT INTO notificaciones_leidas (notificacion_id, usuario_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 2), (2, 3), (2, 5), (2, 6), (2, 7),
(3, 4), (3, 8), (3, 9), (3, 10), (3, 11),
(4, 2),
(5, 3), (5, 4), (5, 8);
GO

-- =============================================
-- 9. ACTUALIZAR CONFIGURACIÓN ADICIONAL
-- =============================================
PRINT 'Actualizando configuración del sitio...';

INSERT INTO configuracion_sitio (clave, valor, descripcion) VALUES
('email_contacto', 'ventasmoviles@upb.edu.co', 'Email de contacto para soporte'),
('telefono_contacto', '+57 604 4488388', 'Teléfono de contacto UPB'),
('direccion_upb', 'Circular 1ra #70-01, Medellín', 'Dirección principal UPB'),
('terminos_condiciones', 'https://www.upb.edu.co/terminos', 'URL de términos y condiciones'),
('politica_privacidad', 'https://www.upb.edu.co/privacidad', 'URL de política de privacidad'),
('max_productos_usuario', '20', 'Máximo número de productos por usuario'),
('dias_vencimiento_producto', '90', 'Días después de los cuales un producto se marca como vencido');
GO

-- =============================================
-- 10. VERIFICACIÓN Y ESTADÍSTICAS
-- =============================================
PRINT 'Generando reporte de datos insertados...';

SELECT 
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM productos) AS total_productos,
    (SELECT COUNT(*) FROM producto_imagenes) AS total_imagenes,
    (SELECT COUNT(*) FROM resenas) AS total_resenas,
    (SELECT COUNT(*) FROM favoritos) AS total_favoritos,
    (SELECT COUNT(*) FROM notificaciones) AS total_notificaciones;

-- Ejecutar stored procedures de estadísticas
PRINT 'Estadísticas generales del sitio:';
EXEC sp_estadisticas_generales;

PRINT 'Estadísticas del vendedor 2:';
EXEC sp_estadisticas_vendedor @vendedor_id = 2;

PRINT 'Estadísticas del vendedor 3:';
EXEC sp_estadisticas_vendedor @vendedor_id = 3;
GO

-- =============================================
-- 11. CONSULTAS DE VERIFICACIÓN
-- =============================================
PRINT 'Mostrando algunos datos de ejemplo:';

-- Productos más populares
SELECT TOP 5 p.id, p.titulo, p.precio, c.nombre as categoria, p.rating_promedio, p.total_resenas, p.vistas
FROM productos p 
INNER JOIN categorias c ON p.categoria_id = c.id 
ORDER BY p.vistas DESC;

-- Usuarios más activos (vendedores)
SELECT u.id, u.nombre, u.id_institucional, COUNT(p.id) as productos_publicados
FROM usuarios u 
LEFT JOIN productos p ON u.id = p.vendedor_id 
WHERE u.rol = 'seller'
GROUP BY u.id, u.nombre, u.id_institucional 
ORDER BY productos_publicados DESC;

-- Distribución de productos por categoría
SELECT c.nombre as categoria, COUNT(p.id) as total_productos, AVG(p.precio) as precio_promedio
FROM categorias c 
LEFT JOIN productos p ON c.id = p.categoria_id 
GROUP BY c.id, c.nombre 
ORDER BY total_productos DESC;
GO

PRINT '=============================================';
PRINT 'ARCHIVO SEMILLA EJECUTADO EXITOSAMENTE';
PRINT '=============================================';
PRINT 'Resumen de datos insertados:';
PRINT '- 7 usuarios adicionales (total: 11 usuarios)';
PRINT '- 24 productos distribuidos en 3 categorías';
PRINT '- 24 imágenes de productos';
PRINT '- 23 reseñas con ratings variados';
PRINT '- 20 productos marcados como favoritos';
PRINT '- 5 notificaciones del sistema';
PRINT '- 17 marcas de notificaciones leídas';
PRINT '=============================================';