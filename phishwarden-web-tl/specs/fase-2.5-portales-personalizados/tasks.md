# Tareas Atómicas: Fase 2.5 Frontend - Portal Aula Virtual UNJBG, Portales Personalizados y Vínculo con Plantillas

## Grupo 1: Contratos y Tipos TypeScript (`src/lib/types.ts`)

- [x] **T2.5.1-F** Actualizar `src/lib/types.ts`:
  - Añadir tipo base `PortalTipoBase = 'unjbg' | 'microsoft' | 'google' | 'bancario' | 'corporativo' | 'personalizado'`.
  - Actualizar `LandingTipo` con `'unjbg'` y `'personalizado'`.
  - Crear interfaces `PortalSimuladoItem`, `PortalConfig`, `CreatePortalInput` y `UpdatePortalInput` alineadas 1 a 1 con `API_CONTRACTS.md`.
  - Actualizar `PlantillaItem`, `CreatePlantillaInput` y `UpdatePlantillaInput` incorporando `landingId?: number | null`.
  - Actualizar `SimulationContext` incorporando `portalConfig?: PortalConfig | null`.

---

## Grupo 2: Portales Simulados en `/sim/verificar` (`src/components/simulacion/`)

- [x] **T2.5.2-F** Crear `src/components/simulacion/UnjbgLanding.tsx`:
  - Réplica del portal de inicio de sesión de **Aula Virtual UNJBG** (`aula.unjbg.edu.pe`).
  - Cabecera institucional con escudo estilizado SVG y título *"Aula Virtual - UNJBG"*.
  - Formulario estilo Moodle con campos *"Nombre de usuario"* y *"Contraseña"*, botón *"Acceder"* en azul UNJBG (`#1d4ed8`), y enlaces de soporte y cookies.
  - Firma obligatoria `onSubmit: () => void`, limpieza inmediata de contraseña y Zero-Credential Storage estricto sin emojis ni menciones a PhishWarden.
- [x] **T2.5.3-F** Crear `src/components/simulacion/CustomBrandedLanding.tsx`:
  - Renderizador dinámico que consume `portalConfig: PortalConfig`.
  - Aplicación dinámica de `colorFondo`, `colorPrimario`, `tituloPortal`, `subtitulo`, `labelUsuario`, `labelPassword` y `textoBoton`.
  - Carga segura de `logoUrl` con fallback al icono `Building2` ante error o ausencia de imagen.
  - Firma obligatoria `onSubmit: () => void`, limpieza inmediata de contraseña y Zero-Credential Storage estricto.
- [x] **T2.5.4-F** Actualizar `src/app/sim/verificar/page.tsx`:
  - Enrutar `landingTipo === 'unjbg'` hacia `UnjbgLanding`.
  - Enrutar `landingTipo === 'personalizado'` o portales con configuración custom hacia `CustomBrandedLanding`.
  - Preservar `CorporativoLanding` como fallback para `generico` o tipos no reconocidos.

---

## Grupo 3: Navegación y Módulo Administrativo `/dashboard/portales`

- [x] **T2.5.5-F** Actualizar `src/app/dashboard/layout.tsx`:
  - Añadir ítem de menú **"Portales simulados"** en el `Sidebar` con icono `Globe` (`lucide-react`) y ruta `/dashboard/portales`.
  - Marcar el estado visual activo cuando `pathname.includes('/dashboard/portales')`.
- [x] **T2.5.6-F** Crear `src/app/dashboard/portales/components/PortalCard.tsx`:
  - Renderizar tarjeta de portal con su tipo base, muestras circulares de paleta (`colorPrimario`, `colorFondo`), título y subtítulo.
  - Mostrar badge distintivo `Global` (azul/slate) vs `Personalizado` (dorado/ámbar).
  - Menú desplegable con opción "Previsualizar" (para todos) y opciones "Editar" y "Eliminar" (bloqueadas para portales globales).
- [x] **T2.5.7-F** Crear `src/app/dashboard/portales/components/PortalFormModal.tsx`:
  - Formulario de creación (`POST /empresas/:empresaId/portales`) y edición (`PUT /empresas/:empresaId/portales/:id`).
  - Panel interactivo de **Live Preview** en tiempo real que refleja instantáneamente los cambios de color, texto, logo y etiquetas.
- [x] **T2.5.8-F** Crear `src/app/dashboard/portales/components/PortalPreviewModal.tsx`:
  - Modal de previsualización completa en viewport desktop/móvil que permite simular la interacción sin registrar eventos ni enviar credenciales.
- [x] **T2.5.9-F** Crear `src/app/dashboard/portales/components/PortalDeleteModal.tsx`:
  - Modal de confirmación para eliminar portales propios (`DELETE /empresas/:empresaId/portales/:id`) con feedback visual de carga.
- [x] **T2.5.10-F** Crear `src/app/dashboard/portales/page.tsx`:
  - Vista principal con consumo de `GET /empresas/:empresaId/portales`.
  - Pestañas de filtrado (`Todos`, `Globales`, `Personalizados`) y barra de búsqueda en tiempo real.
  - Integración de los modales de formulario, previsualización y eliminación con notificaciones toast.

---

## Grupo 4: Integración en Biblioteca de Plantillas (`/dashboard/plantillas/page.tsx`)

- [x] **T2.5.11-F** Actualizar `src/app/dashboard/plantillas/page.tsx` para consultar `GET /empresas/:empresaId/portales` al montar la vista y almacenar el catálogo de portales disponibles.
- [x] **T2.5.12-F** Actualizar modales de creación y edición en `src/app/dashboard/plantillas/page.tsx`:
  - Reemplazar el select plano de landing por un selector agrupado (`<optgroup>`) con portales globales (incluyendo `Aula Virtual UNJBG`), portales personalizados de la empresa y la opción automática.
  - Vincular `landingId` y sincronizar `landingTipo`.
- [x] **T2.5.13-F** Actualizar tarjetas del catálogo y modal de vista previa en `src/app/dashboard/plantillas/page.tsx`:
  - Mostrar el badge con el nombre del portal simulado asignado en cada tarjeta.
  - Reflejar el portal asignado en la cabecera de la vista previa de la plantilla.

---

## Grupo 5: Compilación y Verificación

- [x] **T2.5.14-F** Ejecutar `npm run build` en `phishwarden-web-tl/` y verificar **0 errores de TypeScript y Next.js**.
