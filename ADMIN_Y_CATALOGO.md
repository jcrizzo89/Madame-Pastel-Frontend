# Administración y catálogo

## Roles

- **Superadmin / propietaria:** administra cuentas, configuración de la tienda y todo lo que pueden hacer los otros roles.
- **Administrador:** gestiona productos, categorías, inventario, promociones, reportes y estadísticas.
- **Personal:** consulta pedidos y actualiza su estado. No puede modificar catálogo, pagos, configuración ni usuarios.

Los permisos se verifican en el backend y en la navegación del panel. Desactivar una cuenta invalida también sus siguientes peticiones con el token actual.

## Crear la cuenta superadmin

Desde PowerShell, abrir la carpeta `backend` y ejecutar:

```powershell
npm run create:superadmin:prompt
```

El script toma `MONGODB_URI` del entorno, solicita usuario y email, y pide la contraseña sin mostrarla. Requiere una contraseña de 12 caracteres o más. No crea otra cuenta si ya existe un superadmin ni reemplaza cuentas que coincidan con el usuario o email indicados.

No usar los antiguos scripts `createAdmin.js` o `createAdminSimple.js`: contenían credenciales predefinidas. El alta debe hacerse con el comando anterior.

## Catálogo confirmado disponible para cargar

El archivo `backend/data/customCakeSeedData.js` contiene solo los tamaños y precios del flyer:

| Tamaño | Diámetro | Porciones | Precio |
|---|---:|---:|---:|
| Mini | 14 cm | 5–10 | $55.000 |
| Chica | 16 cm | 10–15 | $72.000 |
| Mediana | 18 cm | 15–20 | $85.000 |
| Grande | 20 cm | 20–25 | $95.000 |
| Extra Grande | 22 cm | 25–30 | $110.000 |

Los cinco registros se marcan como hechos a pedido y muestran una imagen generada que se identifica como ilustrativa. No cargan stock, ingredientes ni alérgenos inventados. El configurador conserva los sabores, rellenos y adicional confirmados en el flyer; la decoración personalizada y el envío se cotizan por WhatsApp.

Primero revisar en modo de vista previa:

```powershell
npm run seed:custom-cakes
```

Para cargar los cinco productos en MongoDB:

```powershell
npm run seed:custom-cakes -- --apply
```

El seed solo inserta los registros que llevan sus `seedKey`, no borra productos y no sobreescribe datos si se vuelve a ejecutar. Si detecta productos existentes con los mismos nombres pero sin esas claves, cancela para evitar duplicados o reemplazos accidentales.

## Catálogo general pendiente

El resto del catálogo no se incluye todavía: faltan sus nombres, precios, tamaños/presentaciones, ingredientes o alérgenos y disponibilidad real. Se pueden añadir desde **Admin → Productos** cuando esos datos estén confirmados. Las ofertas se gestionan desde **Admin → Promociones**; la portada muestra productos marcados como destacados y sus promociones vigentes. El título, el texto principal y el texto de presentación de la portada se editan en **Admin → Configuración → General**.
