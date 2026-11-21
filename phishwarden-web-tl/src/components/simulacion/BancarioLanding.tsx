"use client";

import { useState } from "react";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";

interface BancarioLandingProps {
  onSubmit: () => void;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function BancarioLanding({
  onSubmit,
  nombreEmpresa,
  submitting = false,
}: BancarioLandingProps) {
  const [documento, setDocumento] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente de la memoria React antes de notificar
    setPassword("");
    onSubmit();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-100 text-slate-800 font-sans antialiased">
      {/* Barra superior de seguridad bancaria */}
      <header className="w-full bg-[#002f6c] text-white py-3.5 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wide uppercase">
                {nombreEmpresa ? `Banca Digital • ${nombreEmpresa}` : "Portal de Seguridad Bancaria"}
              </span>
              <p className="text-[10px] text-slate-300">Validación de Canales Digitales y Transferencias</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-mono text-[11px]">SSL 256-Bit TLS Seguro</span>
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Banner preventivo */}
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Verificación preventiva requerida
              </h2>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Por actualización de protocolos antifraude, ingrese sus datos de acceso para confirmar la operatividad de sus cuentas.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Documento o Tarjeta
                </label>
                <input
                  type="text"
                  required
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej. 12345678 o 4557 0000 0000 0000"
                  autoComplete="off"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clave de Internet o Token Digital
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/20 transition-all font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-[#002f6c] hover:bg-[#002454] active:bg-[#001c40] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>{submitting ? "Validando credenciales..." : "Validar y Desbloquear Acceso"}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Transacción protegida por estándares PCI-DSS y Tokenización</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bancario */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>© {new Date().getFullYear()} Red de Protección Financiera. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
