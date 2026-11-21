# Fase 1 Frontend - Gestión Integral de Campañas (`Campañas`)

## Objetivo

Construir la interfaz administrativa completa de gestión y programación de campañas en PhishWarden Web (`/dashboard/campanas`), conectada a los 10 endpoints protegidos del backend mediante el cliente HTTP centralizado (`apiClient`), respetando el aislamiento multi-tenant, el tipado estricto TypeScript y la coherencia visual de la plataforma.

## Alcance

### Incluido

1. Incorporación de la ruta **Campañas** (`/dashboard/campanas`) en la navegación lateral del dashboard.
2. Definición de interfaces TypeScript estrictas en `src/lib/types.ts` alineadas exactamente con los contratos JSON del backend (`CampaignSummary`, `CampaignItem`, `CampaignDetail`, `CampaignParticipantItem`, `CreateCampaignInput`, `UpdateCampaignInput`, `ManageParticipantsInput`, `DuplicateCampaignInput`).
3. **Tarjetas KPI de Resumen (`GET /empresas/:empresaId/campanas/resumen`):**
   - Visualización de métricas rápidas (`total`, `programadas`, `enCurso`, `finalizadas`, `canceladas`).
4. **Listado Paginado y Filtros (`GET /empresas/:empresaId/campanas`):**
   - Tabla/tarjetas paginadas (`{ data, total, page, limit }`).
   - Filtros por búsqueda (`search`), estado (`status`: `programada | en_curso | finalizada | cancelada`) y tipo de ataque (`attackType`: `PHISHING | SMISHING`).
5. **Creación de Campaña (`POST /empresas/:empresaId/campanas`):**
   - Modal/formulario con selección de plantilla (`templateId` INT desde `GET /empresas/:empresaId/plantillas`), nombre (`name`), fecha/hora programada (`scheduledDate` ISO 8601), modalidad de envío (`shippingMethod`: `'masivo' | 'escalonado'`), y selección dual de objetivos: por **departamentos completos** (`departmentIds`: `INT[]`) y/o **colaboradores individuales** (`targetUserIds`: `UUIDv4[]`).
6. **Vista/Modal de Detalle y Gestión de Participantes:**
   - Información completa de la campaña y vista previa de la plantilla asociada (`GET /empresas/:empresaId/campanas/:id`).
   - Listado paginado, buscable y filtrable por departamento de los colaboradores asignados (`GET /empresas/:empresaId/campanas/:id/participantes`).
   - Cuando `status === 'programada'`: permitir agregar nuevos participantes o departamentos (`POST /empresas/:empresaId/campanas/:id/participantes`) y remover colaboradores individuales (`DELETE /empresas/:empresaId/campanas/:id/participantes/:usuarioId`), respetando la regla de conservar al menos 1 participante.
7. **Acciones del Ciclo de Vida:**
   - **Editar campaña (`PATCH /empresas/:empresaId/campanas/:id`):** Habilitada únicamente cuando `status === 'programada'`.
   - **Duplicar / Clonar campaña (`POST /empresas/:empresaId/campanas/:id/duplicar`):** Disponible para cualquier campaña existente, solicitando nueva `scheduledDate` y nombre opcional.
   - **Cancelar campaña (`PATCH /empresas/:empresaId/campanas/:id/cancelar`):** Habilitada únicamente cuando `status === 'programada' || status === 'en_curso'`, con diálogo de confirmación.
8. Actualización de `phishwarden-web-tl/specs/API_CONTRACTS.md`.

### Excluido

- Embudo de conversión de aperturas, clics y envíos de formularios (corresponde a Fase 5 - Analítica).
- Rastreo público o simulación de landing pages (corresponde a Fase 2).
- Vistas de microlecciones o gamificación móvil (corresponde a Fases 3 y 4).

## Auditoría inicial

- El frontend cuenta con `src/lib/api-client.ts` (inyección automática de `Authorization: Bearer <token>`, soporte query params, manejo de `401` con cierre de sesión, `403` sin alterar `empresaId` y parseo de errores `{ message }`), `src/lib/types.ts` y validación de sesión/tenant en `src/app/dashboard/layout.tsx`.
- El backend ya expone y protege bajo `JwtAuthGuard` + `CompanyTenantGuard` todos los endpoints de `/empresas/:empresaId/campanas`.
- Actualmente el menú del dashboard no incluye enlace a `/dashboard/campanas` ni existe la pantalla correspondiente.

## Reglas funcionales

1. **Consumo Centralizado y Multi-tenant:**
   - Todas las llamadas deben usar `apiClient` y el `empresaId` validado de la sesión autenticada.
   - Validar formato UUIDv4 en cliente antes de ejecutar operaciones con `:id` de campaña o `:usuarioId`.

