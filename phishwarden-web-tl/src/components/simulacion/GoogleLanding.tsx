"use client";

import { useState } from "react";

interface GoogleLandingProps {
  onSubmit: () => void;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function GoogleLanding({
  onSubmit,
  nombreEmpresa,
  submitting = false,
}: GoogleLandingProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente de la memoria React antes de notificar
    setPassword("");
    onSubmit();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f0f4f9] text-[#202124] font-sans antialiased">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white p-8 sm:p-10 rounded-2xl sm:border sm:border-[#dadce0] shadow-sm">
          {/* Logo oficial Google */}
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-normal text-[#202124] tracking-tight">
            Iniciar sesión
          </h1>
          <p className="text-sm text-[#5f6368] mt-1 mb-6">
            {nombreEmpresa ? `Ir a cuenta corporativa de ${nombreEmpresa}` : "Utiliza tu cuenta de Google"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico o teléfono"
                autoComplete="off"
                className="w-full h-13 px-4 rounded-md border border-[#dadce0] text-sm text-[#202124] placeholder:text-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                autoComplete="off"
                spellCheck={false}
                className="w-full h-13 px-4 rounded-md border border-[#dadce0] text-sm text-[#202124] placeholder:text-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors"
              />
            </div>

            <div className="pt-1">
              <a href="#olvido" onClick={(e) => e.preventDefault()} className="text-xs font-medium text-[#1a73e8] hover:underline">
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            <p className="text-xs text-[#5f6368] leading-relaxed pt-2">
              ¿No es tu ordenador? Usa una ventana privada para iniciar sesión.{" "}
              <a href="#privada" onClick={(e) => e.preventDefault()} className="text-[#1a73e8] font-medium hover:underline">
                Más información
              </a>
            </p>

            <div className="pt-6 flex items-center justify-between">
              <button
                type="button"
                className="text-xs font-semibold text-[#1a73e8] hover:bg-[#f8fafd] px-3 py-2 rounded transition-colors"
              >
                Crear cuenta
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1b66c9] active:bg-[#185abc] text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Verificando..." : "Siguiente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Google */}
      <footer className="w-full max-w-[450px] mx-auto py-4 px-4 flex items-center justify-between text-xs text-[#5f6368]">
        <span>Español (Latinoamérica)</span>
        <div className="flex gap-4">
          <a href="#ayuda" onClick={(e) => e.preventDefault()} className="hover:underline">Ayuda</a>
          <a href="#privacidad" onClick={(e) => e.preventDefault()} className="hover:underline">Privacidad</a>
          <a href="#terminos" onClick={(e) => e.preventDefault()} className="hover:underline">Términos</a>
        </div>
      </footer>
    </div>
  );
}
