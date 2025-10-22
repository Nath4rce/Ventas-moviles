# Proyecto: Ventas Móviles

Sistema completo para la gestión de ventas de dispositivos móviles, con arquitectura cliente-servidor. Incluye frontend, backend y base de datos.

------------------------------------------------------------
Estructura del Proyecto
------------------------------------------------------------
```
Ventas-moviles-main/
│
├── BackEnd/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── notifications.js
│   │   ├── products.js
│   │   └── reviews.js
│   └── README.md
│
├── FrontEnd/
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── ui.js
│   ├── assets/
│   │   ├── img/
│   │   │   ├── logo.png
│   │   │   └── productos/
│   │   │       ├── telefono1.jpg
│   │   │       ├── telefono2.jpg
│   │   │       └── telefono3.jpg
│   │   ├── fonts/
│   │   │   ├── Roboto-Regular.ttf
│   │   │   └── Roboto-Bold.ttf
│   │   └── icons/
│   │       ├── carrito.svg
│   │       ├── usuario.svg
│   │       └── menu.svg
│   ├── components/
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── product-card.html
│   │   └── modal.html
│   ├── views/
│   │   ├── home.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── product-detail.vue
│   │   └── etc
│   └── config/
│       └── config.js
│
├── DataBase/
│   └── database_schema.sql
│
└── README.md
```
------------------------------------------------------------
Tecnologías Utilizadas
------------------------------------------------------------
Backend:
- Node.js
- Express.js
- JWT (autenticación)
- MySQL

Frontend:
- HTML, CSS, JavaScript
- Framework según dependencias del archivo package.json

Base de Datos:
- SQL server
- Script: /DataBase/database_schema.sql

------------------------------------------------------------
Instalación y Ejecución
------------------------------------------------------------
1. Clonar el repositorio
git clone https://github.com/Nath4rce/Ventas-moviles.git
cd Ventas-moviles-main

2. Configurar el backend
cd BackEnd
npm install
node server.js

Configurar la conexión a la base de datos en:
BackEnd/config/database.js

3. Configurar el frontend
cd ../FrontEnd
npm install
npm start

------------------------------------------------------------
Base de Datos
------------------------------------------------------------
El archivo /DataBase/database_schema.sql contiene la estructura de las tablas,
claves primarias, foráneas y restricciones del sistema.

------------------------------------------------------------
Autenticación
------------------------------------------------------------
El sistema utiliza tokens JWT para la gestión de sesiones seguras.
Los middleware validan el acceso a las rutas protegidas.

------------------------------------------------------------
Rutas Principales del Backend
------------------------------------------------------------
| Ruta             | Método  | Descripción                    |
|------------------|---------|--------------------------------|
| /auth            | POST    | Inicio de sesión y registro    |
| /products        | GET     | Listado de productos           |
| /reviews         | POST    | Envío de reseñas               |
| /notifications   | GET     | Consulta de notificaciones     |
| /admin           | CRUD    | Gestión de usuarios y productos|

------------------------------------------------------------
Autores
------------------------------------------------------------
Desarrollado por

* juan david parra sierra
* santiago viana ayala
* miguel angel ramirez velasquez
* natalia arce peñuela
* sara soto 

Estudiantes de Ingeniería en Sistemas e Informática - UPB Medellín

------------------------------------------------------------
Licencia
------------------------------------------------------------
Proyecto de uso académico. Libre modificación con fines educativos.