2. **Reglas de Creación y Selección de Objetivos (`POST /empresas/:empresaId/campanas`):**
   - El formulario debe permitir seleccionar **departamentos completos** (`departmentIds`) y/o **empleados específicos** (`targetUserIds`), enviando ambos arreglos al backend sin duplicados.
   - Validar en cliente que exista al menos 1 departamento o 1 empleado seleccionado, un `templateId` válido y una `scheduledDate` convertida a ISO 8601 (`new Date(...).toISOString()`).
   - Ante error `400`, mostrar el detalle devuelto por el backend sin limpiar los datos ingresados por el usuario.

3. **Reglas de Estado en la Interfaz (Invariantes de Negocio):**
   - **`programada`:** Muestra acciones de *Ver detalle / participantes*, *Editar*, *Agregar/Quitar participantes*, *Duplicar* y *Cancelar*.
   - **`en_curso`:** Muestra acciones de *Ver detalle / participantes* (solo lectura), *Duplicar* y *Cancelar*. Bloquea edición de metadatos y modificación de participantes.
   - **`finalizada` o `cancelada`:** Muestra acciones de *Ver detalle / participantes* (solo lectura) y *Duplicar*. Bloquea edición, modificación de participantes y cancelación.
   - **Remoción de participantes:** Si `totalParticipants <= 1`, deshabilitar el botón de eliminar participante o mostrar advertencia explicando que toda campaña debe conservar al menos 1 colaborador.

4. **Sincronización de Estado en UI:**
   - Tras crear, editar, duplicar, cancelar o agregar/eliminar participantes, refrescar tanto el listado paginado como las tarjetas de `/campanas/resumen` para mantener consistencia inmediata.

## Diseño técnico obligatorio

- **Tipado estricto:** Prohibido usar `any`. Todos los contratos de request y response deben definirse en `src/lib/types.ts` respetando exactamente las claves del backend (`titulo`, `metodoAtaque`, `asunto`, `cuerpoHtml`, `indicadorDificultad`, `usuarioId`, `totalParticipants`, etc.).
- **Modularidad de componentes:**
  - Página principal: `src/app/dashboard/campanas/page.tsx` (tarjetas resumen, barra de filtros, tabla paginada y coordinación de modales).
  - Componentes dedicados en `src/components/campanas/`:
    - `CreateEditCampaignModal.tsx`: Modal reutilizable para crear (`POST`) y editar (`PATCH`) campañas.
    - `CampaignDetailModal.tsx`: Modal con pestañas o secciones para información de campaña/plantilla y gestión paginada de participantes (`GET /:id/participantes`, `POST /:id/participantes`, `DELETE /:id/participantes/:usuarioId`).
    - `DuplicateCampaignModal.tsx`: Modal ligero para clonar campaña (`POST /:id/duplicar`) con nueva fecha programada.
- **Coherencia visual:** Reutilizar los componentes UI en `src/components/ui/`, la paleta oscura/profesional existente e iconos de `lucide-react`.

## Plan de implementación

1. Incorporar interfaces y tipos de campañas en `src/lib/types.ts`.
2. Añadir el enlace **Campañas** en la navegación del dashboard (`src/app/dashboard/layout.tsx`).
3. Implementar `src/app/dashboard/campanas/page.tsx` con KPIs de resumen, filtros, tabla paginada y acción de cancelación.
4. Implementar `src/components/campanas/CreateEditCampaignModal.tsx` (soporte `POST` con `departmentIds` + `targetUserIds` y `PATCH` para estado `programada`).
5. Implementar `src/components/campanas/CampaignDetailModal.tsx` (detalle + tabla paginada de participantes + agregar/remover en estado `programada`).
6. Implementar `src/components/campanas/DuplicateCampaignModal.tsx`.
7. Ejecutar `npm run lint` y `npm run build` verificando **0 errores y 0 advertencias**.
8. Actualizar `phishwarden-web-tl/specs/API_CONTRACTS.md` con todos los contratos de Fase 1.

## Criterios de aceptación

- `/dashboard/campanas` es accesible desde el menú lateral y valida sesión/tenant.
- Se muestran las tarjetas de resumen (`/campanas/resumen`) y el listado paginado (`/campanas`) con filtros funcionales por texto, estado y tipo de ataque.
- Es posible crear campañas seleccionando departamentos completos y/o colaboradores individuales.
- Es posible editar campañas y agregar/quitar participantes únicamente cuando la campaña está en estado `programada` (impidiendo eliminar el último participante).
- Es posible duplicar cualquier campaña y cancelar campañas `programada` o `en_curso`.
- `npm run lint` y `npm run build` finalizan con **0 errores y 0 advertencias**.
- `specs/API_CONTRACTS.md` del frontend está actualizado.