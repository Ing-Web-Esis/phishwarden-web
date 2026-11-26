# Plan de Implementación: Fase 1 Frontend - Gestión Integral de Campañas

Este documento detalla la planificación arquitectónica y técnica para implementar el módulo de **Gestión de Campañas** en PhishWarden Web (`phishwarden-web-tl/`), conectándolo con los 10 endpoints protegidos del backend bajo `specs/CONSTITUTION.md` y tomando como fuente de verdad exacta `phishwarden-backend-nj/specs/API_CONTRACTS.md`.

---

## 1. Definición Exacta de Tipos e Interfaces (`src/lib/types.ts`)

Para eliminar cualquier uso de `any` y asegurar correspondencia exacta campo por campo con las respuestas JSON del backend, se incorporarán las siguientes interfaces en `src/lib/types.ts`:

```typescript
// Estados y Modalidades de Campañas
export type CampaignStatus = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type ShippingMethod = 'masivo' | 'escalonado';

// Resumen Ejecutivo de Campañas (GET /empresas/:empresaId/campanas/resumen)
export interface CampaignSummary {
  total: number;
  programadas: number;
  enCurso: number;
  finalizadas: number;
  canceladas: number;
}

// Resumen de Plantilla en Listado de Campañas
export interface CampaignTemplateSummary {
  id: number;
  titulo: string;
  metodoAtaque: string;
}

// Elemento de Campaña en Listado Paginado (GET /empresas/:empresaId/campanas)
export interface CampaignItem {
  id: string; // UUIDv4
  templateId: number;
  name: string;
  scheduledDate: string; // ISO 8601
  shippingMethod: ShippingMethod;
  status: CampaignStatus;
  createdAt: string; // ISO 8601
  targetUserIds?: string[];
  template?: CampaignTemplateSummary;
  totalParticipants: number;
}

// Detalle Completo de Plantilla en Detalle de Campaña
export interface CampaignTemplateDetail {
  id: number;
  titulo: string;
  metodoAtaque: string;
  asunto: string | null;
  cuerpoHtml: string;
  indicadorDificultad: string | null;
}

// Detalle Completo de Campaña (GET /empresas/:empresaId/campanas/:id)
export interface CampaignDetail {
  id: string;
  templateId: number | null;
  name: string;
  scheduledDate: string; // ISO 8601
  shippingMethod: ShippingMethod;
  status: CampaignStatus;
  createdAt: string | null; // ISO 8601
  template: CampaignTemplateDetail | null;
  totalParticipants: number;
}

// Participante de Campaña (GET /empresas/:empresaId/campanas/:id/participantes)
export interface CampaignParticipantItem {
  usuarioId: string; // UUIDv4
  nombre: string;
  correo: string;
  departamento: string | null;
  estado: string;
}

// Payloads de Envío hacia la API
export interface CreateCampaignInput {
  name: string;
  templateId: number;
  scheduledDate: string; // ISO 8601
  shippingMethod: ShippingMethod;
  targetUserIds?: string[];
  departmentIds?: number[];
}

export interface UpdateCampaignInput {
  name?: string;
  templateId?: number;
  scheduledDate?: string; // ISO 8601
  shippingMethod?: ShippingMethod;
}

export interface ManageParticipantsInput {
  targetUserIds?: string[];
  departmentIds?: number[];
}

export interface DuplicateCampaignInput {
  name?: string;
  scheduledDate: string; // ISO 8601
}
```

---

## 2. Navegación en el Dashboard (`src/app/dashboard/layout.tsx`)

* **Enlace Activo:**
  * Detectar ruta con `pathname.includes('/dashboard/campanas')`.
  * Reemplazar el enlace existente `href="#"` ("Gestión de campañas") por `href="/dashboard/campanas"`, aplicando el estilo activo (`bg-[#E5A93C]/10 border-[#E5A93C]/20 text-[#E5A93C]`) coherente con las demás secciones.

---

## 3. Arquitectura y Diseño de Pantalla y Componentes

### 3.1. Pantalla Principal: `src/app/dashboard/campanas/page.tsx`
* **Carga de Datos:**
  * Uso de `apiClient.get<CampaignSummary>(/empresas/${empresaId}/campanas/resumen)` para alimentar las tarjetas KPI.
  * Uso de `apiClient.get<PaginatedResponse<CampaignItem>>(/empresas/${empresaId}/campanas, { params })` para alimentar la tabla paginada.
  * Manejo asíncrono limpio con `reloadTrigger` para evitar advertencias de ESLint (`react-hooks/set-state-in-effect`).
* **Tarjetas KPI de Resumen:**
  * *Total Campañas* (icono neutral).
  * *Programadas* (badge ámbar/dorado).
  * *En Curso* (badge verde/esmeralda).
  * *Finalizadas* (badge morado/slate).
  * *Canceladas* (badge rojo).
* **Filtros y Búsqueda:**
  * Búsqueda por texto con debouncing (500 ms).
  * Selector de estado (`Todas`, `programada`, `en_curso`, `finalizada`, `cancelada`).
  * Selector de canal (`Todos`, `phishing`, `smishing`).
