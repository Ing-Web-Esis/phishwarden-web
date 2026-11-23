"use client";

import { Building2 } from 'lucide-react';
import type { DepartmentMetricItem, RiskLevel } from '@/types/analytics';

interface DepartmentComparisonTableProps {
  data: DepartmentMetricItem[];
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

export function DepartmentComparisonTable({
  data,
  isLoading,
}: DepartmentComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = data && data.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#283F50]" />
            <h2 className="text-lg font-semibold text-[#283F50]">
              Postura de Riesgo y Vulnerabilidad por Departamento
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparativa ordenada por áreas con mayor exposición y tasa de interacción vulnerable.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          {data.length} áreas evaluadas
        </span>
      </div>

      {!hasData ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm font-medium">No hay datos departamentales para el rango seleccionado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Departamento</th>
                <th className="pb-3 text-center">Colaboradores</th>
                <th className="pb-3 text-center">Score Promedio</th>
                <th className="pb-3 text-center">Nivel de Riesgo</th>
                <th className="pb-3 text-center">Simulaciones</th>
                <th className="pb-3 text-center">Clics</th>
                <th className="pb-3 text-center">Credenciales</th>
                <th className="pb-3 text-left min-w-[130px]">Tasa Vulnerabilidad</th>
                <th className="pb-3 text-center">Reportes</th>
                <th className="pb-3 text-center pr-2">Lecciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((dept, idx) => (
                <tr
                  key={dept.departamentoId ?? `sin-dept-${idx}`}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 pl-2 font-semibold text-[#283F50]">
                    {dept.departamento || 'Sin departamento'}
                  </td>
                  <td className="py-3.5 text-center text-slate-600 font-medium">
                    {dept.totalColaboradores}
                  </td>
                  <td className="py-3.5 text-center font-bold text-[#283F50]">
                    {dept.scoreRiesgoPromedio}
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getRiskBadge(
                        dept.nivelRiesgo,
                      )}`}
                    >
                      {dept.nivelRiesgo}
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-slate-600">
                    {dept.simulacionesRecibidas}
                  </td>
                  <td className="py-3.5 text-center text-amber-600 font-semibold">
                    {dept.clicsEnSimulacion}
                  </td>
                  <td className="py-3.5 text-center text-rose-600 font-semibold">
                    {dept.credencialesComprometidas}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(dept.tasaVulnerabilidad, 100)}%` }}
                          className={`h-full rounded-full ${
                            dept.tasaVulnerabilidad > 30
                              ? 'bg-rose-500'
                              : dept.tasaVulnerabilidad > 15
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#283F50] w-9 text-right">
                        {dept.tasaVulnerabilidad}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-center text-emerald-600 font-semibold">
                    {dept.reportesRealizados}
                  </td>
                  <td className="py-3.5 text-center pr-2 text-slate-700 font-medium">
                    {dept.leccionesCompletadas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
