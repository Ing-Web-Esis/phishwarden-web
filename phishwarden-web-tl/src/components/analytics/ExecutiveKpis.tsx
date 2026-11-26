"use client";

import { Shield, Smartphone, Send, GraduationCap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ExecutiveSummaryResponse, RiskLevel } from '@/types/analytics';

interface ExecutiveKpisProps {
  data: ExecutiveSummaryResponse | null;
  isLoading?: boolean;
}

function getRiskBadge(level: RiskLevel) {
  switch (level) {
    case 'bajo':
      return {
        label: 'Riesgo bajo',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barClass: 'bg-emerald-500',
      };
    case 'medio':
      return {
        label: 'Riesgo medio',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        barClass: 'bg-amber-500',
      };
    case 'critico':
      return {
        label: 'Riesgo crítico',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        barClass: 'bg-rose-500',
      };
    default:
      return {
        label: 'Sin evaluar',
        className: 'bg-slate-50 text-slate-700 border-slate-200',
        barClass: 'bg-slate-400',
      };
  }
}

export function ExecutiveKpis({ data, isLoading }: ExecutiveKpisProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-48 flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-3 bg-slate-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const { posturaRiesgo, adopcionMovil, metricasSimulaciones, metricasCapacitacion } = data;
  const riskBadge = getRiskBadge(posturaRiesgo.nivelRiesgoGlobal);
  const totalUsersDist =
    posturaRiesgo.distribucion.bajo +
    posturaRiesgo.distribucion.medio +
    posturaRiesgo.distribucion.critico;

  const pctBajo = totalUsersDist > 0 ? (posturaRiesgo.distribucion.bajo / totalUsersDist) * 100 : 0;
  const pctMedio = totalUsersDist > 0 ? (posturaRiesgo.distribucion.medio / totalUsersDist) * 100 : 0;
  const pctCritico = totalUsersDist > 0 ? (posturaRiesgo.distribucion.critico / totalUsersDist) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Postura de Riesgo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#283F50]">
                <Shield className="h-5 w-5 text-[#E5A93C]" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Postura de Riesgo
              </span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${riskBadge.className}`}
            >
              {riskBadge.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#283F50]">
              {posturaRiesgo.scoreRiesgoPromedio}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100 pts</span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Escala normalizada (0 = seguro, 100 = crítico)
          </p>
        </div>

        {/* Barra de distribución por tramos */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${pctBajo}%` }}
              title={`Bajo: ${posturaRiesgo.distribucion.bajo}`}
              className="bg-emerald-500 h-full"
            />
            <div
              style={{ width: `${pctMedio}%` }}
              title={`Medio: ${posturaRiesgo.distribucion.medio}`}
              className="bg-amber-500 h-full"
            />
            <div
              style={{ width: `${pctCritico}%` }}
              title={`Crítico: ${posturaRiesgo.distribucion.critico}`}
              className="bg-rose-500 h-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Bajo: {posturaRiesgo.distribucion.bajo}</span>
            <span>Medio: {posturaRiesgo.distribucion.medio}</span>
            <span>Crítico: {posturaRiesgo.distribucion.critico}</span>
          </div>
        </div>
      </div>

      {/* 2. Adopción App Móvil */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Adopción Móvil
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
              {adopcionMovil.tasaAdopcion}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#283F50]">
              {adopcionMovil.colaboradoresVinculados}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              de {adopcionMovil.totalColaboradores} colaboradores
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Usuarios activos con app vinculada y push
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(adopcionMovil.tasaAdopcion, 100)}%` }}
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-1.5">
            <span>Vinculados</span>
            <span>{adopcionMovil.tasaAdopcion}% cobertura</span>
          </div>
        </div>
      </div>

      {/* 3. Rendimiento de Simulaciones */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#E5A93C]">
                <Send className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulaciones
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {metricasSimulaciones.totalCampanas} campañas
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#283F50]">
              {metricasSimulaciones.tasaClic}%
            </span>
            <span className="text-xs text-rose-500 font-semibold">tasa de clic</span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            {metricasSimulaciones.totalEnvios} envíos totales realizados
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Compromiso</span>
            <span className="font-bold text-rose-600">
              {metricasSimulaciones.tasaCompromisoCredenciales}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Reporte Temprano</span>
            <span className="font-bold text-emerald-600">
              {metricasSimulaciones.tasaReporteTemprano}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Avance de Capacitación */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Capacitación
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
              {metricasCapacitacion.tasaAprobacion}% éxito
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#283F50]">
              {metricasCapacitacion.totalLeccionesCompletadas}
            </span>
            <span className="text-xs text-slate-400 font-medium">completadas</span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Microlecciones aprobadas en evaluaciones
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-amber-600 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Pendientes: {metricasCapacitacion.totalLeccionesPendientes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Reprobadas: {metricasCapacitacion.totalLeccionesReprobadas}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
