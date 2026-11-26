# Plan de Implementación - Fase 5B: Vista General en Vivo, Configuración y Centro de Ayuda Funcional

## 1. Resumen Ejecutivo y Metas

El propósito de esta fase es culminar al 100% la experiencia del panel administrativo web de **PhishWarden** (`phishwarden-web-tl/`), garantizando que ninguna vista contenga información simulada, valores fijos o maquetas estáticas. 

Se interconectarán tres áreas neurálgicas:
1. **Vista General (`/dashboard`):** Monitorización ejecutiva en vivo con KPIs reales calculados desde los endpoints de analítica y campañas, gráfica de tendencia mensual con Recharts y gráfica donut de distribución de vulnerabilidad (`0` a `100`).
2. **Configuración (`/dashboard/configuracion`):** Gestión de la organización, actualización de perfil de administrador, cambio de contraseña seguro y control del código de acceso móvil institucional con regeneración segura y atómica.
3. **Centro de Ayuda (`/dashboard/ayuda`):** Base de conocimiento interactiva con búsqueda en tiempo real, manuales operativos de PhishWarden, generador dinámico de instructivo para colaboradores móviles con el código de acceso real, y verificador en vivo de latencia y disponibilidad de la API.

---

## 2. Auditoría y Mapeo de Endpoints Backend

### 2.1 Endpoints Existentes en `phishwarden-backend-nj/`

| Endpoint | Método | Estado | Rol en Fase 5B |
| :--- | :---: | :---: | :--- |
| `/auth/me` | `GET` | Implementado | Obtiene nombre, correo, rol e ID de empresa del administrador. |
| `/auth/me` | `PUT` | Implementado | Actualiza perfil del admin (`nombre`, `correo`, `nombreEmpresa`, `contraseñaActual`, `nuevaContraseña`). |
| `/empresas/:empresaId` | `GET` | Implementado | Obtiene detalles de la empresa, fecha de creación y `codigoAcceso`. |
| `/empresas/:empresaId/analytics/resumen` | `GET` | Implementado | Alimenta KPIs de riesgo global, adopción móvil, clics y reportes. |
| `/empresas/:empresaId/analytics/evolucion` | `GET` | Implementado | Alimenta la gráfica de evolución mensual (`scoreRiesgoPromedio`). |
| `/empresas/:empresaId/campanas/resumen` | `GET` | Implementado | Obtiene conteos de campañas (`programadas`, `enCurso`, `finalizadas`). |
| `/empresas/:empresaId/campanas` | `GET` | Implementado | Lista campañas recientes para el bloque inferior de actividad. |
| `/` | `GET` | Implementado | Retorna `Hello World!`, ideal para prueba de latencia y ping de disponibilidad. |

### 2.2 Endpoints a Incorporar en `phishwarden-backend-nj/`

Para dar soporte limpio, modular y RESTful a la configuración de la organización sin acoplarse exclusivamente a `/auth/me`:

1. **`PATCH /empresas/:empresaId`**:
   - **Propósito:** Actualizar datos específicos de la empresa (p. ej. `nombre`).
   - **Seguridad:** `@UseGuards(JwtAuthGuard, CompanyTenantGuard)`.
   - **DTO:** `UpdateCompanyDto` con validaciones de `class-validator` (`@IsOptional()`, `@IsString()`, `@MinLength(2)`).
   - **Respuesta:** Objeto `CompanyEntity` actualizado (`{ id, nombre, codigoAcceso, fechaCreacion }`).

2. **`POST /empresas/:empresaId/regenerar-codigo`**:
   - **Propósito:** Generar un nuevo código de acceso de 8 caracteres alfanuméricos en mayúsculas (`CompanyEntity.generateAccessCode()`), verificando unicidad contra la base de datos y actualizando `empresas.codigo_acceso`.
   - **Seguridad:** `@UseGuards(JwtAuthGuard, CompanyTenantGuard)`.
   - **Respuesta:** `{ id, nombre, codigoAcceso, mensaje: 'Código de acceso regenerado exitosamente' }`.

---

## 3. Arquitectura y Diseño Frontend (`phishwarden-web-tl/`)

### 3.1 Layout Global e Identidad (`src/app/dashboard/layout.tsx`)
- **Navegación:**
  - Reemplazar los enlaces placeholder `href="#"` de **Configuración** por `href="/dashboard/configuracion"`.
  - Reemplazar los enlaces placeholder `href="#"` de **Centro de ayuda** por `href="/dashboard/ayuda"`.
  - Activar resaltado dinámico (`bg-[#E5A93C]/10 text-[#E5A93C]`) cuando `pathname.includes('/dashboard/configuracion')` o `pathname.includes('/dashboard/ayuda')`.
- **Breadcrumbs:**
  - Mapear las rutas `/dashboard/configuracion` -> `Configuración` y `/dashboard/ayuda` -> `Centro de ayuda`.
- **Datos de Identidad:**
  - Mostrar nombre de la empresa y sus iniciales en el bloque superior del sidebar.
  - Mostrar nombre del administrador, iniciales y rol (`Administrador`) en el pie del sidebar.

