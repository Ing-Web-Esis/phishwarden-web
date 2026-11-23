"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { EvolutionMetricItem } from '@/types/analytics';

interface EvolutionChartProps {
  data: EvolutionMetricItem[];
  isLoading?: boolean;
}

export function EvolutionChart({ data, isLoading }: EvolutionChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-96 flex flex-col justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  const hasData = data && data.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#283F50]" />
            <h2 className="text-lg font-semibold text-[#283F50]">
              Evolución Mensual de Seguridad y Respuesta
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tendencia de simulaciones enviadas, incidentes generados, reportes oportunos y lecciones completadas.
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-80 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm font-medium">No hay registros de evolución en el periodo seleccionado.</p>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="periodo"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '16px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="simulacionesEnviadas"
                name="Simulaciones enviadas"
                stroke="#283F50"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#283F50' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="incidentesSimulacion"
                name="Incidentes (clics + formularios)"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4, fill: '#EF4444' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="reportesSospechosos"
                name="Reportes sospechosos"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="leccionesCompletadas"
                name="Lecciones completadas"
                stroke="#E5A93C"
                strokeWidth={2}
                dot={{ r: 4, fill: '#E5A93C' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
