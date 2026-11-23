"use client";

import { Calendar, FileText, RotateCcw } from 'lucide-react';

interface AnalyticsHeaderProps {
  desde: string;
  hasta: string;
  onDesdeChange: (value: string) => void;
  onHastaChange: (value: string) => void;
  onResetFilters: () => void;
  onExportPdf: () => void;
  isExporting?: boolean;
}

export function AnalyticsHeader({
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onResetFilters,
  onExportPdf,
  isExporting = false,
}: AnalyticsHeaderProps) {
  const isInvalidRange = Boolean(desde && hasta && desde > hasta);
  const hasActiveFilters = Boolean(desde || hasta);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-[#283F50] tracking-tight">
          Reportes Ejecutivos y Analítica
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Postura global de riesgo organizacional, efectividad de simulaciones y métricas de concientización.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Selector de Fecha Desde */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#E5A93C]/40 focus-within:border-[#E5A93C]">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Desde:</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => onDesdeChange(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
          />
        </div>

        {/* Selector de Fecha Hasta */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#E5A93C]/40 focus-within:border-[#E5A93C]">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Hasta:</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => onHastaChange(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
          />
        </div>

        {/* Botón Restablecer Filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            title="Restablecer fechas"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
        )}

        {/* Botón Exportar PDF */}
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting || isInvalidRange}
          className="flex items-center gap-2 px-4 py-2 bg-[#283F50] hover:bg-[#1e303d] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <FileText className="h-4 w-4 text-[#E5A93C]" />
          <span>Exportar Reporte PDF</span>
        </button>
      </div>

      {isInvalidRange && (
        <div className="w-full text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md mt-2">
          La fecha inicial no puede ser posterior a la fecha final.
        </div>
      )}
    </div>
  );
}
