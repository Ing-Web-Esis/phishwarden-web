# Plan de Implementación: Fase 2.5 Frontend - Portal Aula Virtual UNJBG, Portales Personalizados y Vínculo con Plantillas

**Objetivo:** Implementar en `phishwarden-web-tl/` la réplica institucional del portal simulado de **Aula Virtual UNJBG**, el componente dinámico `CustomBrandedLanding` para portales personalizados, la vista pública `/sim/verificar` enriquecida con `portalConfig`, el módulo administrativo `/dashboard/portales` (CRUD, live preview y previsualización completa) y la integración del selector de portales (`landingId`) en `/dashboard/plantillas`.

---

## 1. Tipos e Interfaces en `src/lib/types.ts`

Se actualizarán y añadirán las siguientes interfaces alineadas 1 a 1 con `API_CONTRACTS.md`:

```typescript
// Tipos base para portales y landings simuladas
export type PortalTipoBase =
  | 'unjbg'
  | 'microsoft'
  | 'google'
  | 'bancario'
  | 'corporativo'
  | 'personalizado';

export type LandingTipo =
  | 'microsoft'
  | 'google'
  | 'corporativo'
  | 'bancario'
  | 'generico'
  | 'unjbg'
  | 'personalizado';

// Entidad de portal simulado devuelta por GET /empresas/:empresaId/portales
export interface PortalSimuladoItem {
  id: number;
  empresaId: number | null;
  nombre: string;
  tipoBase: PortalTipoBase;
  tituloPortal: string;
  subtitulo?: string | null;
  logoUrl?: string | null;
  colorPrimario: string;
  colorFondo: string;
  labelUsuario: string;
  labelPassword: string;
  textoBoton: string;
  esGlobal: boolean;
  fechaCreacion?: string;
}

// Configuración de personalización devuelta en GET /track/context/:token
export interface PortalConfig {
  id: number;
  nombre: string;
  tipoBase: string;
  tituloPortal: string;
  subtitulo?: string | null;
  logoUrl?: string | null;
  colorPrimario: string;
  colorFondo: string;
  labelUsuario: string;
  labelPassword: string;
  textoBoton: string;
}

// Payloads de creación y actualización para portales
export interface CreatePortalInput {
  nombre: string;
  tipoBase?: PortalTipoBase;
  tituloPortal: string;
  subtitulo?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string;
  colorFondo?: string;
  labelUsuario?: string;
  labelPassword?: string;
  textoBoton?: string;
}

export interface UpdatePortalInput {
  nombre?: string;
  tituloPortal?: string;
  subtitulo?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string;
  colorFondo?: string;
  labelUsuario?: string;
  labelPassword?: string;
  textoBoton?: string;
}

// Actualización en Plantillas para soporte de landingId
export interface PlantillaItem {
  id: number | string;
  companyId?: number | null;
  empresa_id?: number | null;
  title: string;
  subject: string;
  bodyHtml: string;
  attackType: AttackType;
  difficulty: DifficultyLevel;
  landingTipo?: LandingTipo;
  landingId?: number | null;
  isGlobal: boolean;
  createdAt?: string;
}

export interface CreatePlantillaInput {
  title: string;
  subject: string;
  bodyHtml: string;
  attackType: AttackType;
  difficulty: DifficultyLevel;
  landingTipo?: LandingTipo;
  landingId?: number | null;
}

export interface UpdatePlantillaInput {
  title?: string;
  subject?: string;
  bodyHtml?: string;
  attackType?: AttackType;
  difficulty?: DifficultyLevel;
  landingTipo?: LandingTipo;
  landingId?: number | null;
}

// Actualización en contexto de simulación
export interface SimulationContext {
  token: string;
  landingTipo: LandingTipo;
  metodoAtaque: string;
  nombreEmpresa: string;
  tituloPlantilla: string;
  asunto: string | null;
  indicadorDificultad: string | null;
  portalConfig?: PortalConfig | null;
}
```

---

## 2. Portales Simulados en `/sim/verificar` (`src/components/simulacion/`)

