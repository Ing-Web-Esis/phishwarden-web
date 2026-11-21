"use client";

import { useState } from "react";
import { Building2, Key, Shield } from "lucide-react";

interface CorporativoLandingProps {
  onSubmit: () => void;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function CorporativoLanding({
  onSubmit,
  nombreEmpresa,
  submitting = false,
}: CorporativoLandingProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente de la memoria React antes de notificar
    setPassword("");
    onSubmit();
  };

  const empresaDisplay = nombreEmpresa || "Portal de Acceso Corporativo";

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#1e293b] text-slate-100 font-sans antialiased">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] bg-white text-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200">
          {/* Header Corporativo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-900 text-white mb-3 shadow">
              <Building2 className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {empresaDisplay}
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Inicio de Sesión Único (SSO)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuario de Red / Correo Institucional
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario@organizacion.com"
                  autoComplete="off"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña de Dominio
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-800" />
                <span>Recordar sesión</span>
              </label>
              <a href="#soporte" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">
                ¿Olvidó su clave?
              </a>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <Key className="h-4 w-4 text-amber-400" />
                <span>{submitting ? "Autenticando..." : "Acceder a Sistemas Internos"}</span>
              </button>
            </div>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              El uso indebido de esta plataforma está monitoreado bajo las políticas de seguridad de la información de la organización.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Corporativo */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-700/50">
        <p>Servicios de Identidad Corporativa y Control de Acceso Centralizado</p>
      </footer>
    </div>
  );
}
