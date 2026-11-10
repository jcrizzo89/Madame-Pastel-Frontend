# Auditoría y plan de cierre — Madame Pastel

Revisión inicial: 8 de noviembre de 2026. Incluye el código local y una lectura de solo lectura de `https://madamepastemdp.onrender.com/`. No se cambió código de la aplicación ni se modificó el sitio publicado.

## Resumen

Hay una tienda React/Express/MongoDB con catálogo, promociones, carrito, checkout, pagos, administración, reportes y stock. La URL de Render publicada presenta una portada de marca con productos, precios e Instagram. La copia local está en estado de trabajo y no coincide completamente con la tienda publicada. Por eso no se debe publicar el build local encima del sitio existente sin comparar y aprobar el resultado.

El proyecto aún no está listo para vender: el checkout local genera IDs y preferencias de pago ficticios, el servidor de pedidos no valida el precio ni el stock contra el producto, y las rutas administrativas de productos y registro de administradores tienen controles insuficientes. Además, hay valores de muestra para catálogo, Instagram, datos comerciales y entrega.

## Agent-Hub: qué conservar

Los recursos importados sí son útiles como apoyo de desarrollo: `impeccable` y las guías web para UX, los revisores de React y seguridad, el agente E2E y las guías TDD/depuración. No son funcionalidades comerciales que deban copiarse al sitio. Evitar sumar skills redundantes: el repo ya incluye estas guías y agentes. `HUB_RECOMMENDATIONS.md` no produjo una lista de recomendaciones accionables.

## Hallazgos por prioridad

### Bloqueantes para vender

1. **Checkout simulado en el frontend** (`frontend/src/pages/CheckoutPage.js`): crea una orden ficticia, devuelve una preferencia de pago fija y deja comentadas las llamadas a la API.
2. **La compra no está validada en el servidor** (`backend/controllers/orderController.js`): acepta datos y precios del cliente, no verifica cantidades disponibles antes de guardar y descuenta stock tras crear la orden. Hay riesgo de pedidos con valores manipulados o stock negativo.
3. **Pago/configuración incompletos**: el modelo de pedido no admite efectivo, aunque la UI lo ofrece; falta confirmar credenciales reales de Mercado Pago y datos bancarios. La URL de notificaciones del pago contiene una interpolación mal formada.
4. **Acceso administrativo insuficiente**: al iniciar la auditoría, `POST /api/auth/register` era público y podía asignar `admin`; también estaban abiertas operaciones de productos, inventario, cancelar pedidos y confirmar transferencias. Ya quedaron protegidas localmente con autenticación y rol admin (ver avances).
5. **Entrega no refleja lo pedido**: el frontend todavía permite retiro y envío, mientras que el negocio indicó “solo por envío”. Zonas, costo y disponibilidad no están definidos.

### Necesarios antes de publicar

- Reemplazar productos, precios, promociones y fotos de muestra por datos reales. La web publicada muestra productos y precios que hay que confirmar como vigentes.
- Corregir contacto y redes. El WhatsApp recibido es `2235512021`; falta confirmar si corresponde a Argentina y se publicará con el prefijo `+54 9`.
- El feed de Instagram local genera publicaciones de ejemplo; debe mostrar enlaces reales, una integración autorizada o limitarse a enlazar al perfil.
- Configurar variables obligatorias y quitar secretos de fallback (`JWT_SECRET`, token de Mercado Pago, SMTP), definir el CORS por dominio y documentar la instalación.
- Revisar transiciones de pago/inventario, confirmación de transferencia, cancelaciones, protección contra órdenes duplicadas y trazabilidad.
- Completar privacidad, términos de compra/cancelación, datos del vendedor y condiciones de entrega con la información real del negocio.
- Corregir guía de despliegue e infraestructura: actualmente describe un despliegue parcial y no configura con claridad el backend/API.

### Calidad observada

- La compilación de producción local finalizó, con advertencias ESLint (dependencias de hooks, variables sin uso y código inalcanzable en checkout) y la base `caniuse-lite` desactualizada.
- Las pruebas existentes no dieron una señal funcional: backend bloqueado por la política de red local (`EACCES` al abrir puertos efímeros); Jest frontend no pudo renombrar archivos de caché (`EPERM`). Requieren un entorno que permita esas operaciones.
- El repositorio ya tenía cambios locales antes de esta revisión, incluidos código, dependencias, pruebas, `node_modules` versionado y assets de Agent-Hub. Preservarlos y revisar cada diff antes de cualquier publicación o limpieza.

## Avances de esta sesión

- Cerré localmente el alta pública de administradores y protegí las rutas de creación, edición y borrado de productos con autenticación y rol admin. `backend/tests/routeAccess.test.js`: 4/4 pruebas pasan.
- Extendí esa protección al inventario, la cancelación de pedidos y la confirmación de transferencias; las notificaciones ya están montadas en el servidor principal y protegidas. La prueba de rutas ahora cubre 12 casos y pasa completa. `server.js` carga en modo de prueba.
- Eliminé la clave JWT fija de respaldo y el log de credenciales de administrador del servidor auxiliar. El correo ya carga su dependencia ESM de forma diferida y rechaza intentos de envío sin SMTP configurado.
- Implementé `/armar-torta` con las cinco medidas y precios de la imagen, sabores, selección limitada a dos rellenos, decoración clásica/personalizada, bizcochuelo extra y pedido por WhatsApp. La decoración personalizada se marca para cotizar.
- Reemplacé el checkout con simulaciones por un resumen que muestra subtotal, envío/importe final a confirmar y pedido por WhatsApp. Eliminé productos de muestra y publicaciones ficticias; la portada dirige al configurador y Catálogo/Promociones se conservan para cargar datos de la base. El detalle ya no inventa productos cuando no encuentra uno.
- Corregí la ruta del API en catálogo y el `homepage` que aún apuntaba a GitHub Pages; actualicé valores comerciales por defecto para no inventar costos de envío, cuentas bancarias ni correo.
- Verificación: pruebas focalizadas de backend 26/26 en cinco suites; frontend 9/9 en cuatro suites; `npm run build` finaliza. Quedan advertencias ESLint en reportes, footer, dashboard, inventario y notificaciones; `caniuse-lite` está desactualizado.
- La suite backend completa aún tiene pruebas de socket bloqueadas por `EACCES` del entorno. No publiqué cambios; la tienda existente sigue intacta.

