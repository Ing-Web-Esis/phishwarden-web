# Plan de Implementación — Fase 5 (Web): Dashboard de Analítica Ejecutiva, Riesgo Organizacional y Reportes

## 1. Auditoría de Dependencias y Reutilización de Librerías

Tras inspeccionar `phishwarden-web-tl/package.json`, se constata que **todas las librerías requeridas ya están instaladas**, por lo que **no se ejecutará `npm install` ni comandos interactivos**:

- **Gráficos interactivos:** `recharts` (`^3.10.1`) está instalado. Se utilizarán componentes como `ResponsiveContainer`, `LineChart`, `Line`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend` y `Cell` bajo la directiva `"use client"`.
- **Iconografía profesional sin emojis:** `lucide-react` (`^1.56.0`) está instalado. Se utilizarán iconos vectoriales limpios como `Shield`, `TrendingUp`, `Smartphone`, `Send`, `GraduationCap`, `Award`, `AlertTriangle`, `Download`, `Calendar`, `RotateCcw`, `CheckCircle2`, `Users`, `BarChart2`, `Building2` y `FileSpreadsheet`.
- **Estilos y componentes UI:** `tailwindcss` (`^4`), `@base-ui/react`, `class-variance-authority` y los componentes ya existentes en `src/components/ui/` (`card`, `button`, `table`, `input`, `dropdown-menu`).

---

## 2. Tipado TypeScript y Capa de Servicios

### 2.1 Tipos TypeScript (`src/types/analytics.ts` o `src/lib/types.ts`)

Mapeo riguroso de las respuestas de los 6 endpoints documentados en `phishwarden-backend-nj/specs/API_CONTRACTS.md`:

```typescript
export type RiskLevel = 'bajo' | 'medio' | 'critico';

export interface RiskPosture {
  scoreRiesgoPromedio: number;
  nivelRiesgoGlobal: RiskLevel;
  distribucion: {
    bajo: number;
    medio: number;
    critico: number;
  };
}

export interface MobileAdoption {
  totalColaboradores: number;
  colaboradoresVinculados: number;
  tasaAdopcion: number;
}

export interface SimulationMetrics {
  totalCampanas: number;
  totalEnvios: number;
  totalAperturas: number;
  totalClics: number;
  totalEnviosCredenciales: number;
  totalReportes: number;
  tasaApertura: number;
  tasaClic: number;
  tasaCompromisoCredenciales: number;
  tasaReporteTemprano: number;
}

export interface TrainingMetrics {
  totalLeccionesCompletadas: number;
  totalLeccionesPendientes: number;
  totalLeccionesReprobadas: number;
  tasaAprobacion: number;
}

export interface ExecutiveSummaryResponse {
  posturaRiesgo: RiskPosture;
  adopcionMovil: MobileAdoption;
  metricasSimulaciones: SimulationMetrics;
  metricasCapacitacion: TrainingMetrics;
}

export interface DepartmentMetricItem {
  departamentoId: number | null;
  departamento: string;
  totalColaboradores: number;
  scoreRiesgoPromedio: number;
  nivelRiesgo: RiskLevel;
  simulacionesRecibidas: number;
  clicsEnSimulacion: number;
  credencialesComprometidas: number;
  tasaVulnerabilidad: number;
  reportesRealizados: number;
  leccionesCompletadas: number;
}

export interface AttackVectorMetricItem {
  metodoAtaque: string;
  totalEnvios: number;
  totalClics: number;
  totalEnviosCredenciales: number;
  tasaClic: number;
  tasaCompromiso: number;
}

export interface EvolutionMetricItem {
  periodo: string; // 'YYYY-MM'
  simulacionesEnviadas: number;
  incidentesSimulacion: number;
  reportesSospechosos: number;
  leccionesCompletadas: number;
}

export interface HighRiskUser {
  id: string;
  nombre: string;
  correo: string;
  departamento: string;
  scoreRiesgo: number;
  nivelRiesgo: RiskLevel;
  simulacionesFallidas: number;
}

export interface TopDefenderUser {
  id: string;
  nombre: string;
  correo: string;
  departamento: string;
  puntosCapacitacion: number;
  reportesRealizados: number;
  scoreRiesgo: number;
  rachaDiasSeguros: number;
}

export interface FeaturedUsersResponse {
  mayorRiesgo: HighRiskUser[];
  mejoresDefensores: TopDefenderUser[];
}

export interface AnalyticsDateRangeFilter {
  desde?: string;
  hasta?: string;
}
```

---

### 2.2 Servicio de Analítica (`src/services/analytics.service.ts`)

Encapsula el consumo de los 6 endpoints mediante `apiClient` y maneja la descarga de archivos `Blob`:

```typescript
import { apiClient } from '@/lib/api-client';
import type {
  ExecutiveSummaryResponse,
  DepartmentMetricItem,
  AttackVectorMetricItem,
  EvolutionMetricItem,
  FeaturedUsersResponse,
  AnalyticsDateRangeFilter,
} from '@/types/analytics';

