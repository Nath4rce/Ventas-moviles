-- =============================================
-- SEED DATA COMPLETO - VENTAS MOVILES UPB v3
-- Reinicio completo + 30 Vendedores + 30 Compradores
-- =============================================

USE ventasmoviles_upb;
GO

-- =============================================
-- LIMPIAR TODO (incluye categorías y usuarios default)
-- =============================================

ALTER TABLE resenas DISABLE TRIGGER trg_resenas_update_rating;
GO

DELETE FROM notificaciones_leidas;
DELETE FROM notificaciones;
DELETE FROM favoritos;
DELETE FROM resenas;
DELETE FROM producto_imagenes;
DELETE FROM productos;
DELETE FROM usuarios;
DELETE FROM categorias;
DELETE FROM configuracion_sitio;
GO

DBCC CHECKIDENT ('notificaciones_leidas', RESEED, 0);
DBCC CHECKIDENT ('notificaciones', RESEED, 0);
DBCC CHECKIDENT ('favoritos', RESEED, 0);
DBCC CHECKIDENT ('resenas', RESEED, 0);
DBCC CHECKIDENT ('producto_imagenes', RESEED, 0);
DBCC CHECKIDENT ('productos', RESEED, 0);
DBCC CHECKIDENT ('usuarios', RESEED, 0);
DBCC CHECKIDENT ('categorias', RESEED, 0);
DBCC CHECKIDENT ('configuracion_sitio', RESEED, 0);
GO

ALTER TABLE resenas ENABLE TRIGGER trg_resenas_update_rating;
GO

-- =============================================
-- 1. CATEGORÍAS (3 obligatorias por normativa UPB)
-- =============================================

INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Alimentos', 'Comida, bebidas y productos comestibles preparados por estudiantes', 'fa-utensils'),
('Papelería', 'Material de oficina, libros, útiles escolares y artículos de estudio', 'fa-pencil-alt'),
('Accesorios', 'Complementos personales, tecnología y artículos diversos', 'fa-glasses');
GO

-- =============================================
-- 2. CONFIGURACIÓN DEL SITIO
-- =============================================

INSERT INTO configuracion_sitio (clave, valor, descripcion) VALUES
('sitio_activo', 'true', 'Indica si el sitio está activo o en mantenimiento'),
('mensaje_mantenimiento', 'El sitio se encuentra en mantenimiento. Volveremos pronto.', 'Mensaje mostrado durante mantenimiento'),
('max_imagenes_producto', '5', 'Número máximo de imágenes por producto');
GO

-- =============================================
-- 3. USUARIOS DEFAULT (Admin + casos especiales)
-- =============================================

-- Admin principal
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000000001', 'admin@upb.edu.co', '$2a$12$I/BgtbzwtarugDSh5U1nuOU1yGOkNfOhivWRrDU50DonuJtkAiYm6', 'Administrador UPB', 'admin', '3001234567', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 1);

-- Vendedor activo con producto activo (caso normal)
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111111', 'vendedor.activo@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Pedro Vendedor Normal', 'seller', '3009876543', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VendedorActivo', 1);

-- Vendedor con producto inactivo (caso especial)
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111112', 'vendedor.inactivo@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'María Vendedora Con Producto Pausado', 'seller', '3009876544', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VendedorInactivo', 1);

-- Usuario inactivo (cuenta suspendida)
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111113', 'usuario.suspendido@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Carlos Usuario Suspendido', 'buyer', '3009876545', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suspendido', 0);

-- Usuario con notificación dirigida
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111114', 'usuario.notificado@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Laura Estudiante VIP', 'buyer', '3009876546', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Notificado', 1);

-- Comprador normal
INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111115', 'comprador.normal@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Jorge Estudiante Comprador', 'buyer', '3009876547', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comprador', 1);
GO

-- =============================================
-- 4. VENDEDORES (24 adicionales = 30 total con los default)
-- Password: vendedor123
-- =============================================

INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000111116', 'vendedor3@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Diana Sánchez Ruiz', 'seller', '3001234503', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', 1),
('000111117', 'vendedor4@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Eduardo Torres Pérez', 'seller', '3001234504', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo', 1),
('000111118', 'vendedor5@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Fernanda Castro Silva', 'seller', '3001234505', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda', 1),
('000111119', 'vendedor6@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Gabriel Morales Díaz', 'seller', '3001234506', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel', 1),
('000111120', 'vendedor7@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Helena Vargas Mejía', 'seller', '3001234507', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helena', 1),
('000111121', 'vendedor8@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Ignacio Romero Cruz', 'seller', '3001234508', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ignacio', 1),
('000111122', 'vendedor9@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Julia Herrera Ríos', 'seller', '3001234509', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia', 1),
('000111123', 'vendedor10@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Kevin Ortiz Flores', 'seller', '3001234510', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin', 1),
('000111124', 'vendedor11@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Laura Jiménez Rojas', 'seller', '3001234511', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LauraJ', 1),
('000111125', 'vendedor12@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Mario Mendoza Luna', 'seller', '3001234512', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario', 1),
('000111126', 'vendedor13@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Natalia Campos Reyes', 'seller', '3001234513', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia', 1),
('000111127', 'vendedor14@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Oscar Ramírez Vega', 'seller', '3001234514', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar', 1),
('000111128', 'vendedor15@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Patricia León Ortiz', 'seller', '3001234515', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia', 1),
('000111129', 'vendedor16@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Quintín Gutiérrez Arias', 'seller', '3001234516', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quintin', 1),
('000111130', 'vendedor17@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Rosa Navarro Paredes', 'seller', '3001234517', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rosa', 1),
('000111131', 'vendedor18@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Sebastián Medina Cortés', 'seller', '3001234518', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian', 1),
('000111132', 'vendedor19@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Teresa Aguilar Montes', 'seller', '3001234519', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teresa', 1),
('000111133', 'vendedor20@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Ulises Peña Salinas', 'seller', '3001234520', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ulises', 1),
('000111134', 'vendedor21@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Valeria Cruz Mendoza', 'seller', '3001234521', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valeria', 1),
('000111135', 'vendedor22@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Walter Fernández Ibarra', 'seller', '3001234522', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Walter', 1),
('000111136', 'vendedor23@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Ximena Domínguez Salas', 'seller', '3001234523', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ximena', 1),
('000111137', 'vendedor24@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Yolanda Chávez Ponce', 'seller', '3001234524', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yolanda', 1),
('000111138', 'vendedor25@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Zacarías Benítez Ochoa', 'seller', '3001234525', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zacarias', 1),
('000111139', 'vendedor26@upb.edu.co', '$2a$12$YCrWylKEeoKWtM3qFg0ri.q80UZEUHYh.wUgcgNNAPJJDmr8QuQfG', 'Adriana Fuentes Guzmán', 'seller', '3001234526', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adriana', 1);
GO

-- =============================================
-- 5. COMPRADORES (25 adicionales = 30 total con default)
-- Password: comprador123
-- =============================================

INSERT INTO usuarios (id_institucional, email, password_hash, nombre, rol, telefono, avatar_url, is_active) VALUES
('000222221', 'comprador1@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Felipe Alvarado Soto', 'buyer', '3002001001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe', 1),
('000222222', 'comprador2@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Gabriela Rojas Herrera', 'buyer', '3002001002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriela', 1),
('000222223', 'comprador3@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Héctor Muñoz Castillo', 'buyer', '3002001003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hector', 1),
('000222224', 'comprador4@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Irene Flores Duarte', 'buyer', '3002001004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Irene', 1),
('000222225', 'comprador5@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Jorge Carrillo Mora', 'buyer', '3002001005', 'https://api.dicebear.com/7.x/avataaars/svg?seed=JorgeC', 1),
('000222226', 'comprador6@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Karen Bravo Esquivel', 'buyer', '3002001006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karen', 1),
('000222227', 'comprador7@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Leonardo Silva Barrios', 'buyer', '3002001007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leonardo', 1),
('000222228', 'comprador8@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Mónica Parra Ibarra', 'buyer', '3002001008', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Monica', 1),
('000222229', 'comprador9@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Nicolás Acosta Vega', 'buyer', '3002001009', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nicolas', 1),
('000222230', 'comprador10@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Olivia Rivas Márquez', 'buyer', '3002001010', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', 1),
('000222231', 'comprador11@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Pablo Montoya Ángel', 'buyer', '3002001011', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pablo', 1),
('000222232', 'comprador12@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Raquel Delgado Rubio', 'buyer', '3002001012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raquel', 1),
('000222233', 'comprador13@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Samuel Reyes Figueroa', 'buyer', '3002001013', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel', 1),
('000222234', 'comprador14@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Tatiana Cabrera Solís', 'buyer', '3002001014', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tatiana', 1),
('000222235', 'comprador15@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Uriel Maldonado Prieto', 'buyer', '3002001015', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Uriel', 1),
('000222236', 'comprador16@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Verónica Lara Contreras', 'buyer', '3002001016', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veronica', 1),
('000222237', 'comprador17@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'William Galván Serrano', 'buyer', '3002001017', 'https://api.dicebear.com/7.x/avataaars/svg?seed=William', 1),
('000222238', 'comprador18@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Yessica Trujillo Nava', 'buyer', '3002001018', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yessica', 1),
('000222239', 'comprador19@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Zulema Cordero Lugo', 'buyer', '3002001019', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zulema', 1),
('000222240', 'comprador20@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Alberto Salazar Toro', 'buyer', '3002001020', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alberto', 1),
('000222241', 'comprador21@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Beatriz Quintero Galindo', 'buyer', '3002001021', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz', 1),
('000222242', 'comprador22@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Cristian Soto Lozano', 'buyer', '3002001022', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cristian', 1),
('000222243', 'comprador23@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Daniela Padilla Varela', 'buyer', '3002001023', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielaP', 1),
('000222244', 'comprador24@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Emilio Ochoa Carmona', 'buyer', '3002001024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emilio', 1),
('000222245', 'comprador25@upb.edu.co', '$2a$12$Sbouw.tNIzAdkZwf.k2et.lCogg4MSe5rKWlg0Mb3.NxMWYJ7lZya', 'Fabiola Montes Peralta', 'buyer', '3002001025', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fabiola', 1);
GO

-- =============================================
-- 6. PRODUCTOS (30 productos - 1 por vendedor)
-- =============================================

DECLARE @alimentos_id INT = (SELECT id FROM categorias WHERE nombre = 'Alimentos');
DECLARE @papeleria_id INT = (SELECT id FROM categorias WHERE nombre = 'Papelería');
DECLARE @accesorios_id INT = (SELECT id FROM categorias WHERE nombre = 'Accesorios');

-- Producto activo (vendedor activo)
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, is_active) VALUES
('Empanadas Artesanales', 'Deliciosas empanadas hechas en casa con carne, pollo o queso. Perfectas para el almuerzo.', 2500, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111111'), 1);

-- Producto inactivo (vendedor con producto pausado)
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, is_active) VALUES
('Brownies de Chocolate', 'Brownies caseros con trozos de chocolate. Temporalmente sin stock.', 5000, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111112'), 0);

-- Resto de productos (Alimentos)
INSERT INTO productos (titulo, descripcion, precio, categoria_id, vendedor_id, is_active) VALUES
('Café Colombiano Premium', 'Café molido de alta calidad. 250g de café 100% colombiano de origen.', 12000, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111116'), 1),
('Sándwiches Gourmet', 'Sándwiches preparados al momento con ingredientes frescos. Variedad de sabores.', 8000, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111117'), 1),
('Galletas de Avena', 'Galletas caseras saludables con avena, pasas y miel. Paquete de 12 unidades.', 6000, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111118'), 1),
('Jugos Naturales', 'Jugos 100% naturales sin azúcar añadida. Sabores: naranja, mora, lulo, mango.', 3500, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111119'), 1),
('Pizza Personal', 'Pizza individual recién horneada. Elige tus ingredientes favoritos.', 10000, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111120'), 1),
('Ensaladas Frescas', 'Ensaladas preparadas con vegetales orgánicos. Opción vegana disponible.', 7500, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111121'), 1),
('Arepas Rellenas', 'Arepas con rellenos variados: carne, pollo, queso, aguacate. Tamaño grande.', 6500, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111122'), 1),
('Torta de Zanahoria', 'Torta casera húmeda con nueces y glaseado de queso crema. Porción generosa.', 8500, @alimentos_id, (SELECT id FROM usuarios WHERE id_institucional = '000111123'), 1),

-- Papelería (10 productos)
('Cuadernos Universitarios', 'Cuadernos de 100 hojas rayados. Pasta dura. Ideal para tomar apuntes.', 8000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111124'), 1),
('Kit de Lápices y Colores', 'Set completo con 12 lápices de colores, borrador y sacapuntas profesional.', 15000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111125'), 1),
('Marcadores Fluorescentes', 'Pack de 6 marcadores de colores brillantes para resaltar textos importantes.', 7000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111126'), 1),
('Carpetas Archivadoras', 'Carpetas de argollas tamaño oficio. Ideales para organizar trabajos y documentos.', 12000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111127'), 1),
('Calculadora Científica', 'Calculadora Casio FX-991 ideal para ingeniería y matemáticas avanzadas.', 85000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111128'), 1),
('Block de Dibujo A4', 'Block de 50 hojas para dibujo técnico y artístico. Papel de alta calidad.', 18000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111129'), 1),
('Bolígrafos de Gel', 'Set de 10 bolígrafos de gel con tinta de colores variados. Escritura suave.', 9000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111130'), 1),
('Tijeras Profesionales', 'Tijeras de acero inoxidable con mango ergonómico. Para uso académico.', 6500, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111131'), 1),
('Pegamento en Barra', 'Pack de 3 barras de pegamento de 40g cada una. No tóxico.', 5500, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111132'), 1),
('Regla y Escuadras', 'Kit de geometría con regla de 30cm, escuadra de 45° y transportador.', 10000, @papeleria_id, (SELECT id FROM usuarios WHERE id_institucional = '000111133'), 1),

-- Accesorios (10 productos)
('Mochila Universitaria', 'Mochila espaciosa con compartimento para laptop hasta 15.6". Resistente al agua.', 95000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111134'), 1),
('Audífonos Bluetooth', 'Audífonos inalámbricos con cancelación de ruido. Batería de 20 horas.', 120000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111135'), 1),
('Power Bank 10000mAh', 'Batería portátil de carga rápida. Compatible con todos los dispositivos USB.', 45000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111136'), 1),
('Gorra UPB Oficial', 'Gorra bordada con logo de la universidad. Diseño casual y cómodo.', 25000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111137'), 1),
('Termo de Acero', 'Termo térmico de 500ml que mantiene bebidas frías o calientes por 12 horas.', 35000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111138'), 1),
('Llavero Personalizado', 'Llavero con nombre o carrera personalizado. Material acrílico resistente.', 8000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000111139'), 1),
('Reloj Digital Deportivo', 'Reloj resistente al agua con cronómetro, alarma y luz LED. Perfecto para ejercicio.', 55000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000222221'), 1),
('Pulsera de Hilo', 'Pulseras artesanales tejidas a mano en varios colores. Unisex.', 5000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000222222'), 1),
('Estuche para Lápices', 'Estuche amplio con cremallera. Capacidad para 30 lápices y accesorios.', 15000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000222223'), 1),
('Paraguas Compacto', 'Paraguas plegable resistente al viento. Tamaño compacto para llevar en la mochila.', 28000, @accesorios_id, (SELECT id FROM usuarios WHERE id_institucional = '000222224'), 1);
GO

-- =============================================
-- 7. IMÁGENES DE PRODUCTOS (2-3 por producto)
-- =============================================

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Empanadas Artesanales';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500', 1, 1
FROM productos p WHERE p.titulo LIKE 'Brownies%';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Café Colombiano Premium';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Sándwiches Gourmet';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Galletas de Avena';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Jugos Naturales';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Pizza Personal';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Ensaladas Frescas';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Arepas Rellenas';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Torta de Zanahoria';

-- Papelería
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Cuadernos Universitarios';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Kit de Lápices y Colores';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1587842378485-eb6e6abf8b69?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Marcadores Fluorescentes';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Carpetas Archivadoras';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1611174069869-96cc681ffbfd?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Calculadora Científica';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Block de Dibujo A4';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Bolígrafos de Gel';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1565024672588-a8c0aed5c48b?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Tijeras Profesionales';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1621547916139-2382f1aba10e?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Pegamento en Barra';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1581922814484-0c8f4e5b0e23?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Regla y Escuadras';

-- Accesorios
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Mochila Universitaria';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Audífonos Bluetooth';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Power Bank 10000mAh';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Gorra UPB Oficial';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Termo de Acero';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Llavero Personalizado';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Reloj Digital Deportivo';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Pulsera de Hilo';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1586281010691-34f17b7c6949?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Estuche para Lápices';

INSERT INTO producto_imagenes (producto_id, imagen_url, orden, is_principal)
SELECT p.id, 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500', 1, 1
FROM productos p WHERE p.titulo = 'Paraguas Compacto';
GO

-- =============================================
-- 8. RESEÑAS (Variadas de compradores)
-- =============================================

DECLARE @producto_id INT;
DECLARE @comprador_id INT;
DECLARE @rating INT;
DECLARE @comentarios TABLE (comentario NVARCHAR(1000));

INSERT INTO @comentarios VALUES
('Excelente producto, muy recomendado'),
('Buena calidad por el precio'),
('Superó mis expectativas'),
('Muy satisfecho con la compra'),
('Producto tal como se describe'),
('Rápida entrega y buen servicio'),
('Lo volvería a comprar sin duda'),
('Calidad aceptable'),
('Cumple con lo esperado'),
('Buen producto en general');

DECLARE producto_cursor CURSOR FOR 
SELECT id FROM productos WHERE is_active = 1;

OPEN producto_cursor;
FETCH NEXT FROM producto_cursor INTO @producto_id;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @num_resenas INT = FLOOR(RAND() * 6) + 3;
    DECLARE @j INT = 0;
    
    WHILE @j < @num_resenas
    BEGIN
        SELECT TOP 1 @comprador_id = id 
        FROM usuarios 
        WHERE rol = 'buyer' 
            AND is_active = 1
            AND id NOT IN (SELECT usuario_id FROM resenas WHERE producto_id = @producto_id)
        ORDER BY NEWID();
        
        SET @rating = CASE 
            WHEN RAND() < 0.6 THEN 5
            WHEN RAND() < 0.85 THEN 4
            ELSE 3
        END;
        
        INSERT INTO resenas (producto_id, usuario_id, rating, comentario)
        SELECT TOP 1 @producto_id, @comprador_id, @rating, comentario
        FROM @comentarios
        ORDER BY NEWID();
        
        SET @j = @j + 1;
    END;
    
    FETCH NEXT FROM producto_cursor INTO @producto_id;
END;

CLOSE producto_cursor;
DEALLOCATE producto_cursor;
GO

-- =============================================
-- 9. NOTIFICACIÓN DIRIGIDA (Para caso especial)
-- =============================================

INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_tipo, id_institucional_especifico, is_site_wide, prioridad, created_by) VALUES
('Promoción Exclusiva para Ti', 'Has sido seleccionado para recibir un descuento del 20% en tu próxima compra. Código: VIP2025', 'success', 'id_institucional_especifico', '000111114', 0, 2, 1);
GO

PRINT '========================================';
PRINT 'SEED DATA COMPLETADO EXITOSAMENTE';
PRINT '========================================';
PRINT 'Admin: 1';
PRINT 'Vendedores: 26 (incluye casos especiales)';
PRINT 'Compradores: 30';
PRINT 'Productos: 30 (1 inactivo para prueba)';
PRINT 'Imágenes: 30';
PRINT 'Reseñas: ~120-180';
PRINT '========================================';
GO
