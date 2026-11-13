# Madame Pastel

Aplicación web para una pastelería, con catálogo de productos, carrito de compras, panel de administración y preparación de pedidos mediante WhatsApp.

## Componentes

- **Frontend:** aplicación web desarrollada con React.
- **Backend:** API desarrollada con Node.js y Express.
- **Persistencia:** MongoDB.
- **Pedidos:** el checkout prepara un mensaje con el detalle del carrito para que el negocio confirme disponibilidad, envío e importe final por WhatsApp.

## Funcionalidades

- Catálogo de productos.
- Carrito de compras.
- Flujo de solicitud de pedidos por WhatsApp.
- Panel de administración para gestionar el catálogo.
- API para las operaciones de la aplicación.

## Requisitos

- Node.js (consultar la versión compatible con las dependencias del proyecto).
- MongoDB local o MongoDB Atlas.
- npm.

## Configuración local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/jcrizzo89/Madame-Pastel-Frontend.git
   cd Madame-Pastel-Frontend
   ```

2. Configurar las variables de entorno a partir de los archivos de ejemplo disponibles en el repositorio:

   - Backend: `backend/.env.example`
   - Frontend: `frontend/.env.example`

3. Completar las variables necesarias, incluyendo la conexión a MongoDB y un secreto JWT seguro. No subir archivos `.env` ni credenciales al repositorio.

4. Instalar dependencias e iniciar los servicios:

   ```bash
   cd backend
   npm ci
   npm start
   ```

   En otra terminal:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

> Los comandos y puertos pueden variar según la configuración actual del proyecto. Revisar los scripts de `package.json` antes de ejecutar.

## Flujo de pedidos

El checkout prepara un mensaje con los datos del carrito y abre WhatsApp para que la pastelería confirme disponibilidad, envío e importe final. No se realiza un cobro automático desde la aplicación.

## Despliegue

El repositorio incluye configuración de despliegue de preview. Antes de publicar, configurar las variables de entorno, la base de datos y los servicios correspondientes. No asumir que un entorno de preview equivale a producción.

## Seguridad

- No compartir ni versionar secretos, tokens o archivos `.env`.
- Utilizar variables de entorno para credenciales y configuración sensible.
- Verificar permisos y configuración del panel administrativo antes de desplegar.

## Estado

Proyecto personal / de desarrollo. Las funcionalidades y el estado de despliegue deben verificarse en la versión actual del código.

---

Desarrollado por **Juan Cruz Rizzo**.