export const analyticsService = {
  getSummary: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<ExecutiveSummaryResponse>(`/empresas/${empresaId}/analytics/resumen`, { params }),

  getDepartments: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<DepartmentMetricItem[]>(`/empresas/${empresaId}/analytics/departamentos`, { params }),

  getVectors: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<AttackVectorMetricItem[]>(`/empresas/${empresaId}/analytics/vectores`, { params }),

  getEvolution: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<EvolutionMetricItem[]>(`/empresas/${empresaId}/analytics/evolucion`, { params }),

  getFeaturedUsers: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<FeaturedUsersResponse>(`/empresas/${empresaId}/analytics/usuarios-destacados`, { params }),

  downloadCsv: async (empresaId: number, params?: AnalyticsDateRangeFilter): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const cleanBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const url = new URL(`${cleanBase}/empresas/${empresaId}/analytics/exportar`);
    if (params?.desde) url.searchParams.set('desde', params.desde);
    if (params?.hasta) url.searchParams.set('hasta', params.hasta);

    const res = await fetch(url.toString(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error('Error al descargar el archivo CSV');
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `reporte-phishwarden-empresa-${empresaId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
```

---

## 3. Estructura de Navegación y Componentes UI

### 3.1 Integración en la Navegación (`src/app/dashboard/layout.tsx`)
- Enlazar la pestaña del menú lateral **"Reportes ejecutivos"** (`BarChart2`) a `/dashboard/reportes`.
- Actualizar el estado activo del sidebar: `const isReportes = pathname.includes('/dashboard/reportes')`.
- Actualizar el encabezado y breadcrumb dinámico: cuando `isReportes` esté activo, mostrar `PhishWarden / Reportes ejecutivos`.

### 3.2 Estructura Modular de Componentes (`src/components/analytics/`)

1. **`AnalyticsHeader.tsx`:**
   - Título y descripción ejecutiva.
   - Controles de filtrado por fecha (`Desde` y `Hasta`) con selector HTML5 `date` y botón para limpiar filtros.
   - Validación visual para impedir que `desde > hasta`.
   - Botón de **"Exportar Reporte CSV"** (`Download` de Lucide) con spinner de carga durante la descarga del `Blob`.

2. **`ExecutiveKpis.tsx` (Métricas Clave):**
   - **Tarjeta Postura de Riesgo:** Muestra el `scoreRiesgoPromedio` (0 a 100), badge de nivel (`Bajo`, `Medio`, `Crítico`), y barra segmentada con la distribución de colaboradores.
   - **Tarjeta Adopción Móvil:** Colaboradores vinculados vs. total de colaboradores activos y porcentaje de adopción (`Smartphone`).
   - **Tarjeta Simulaciones:** Desglose visual de envíos, aperturas, clics, envíos de credenciales y reportes tempranos.
   - **Tarjeta Capacitación:** Lecciones completadas, pendientes, reprobadas y tasa de aprobación (`GraduationCap`).

3. **`EvolutionChart.tsx` (Serie Temporal con Recharts):**
   - Gráfico de líneas o áreas suaves mostrando en el eje X los meses (`YYYY-MM`) y en el eje Y las métricas:
     - Envíos de simulaciones (azul corporativo `#283F50`).
     - Incidentes (clics + credenciales en rojo/ámbar).
     - Reportes de phishing (esmeralda `#10B981`).
     - Lecciones completadas (dorado `#E5A93C`).
   - Tooltip personalizado con formato visual limpio sin emojis.

4. **`DepartmentComparisonTable.tsx` (Riesgo Departamental):**
   - Tabla comparativa de departamentos ordenada por `scoreRiesgoPromedio` descendente.
   - Muestra: Departamento (`"Sin departamento"` cuando sea nulo), Total colaboradores, Score de riesgo, Badge de nivel, Simulaciones recibidas, Clics, Credenciales, Tasa de vulnerabilidad (con barra indicadora), Reportes y Lecciones completadas.

5. **`AttackVectorCards.tsx` (Efectividad por Vector de Ataque):**
   - 4 tarjetas o cuadrícula comparativa para `phishing`, `smishing`, `vishing` e `ingenieria_social`.
   - Muestra envíos, clics, envío de credenciales, tasa de clics (%) y tasa de compromiso (%).

6. **`FeaturedUsersPanels.tsx` (Usuarios Destacados - Top 5):**
   - **Panel 1 — Intervención Prioritaria (`mayorRiesgo`):** Lista de los 5 usuarios con mayor score de riesgo y fallos en simulaciones. Badge de criticidad rojo/ámbar y botón o indicativo de foco formativo.
   - **Panel 2 — Líderes de Seguridad (`mejoresDefensores`):** Lista de los 5 usuarios con mayor puntaje en microlecciones, reportes sospechosos y menor riesgo. Iconos de trofeo/medalla (`Award`, `Shield`).

7. **Página Principal (`src/app/dashboard/reportes/page.tsx`):**
   - Manejador de estado centralizado (`useState`, `useEffect`) que consume concurrentemente las 5 consultas JSON (`Promise.allSettled` o `Promise.all`).
   - Estados de carga (*skeletons* elegantes) y estado vacío amigable cuando la organización aún no tenga campañas o simulaciones registradas.

---

## 4. Reglas Semánticas y de Diseño

1. **Escala de Riesgo (`0` = seguro, `100` = crítico):**
   - `0–30` (`bajo`): Esmeralda (`bg-emerald-50 text-emerald-700 border-emerald-200`).
   - `31–69` (`medio`): Ámbar (`bg-amber-50 text-amber-700 border-amber-200`).
   - `70–100` (`critico`): Rojo carmesí (`bg-rose-50 text-rose-700 border-rose-200`).
2. **Cero Emojis:** Todos los indicadores, títulos y avisos emplearán exclusivamente iconografía de `lucide-react`.
3. **Multi-Tenant Seguro:** Extracción del `empresaId` desde `localStorage.getItem('empresaId')` o perfil autenticado `/auth/me`.

---

## 5. Criterios de Aceptación y Verificación

- Integración completa con los 6 endpoints documentados en `API_CONTRACTS.md`.
- Navegación lateral activa hacia `/dashboard/reportes` con breadcrumb funcional.
- Filtros de fecha operativos y descarga funcional de CSV con nombre `reporte-phishwarden-empresa-{id}.csv`.
- `npm run build` en `phishwarden-web-tl/` ejecuta con **0 errores de TypeScript y Next.js**.
