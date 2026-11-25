// Tipos e interfaces compartidas para PhishWarden Web

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Autenticación y Sesión
export interface AuthLoginResponse {
  message: string;
  user?: {
    id: number;
    email: string;
    rol?: string;
  };
  token?: string;
  access_token?: string;
}

export interface AdminProfile {
  id: string | number;
  nombre: string;
  correo: string;
  empresaId: number | null;
  empresa: {
    id: number;
    nombre: string;
    codigoAcceso?: string;
  } | null;
  name?: string;
  email?: string;
  codigoAcceso?: string;
}

export type CompanyPlan = 'essential' | 'professional' | 'enterprise';

export interface CompanyDetail {
  id: number;
  nombre: string;
  codigoAcceso: string;
  plan?: CompanyPlan;
  fechaCreacion?: string;
}

export interface RegisterCompanyInput {
  companyName: string;
  adminName: string;
  adminEmail: string;
  password: string;
  plan?: CompanyPlan;
}

export interface RegisterCompanyResponse {
  message: string;
  empresa: {
    id: number;
    nombre: string;
    codigoAcceso: string;
    plan?: CompanyPlan;
  };
  administrador: {
    id: number;
    nombre: string;
    correo: string;
  };
}

export interface UpdateCompanyInput {
  nombre?: string;
}

export interface RegenerateAccessCodeResponse {
  id: number;
  nombre: string;
  codigoAcceso: string;
  mensaje: string;
}

export interface UpdateAdminProfileInput {
  nombre?: string;
  correo?: string;
  nombreEmpresa?: string;
  contraseñaActual?: string;
  nuevaContraseña?: string;
}

// Departamentos
export interface DepartmentItem {
  id: number;
  nombre: string;
  name?: string;
  companyId?: number;
  descripcion?: string | null;
  colaboradores?: number;
  scoreRiesgo?: number;
  _count?: {
    empleados?: number;
    usuarios?: number;
  };
}

// Empleados / Usuarios
export interface EmployeeSummaryItem {
  id: string; // UUIDv4
  nombre: string;
  name?: string;
  correo: string;
  email?: string;
  departamento?: string | { id?: number; nombre?: string } | null;
  departmentId?: number;
  departamentoId?: number;
  scoreRiesgo: number;
  score?: number;
  telefono?: string | null;
  phone?: string | null;
}

export interface EmployeeDetail {
  id?: string;
  nombre: string;
  name?: string;
  correo: string;
  email?: string;
  telefono: string | null;
  phone?: string | null;
  departmentId?: number;
  departamentoId?: number;
  departamento?: string | { id?: number; nombre?: string } | null;
  scoreRiesgo: number;
  score?: number;
  rachaDiasSeguros: number;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  phone?: string;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  departmentId?: number;
  phone?: string;
}

// Portales Simulados (Fase 2.5)
export type PortalTipoBase =
  | 'unjbg'
  | 'microsoft'
  | 'google'
  | 'bancario'
  | 'corporativo'
  | 'personalizado';

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

// Plantillas
export type AttackType = 'PHISHING' | 'SMISHING';
export type DifficultyLevel = 'BAJO' | 'MEDIO' | 'ALTO';
export type LandingTipo =
  | 'microsoft'
  | 'google'
  | 'corporativo'
  | 'bancario'
  | 'generico'
  | 'unjbg'
  | 'personalizado';

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

// Campañas
export type CampaignStatus = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type ShippingMethod = 'masivo' | 'escalonado';

export interface CampaignSummary {
  total: number;
  programadas: number;
  enCurso: number;
  finalizadas: number;
  canceladas: number;
}

export interface CampaignTemplateSummary {
  id: number;
  titulo: string;
  metodoAtaque: string;
}

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

export interface CampaignTemplateDetail {
  id: number;
  titulo: string;
  metodoAtaque: string;
  asunto: string | null;
  cuerpoHtml: string;
  indicadorDificultad: string | null;
}

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

export interface CampaignParticipantItem {
  usuarioId: string; // UUIDv4
  nombre: string;
  correo: string;
  departamento: string | null;
  estado: string;
}

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

// Rastreo y Simulaciones (Fase 2 y 2.5)
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

export interface TrackSubmitResponse {
  status: 'compromised';
  message: string;
  landingTipo: string;
  recomendaciones: string[];
}

export interface DispatchCampaignResponse {
  message: string;
  campaignId: string;
  totalTargets: number;
  mode: 'sandbox' | 'live';
}


export * from '@/types/analytics';
