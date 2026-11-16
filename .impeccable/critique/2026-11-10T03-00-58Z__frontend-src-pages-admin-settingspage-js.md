---
target: frontend/src/pages/admin/SettingsPage.js
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\u610059\\OneDrive - Telecom Argentina SA\\Documents\\Proyectos\\Madame-Pastel\\frontend\\src\\pages\\admin\\SettingsPage.js"
target_fingerprint: "sha256:f252906d99129c51cd13369f039269e2a555423d676f4373fe8f574202a5aa0f"
target_path: "C:\\Users\\u610059\\OneDrive - Telecom Argentina SA\\Documents\\Proyectos\\Madame-Pastel\\frontend\\src\\pages\\admin\\SettingsPage.js"
timestamp: 2026-11-10T03-00-58Z
slug: frontend-src-pages-admin-settingspage-js
---
# Design Critique: Admin Settings (/admin/settings)
Target: `frontend/src/pages/admin/SettingsPage.js`

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2 | Carga y guarda con spinner básico, pero sin indicador de cambios pendientes (dirty state) ni barra de estado. |
| 2 | Match System / Real World | 1 | Expone jerga técnica (.env) al usuario; mezcla propuesta de valor con SEO; datos bancarios sin estructura. |
| 3 | User Control and Freedom | 1 | Sin botón "Descartar cambios", sin historial ni alerta al navegar fuera con cambios sin guardar. |
| 4 | Consistency and Standards | 2 | Paleta de colores discordante (#4caf50 vs rosa de marca); inputs desbalanceados respecto a su contenido. |
| 5 | Error Prevention | 1 | Sin validación en tiempo real para URLs, formatos de CBU (22 dígitos), teléfonos o rangos horarios. |
| 6 | Recognition Rather Than Recall | 2 | Previsualiza logo y colores, pero exige recordar sintaxis exacta de CBU/alias y links completos. |
| 7 | Flexibility and Efficiency | 1 | No permite copiar horarios entre días de semana, ni activar "modo feriado", ni subir imágenes directamente. |
| 8 | Aesthetic and Minimalist Design | 2 | Contenedor gris genérico noventero con flecha triangular obsoleta y campos amontonados sin jerarquía visual. |
| 9 | Error Recovery | 1 | Mensaje genérico de error ("Error al guardar") sin identificar el campo causante ni dar opción de recuperación. |
| 10 | Help and Documentation | 2 | Textos de ayuda mínimos en <small>; falta orientación contextual sobre el impacto de cada ajuste en la tienda. |
| **Total** | | **15/40** | **Deficiente (Severa deuda de usabilidad y ergonomía)** |

### Design Specificity Verdict
El panel actual es un formulario CRUD genérico que ignora la identidad de pastelería artesanal de Madame Pastel. Utiliza contenedores rígidos, sombras duras y botones que parecen de un sistema contable en lugar del centro de control de una pastelería boutique.
- **Detector estático:** 0 errores sintácticos por escaneo regex en archivos JS/CSS (con advertencia de subconteo al ser código no renderizado).
- **Inspección técnica de código:** Fallos de contraste en botón de guardar (#4caf50 sobre blanco: ratio 2.78:1), supresión de foco accesible (`outline: none`), switches sin atributos `aria-label` y contenedor con scroll anidado (`max-height: calc(100vh - 180px)`).

### Overall Impression
Funciona para persistir valores básicos en MongoDB, pero genera alta fricción y riesgo de pérdida de trabajo para el administrador. Se siente como un prototipo de desarrollador antes que una herramienta de gestión para dueños de tienda.

### What's Working
1. **Previsualizaciones inmediatas:** El logo y la muestra de colores primario/secundario actualizan al momento.
2. **División en pestañas temáticas:** Evita un formulario vertical infinito de 1500px.
3. **Interruptores táctiles:** Los toggles tipo switch facilitan activar/desactivar opciones frente a checkboxes estándar.

### Priority Issues
- **[P0] Ausencia de detección de cambios (Dirty State) y Guardado Desconectado:** El botón de guardar está fijo en la cabecera superior. Si el admin modifica opciones al final de la página y cambia de pestaña o cierra la ventana, los cambios se pierden sin aviso.
- **[P1] Fuga de abstracciones técnicas y Datos Bancarios desestructurados:** El mensaje instruye editar el archivo `.env` del backend para Mercado Pago, y la transferencia bancaria es un textarea libre con placeholder de barras donde un error de CBU causa pérdidas directas.
- **[P2] Arquitectura de Información invertida:** El contenido de la home ("Nuestra propuesta") está escondido en SEO, y la anticipación de pedidos está oculta en Pagos.
- **[P3] Carga de Logo frágil y gestión de horarios rígida:** Exige URL externa en vez de carga de archivo; y configurar 7 días individualmente sin atajos como "Lunes a Viernes de 9 a 18" es tedioso.
