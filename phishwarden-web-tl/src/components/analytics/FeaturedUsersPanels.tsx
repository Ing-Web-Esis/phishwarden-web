"use client";

import { AlertTriangle, Award, ShieldCheck, Flame } from 'lucide-react';
import type { FeaturedUsersResponse, RiskLevel } from '@/types/analytics';

interface FeaturedUsersPanelsProps {
  data: FeaturedUsersResponse | null;
  isLoading?: boolean;
}

function getRiskBadge(level: RiskLevel) {
  switch (level) {
    case 'bajo':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'medio':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'critico':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function FeaturedUsersPanels({
  data,
  isLoading,
}: FeaturedUsersPanelsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-80"
          >
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-10 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { mayorRiesgo, mejoresDefensores } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel 1: Intervención Prioritaria */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#283F50]">
                  Intervención Prioritaria
                </h3>
                <p className="text-xs text-slate-400">
                  Colaboradores con mayor vulnerabilidad y fallos recurrentes
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Top 5 Crítico
            </span>
          </div>

          {mayorRiesgo.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No se registran usuarios con incidentes críticos.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {mayorRiesgo.map((user, idx) => (
                <div
                  key={user.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[11px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#283F50] truncate">
                        {user.nombre}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.correo} • {user.departamento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    <div className="text-right">
                      <span className="block font-bold text-rose-600">
                        {user.simulacionesFallidas} fallos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {user.scoreRiesgo} pts
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getRiskBadge(
                        user.nivelRiesgo,
                      )}`}
                    >
                      {user.nivelRiesgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Líderes de Seguridad */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#283F50]">
                  Líderes de Seguridad
                </h3>
                <p className="text-xs text-slate-400">
                  Colaboradores con mayor compromiso, reportes y racha segura
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Top 5 Defensores
            </span>
          </div>

          {mejoresDefensores.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              Aún no hay registros de líderes de seguridad en el periodo.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {mejoresDefensores.map((user, idx) => (
                <div
                  key={user.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-[11px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#283F50] truncate">
                        {user.nombre}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.correo} • {user.departamento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <div className="text-right">
                      <span className="block font-bold text-[#E5A93C]">
                        {user.puntosCapacitacion} pts
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {user.reportesRealizados} reportes
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] text-slate-600 font-medium" title="Racha de días seguros">
                      <Flame className="h-3 w-3 text-amber-500" />
                      <span>{user.rachaDiasSeguros}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
