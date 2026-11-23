"use client";

import { Mail, MessageSquare, Target } from 'lucide-react';
import type { AttackVectorMetricItem } from '@/types/analytics';

interface AttackVectorCardsProps {
  data: AttackVectorMetricItem[];
  isLoading?: boolean;
}

const VECTOR_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  phishing: {
    label: 'Correo Electrónico (Phishing)',
    icon: Mail,
  },
  smishing: {
    label: 'Mensajería SMS (Smishing)',
    icon: MessageSquare,
  },
};

export function AttackVectorCards({ data, isLoading }: AttackVectorCardsProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filtrar exclusivamente Phishing y Smishing (sin vishing ni pretexting)
  const visibleVectors = (data || []).filter(
    (item) => item.metodoAtaque === 'phishing' || item.metodoAtaque === 'smishing',
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#283F50]" />
            <h2 className="text-lg font-semibold text-[#283F50]">
              Efectividad y Susceptibilidad por Vector de Ataque
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Desempeño y tasas de interacción ante vectores principales de ingeniería social (Phishing y Smishing).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleVectors.map((item) => {
          const config = VECTOR_CONFIG[item.metodoAtaque] || {
            label: item.metodoAtaque,
            icon: Target,
          };
          const IconComponent = config.icon;

          return (
            <div
              key={item.metodoAtaque}
              className="p-6 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between hover:border-slate-200 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#283F50] shadow-sm">
                    <IconComponent className="h-5 w-5 text-[#E5A93C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#283F50]">
                      {config.label}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Canal de simulación activa
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-white rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                      Tasa de clic
                    </span>
                    <span className="text-2xl font-extrabold text-amber-600">
                      {item.tasaClic}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.totalClics} de {item.totalEnvios} envíos
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                      Compromiso
                    </span>
                    <span className="text-2xl font-extrabold text-rose-600">
                      {item.tasaCompromiso}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.totalEnviosCredenciales} formularios
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex justify-between text-xs text-slate-500 font-medium">
                <span>Total envíos: <strong className="text-[#283F50]">{item.totalEnvios}</strong></span>
                <span>Clics: <strong className="text-amber-600">{item.totalClics}</strong></span>
                <span>Credenciales: <strong className="text-rose-600">{item.totalEnviosCredenciales}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