* **Tabla de Campañas:**
  * Columnas: Campaña (nombre y canal con icono `Send`/`Smartphone`), Plantilla (`template.titulo`), Fecha programada (formato legible localizado), Modalidad (`masivo` / `escalonado`), Participantes (`totalParticipants`), Estado (Badge coloreado), Acciones (Menú desplegable).
* **Acciones en Dropdown según Invariantes de Estado:**
  * `programada`: Ver detalle, Editar campaña, Duplicar, Cancelar.
  * `en_curso`: Ver detalle, Duplicar, Cancelar (Editar deshabilitado/oculto).
  * `finalizada` / `cancelada`: Ver detalle, Duplicar (Editar y Cancelar deshabilitados/ocultos).
* **Diálogo de Cancelación:**
  * Modal de confirmación para `PATCH /empresas/:empresaId/campanas/:id/cancelar`.

---

### 3.2. Modal de Creación y Edición: `src/components/campanas/CreateEditCampaignModal.tsx`
* **Doble Modo:**
  * Modo **Crear** (`POST /empresas/:empresaId/campanas`): Carga plantillas (`/plantillas`), departamentos (`/departamentos`) y empleados (`/empleados/resumen`) para selección de objetivos.
  * Modo **Editar** (`PATCH /empresas/:empresaId/campanas/:id`): Habilitado solo para campañas `programada`. Permite modificar `name`, `templateId`, `scheduledDate` y `shippingMethod`.
* **Conversión de Fechas:**
  * El input HTML `<input type="datetime-local" />` trabaja en hora local (`YYYY-MM-DDTHH:mm`).
  * Antes de enviar el payload, se transforma a formato ISO 8601 estricto con:
    ```typescript
    const isoDate = new Date(formData.scheduledDate).toISOString();
    ```
  * Al abrir el modal en modo edición, se formatea la fecha ISO existente a formato local para inicializar el input.
* **Selección Dual de Objetivos (Creación):**
  * Pestañas o secciones para seleccionar:
    1. Departamentos completos (checkboxes con ID numérico).
    2. Empleados individuales (lista buscable con checkboxes de UUID).
  * Validación en cliente: Requiere que al menos un departamento o un empleado esté seleccionado.

---

### 3.3. Modal de Detalle y Gestión de Participantes: `src/components/campanas/CampaignDetailModal.tsx`
* **Consulta de Detalle:**
  * `GET /empresas/:empresaId/campanas/:id`: Obtiene datos generales y el desglose de la plantilla (`titulo`, `metodoAtaque`, `asunto`, `cuerpoHtml`, `indicadorDificultad`).
* **Pestaña 1: Información y Vista Previa:**
  * Resumen de campaña (fechas, estado, participantes, modalidad).
  * Vista previa del asunto y cuerpo HTML renderizado de la plantilla asociada.
* **Pestaña 2: Colaboradores Participantes (`GET /:id/participantes`):**
  * Tabla paginada con buscador por nombre/correo y filtro por departamento.
  * Columnas: Colaborador (`nombre`, `correo`), Departamento (`departamento`), Estado (`estado`), y columna de acción (Eliminar).
* **Gestión de Participantes en Estado `programada`:**
  * **Agregar Participantes:** Botón que despliega selector para agregar departamentos (`departmentIds`) o colaboradores adicionales (`targetUserIds`) mediante `POST /empresas/:empresaId/campanas/:id/participantes`.
  * **Remover Participante:** Botón por fila que ejecuta `DELETE /empresas/:empresaId/campanas/:id/participantes/:usuarioId`.
  * **Regla de Protección de Último Participante:** Si `campaign.totalParticipants <= 1`, el botón de remover se deshabilita con un tooltip o mensaje explicando que toda campaña debe conservar al menos un colaborador.

---

### 3.4. Modal de Duplicación: `src/components/campanas/DuplicateCampaignModal.tsx`
* Modal enfocado y rápido:
  * Muestra el nombre de la campaña origen.
  * Campo de texto opcional para nuevo nombre (`name`, con placeholder `"Copia de <nombre>"`).
  * Campo obligatorio `<input type="datetime-local" />` para la nueva fecha programada.
  * Convierte a ISO 8601 y ejecuta `POST /empresas/:empresaId/campanas/:id/duplicar`.
  * Refresca listado y KPIs tras completarse con éxito.

---

## 4. Estrategia de Manejo de Errores y Calidad

1. **Captura de `ApiError`:**
   * **400 Bad Request:** Extraer `err.message` (sea string o arreglo de validaciones) y mostrarlo en toast sin borrar el formulario del usuario.
   * **401 Unauthorized:** Gestionado automáticamente por `apiClient` (cierra sesión y redirige a `/login`).
   * **403 Forbidden:** Mostrar toast de permisos denegados sin alterar destructivamente `localStorage.empresaId`.
   * **404 Not Found:** Mostrar toast indicando que el recurso ya no existe o pertenece a otro tenant.
2. **Validaciones en Cliente:**
   * Formato UUIDv4 verificado con `isValidUUID` antes de llamar endpoints paramétricos `:id` o `:usuarioId`.
3. **Calidad de Código:**
   * Sin `any`.
   * 0 advertencias y 0 errores en `npm run lint`.
   * Compilación exitosa en `npm run build`.