## Recomendación inicial de alojamiento

- **Para probar y cerrar el proyecto sin costo:** mantener la web estática en Render; usar un servicio backend Render Free solo como entorno de prueba; MongoDB Atlas Free para la base. Atlas Free tiene 0,5 GB de almacenamiento y puede pausarse luego de 30 días sin conexiones. Render Free duerme tras 15 minutos sin tráfico, tarda alrededor de un minuto en volver y Render indica que su nivel gratuito no debe usarse en producción.
- **Para aceptar pedidos reales:** primero dejar el código y datos correctos; después pasar como mínimo el backend a un servicio siempre activo y configurar copias de seguridad/recuperación de la base. El frontend estático puede seguir gratis si su cuota alcanza. Se puede conservar la URL `onrender.com` durante la prueba; un dominio propio es opcional y se define al final.
- **No recomiendo Vercel Hobby para esta tienda comercial**: sus condiciones limitan ese plan al uso personal/no comercial.

Fuentes oficiales consultadas: [Render Free](https://render.com/docs/free), [límites de Atlas Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/), [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Plan de ejecución

1. **Congelar la referencia**: comparar el código local con el sitio publicado y conservar los cambios locales identificando qué versión es la fuente para cada funcionalidad.
2. **Cerrar el flujo comercial**: definir datos del negocio, catálogo y envío; adaptar pedido, stock, pagos y estados; quitar las simulaciones.
3. **Cerrar seguridad**: limitar registro inicial de admin, proteger CRUD administrativo, validar importes/stock en servidor y exigir secretos/variables válidos.
4. **Mejorar experiencia visual**: preservar la dirección de marca que ya muestra el sitio, sustituir muestras por contenido real, corregir responsive/accesibilidad y errores de consola.
5. **Verificar**: ejecutar pruebas de API, frontend y build; recorrer catálogo → carrito → checkout → pago/confirmación en entorno de prueba.
6. **Preparar despliegue**: configurar backend, Atlas, variables, CORS, dominio y procedimientos de respaldo. Publicar solo después de una revisión del resultado y de confirmar acceso a los servicios/cuentas.

## Información del negocio todavía necesaria

- Catálogo real: nombre, descripción, precio, tamaño/porciones, stock o anticipación y fotos. La web puede terminarse con un lote inicial pequeño.
- Envíos: barrios/zonas, costo fijo o por zona, mínimo para envío gratis si existe, días/horarios y anticipación mínima.
- Pagos: credenciales de prueba y luego de producción de Mercado Pago; CBU/alias/titular/instrucciones para transferencia; si el efectivo se cobra al entregar o antes.
- En el configurador/checkout se usa el número compartido `2235512021` normalizado como `+5492235512021`; revisar el enlace de WhatsApp desde un teléfono antes de publicarlo.
- Confirmar si los productos y precios que aparecen en Render son actuales y si queremos mantener el diseño publicado como referencia visual.
- Para publicar: acceso del propietario a Render y MongoDB Atlas; no enviar contraseñas ni tokens por el chat.

## Bloqueos abiertos para completar la venta y el despliegue

- La web ahora tiene el configurador de tortas y pedidos por WhatsApp, pero no conserva los pedidos dentro del sistema ni procesa pagos en línea. Ese es el flujo temporal elegido.
- Se conserva la navegación de Catálogo y Promociones como pidió la usuaria; mostrará datos de la base cuando esta se conecte, sin productos de muestra.
- El catálogo general de productos de la tienda y sus precios/fotos aún necesita confirmación; no tomé los precios de tortas como catálogo completo.
- El costo/zonas/días de envío, anticipación, condiciones para efectivo y textos de privacidad/cancelación siguen pendientes. Se informan como “a confirmar” donde impactan al cliente.
- La API de pedidos valida los datos mínimos, verifica catálogo/stock, sustituye precios del cliente por los precios del catálogo y reserva unidades con una actualización atómica; la prueba cubre pedido vacío, cantidad inválida, precio manipulado, stock insuficiente y una carrera de stock. Se amplió el enum para pagos en efectivo. Falta adaptar el esquema y el flujo completo a entregas, email opcional, pagos y pedidos personalizados antes de integrarlo con el checkout.
- El backend de prueba requiere una URI de MongoDB Atlas y valores de entorno de las cuentas de hosting. No se publicaron cambios ni se subieron secretos.
- Se recibió un archivo de credenciales de Atlas. Un ping de solo lectura autenticó correctamente. Se configuró `MONGODB_URI` como variable de entorno del usuario de Windows (fuera del repositorio); una sesión nueva volvió a autenticar y `/health` respondió `200 connected`. La URI no se imprimió ni se guardó en el repo y no se modificaron datos.
- El chequeo `/health` ahora responde 503 mientras MongoDB esté desconectado para que Render no considere saludable una API sin base; el handler se verificó localmente. `backend/.env` está versionado en Git, así que no se deben guardar allí nuevas credenciales.

