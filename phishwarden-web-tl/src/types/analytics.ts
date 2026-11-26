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