### 2.1. `UnjbgLanding.tsx` (Réplica institucional `aula.unjbg.edu.pe`)
- **Fidelidad Institucional:**
  - Réplica del login Moodle institucional de la **Universidad Nacional Jorge Basadre Grohmann (UNJBG)**.
  - Paleta: Azul institucional UNJBG `#1d4ed8` (hover `#1e40af`, focus ring `#2563eb`), fondo slate limpio `#f1f5f9`.
  - Cabecera: Isotipo/escudo heráldico estilizado de la UNJBG con las siglas institucionales y texto formal: *"Universidad Nacional Jorge Basadre Grohmann"* y badge *"Aula Virtual"*.
  - Tarjeta central estilo Moodle 4.x:
    - Título: *"Acceso a la plataforma"*
    - Subtítulo: *"Ingrese sus credenciales institucionales para acceder a sus asignaturas"*
    - Campo 1: `Nombre de usuario` con placeholder `"Ej. 2021-119001 o usuario"` y selector de tipo de documento/identificador.
    - Campo 2: `Contraseña` con placeholder `"••••••••••••"`.
    - Checkbox: *"Recordar nombre de usuario"*.
    - Botón principal: *"Acceder"* (`bg-[#1d4ed8] text-white`).
    - Enlaces de soporte idénticos al portal real:
      - *"¿Olvidó su nombre de usuario o contraseña?"*
      - *"Aviso de cookies del navegador"*
      - *"Acceso para invitados y postulantes"*
- **Zero-Credential Storage:**
  - Prop `onSubmit: () => void`.
  - `handleSubmit`: `e.preventDefault()`, borrado instantáneo del estado (`setPassword('')`), luego invocación de `onSubmit()`.
  - Ningún dato ingresado viaja en la red ni se almacena en memoria.
  - Sin emojis, sin mención a PhishWarden ni logos de ciberseguridad antes de la trampa.

### 2.2. `CustomBrandedLanding.tsx` (Portal Corporativo Dinámico)
- **Renderizado Dinámico:**
  - Consume la prop `portalConfig: PortalConfig`.
  - Aplica dinámicamente `portalConfig.colorFondo` al fondo general y `portalConfig.colorPrimario` a los botones, foco de inputs y acentos.
  - Logotipo: Si `portalConfig.logoUrl` está presente, lo renderiza con respaldo ante error (`onError` activa fallback al icono vectorial de empresa `Building2`).
  - Textos dinámicos:
    - Título: `portalConfig.tituloPortal`
    - Subtítulo: `portalConfig.subtitulo || portalConfig.nombre`
    - Label Usuario: `portalConfig.labelUsuario || 'Correo electrónico o usuario'`
    - Label Contraseña: `portalConfig.labelPassword || 'Contraseña'`
    - Botón Submit: `portalConfig.textoBoton || 'Iniciar sesión'`
- **Zero-Credential Storage:**
  - Misma firma: `onSubmit: () => void`, sin envío de credenciales.

### 2.3. Enrutamiento en `src/app/sim/verificar/page.tsx`
- Si `context.portalConfig`:
  - Si `landing === 'unjbg'`: Renderiza `<UnjbgLanding onSubmit={handleCaptureCredentials} submitting={isSubmitting} />`.
  - Si `landing === 'personalizado'` o no coincide con los 4 portales base: Renderiza `<CustomBrandedLanding portalConfig={context.portalConfig} onSubmit={handleCaptureCredentials} submitting={isSubmitting} />`.
  - Si `landing` coincide con `microsoft`, `google`, `bancario`, `corporativo`: Renderiza el portal correspondiente preservando su diseño específico.
- Fallback general para `generico` o indefinido: `CorporativoLanding`.

---

## 3. Módulo Administrativo `/dashboard/portales`

### 3.1. Navegación en `src/app/dashboard/layout.tsx`
- Incorporar enlace en el `Sidebar`:
  - Icono: `Globe` de `lucide-react`.
  - Texto: *"Portales simulados"*.
  - Ruta: `/dashboard/portales`.
  - Estado activo: `pathname.includes('/dashboard/portales')`.

### 3.2. Página Principal `src/app/dashboard/portales/page.tsx`
- **Cabecera:**
  - Título: *"Catálogo de Portales Simulados"*.
  - Descripción: *"Gestiona las páginas de aterrizaje falsas hacia donde son dirigidos los colaboradores al hacer clic en enlaces de simulación."*
  - Botón principal: `+ Crear Portal Personalizado` (abre modal de creación).
- **Consumo API:**
  - `GET /empresas/:empresaId/portales` cargando tanto los portales globales como los de la empresa.
- **Filtros por pestaña:**
  - `Todos` (con conteo total)
  - `Globales del Sistema` (los 5 precargados, badge `Global`, solo previsualización)
  - `Personalizados` (creados por la empresa, badge `Personalizado`, editar y eliminar disponibles)
