# Tareas Atómicas: Fase 1 Frontend - Gestión Integral de Campañas

## Grupo 1: Fundaciones de Tipado y Navegación

- [x] **T1.1-F** Incorporar interfaces y tipos estrictos de campañas en `src/lib/types.ts`:
  - Enums/types: `CampaignStatus` (`'programada' | 'en_curso' | 'finalizada' | 'cancelada'`), `ShippingMethod` (`'masivo' | 'escalonado'`).
  - Modelos de datos: `CampaignSummary`, `CampaignTemplateSummary`, `CampaignItem`, `CampaignTemplateDetail`, `CampaignDetail`, `CampaignParticipantItem`.
  - Entradas de API: `CreateCampaignInput`, `UpdateCampaignInput`, `ManageParticipantsInput`, `DuplicateCampaignInput`.
- [x] **T1.2-F** Actualizar la navegación lateral en `src/app/dashboard/layout.tsx`:
  - Añadir detección de ruta con `pathname.includes('/dashboard/campanas')`.
  - Reemplazar enlace estático `href="#"` por `href="/dashboard/campanas"`, aplicando clases de estado activo idénticas al resto del menú.

---

## Grupo 2: Modales Especializados del Módulo

- [x] **T1.3-F** Crear `src/components/campanas/CreateEditCampaignModal.tsx`:
  - Cargar plantillas (`/plantillas`), departamentos (`/departamentos`) y empleados (`/empleados/resumen`) con `{ params: { page: 1, limit: 100 } }`.
  - Manejar modo creación (`POST /empresas/:empresaId/campanas`) con selección dual de objetivos (`departmentIds` y/o `targetUserIds`).
  - Manejar modo edición (`PATCH /empresas/:empresaId/campanas/:id`) exclusivo para estado `'programada'`.
  - Implementar conversión de fecha local `<input type="datetime-local" />` hacia ISO 8601 (`new Date(val).toISOString()`), y getters locales en edición.
  - Manejar respuestas de error HTTP 400 sin borrar los datos del formulario.
- [x] **T1.4-F** Crear `src/components/campanas/CampaignDetailModal.tsx`:
  - Consultar detalle completo (`GET /empresas/:empresaId/campanas/:id`) con plantilla asociada.
  - Pestaña de información general y previsualización aislada de la plantilla (`template.cuerpoHtml` dentro de `<iframe srcDoc={...} sandbox="" />`).
  - Pestaña de colaboradores asignados consumiendo `GET /empresas/:empresaId/campanas/:id/participantes` con paginación y búsqueda.
  - Gestión de participantes cuando la campaña esté `'programada'`: sub-formulario para agregar (`POST /:id/participantes`) y botón para remover (`DELETE /:id/participantes/:usuarioId`), deshabilitándolo y advirtiendo si `totalParticipants <= 1`.
  - Sincronización en vivo de `totalParticipants` y recarga tras mutaciones.
- [x] **T1.5-F** Crear `src/components/campanas/DuplicateCampaignModal.tsx`:
  - Formulario ligero solicitando nueva fecha programada obligatoria (`datetime-local`) y nombre opcional.
  - Conversión a ISO 8601 y envío a `POST /empresas/:empresaId/campanas/:id/duplicar`.

---

## Grupo 3: Pantalla Principal de Campañas

- [x] **T1.6-F** Implementar `src/app/dashboard/campanas/page.tsx` (estructura base, KPIs y filtros):
  - Consulta y visualización de tarjetas KPI (`GET /empresas/:empresaId/campanas/resumen`).
  - Barra de búsqueda con debouncing y filtros por estado (`status`) y canal (`attackType`).
  - Estado `reloadTrigger` para recarga limpia y asíncrona tras cualquier mutación.
- [x] **T1.7-F** Incorporar tabla paginada de campañas y acciones en `src/app/dashboard/campanas/page.tsx`:
  - Renderizado de columnas: nombre de campaña, canal, plantilla asociada, fecha programada formateada, modalidad de envío, total de participantes y badge de estado.
  - Dropdown de acciones aplicando restricciones de negocio según estado (`programada`: ver, editar, duplicar, cancelar; `en_curso`: ver, duplicar, cancelar; `finalizada`/`cancelada`: ver, duplicar).
  - Diálogo de confirmación para cancelar campaña (`PATCH /empresas/:empresaId/campanas/:id/cancelar`).
  - Coordinación de apertura y cierre de los 3 modales especializados.

---

## Grupo 4: Verificación, Calidad y Contratos

- [x] **T1.8-F** Ejecutar `npm run lint` en `phishwarden-web-tl/` y verificar que finalice con **0 errores y 0 advertencias**.
- [x] **T1.9-F** Ejecutar `npm run build` en `phishwarden-web-tl/` y confirmar compilación exitosa de Next.js sin errores de TypeScript ni bundling (0 errores).
- [x] **T1.10-F** Actualizar `phishwarden-web-tl/specs/API_CONTRACTS.md` documentando la nueva pantalla de campañas, payloads, manejo de fechas ISO 8601 y gestión de estados.
