# Madame Pastel

Tienda de pastelería con catálogo, carrito, panel de administración y solicitudes de pedido por WhatsApp. La API está en Express/MongoDB y la web en React.

## Desarrollo local

Requisitos: Node.js 24 y MongoDB (local o Atlas).

### Inicio rápido en Windows
Haz doble clic en [iniciar.bat](file:///c:/Users/u610059/OneDrive%20-%20Telecom%20Argentina%20SA/Documents/Proyectos/Madame-Pastel/iniciar.bat) (o ejecútalo desde la terminal). El script se encargará automáticamente de:
- Verificar que Node.js esté instalado.
- Crear `frontend/.env` si no existe.
- Instalar dependencias si faltan (`node_modules`).
- Iniciar el **backend** (puerto 5000) y el **frontend** (puerto 3000) en terminales independientes.

Para detener ambos servicios rápidamente, puedes cerrar las terminales o ejecutar [detener.bat](file:///c:/Users/u610059/OneDrive%20-%20Telecom%20Argentina%20SA/Documents/Proyectos/Madame-Pastel/detener.bat).

### Inicio manual

1. Copiar `backend/.env.example` como `backend/.env` y completar `MONGODB_URI` y un `JWT_SECRET` largo y aleatorio.
2. Instalar e iniciar el backend:

   ```powershell
   cd backend
   npm ci
   npm start
   ```

3. Copiar `frontend/.env.example` como `frontend/.env`, instalar e iniciar la web en otra terminal:

   ```powershell
   cd frontend
   npm ci
   npm start
   ```

La web queda en `http://localhost:3000` y la API en `http://localhost:5000`. El panel de administración permite cargar el catálogo real una vez creado el primer administrador.

## Pedidos

El checkout prepara un mensaje con el carrito, el domicilio y el medio de pago elegido, y abre WhatsApp para que la pastelería confirme disponibilidad, envío e importe final. No se realiza un cobro automático. No ingresar precios o costos de envío estimados como si fueran definitivos.

## Despliegue

`render.yaml` prepara dos servicios de **preview** separados en Render: sitio estático y API. Se necesita una base MongoDB Atlas y credenciales válidas antes de crear el backend. El nivel gratuito de Render es solo para pruebas; ver [la auditoría y el plan de cierre](AUDITORIA_Y_PLAN.md) y [la guía de despliegue](frontend/RENDER_DEPLOYMENT.md).

La URL publicada actualmente no se modifica con este blueprint. Revisar los servicios y variables en Render y hacer una publicación explícita cuando el catálogo y el contenido comercial estén confirmados.
