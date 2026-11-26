# Fase 2 Frontend - Landing Page Dinámica Zero-Credential, Selector de Landing en Plantillas y Despacho de Campañas

## Objetivo

Implementar en `phishwarden-web-tl/` (Next.js + Tailwind CSS + Shadcn UI) la experiencia pública de aterrizaje de simulaciones (`/sim/verificar`), el soporte de `landingTipo` en la gestión de plantillas y la acción manual de despacho de campañas, respetando estrictamente los contratos de `API_CONTRACTS.md` y el principio **Zero-Credential Storage**.

## Alcance

### Incluido

1. **Ruta Pública de Simulación (`/sim/verificar`):**
   - Accesible sin autenticación JWT y excluida de redirecciones hacia `/login` (revisar `middleware.ts` o guards de layout en Next.js).
   - Aislada visualmente del layout administrativo (no mostrar sidebar, navbar ni logos de PhishWarden durante la fase de captura/trampa).
   - Consulta `GET /track/context/:token` usando el parámetro de consulta `?t=<token>` (sin header `Authorization`).
   - Renderiza dinámicamente el portal simulado según `landingTipo` (`'microsoft'`, `'google'`, `'bancario'`, `'corporativo'` / `'generico'`), personalizando el nombre de la organización (`nombreEmpresa`) cuando aplique.
   - **Zero-Credential Storage estricto:** Al enviar el formulario, el navegador limpia y descarta inmediatamente en memoria el valor de contraseña/credencial ingresado, **nunca** lo incluye en peticiones HTTP, ni en `console.log`, ni en `localStorage`/`sessionStorage`, y envía exclusivamente `{ token }` a `POST /track/submit`.
   - Transiciona inmediatamente a una vista de **Retroalimentación Educativa** mostrando el mensaje de alerta, las `recomendaciones` devueltas por el backend y las señales de advertencia de la plantilla (`tituloPlantilla`, `asunto`, `metodoAtaque`, `indicadorDificultad`).
   - Manejo limpio de estados: cargando, token ausente/inválido (`400`/`404` -> vista neutral de enlace expirado o no disponible) y error de red.

2. **Soporte de `landingTipo` en Módulo de Plantillas:**
   - Actualizar tipos TypeScript y servicio de plantillas para enviar y recibir `landingTipo` (`'generico' | 'microsoft' | 'google' | 'bancario' | 'corporativo'`).
   - Añadir selector de `landingTipo` en los formularios/modales de creación (`POST /empresas/:empresaId/plantillas`) y edición (`PUT /empresas/:empresaId/plantillas/:id`), explicando que `'generico'` detecta automáticamente el estilo según el título/asunto.
   - Mostrar badge identificador del portal simulado en el listado/tarjetas de plantillas.

3. **Despacho Manual de Campañas (`POST /empresas/:empresaId/campanas/:id/despachar`):**
   - Añadir botón **"Despachar ahora"** en campañas con estado `'programada'` (en la tabla/tarjetas de campañas y/o en el detalle de campaña).
   - Solicitar confirmación mediante diálogo antes de ejecutar el envío.
   - Llamar a `POST /empresas/:empresaId/campanas/:id/despachar`, mostrar notificación con `totalTargets` y `mode` (`sandbox` o `live`), y refrescar el listado y resumen de campañas (`estado` pasa a `'en_curso'`).

### Excluido

- Vistas de resultados estadísticos globales, tasas de apertura/clic o ranking de departamentos (corresponde a Fase 5 Dashboard y Analítica).
- Funcionalidades de la app móvil Flutter y notificaciones push FCM (corresponde a Fase 3).

## Reglas funcionales y de seguridad

1. **Zero-Credential Storage en Cliente (Inviolable):**
   - El campo `<input type="password">` del formulario simulado debe usar `autoComplete="off"`, no persistirse en almacenamiento del navegador y limpiarse (`setPassword('')`) inmediatamente en el handler `onSubmit` antes de invocar `fetch`/`axios`.
   - El cuerpo JSON de `POST /track/submit` debe contener **únicamente** `{ token: string }`. Cualquier propiedad adicional será rechazada por el backend con `400 Bad Request` (`forbidNonWhitelisted: true`).

2. **Fidelidad Visual por `landingTipo`:**
   - `microsoft`: Estética limpia tipo inicio de sesión de Microsoft 365 / Outlook (emblema de 4 cuadros, título "Iniciar sesión", correo institucional, contraseña y botón primario azul `#0067b8`).
   - `google`: Estética tipo acceso de Google Workspace / Gmail (tarjeta centrada blanca, emblema multicolor minimalista, correo y contraseña).
   - `bancario`: Estética de portal de validación de seguridad bancaria / banca por internet (encabezado institucional de seguridad, aviso de verificación preventiva y formulario de acceso).
   - `corporativo` / `generico`: Portal de acceso único (SSO) corporativo destacando `nombreEmpresa` en el encabezado.

3. **Consistencia con Contratos API:**
   - `GET /track/context/:token` -> `{ token, landingTipo, metodoAtaque, nombreEmpresa, tituloPlantilla, asunto, indicadorDificultad }`.
   - `POST /track/submit` -> Request `{ token }` | Response `{ status, message, landingTipo, recomendaciones }`.
   - `POST /empresas/:empresaId/campanas/:id/despachar` -> Response `{ message, campaignId, totalTargets, mode }`.

## Criterios de aceptación

- Al abrir `/sim/verificar?t=<token_valido>` sin haber iniciado sesión en PhishWarden, se visualiza el portal simulado correspondiente a `landingTipo` sin redirección al login administrativo.
- Al enviar el formulario simulado, en la pestaña Network del navegador se verifica que `POST /track/submit` envía exclusivamente `{ "token": "..." }` sin contraseñas ni correos, y la pantalla cambia al panel educativo con las recomendaciones.
- En el panel de Plantillas se puede seleccionar `landingTipo` al crear y editar plantillas propias.
- En el panel de Campañas se puede despachar manualmente una campaña `'programada'`, actualizando su estado a `'en_curso'`.
- `npm run build` en `phishwarden-web-tl/` finaliza con **0 errores de TypeScript/Next.js**.