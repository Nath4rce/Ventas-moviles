-- Verificar base de datos
USE ventasmoviles_upb;
GO

-- Contar tablas creadas (debe ser 10)
SELECT COUNT(*) AS total_tablas 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Ver todas las tablas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verificar usuarios de prueba
SELECT id_institucional, nombre, rol, email 
FROM usuarios;

-- Verificar categorías
SELECT nombre, icono 
FROM categorias;

-- Verificar triggers
SELECT name 
FROM sys.triggers 
WHERE parent_class = 1;

-- Verificar stored procedures
SELECT name 
FROM sys.procedures;

-- Verificar vistas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS;

USE ventasmoviles_upb;
GO

-- Debe mostrar 10 tablas
SELECT COUNT(*) AS total_tablas 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Listar todas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verificar Foreign Keys (todas deben ser NO ACTION excepto categorias)
SELECT 
    fk.name AS constraint_name,
    OBJECT_NAME(fk.parent_object_id) AS tabla,
    OBJECT_NAME(fk.referenced_object_id) AS tabla_referenciada,
    delete_referential_action_desc AS on_delete
FROM sys.foreign_keys fk
ORDER BY tabla;