- **Barra de Búsqueda:** Búsqueda en tiempo real por nombre, título o tipo base.
- **Tarjetas de Portales:**
  - Miniatura o icono representativo (`tipoBase`).
  - Muestra del `colorPrimario` y `colorFondo` como muestras circulares de color.
  - Título y subtítulo del portal.
  - Badge de visibilidad (`Global` en azul marino vs `Personalizado` en dorado).
  - Menú de opciones (`...`):
    - *Previsualizar* (abre modal de vista previa completa para cualquier portal).
    - *Editar* (solo para portales propios, abre modal de edición).
    - *Eliminar* (solo para portales propios, abre diálogo de confirmación).

### 3.3. Modal Crear / Editar Portal (`PortalFormModal`)
- **Estructura en dos columnas (Grid responsivo):**
  - **Columna 1: Formulario de Configuración**
    - `nombre`: Nombre interno del portal (ej. "Portal SSO Ventas").
    - `tipoBase`: Selector de plantilla base (`unjbg`, `microsoft`, `google`, `bancario`, `corporativo`, `personalizado`).
    - `tituloPortal`: Título en la pantalla de inicio de sesión.
    - `subtitulo`: Subtítulo o nombre de organización mostrado al colaborador.
    - `logoUrl`: URL de la imagen del logotipo institucional.
    - `colorPrimario`: Selector de color con input tipo color y preview hexadecimal.
    - `colorFondo`: Selector de color de fondo.
    - `labelUsuario`: Etiqueta del campo de usuario.
    - `labelPassword`: Etiqueta del campo de contraseña.
    - `textoBoton`: Texto del botón de acceso.
  - **Columna 2: Live Preview Interactivo**
    - Miniatura simulada en tiempo real que refleja inmediatamente los colores, textos, labels y logo configurados mientras el usuario escribe en el formulario.
- **Operaciones:**
  - Crear: `POST /empresas/:empresaId/portales` con `CreatePortalInput`.
  - Editar: `PUT /empresas/:empresaId/portales/:id` con `UpdatePortalInput`.
  - Feedback inmediato con toasts de éxito/error.

### 3.4. Modal de Previsualización Completa (`PortalPreviewModal`)
- Muestra el portal a tamaño real o en viewport desktop/tablet/móvil simulado.
- Permite interactuar con los campos en modo demostración (sin disparar endpoints reales).

### 3.5. Diálogo de Eliminación (`PortalDeleteModal`)
- Confirmación clara antes de ejecutar `DELETE /empresas/:empresaId/portales/:id`.
- Bloqueado visual y funcionalmente para portales globales.

---

## 4. Integración en Biblioteca de Plantillas (`/dashboard/plantillas/page.tsx`)

### 4.1. Carga de Portales
- Al montar `/dashboard/plantillas`, se consulta `GET /empresas/:empresaId/portales`.
- Se almacena la lista en estado `portalesDisponibles: PortalSimuladoItem[]`.

### 4.2. Modales Crear y Editar Plantilla
- Se actualiza el selector de portal simulado para ofrecer una experiencia categorizada:
  - Selector con `<optgroup label="Portales Globales del Sistema">` (incluyendo `Aula Virtual UNJBG`, `Microsoft 365`, `Google Workspace`, `Validación Bancaria`, `SSO Corporativo`).
  - Selector con `<optgroup label="Portales Personalizados de la Organización">` (los portales propios creados en `/dashboard/portales`).
  - Opción fallback: *"Detección Inteligente Automática (según contenido)"*.
- Al seleccionar un portal:
  - Se vincula el `landingId` correspondiente.
  - Se actualiza `landingTipo` para sincronizar con el `tipoBase` del portal.

### 4.3. Tarjetas del Catálogo y Vista Previa
- En cada tarjeta de plantilla se muestra el badge con el portal asignado:
  - Si tiene `landingId`, se muestra el nombre del portal (ej. `Portal: Aula Virtual UNJBG` o `Portal: Intranet TechCorp`).
  - Si no, se muestra el `landingTipo` o *"Automática"*.
- En el modal de vista previa de la plantilla, se muestra el portal simulado asignado.

---

## 5. Criterios de Aceptación y Calidad

1. **Zero-Credential Storage:** Ni `UnjbgLanding` ni `CustomBrandedLanding` capturan ni envían contraseñas a ningún destino.
2. **Sin Emojis:** Interfaz completamente profesional con iconografía `lucide-react` y SVGs limpios.
3. **Multi-tenant y Blindaje:** Los portales globales nunca exponen acciones de editar o eliminar en el frontend.
4. **Build Limpio:** `npm run build` en `phishwarden-web-tl/` compila con **0 errores de TypeScript y Next.js**.
