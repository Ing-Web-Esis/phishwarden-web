# Fase 2.5 Frontend - Portal Aula Virtual UNJBG, Portales Personalizados y Vínculo con Plantillas

## Objetivo

Implementar en `phishwarden-web-tl/` el portal simulado institucional de **Aula Virtual UNJBG**, el renderizador dinámico de **Portales Personalizados** configurados por cada organización (`CustomBrandedLanding`), el módulo administrativo `/dashboard/portales` para gestionar y previsualizar portales (globales y propios), y su selección directa al crear o editar plantillas, manteniendo estrictamente **Zero-Credential Storage** y los contratos de `API_CONTRACTS.md`.

## Alcance

### Incluido

1. **Nuevos Portales en `/sim/verificar` (`src/components/simulacion/`):**
   - **`UnjbgLanding.tsx`:** Portal simulado fiel al inicio de sesión de **Aula Virtual UNJBG** (`aula.unjbg.edu.pe`), con identidad institucional azul UNJBG, cabecera con emblema y título *"Aula Virtual - UNJBG"*, tarjeta centrada estilo Moodle con campos *"Nombre de usuario"* y *"Contraseña"*, botón *"Acceder"*, enlace *"¿Olvidó su nombre de usuario o contraseña?"* y aviso de cookies del navegador.
   - **`CustomBrandedLanding.tsx`:** Portal dinámico que renderiza `portalConfig` (`tituloPortal`, `subtitulo`, `logoUrl`, `colorPrimario`, `colorFondo`, `labelUsuario`, `labelPassword`, `textoBoton`), con respaldo visual limpio si `logoUrl` es nulo o falla al cargar.
   - Actualizar `src/app/sim/verificar/page.tsx` para enrutar `landingTipo === 'unjbg'` hacia `UnjbgLanding` y `landingTipo === 'personalizado'` (o presencia de `portalConfig` personalizado) hacia `CustomBrandedLanding`.
   - Mantener **Zero-Credential Storage** estricto (`onSubmit: () => void`, limpieza inmediata de contraseña en memoria, sin menciones a PhishWarden antes del envío y envío exclusivo de `{ token }` a `POST /track/submit`).

2. **Módulo Administrativo `/dashboard/portales`:**
   - Añadir enlace **"Portales Simulados"** en la navegación lateral (`Sidebar`) del dashboard.
   - Consumir `GET /empresas/:empresaId/portales` para listar por separado o con filtros claros los **Portales Globales** (etiqueta `Global`, solo lectura y previsualización) y los **Portales Personalizados** de la empresa (editar y eliminar).
   - **Modal Crear / Editar Portal (`POST` y `PUT /empresas/:empresaId/portales`):** Formulario con vista previa en vivo (*Live Preview*) donde el administrador configura `nombre`, `tituloPortal`, `subtitulo`, `logoUrl`, `colorPrimario`, `colorFondo`, `labelUsuario`, `labelPassword` y `textoBoton`.
   - **Modal Previsualizar Portal:** Permite visualizar a tamaño real cómo verá el colaborador cualquier portal (incluyendo `Aula Virtual UNJBG` y los personalizados) en modo demostración sin registrar eventos.
   - **Eliminación (`DELETE /empresas/:empresaId/portales/:id`):** Confirmación antes de eliminar portales propios.

3. **Integración en `/dashboard/plantillas`:**
   - Cargar el catálogo desde `GET /empresas/:empresaId/portales` en los modales de creación y edición de plantillas.
   - Permitir seleccionar el portal simulado asociado (`landingId`, además de mantener compatibilidad con `landingTipo`), mostrando claramente `Aula Virtual UNJBG`, los demás portales globales y los portales personalizados de la empresa.
   - Mostrar el nombre/badge del portal vinculado en las tarjetas del catálogo de plantillas y en su vista previa.

### Excluido

- Edición o eliminación de portales globales (`empresaId === null`) desde el frontend.
- Integración móvil Flutter y notificaciones push FCM (corresponde a Fase 3).

## Reglas funcionales y de diseño

1. **Zero-Credential Storage Inviolable:** Tanto `UnjbgLanding` como `CustomBrandedLanding` deben seguir exactamente la misma firma `onSubmit: () => void` sin transmitir credenciales ni mostrar marca de PhishWarden hasta llegar a `EducationalFeedbackView`.
2. **Interfaz Limpia y Minimalista:** Usar exclusivamente iconografía vectorial (`lucide-react` / SVG institucionales) sin emojis en la interfaz de usuario.
3. **Alineación con `API_CONTRACTS.md`:** Respetar exactamente los tipos y rutas documentadas para `portales_simulados`, `plantillas` (`landingId`) y `GET /track/context/:token` (`portalConfig`).

## Criterios de aceptación

- Al abrir `/sim/verificar?t=<token>` vinculado a `Aula Virtual UNJBG` (`landingTipo: 'unjbg'`), se renderiza `UnjbgLanding` sin redirección a `/login` y envía únicamente `{ token }` al hacer submit.
- Al abrir `/sim/verificar?t=<token>` vinculado a un portal personalizado creado por una empresa, `CustomBrandedLanding` aplica sus colores, textos y logo configurados.
- En `/dashboard/portales` se visualizan los 5 portales globales (con previsualización) y se puede crear, previsualizar, editar y eliminar portales personalizados de la empresa.
- En `/dashboard/plantillas` se puede vincular una plantilla a `Aula Virtual UNJBG` o a un portal personalizado mediante `landingId`.
- `npm run build` en `phishwarden-web-tl/` finaliza con **0 errores de TypeScript y Next.js**.