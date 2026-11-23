"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Send,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  Calendar,
  Layers,
  RefreshCw,
  Clock,
  PlayCircle,
  CheckCheck,
  Ban,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { analyticsService } from "@/services/analytics.service";
import type {
  AdminProfile,
  CampaignSummary,
  CampaignItem,
  PaginatedResponse,
} from "@/lib/types";
import type {
  ExecutiveSummaryResponse,
  EvolutionMetricItem,
} from "@/types/analytics";

function getMonthName(periodo: string): string {
  const parts = periodo.split("-");
  if (parts.length < 2) return periodo;
  const monthNum = parseInt(parts[1], 10);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNum - 1] || periodo;
}

export default function DashboardHomePage() {
  const [primerNombre, setPrimerNombre] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adminNombre");
      if (cached) return cached.split(" ")[0];
    }
    return "";
  });

  const [saludoHora, setSaludoHora] = useState<string>("Buenos días");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Estados de métricas reales
  const [summary, setSummary] = useState<ExecutiveSummaryResponse | null>(null);
  const [evolution, setEvolution] = useState<EvolutionMetricItem[]>([]);
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignItem[]>([]);
  const [windowMonths, setWindowMonths] = useState<number>(6);

  // Determinar saludo según hora del día
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) {
      setSaludoHora("Buenos días");
    } else if (hora < 19) {
      setSaludoHora("Buenas tardes");
    } else {
      setSaludoHora("Buenas noches");
    }
  }, []);

  const loadDashboardData = async (forcedEmpresaId?: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    let targetEmpresaId = forcedEmpresaId;
    if (!targetEmpresaId && typeof window !== "undefined") {
      const stored = localStorage.getItem("empresaId");
      if (stored) targetEmpresaId = Number(stored);
    }

    // Solo si no existe empresaId en localStorage (primer inicio de sesión), consultamos /auth/me como respaldo
    if (!targetEmpresaId) {
      try {
        const admin = await apiClient.get<AdminProfile>("/auth/me");
        const fullName = admin.nombre || admin.name || "Administrador";
        setPrimerNombre(fullName.split(" ")[0]);
        localStorage.setItem("adminNombre", fullName);

        const eid = admin.empresaId ?? admin.empresa?.id;
        if (eid) {
          targetEmpresaId = Number(eid);
          localStorage.setItem("empresaId", String(eid));
        }
      } catch (err) {
        console.error("Error al obtener sesión en dashboard:", err);
      }
    }

    if (!targetEmpresaId) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      // Disparo inmediato en paralelo sin bloqueos ni cascadas
      const [resumenData, evolucionData, campSummaryData, campListData] = await Promise.allSettled([
        analyticsService.getSummary(targetEmpresaId),
        analyticsService.getEvolution(targetEmpresaId),
        apiClient.get<CampaignSummary>(`/empresas/${targetEmpresaId}/campanas/resumen`),
        apiClient.get<PaginatedResponse<CampaignItem>>(`/empresas/${targetEmpresaId}/campanas`, {
          params: { page: 1, limit: 3 },
        }),
      ]);

      if (resumenData.status === "fulfilled") {
        setSummary(resumenData.value);
      }
      if (evolucionData.status === "fulfilled") {
        setEvolution(evolucionData.value || []);
      }
      if (campSummaryData.status === "fulfilled") {
        setCampaignSummary(campSummaryData.value);
      }
      if (campListData.status === "fulfilled") {
        setRecentCampaigns(campListData.value?.data || []);
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleSessionUpdate = () => {
      const cachedName = localStorage.getItem("adminNombre");
      if (cachedName) setPrimerNombre(cachedName.split(" ")[0]);
      const storedEmpresaId = localStorage.getItem("empresaId");
      if (storedEmpresaId) loadDashboardData(Number(storedEmpresaId));
    };
    window.addEventListener("phishwarden-session-updated", handleSessionUpdate);
    return () => {
      window.removeEventListener("phishwarden-session-updated", handleSessionUpdate);
    };
  }, []);

  // Procesamiento de datos de evolución para Recharts
  const evolutionChartData = useMemo(() => {
    if (!evolution || evolution.length === 0) return [];
    const sliced = evolution.slice(-windowMonths);
    return sliced.map((item) => {
      const porcentajeVulnerable =
        item.simulacionesEnviadas > 0
          ? Math.round((item.incidentesSimulacion / item.simulacionesEnviadas) * 1000) / 10
          : 0;
      return {
        periodo: item.periodo,
        mesLabel: getMonthName(item.periodo),
        porcentajeVulnerable,
        simulacionesEnviadas: item.simulacionesEnviadas,
        incidentesSimulacion: item.incidentesSimulacion,
        reportesSospechosos: item.reportesSospechosos,
      };
    });
  }, [evolution, windowMonths]);

  // Cálculo de variación del riesgo frente al mes anterior
  const variacionRiesgo = useMemo(() => {
    if (!evolution || evolution.length < 2) return null;
    const ultimoMes = evolution[evolution.length - 1];
    const mesAnterior = evolution[evolution.length - 2];

    const tasaActual =
      ultimoMes.simulacionesEnviadas > 0
        ? (ultimoMes.incidentesSimulacion / ultimoMes.simulacionesEnviadas) * 100
        : 0;
    const tasaPrevia =
      mesAnterior.simulacionesEnviadas > 0
        ? (mesAnterior.incidentesSimulacion / mesAnterior.simulacionesEnviadas) * 100
        : 0;

    const diff = Math.round((tasaActual - tasaPrevia) * 10) / 10;
    return diff;
  }, [evolution]);

  // Datos para gráfica Donut de nivel de vulnerabilidad
  const donutData = useMemo(() => {
    const dist = summary?.posturaRiesgo?.distribucion;
    const bajo = dist?.bajo || 0;
    const medio = dist?.medio || 0;
    const critico = dist?.critico || 0;

    return [
      { name: "Bajo riesgo (0-30)", value: bajo, color: "#10B981" },
      { name: "Riesgo medio (31-69)", value: medio, color: "#F59E0B" },
      { name: "Riesgo crítico (70-100)", value: critico, color: "#EF4444" },
    ];
  }, [summary]);

  const totalUsuarios =
    summary?.adopcionMovil?.totalColaboradores ??
    ((summary?.posturaRiesgo?.distribucion?.bajo || 0) +
      (summary?.posturaRiesgo?.distribucion?.medio || 0) +
      (summary?.posturaRiesgo?.distribucion?.critico || 0));

  const scoreRiesgoGlobal = summary?.posturaRiesgo?.scoreRiesgoPromedio ?? 0;

  // Campañas activas (en curso + programadas)
  const campanasActivasTotal =
    (campaignSummary?.enCurso || 0) + (campaignSummary?.programadas || 0);

  // Total de incidentes e interacciones vulnerables
  const totalIncidentes =
    (summary?.metricasSimulaciones?.totalClics || 0) +
    (summary?.metricasSimulaciones?.totalEnviosCredenciales || 0);

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "en_curso":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlayCircle className="w-3.5 h-3.5" /> En curso
          </span>
        );
      case "programada":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Programada
          </span>
        );
      case "finalizada":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCheck className="w-3.5 h-3.5" /> Finalizada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabecera dinámica y botón de recarga (Renderizado instantáneo) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">
            {saludoHora}, {primerNombre || "Administrador"}
          </h1>
          <p className="text-slate-500 mt-1">
            Esto es lo que ocurre con la postura de seguridad y concientización en tu organización.
          </p>
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            loadDashboardData();
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* 4 Tarjetas KPI Conectadas a Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Riesgo Global */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  scoreRiesgoGlobal <= 30
                    ? "bg-emerald-50 text-emerald-600"
                    : scoreRiesgoGlobal <= 69
                    ? "bg-amber-50 text-[#E5A93C]"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Riesgo Global
              </p>
            </div>
            {summary && (
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  scoreRiesgoGlobal <= 30
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : scoreRiesgoGlobal <= 69
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {scoreRiesgoGlobal <= 30 ? "Bajo" : scoreRiesgoGlobal <= 69 ? "Medio" : "Crítico"}
              </span>
            )}
          </div>
          <div>
            {isLoading && !summary ? (
              <div className="space-y-2 py-1">
                <div className="h-8 bg-slate-100 rounded w-20 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded w-32 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-[#283F50]">{scoreRiesgoGlobal}</h2>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="mt-2 text-xs flex items-center gap-1 font-medium">
                  {variacionRiesgo === null ? (
                    <span className="text-slate-400">Sin variación mensual previa</span>
                  ) : variacionRiesgo < 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {Math.abs(variacionRiesgo)}% <span className="text-slate-400 font-normal">vs. mes anterior</span>
                    </span>
                  ) : variacionRiesgo > 0 ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{variacionRiesgo}% <span className="text-slate-400 font-normal">vs. mes anterior</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Minus className="h-3.5 w-3.5" />
                      Estable <span className="text-slate-400 font-normal">vs. mes anterior</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI 2: Usuarios Evaluados */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Usuarios Evaluados
              </p>
            </div>
          </div>
          <div>
            {isLoading && !summary ? (
              <div className="space-y-2 py-1">
                <div className="h-8 bg-slate-100 rounded w-24 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded w-44 animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#283F50]">
                  {totalUsuarios.toLocaleString()}
                </h2>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-[#283F50]">
                    {summary?.adopcionMovil?.colaboradoresVinculados ?? 0}
                  </span>{" "}
                  con app móvil vinculada ({summary?.adopcionMovil?.tasaAdopcion ?? 0}%)
                </p>
              </>
            )}
          </div>
        </div>

        {/* KPI 3: Campañas Activas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Send className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Campañas Activas
              </p>
            </div>
          </div>
          <div>
            {isLoading && !campaignSummary ? (
              <div className="space-y-2 py-1">
                <div className="h-8 bg-slate-100 rounded w-16 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded w-36 animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#283F50]">
                  {String(campanasActivasTotal).padStart(2, "0")}
                </h2>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-emerald-600">{campaignSummary?.enCurso ?? 0} en curso</span>
                  {" · "}
                  <span className="font-semibold text-blue-600">{campaignSummary?.programadas ?? 0} programadas</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Incidentes y Reportes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#E5A93C]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Interacciones Vulnerables
              </p>
            </div>
          </div>
          <div>
            {isLoading && !summary ? (
              <div className="space-y-2 py-1">
                <div className="h-8 bg-slate-100 rounded w-20 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded w-40 animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#283F50]">{totalIncidentes}</h2>
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-emerald-600">
                    {summary?.metricasSimulaciones?.totalReportes ?? 0}
                  </span>{" "}
                  reportes de sospecha recibidos
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución del riesgo (Recharts AreaChart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#283F50]">Evolución del riesgo</h3>
              <p className="text-sm text-slate-500">Porcentaje mensual de interacción vulnerable en simulaciones</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
              <button
                onClick={() => setWindowMonths(3)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  windowMonths === 3 ? "bg-white text-[#283F50] shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Últimos 3 meses
              </button>
              <button
                onClick={() => setWindowMonths(6)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  windowMonths === 6 ? "bg-white text-[#283F50] shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Últimos 6 meses
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {isLoading && evolutionChartData.length === 0 ? (
              <div className="h-full w-full flex flex-col justify-end gap-3 p-4 bg-slate-50/50 rounded-lg animate-pulse">
                <div className="h-40 bg-slate-100 rounded-lg w-full" />
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-3 w-8 bg-slate-200 rounded" />
                  ))}
                </div>
              </div>
            ) : evolutionChartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <p className="text-sm">No hay registros de evolución en el periodo seleccionado.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionChartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E5A93C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="mesLabel"
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#283F50] text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-[#E5A93C]">{data.periodo}</p>
                            <p className="text-slate-200">
                              Interacción vulnerable: <span className="font-bold">{data.porcentajeVulnerable}%</span>
                            </p>
                            <p className="text-slate-300 text-[11px]">
                              {data.incidentesSimulacion} incidentes de {data.simulacionesEnviadas} envíos
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="porcentajeVulnerable"
                    stroke="#E5A93C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Nivel de vulnerabilidad (Recharts Pie Donut) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#283F50]">Nivel de vulnerabilidad</h3>
            <p className="text-sm text-slate-500">Distribución de riesgo en la organización</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            {isLoading && !summary ? (
              <div className="h-48 w-full flex flex-col items-center justify-center gap-3 animate-pulse">
                <div className="h-32 w-32 rounded-full border-8 border-slate-100" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            ) : (
              <div className="relative h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} colaboradores (${totalUsuarios > 0 ? Math.round((Number(value) / totalUsuarios) * 100) : 0}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[#283F50]">{totalUsuarios.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-medium">usuarios</span>
                </div>
              </div>
            )}

            <div className="w-full space-y-2.5 mt-2">
              {donutData.map((item, idx) => {
                const count = item.value;
                const pct = totalUsuarios > 0 ? Math.round((count / totalUsuarios) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-normal">({count})</span>
                      <span className="font-bold text-[#283F50]">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actividades y Campañas Recientes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#283F50]">Campañas recientes</h3>
            <p className="text-sm text-slate-500">Últimos simulacros registrados en la plataforma</p>
          </div>
          <Link
            href="/dashboard/campanas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A93C] hover:text-[#c48e2b] transition-colors"
          >
            Ver todas las campañas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading && recentCampaigns.length === 0 ? (
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentCampaigns.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
            <p className="text-sm">No se han registrado campañas de simulación aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCampaigns.map((camp) => (
              <div key={camp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#283F50] flex-shrink-0 mt-0.5">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#283F50]">{camp.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="capitalize">{camp.shippingMethod?.replace("_", " ")}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {camp.scheduledDate ? new Date(camp.scheduledDate).toLocaleDateString() : "Sin fecha"}
                      </span>
                      <span>·</span>
                      <span>{camp.totalParticipants || 0} destinatarios</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(camp.status)}
                  <Link
                    href={`/dashboard/campanas`}
                    className="p-1.5 text-slate-400 hover:text-[#283F50] hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
