"use client";

import { Link2Off, ArrowLeft } from "lucide-react";

interface InvalidSimulationViewProps {
  message?: string;
}

export function InvalidSimulationView({
  message = "El enlace de verificación al que intenta acceder no es válido, ha caducado o el recurso no se encuentra disponible.",
}: InvalidSimulationViewProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-100 text-slate-800 font-sans antialiased p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-slate-100 text-slate-500 mb-4">
            <Link2Off className="h-7 w-7 text-slate-600" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Enlace no disponible
          </h1>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {message}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Regresar</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 text-center text-xs text-slate-400">
        <p>Servicio de Verificación de Enlaces Seguros</p>
      </footer>
    </div>
  );
}
