"use client";

import { useState } from "react";
import { Building2, User, Lock, HelpCircle } from "lucide-react";
import type { PortalConfig } from "@/lib/types";

interface CustomBrandedLandingProps {
  onSubmit: () => void;
  portalConfig?: PortalConfig | null;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function CustomBrandedLanding({
  onSubmit,
  portalConfig,
  nombreEmpresa,
  submitting = false,
}: CustomBrandedLandingProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente la contraseña de la memoria
    setPassword("");
    onSubmit();
  };

  const titulo = portalConfig?.tituloPortal || "Portal de Acceso Corporativo";
  const subtitulo =
    portalConfig?.subtitulo ||
    nombreEmpresa ||
    portalConfig?.nombre ||
    "Autenticación Única de Red";
  const labelUsuario = portalConfig?.labelUsuario || "Correo electrónico o usuario";
  const labelPassword = portalConfig?.labelPassword || "Contraseña";
  const textoBoton = portalConfig?.textoBoton || "Iniciar sesión";
  const colorPrimario = portalConfig?.colorPrimario || "#0067b8";
  const colorFondo = portalConfig?.colorFondo || "#f3f4f6";
  const logoUrl = portalConfig?.logoUrl;

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between text-slate-800 font-sans antialiased"
      style={{ backgroundColor: colorFondo }}
    >
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Cabecera / Identidad Corporativa */}
          <div className="p-8 pb-4 text-center">
            {logoUrl && !imageError ? (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={subtitulo}
                  className="max-h-14 max-w-[180px] object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div
                className="inline-flex items-center justify-center h-14 w-14 rounded-2xl text-white mb-3 shadow-md"
                style={{ backgroundColor: colorPrimario }}
              >
                <Building2 className="h-7 w-7" />
              </div>
            )}

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {titulo}
            </h1>
            {subtitulo && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {subtitulo}
              </p>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {labelUsuario}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario@dominio.com"
                  autoComplete="off"
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all bg-white"
                  style={
                    {
                      "--tw-ring-color": `${colorPrimario}33`,
                      borderColor: undefined,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {labelPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all bg-white font-mono"
                  style={
                    {
                      "--tw-ring-color": `${colorPrimario}33`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-400"
                />
                <span>Mantener sesión</span>
              </label>
              <a
                href="#recuperar"
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 hover:underline"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 text-white text-sm font-semibold rounded-lg transition-opacity shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: colorPrimario }}
              >
                <span>{submitting ? "Verificando..." : textoBoton}</span>
              </button>
            </div>
          </form>

          {/* Footer de la tarjeta */}
          <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Acceso seguro protegido por protocolo corporativo
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} {subtitulo}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
