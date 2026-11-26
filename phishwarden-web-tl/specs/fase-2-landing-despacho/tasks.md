# Tareas Atómicas: Fase 2 Frontend - Landing Dinámica Zero-Credential, Selector de Landing y Despacho de Campañas

## Grupo 1: Contratos, Tipos y Cliente API

- [x] **T2.1-F** Actualizar `src/lib/types.ts`:
  - Definir tipo `LandingTipo = 'microsoft' | 'google' | 'corporativo' | 'bancario' | 'generico'`.
  - Extender `PlantillaItem`, `CreatePlantillaInput` y `UpdatePlantillaInput` con la propiedad opcional `landingTipo?: LandingTipo`.
  - Definir interfaces `SimulationContext` (respuesta de `GET /track/context/:token`), `TrackSubmitResponse` (respuesta de `POST /track/submit`) y `DispatchCampaignResponse` (respuesta de `POST /empresas/:empresaId/campanas/:id/despachar`).
- [x] **T2.2-F** Reforzar `src/lib/api-client.ts`:
  - Asegurar que la redirección ante código `401` se omita cuando la ruta activa del navegador pertenezca a `/sim/` (`!window.location.pathname.startsWith('/sim/')`).

---

## Grupo 2: Componentes de Landing Page Dinámica y Zero-Credential (`src/components/simulacion/`)

- [x] **T2.3-F** Crear `src/components/simulacion/MicrosoftLanding.tsx`:
  - Portal de inicio de sesión con estética de Microsoft 365 / Outlook (emblema de 4 cuadrados, botón azul `#0067b8`, enlaces de opciones de cuenta).
  - Cumplir **Zero-Credential Storage**: input con `autoComplete="off"`, limpieza inmediata de campos al enviar y despacho exclusivo de `{ token }`.
- [x] **T2.4-F** Crear `src/components/simulacion/GoogleLanding.tsx`:
  - Portal de acceso con estética de Google Workspace / Gmail (tarjeta centrada, logotipo multicolor de Google, tipografía limpia).
  - Cumplir **Zero-Credential Storage** estricto en el envío.
- [x] **T2.5-F** Crear `src/components/simulacion/BancarioLanding.tsx`:
  - Portal de validación de seguridad financiera / banca por internet con banner de advertencia institucional y sello de cifrado SSL 256-bit.
  - Cumplir **Zero-Credential Storage** estricto en el envío.
- [x] **T2.6-F** Crear `src/components/simulacion/CorporativoLanding.tsx`:
  - Portal corporativo SSO que muestra destacadamente `nombreEmpresa`, usuario de dominio y acceso unificado.
  - Cumplir **Zero-Credential Storage** estricto en el envío.
- [x] **T2.7-F** Crear `src/components/simulacion/EducationalFeedbackView.tsx`:
  - Vista pedagógica post-compromiso que informa al colaborador de la simulación controlada, aclara que sus credenciales reales no fueron interceptadas (Zero-Credential Policy), muestra los detalles del ataque simulado (`tituloPlantilla`, `asunto`, `metodoAtaque`, `indicadorDificultad`) y renderiza la lista de recomendaciones devuelta por el backend.
- [x] **T2.8-F** Crear `src/components/simulacion/InvalidSimulationView.tsx`:
  - Vista limpia y neutral para enlaces de simulación vencidos, cancelados o con tokens inválidos (404/400).

---

## Grupo 3: Ruta Pública de Simulación (`src/app/sim/verificar/page.tsx`)

- [x] **T2.9-F** Crear `src/app/sim/verificar/page.tsx`:
  - Configurar página con `<Suspense>` para lectura de `useSearchParams` (`?t=<token>`).
  - Consultar `GET /track/context/:token` mediante `apiClient.get` con `{ skipAuth: true }`.
  - Renderizar dinámicamente el portal correspondiente (`MicrosoftLanding`, `GoogleLanding`, `BancarioLanding`, `CorporativoLanding`) según el `landingTipo` obtenido.
  - Orquestar la captura mediante `POST /track/submit` (enviando únicamente `{ token }`) y transicionar inmediatamente a `EducationalFeedbackView`.
  - Manejar estados de carga y error con `InvalidSimulationView`.

---

## Grupo 4: Soporte de `landingTipo` en Gestión de Plantillas

- [x] **T2.10-F** Actualizar modales de creación y edición en `src/app/dashboard/plantillas/page.tsx`:
  - Añadir selector interactivo para `landingTipo` (`generico`, `microsoft`, `google`, `bancario`, `corporativo`) con textos explicativos.
  - Inicializar y actualizar `formData` y `editFormData` con `landingTipo`.
- [x] **T2.11-F** Actualizar la visualización de plantillas en `src/app/dashboard/plantillas/page.tsx`:
  - Añadir un badge identificador del portal simulado en las tarjetas del catálogo de plantillas.
  - Mostrar el tipo de landing configurado en el modal de previsualización ("Ver Plantilla").

---

## Grupo 5: Despacho Manual de Campañas Programadas

- [x] **T2.12-F** Integrar despacho manual en `src/app/dashboard/campanas/page.tsx`:
  - Añadir la opción **"Despachar Ahora"** en el menú desplegable de acciones para campañas con estado `'programada'`.
  - Crear modal de confirmación de despacho mostrando detalles de la campaña y solicitando aprobación.
  - Ejecutar llamada a `POST /empresas/:empresaId/campanas/:id/despachar`, mostrar toast informativo con los participantes despachados y modo de envío (`sandbox` o `live`), y recargar el listado y KPIs de campañas.
- [x] **T2.13-F** Integrar botón de despacho en `src/components/campanas/CampaignDetailModal.tsx`:
  - Permitir el despacho inmediato desde la vista de detalle cuando la campaña esté `'programada'`, actualizando el estado tras la confirmación.
- [x] **T2.14-F** Validar y robustecer los selectores de departamentos en `CreateEditCampaignModal.tsx`:
  - Asegurar que la etiqueta de cada departamento resuelva correctamente `dept.nombre || dept.name || 'Departamento ' + dept.id`, evitando cuadros vacíos en el selector.

---

## Grupo 6: Verificación y Compilación

- [x] **T2.15-F** Ejecutar `npm run build` en `phishwarden-web-tl/` y confirmar **0 errores de TypeScript y Next.js**.
