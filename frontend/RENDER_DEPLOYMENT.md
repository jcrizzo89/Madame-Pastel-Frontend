# Preview en Render

El `render.yaml` de la raíz define una vista previa con dos servicios que no reemplazan el sitio existente:

- `madame-pastel-preview`: React estático, con reescritura para React Router.
- `madame-pastel-api-preview`: API Node/Express en plan Free.

## Preparación

1. Subir esta rama al repositorio conectado a Render.
2. Crear un Blueprint desde el archivo `render.yaml` y revisar que los nombres indiquen `preview`.
3. Proporcionar `MONGODB_URI` para una base MongoDB Atlas Free. Generar `JWT_SECRET` en Render; no copiar secretos al repositorio.
4. El frontend recibirá la URL de la API del servicio. El backend recibirá la URL pública del frontend para CORS.
5. Mercado Pago no se activa hasta configurar sus credenciales de prueba y producción como variables de entorno. El flujo actual confirma el importe por WhatsApp antes del pago.

## Límites

Render Free duerme el backend tras 15 minutos sin tráfico y puede tardar cerca de un minuto en responder cuando se reactiva. Render indica que el plan gratuito no está destinado a aplicaciones de producción. Úsalo para validar la vista previa; antes de aceptar ventas de forma sostenida, pasar el backend a un servicio siempre activo.

MongoDB Atlas Free ofrece una base pequeña para pruebas. Revisar los límites y la configuración de acceso a red en [la documentación de Atlas](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).

El blueprint no cambia la tienda que hoy está publicada. Revisar el resultado y los registros en Render antes de decidir si se reemplaza la URL actual.
