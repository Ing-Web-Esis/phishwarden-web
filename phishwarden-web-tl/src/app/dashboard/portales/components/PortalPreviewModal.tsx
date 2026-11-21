"use client";

import { useState } from "react";
import { X, Eye, CheckCircle2, RotateCcw } from "lucide-react";
import { MicrosoftLanding } from "@/components/simulacion/MicrosoftLanding";
import { GoogleLanding } from "@/components/simulacion/GoogleLanding";
import { BancarioLanding } from "@/components/simulacion/BancarioLanding";
import { CorporativoLanding } from "@/components/simulacion/CorporativoLanding";
import { UnjbgLanding } from "@/components/simulacion/UnjbgLanding";
import { CustomBrandedLanding } from "@/components/simulacion/CustomBrandedLanding";
import type { PortalSimuladoItem, PortalConfig } from "@/lib/types";

interface PortalPreviewModalProps {
  portal: PortalSimuladoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PortalPreviewModal({
  portal,
  isOpen,
  onClose,
}: PortalPreviewModalProps) {
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  if (!isOpen || !portal) return null;

  // Precisión técnica 3: Reutilización directa de los componentes de simulación
  const handleDemoSubmit = () => {
    setDemoSubmitted(true);
  };

  const handleResetDemo = () => {
    setDemoSubmitted(false);
  };

  const portalConfig: PortalConfig = {
    id: portal.id,
    nombre: portal.nombre,
    tipoBase: portal.tipoBase,
    tituloPortal: portal.tituloPortal,
    subtitulo: portal.subtitulo ?? null,
    logoUrl: portal.logoUrl ?? null,
    colorPrimario: portal.colorPrimario,
    colorFondo: portal.colorFondo,
    labelUsuario: portal.labelUsuario,
    labelPassword: portal.labelPassword,
    textoBoton: portal.textoBoton,
  };

  const renderLandingComponent = () => {
    const tipo = portal.tipoBase?.toLowerCase();

    switch (tipo) {
      case "unjbg":
        return (
          <UnjbgLanding
            onSubmit={handleDemoSubmit}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );

      case "microsoft":
        return (
          <MicrosoftLanding
            onSubmit={handleDemoSubmit}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );

      case "google":
        return (
          <GoogleLanding
            onSubmit={handleDemoSubmit}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );

      case "bancario":
        return (
          <BancarioLanding
            onSubmit={handleDemoSubmit}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );

      case "corporativo":
        return (
          <CorporativoLanding
            onSubmit={handleDemoSubmit}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );

      case "personalizado":
      default:
        return (
          <CustomBrandedLanding
            onSubmit={handleDemoSubmit}
            portalConfig={portalConfig}
            nombreEmpresa={portal.subtitulo || undefined}
            submitting={false}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Barra Superior de Control de la Demostración */}
      <header className="h-14 bg-slate-900 text-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Eye className="h-3.5 w-3.5" />
            <span>Modo Demostración</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-slate-200">
              {portal.nombre}
            </span>
            <span className="text-xs text-slate-400 ml-2 font-mono">
              ({portal.tipoBase})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {demoSubmitted && (
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar prueba</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors border border-white/10 cursor-pointer font-medium"
          >
            <X className="h-4 w-4" />
            <span>Cerrar</span>
          </button>
        </div>
      </header>

      {/* Alerta flotante cuando el usuario envía el formulario en la demo */}
      {demoSubmitted && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2 shadow-md shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-200" />
          <span>
            Simulación de captura registrada exitosamente en modo demostración. No se enviaron credenciales reales.
          </span>
        </div>
      )}

      {/* Renderizado de la Landing en pantalla completa */}
      <div className="flex-1 overflow-y-auto">
        {renderLandingComponent()}
      </div>
    </div>
  );
}
