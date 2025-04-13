# Guía de Despliegue en Render.com para Madame Pastel

Esta guía te ayudará a desplegar la aplicación web Madame Pastel en Render.com.

## Pasos para el despliegue

### 1. Crear una cuenta en Render.com

- Ve a [render.com](https://render.com/) y regístrate o inicia sesión.

### 2. Crear un nuevo servicio para el frontend

1. Desde el dashboard de Render, haz clic en "New" y selecciona "Static Site".
2. Conecta tu repositorio de GitHub/GitLab o elige la opción "Upload Files" si no usas un repositorio.
// no puede ser
### 3. Configurar el servicio

Completa la configuración con los siguientes valores:

- **Name**: Madame Pastel
- **Environment**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 4. Configurar variables de entorno (si es necesario)

Si necesitas variables de entorno para tu aplicación, añádelas en la sección "Environment":

- `NODE_VERSION`: `18.0.0`
- `REACT_APP_API_URL`: URL de tu backend (cuando esté desplegado)

### 5. Configurar redirecciones para SPA

En la sección "Redirects/Rewrites", agrega una nueva regla:

- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

Esto asegura que la navegación de React Router funcione correctamente.

### 6. Completar el despliegue

- Haz clic en "Create Static Site" para iniciar el proceso de despliegue.
- Render construirá y desplegará automáticamente tu aplicación.
- Obtendrás una URL en el formato `https://madame-pastel.onrender.com` cuando el despliegue esté completo.

## Despliegue del backend (opcional)

Si también necesitas desplegar el backend, sigue estos pasos:

1. En el dashboard de Render, selecciona "New" > "Web Service".
2. Configura:
   - **Name**: Madame Pastel API
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Publica las variables de entorno** necesarias para tu backend (MongoDB URI, etc.)

## Mantenimiento y actualización

Para actualizar tu aplicación desplegada:
- Si usas un repositorio Git: Haz cambios en tu código y haz push a tu repositorio. Render actualizará automáticamente tu sitio.
- Si subiste archivos manualmente: Necesitarás subir nuevamente los archivos actualizados a través del panel de Render.

¡Listo! Tu aplicación Madame Pastel estará disponible públicamente en la URL proporcionada por Render.
