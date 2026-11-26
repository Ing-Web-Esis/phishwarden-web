"use client";

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { generateExecutivePdfReport } from '@/services/pdf-report.helper';
import { apiClient } from '@/lib/api-client';
import type { AdminProfile } from '@/lib/types';
import type {
  ExecutiveSummaryResponse,
  DepartmentMetricItem,
  AttackVectorMetricItem,
  EvolutionMetricItem,
  FeaturedUsersResponse,
  AnalyticsDateRangeFilter,
} from '@/types/analytics';

import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { ExecutiveKpis } from '@/components/analytics/ExecutiveKpis';
import { EvolutionChart } from '@/components/analytics/EvolutionChart';
import { DepartmentComparisonTable } from '@/components/analytics/DepartmentComparisonTable';
import { AttackVectorCards } from '@/components/analytics/AttackVectorCards';
import { FeaturedUsersPanels } from '@/components/analytics/FeaturedUsersPanels';

export default function AnalyticsReportesPage() {
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('Mi Organización');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [summary, setSummary] = useState<ExecutiveSummaryResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentMetricItem[]>([]);
  const [vectors, setVectors] = useState<AttackVectorMetricItem[]>([]);
  const [evolution, setEvolution] = useState<EvolutionMetricItem[]>([]);
  const [featured, setFeatured] = useState<FeaturedUsersResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Resolver empresaId y nombre de organización
  useEffect(() => {
    const resolveCompany = async () => {
      try {
        const me = await apiClient.get<AdminProfile>('/auth/me');
        const resolved = me.empresaId ?? me.empresa?.id;
        if (resolved) {
          localStorage.setItem('empresaId', String(resolved));
          setEmpresaId(resolved);
        }
        if (me.empresa?.nombre) {
          setCompanyName(me.empresa.nombre);
        }
      } catch (err) {
        console.error('Error al resolver la empresa para analítica:', err);
        const stored = localStorage.getItem('empresaId');
        if (stored && !isNaN(Number(stored))) {
          setEmpresaId(Number(stored));
        } else {
          setError('No se pudo identificar la organización del administrador autenticado.');
          setIsLoading(false);
        }
      }
    };

    resolveCompany();
  }, []);

  // 2. Cargar los datos de analítica de forma agregada y paralela
  const loadData = useCallback(
    async (id: number, filter?: AnalyticsDateRangeFilter) => {
      setIsLoading(true);
      setError(null);

      try {
        const [sumRes, deptRes, vecRes, evoRes, featRes] = await Promise.all([
          analyticsService.getSummary(id, filter),
          analyticsService.getDepartments(id, filter),
          analyticsService.getVectors(id, filter),
          analyticsService.getEvolution(id, filter),
          analyticsService.getFeaturedUsers(id, filter),
        ]);

        setSummary(sumRes);
        setDepartments(deptRes);
        setVectors(vecRes);
        setEvolution(evoRes);
        setFeatured(featRes);
      } catch (err: unknown) {
        console.error('Error al cargar analítica ejecutiva:', err);
        const msg =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar los indicadores de analítica.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 3. Efecto disparador según empresaId y filtros
  useEffect(() => {
    if (!empresaId) return;

    if (desde && hasta && desde > hasta) {
      return;
    }

    const filter: AnalyticsDateRangeFilter = {};
    if (desde) filter.desde = desde;
    if (hasta) filter.hasta = hasta;

    loadData(empresaId, filter);
  }, [empresaId, desde, hasta, loadData]);

  // 4. Manejadores de interacción
  const handleResetFilters = () => {
    setDesde('');
    setHasta('');
  };

  const handleExportPdf = () => {
    generateExecutivePdfReport({
      companyName,
      dateRange: {
        desde: desde || undefined,
        hasta: hasta || undefined,
      },
      summary,
      departments,
      vectors,
      featured,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Barra Superior con Controles de Fecha y Exportación a PDF */}
      <AnalyticsHeader
        desde={desde}
        hasta={hasta}
        onDesdeChange={setDesde}
        onHastaChange={setHasta}
        onResetFilters={handleResetFilters}
        onExportPdf={handleExportPdf}
      />

      {/* Alerta de Error si ocurre */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {empresaId && (
            <button
              onClick={() => {
                const filter: AnalyticsDateRangeFilter = {};
                if (desde) filter.desde = desde;
                if (hasta) filter.hasta = hasta;
                loadData(empresaId, filter);
              }}
              className="flex items-center gap-1 font-semibold underline hover:text-rose-900"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reintentar</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Tarjetas KPI de Resumen Ejecutivo y Postura de Riesgo */}
      <ExecutiveKpis data={summary} isLoading={isLoading} />

      {/* 2. Gráfico de Evolución Temporal con Recharts */}
      <EvolutionChart data={evolution} isLoading={isLoading} />

      {/* 3. Tabla Comparativa por Departamento */}
      <DepartmentComparisonTable data={departments} isLoading={isLoading} />

      {/* 4. Tarjetas de Efectividad por Vector de Ataque (Phishing y Smishing) */}
      <AttackVectorCards data={vectors} isLoading={isLoading} />

      {/* 5. Paneles Top 5: Mayor Riesgo y Mejores Defensores */}
      <FeaturedUsersPanels data={featured} isLoading={isLoading} />
    </div>
  );
}
