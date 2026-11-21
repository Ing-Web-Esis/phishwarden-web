"use client";

import { useState } from "react";
import { KeyRound, HelpCircle } from "lucide-react";

interface MicrosoftLandingProps {
  onSubmit: () => void;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function MicrosoftLanding({
  onSubmit,
  nombreEmpresa,
  submitting = false,
}: MicrosoftLandingProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente de la memoria React antes de notificar
    setPassword("");
    onSubmit();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f0f4f9] text-[#1b1b1b] font-sans antialiased selection:bg-[#0067b8] selection:text-white">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[440px] bg-white p-8 sm:p-11 rounded-none sm:rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.2)] border border-[#e1dfdd]">
          {/* Logo oficial Microsoft (4 cuadros) */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            <span className="text-sm font-semibold text-[#737373] tracking-tight">Microsoft</span>
          </div>

          <h1 className="text-2xl font-semibold text-[#1b1b1b] mb-1">
            Iniciar sesión
          </h1>
          {nombreEmpresa && (
            <p className="text-xs text-[#505050] mb-5">
              Continuar hacia <span className="font-semibold text-[#1b1b1b]">{nombreEmpresa}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico, teléfono o Skype"
                autoComplete="off"
                className="w-full border-b border-[#666666] focus:border-[#0067b8] py-1.5 px-0 text-sm outline-none placeholder:text-[#666666] transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="off"
                spellCheck={false}
                className="w-full border-b border-[#666666] focus:border-[#0067b8] py-1.5 px-0 text-sm outline-none placeholder:text-[#666666] transition-colors"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-[#505050]">
                ¿No tiene una cuenta?{" "}
                <a href="#crear" onClick={(e) => e.preventDefault()} className="text-[#0067b8] hover:underline">
                  Cree una.
                </a>
              </p>
              <p className="text-xs text-[#0067b8] mt-1 hover:underline cursor-pointer">
                ¿No puede acceder a su cuenta?
              </p>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-1.5 bg-[#0067b8] hover:bg-[#005da6] active:bg-[#005293] text-white text-sm font-normal rounded-none transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Iniciando..." : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#e1dfdd]">
            <div className="flex items-center gap-3 p-2 hover:bg-[#f3f2f1] cursor-pointer rounded transition-colors text-xs text-[#1b1b1b]">
              <KeyRound className="h-5 w-5 text-[#505050]" />
              <span>Opciones de inicio de sesión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Microsoft */}
      <footer className="w-full py-3 px-6 flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[11px] text-[#505050]">
        <a href="#terminos" onClick={(e) => e.preventDefault()} className="hover:underline">
          Términos de uso
        </a>
        <a href="#privacidad" onClick={(e) => e.preventDefault()} className="hover:underline">
          Privacidad y cookies
        </a>
        <span>...</span>
        <span>© Microsoft {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
