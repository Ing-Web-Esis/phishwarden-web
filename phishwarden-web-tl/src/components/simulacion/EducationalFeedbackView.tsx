"use client";

import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Lock } from "lucide-react";
import type { SimulationContext } from "@/lib/types";

interface EducationalFeedbackViewProps {
  message?: string;
  landingTipo?: string;
  recomendaciones?: string[];
  simulationContext?: SimulationContext | null;
  onAcknowledge?: () => void;
}

export function EducationalFeedbackView({
  message = "Has ingresado credenciales en una prueba de concientización de seguridad de tu organización.",
  landingTipo,
  recomendaciones = [],
  simulationContext,
  onAcknowledge,
}: EducationalFeedbackViewProps) {
  const empresaNombre = simulationContext?.nombreEmpresa || "tu organización";

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 text-slate-800 font-sans antialiased p-4 sm:p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header de Alerta Educativa PhishWarden */}
          <div className="bg-[#283F50] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-9 w-9 text-amber-400" />
            </div>
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Simulación de Seguridad Controlada</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                ¡Esta página era una prueba preventiva!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Banner de Garantía Zero-Credential */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Política de Privacidad y Zero-Credential Storage
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Tranquilo: <strong>tu contraseña real jamás fue guardada, transmitida ni leída</strong>. PhishWarden solo registra la interacción para propósitos de capacitación y fortalecimiento de la seguridad institucional.
                </p>
              </div>
            </div>

            {/* Metadatos del Ataque Simulado */}
            {simulationContext && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-xs font-bold text-[#283F50] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#E5A93C]" />
                  Análisis del Ejercicio de Ingeniería Social
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Organización:</span>
                    <p className="font-semibold text-slate-800">{empresaNombre}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Canal Utilizado:</span>
                    <p className="font-semibold text-slate-800 uppercase">{simulationContext.metodoAtaque}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Plantilla Señuelo:</span>
                    <p className="font-semibold text-slate-800">{simulationContext.tituloPlantilla}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nivel de Dificultad:</span>
                    <p className="font-semibold text-slate-800 capitalize">{simulationContext.indicadorDificultad || "Medio"}</p>
                  </div>
                  {simulationContext.asunto && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Asunto del Mensaje:</span>
                      <p className="font-medium text-slate-700 italic">"{simulationContext.asunto}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Consejos y Recomendaciones Preventivas */}
            <div>
              <h3 className="text-xs font-bold text-[#283F50] uppercase tracking-wider mb-3">
                ¿Cómo protegerte ante un ataque real?
              </h3>
              <div className="space-y-2.5">
                {(recomendaciones.length > 0
                  ? recomendaciones
                  : [
                      "Verifica siempre la URL y el certificado SSL del sitio antes de ingresar tus contraseñas.",
                      "Nunca proporciones tus credenciales corporativas en enlaces recibidos por correos o SMS imprevistos.",
                      "Comunícate inmediatamente con el área de TI o Ciberseguridad de tu organización ante cualquier sospecha.",
                    ]
                ).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de cierre o acuse */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onAcknowledge || (() => window.close())}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#283F50] hover:bg-[#1e303d] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Comprendido, estaré más alerta</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer PhishWarden Concientización */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Shield className="h-3.5 w-3.5 text-[#E5A93C]" />
        <span>PhishWarden • Programa Continuo de Concientización en Ciberseguridad</span>
      </footer>
    </div>
  );
}
