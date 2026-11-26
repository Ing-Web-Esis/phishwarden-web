import { apiClient } from '@/lib/api-client';
import type {
  ExecutiveSummaryResponse,
  DepartmentMetricItem,
  AttackVectorMetricItem,
  EvolutionMetricItem,
  FeaturedUsersResponse,
  AnalyticsDateRangeFilter,
} from '@/types/analytics';

function buildQueryString(params?: AnalyticsDateRangeFilter): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.desde) searchParams.set('desde', params.desde);
  if (params.hasta) searchParams.set('hasta', params.hasta);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const analyticsService = {
  getSummary: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<ExecutiveSummaryResponse>(
      `/empresas/${empresaId}/analytics/resumen${buildQueryString(params)}`,
    ),

  getDepartments: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<DepartmentMetricItem[]>(
      `/empresas/${empresaId}/analytics/departamentos${buildQueryString(params)}`,
    ),

  getVectors: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<AttackVectorMetricItem[]>(
      `/empresas/${empresaId}/analytics/vectores${buildQueryString(params)}`,
    ),

  getEvolution: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<EvolutionMetricItem[]>(
      `/empresas/${empresaId}/analytics/evolucion${buildQueryString(params)}`,
    ),

  getFeaturedUsers: (empresaId: number, params?: AnalyticsDateRangeFilter) =>
    apiClient.get<FeaturedUsersResponse>(
      `/empresas/${empresaId}/analytics/usuarios-destacados${buildQueryString(params)}`,
    ),

  downloadCsv: async (
    empresaId: number,
    params?: AnalyticsDateRangeFilter,
  ): Promise<void> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const cleanBase = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    ).replace(/\/+$/, '');
    const url = `${cleanBase}/empresas/${empresaId}/analytics/exportar${buildQueryString(params)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      let errorMessage = `Error ${res.status} al descargar el archivo`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.message) {
          errorMessage = Array.isArray(errJson.message)
            ? errJson.message.join(', ')
            : errJson.message;
        }
      } catch {
        // Fallback a statusText
      }
      throw new Error(errorMessage);
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