### 3.2 Vista General en Vivo (`src/app/dashboard/page.tsx`)
- **Cero números estáticos:**
  - **Saludo dinámico:** Saludo contextualizado según la hora local (`Buenos días`, `Buenas tardes`, `Buenas noches`) seguido del nombre de pila del administrador.
  - **KPI 1 - Riesgo Global:** `posturaRiesgo.scoreRiesgoPromedio` (escala `0` a `100`). Badge de severidad (`Bajo` 0–30, `Medio` 31–69, `Crítico` 70–100) y delta porcentual calculado comparando el último mes con el anterior en `analyticsService.getEvolution`.
  - **KPI 2 - Usuarios Evaluados:** `posturaRiesgo.totalColaboradores` y desglose de adopción móvil (`colaboradoresVinculados` con app vinculada).
  - **KPI 3 - Campañas Activas:** Suma de campañas `enCurso + programadas` desde `/campanas/resumen`.
  - **KPI 4 - Incidentes y Reportes:** Suma de interacciones vulnerables (`totalClics + totalEnviosCredenciales`) y reportes sospechosos (`totalReportes`).
- **Gráfica de Evolución del Riesgo:**
  - Componente Recharts `ResponsiveContainer` (altura fija `h-72`) con `AreaChart`.
  - Gradiente en tonos corporativos (#E5A93C).
  - Selector funcional de ventana temporal: `Últimos 6 meses` vs `Últimos 3 meses`.
  - Tooltip personalizado con formato de mes en español (`Ene`, `Feb`, etc.) y valor de riesgo.
- **Gráfica Donut de Nivel de Vulnerabilidad:**
  - Componente Recharts `PieChart` con `Pie` (`innerRadius={55}`, `outerRadius={75}`).
  - Segmentos coloreados según estándar: Bajo (#10B981), Medio (#F59E0B), Crítico (#EF4444).
  - Centro del donut dinámico con el total real de colaboradores y leyenda inferior con porcentajes reales calculados sobre el total.
- **Actividad Reciente:**
  - Listado de las 3 campañas más recientes con indicador de estado, vector de ataque y tasa de efectividad, con acceso directo a `/dashboard/campanas`.

### 3.3 Configuración Funcional (`src/app/dashboard/configuracion/page.tsx`)
Estructurado en pestañas visuales o bloques modulares limpios:
1. **Datos de la Organización:**
   - Nombre de la empresa (campo editable con botón de guardar).
   - Fecha de registro de la empresa.
   - **Gestión de Código de Acceso Móvil:**
     - Bloque visual destacado con el código alfanumérico en fuente monoespaciada grande.
     - Botón de **Copiar código** con feedback instantáneo mediante tooltip/icono de confirmación.
     - Botón de **Regenerar código** que abre un diálogo modal de confirmación advirtiendo que los nuevos registros requerirán el nuevo código.
2. **Perfil y Seguridad del Administrador:**
   - Edición de nombre y correo electrónico corporativo.
   - Cambio de contraseña requiriendo contraseña actual y nueva contraseña (mínimo 8 caracteres), validado contra `PUT /auth/me`.
3. **Estado de Integraciones:**
   - Indicador de estado del servicio backend y motor de simulación.
   - Métrica de sincronización con la aplicación móvil (`colaboradoresVinculados / totalColaboradores`).
   - Enlace directo a descarga de reportes ejecutivos.

### 3.4 Centro de Ayuda Funcional (`src/app/dashboard/ayuda/page.tsx`)
1. **Buscador Dinámico y Filtro por Categorías:**
   - Campo de búsqueda interactivo que filtra instantáneamente las preguntas y manuales por título, descripción y palabras clave.
   - Pills de filtro: `Todas`, `Campañas`, `Portales Simulados`, `App Móvil y FCM`, `Riesgo y Microlecciones`.
2. **Manual Operativo de PhishWarden (Acordeón):**
   - Cómo lanzar una campaña de simulación efectiva.
   - Cómo personalizar y validar portales de inicio de sesión falsos.
   - Cómo se calcula el Score de Riesgo (0 a 100) y su impacto en el ranking departamental.
   - Cómo se asignan las microlecciones reactivas automáticas cuando un colaborador cae en un simulacro.
3. **Plantilla de Incorporación Móvil Lista para Compartir:**
   - Cuadro interactivo con el texto preformateado de inducción para colaboradores, inyectando automáticamente el **nombre real de la empresa** y su **`codigo_acceso` actual**.
   - Botón para **Copiar texto al portapapeles** (listo para pegar en Teams, Slack o correo institucional).
   - Botón para **Descargar plantilla en archivo `.txt`**.
4. **Verificador de Estado y Latencia en Vivo:**
   - Componente que ejecuta una petición de sondeo a la API (`GET /`).
   - Mide el tiempo de respuesta en milisegundos (`ms`), muestra badge de estado `Operativo` (verde) o `Intermitente` (ámbar), y ofrece botón de recarga manual.

---

## 4. Reglas de Implementación y Restricciones Técnicas

1. **Cero Emojis:** Todos los componentes, alertas, tarjetas y textos informativos utilizarán exclusivamente iconos de `lucide-react` (ej. `Shield`, `CheckCircle2`, `AlertTriangle`, `RefreshCw`, `Copy`, `FileText`, `Activity`, `Building2`, `KeyRound`).
2. **Escala Unificada de Riesgo (`0` a `100`):**
   - `0–30`: Nivel Bajo / Seguro (Esmeralda `#10B981` / `text-emerald-600 bg-emerald-50`).
   - `31–69`: Nivel Medio (Ámbar `#F59E0B` / `text-amber-600 bg-amber-50`).
   - `70–100`: Nivel Crítico (Rojo `#EF4444` / `text-rose-600 bg-rose-50`).
3. **Sin Dependencias Nuevas:** Se reutilizarán estrictamente los paquetes ya instalados (`recharts`, `lucide-react`, `class-validator`, etc.).
4. **Validación de Compilación:** Finalizar asegurando que `npm run build` ejecute con **0 errores** tanto en el frontend como en el backend.
