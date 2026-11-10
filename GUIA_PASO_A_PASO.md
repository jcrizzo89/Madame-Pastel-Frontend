# Guía para revisar y continuar Madame Pastel

## 1. Revisar los cambios del frontend

La vista local está abierta en el navegador:

- Configurador: <http://127.0.0.1:3000/armar-torta>
- Inicio: <http://127.0.0.1:3000/>
- Catálogo: <http://127.0.0.1:3000/productos>
- Promociones: <http://127.0.0.1:3000/promociones>
- Carrito: <http://127.0.0.1:3000/carrito>
- Checkout: <http://127.0.0.1:3000/checkout>

El configurador refleja el folleto recibido: tamaños y precios, bizcochuelo, dos rellenos, decoración, bizcochuelo extra y datos para el envío. La decoración personalizada se cotiza por WhatsApp. No envíes un pedido real desde esta vista de revisión.

El catálogo y las promociones se mantienen en la navegación. Como todavía no se cargó el catálogo real, esas páginas muestran productos solo si la API los devuelve; no se agregaron ejemplos.

## 2. Archivos principales del frontend

- `frontend/src/pages/CustomCakePage.js`: configurador y formulario de entrega.
- `frontend/src/data/customCake.js`: opciones y precios del folleto.
- `frontend/src/utils/whatsappOrder.js`: composición del mensaje de WhatsApp para tortas y carrito.
- `frontend/src/pages/CheckoutPage.js`: checkout temporal por WhatsApp, con envío e importe final a confirmar.
- `frontend/src/pages/HomePage.js`: portada y estados sin productos/promociones.
- `frontend/src/pages/ProductsPage.js` y `ProductDetailPage.js`: catálogo conectado a la API, sin productos de respaldo inventados.
- `frontend/src/components/instagram/InstagramFeed.js`: enlace al perfil real, sin publicaciones simuladas.

## 3. Conectar los dos procesos locales

La URI de Atlas quedó en una variable de entorno del usuario de Windows, no en el repositorio. Abrí una terminal nueva para que herede esa variable.

**Terminal 1 — backend**

```powershell
Set-Location 'C:\Users\u610059\OneDrive - Telecom Argentina SA\Documents\Proyectos\Madame-Pastel\backend'
npm start
```

Comprobá <http://localhost:5000/health>. Debe responder `database: connected`.

**Terminal 2 — frontend**

```powershell
Set-Location 'C:\Users\u610059\OneDrive - Telecom Argentina SA\Documents\Proyectos\Madame-Pastel\frontend'
$env:REACT_APP_API_URL = 'http://localhost:5000'
npm start
```

Si el puerto 3000 ya está ocupado por la vista que dejé abierta, React puede ofrecer otro puerto. Elige continuar con ese puerto y abre `/armar-torta`.

Si Atlas está vacía, la primera consulta a `/api/config` crea el documento de configuración predeterminado. No hay una carga inicial de productos todavía.

## 4. Próximos pasos del proyecto

1. Confirmar y cargar el catálogo general con nombres, precios, descripciones, fotos y stock.
2. Definir zonas, tarifas, horarios y anticipación de los envíos.
3. Crear la vista previa en Render desde el `render.yaml`, cargar allí `MONGODB_URI` como secreto y autorizar en Atlas los rangos de salida del servicio API.
4. Reemplazar los scripts de alta de administrador que aún usan credenciales predeterminadas por un alta segura.
5. Probar el flujo completo y completar privacidad, cancelaciones y condiciones de compra antes de aceptar ventas.

## Verificación ya realizada

- Pruebas focalizadas: backend 26/26 y frontend 9/9.
- `npm run build` finaliza; quedan advertencias ESLint en algunas pantallas administrativas y avisos de dependencias de navegadores desactualizadas.
- El sitio publicado y la infraestructura de Render no se modificaron.
