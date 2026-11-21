"use client";

import { useState } from "react";
import { User, Lock, CheckCircle2, HelpCircle } from "lucide-react";

interface UnjbgLandingProps {
  onSubmit: () => void;
  nombreEmpresa?: string;
  submitting?: boolean;
}

export function UnjbgLanding({
  onSubmit,
  nombreEmpresa,
  submitting = false,
}: UnjbgLandingProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Zero-Credential Storage: Limpiar inmediatamente de la memoria React antes de notificar
    setPassword("");
    onSubmit();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-cover bg-center bg-no-repeat font-sans antialiased text-slate-800"
      style={{
        backgroundImage: "url('/unjbg-bg.png')",
        backgroundColor: "#e8ecf0",
      }}
    >
      {/* Tarjeta Centrada del Aula Virtual */}
      <div className="w-full max-w-[890px] bg-white rounded-md shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-300/70 animate-in fade-in zoom-in-95 duration-200">
        {/* Columna Izquierda (Granate Institucional UNJBG) */}
        <div className="md:col-span-7 bg-[#6d021c] text-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Título Principal */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase pb-2 border-b border-white/30 text-white">
                AULA VIRTUAL UNJBG
              </h1>
            </div>

            {/* Subtítulo y Cookies */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs text-white/90">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white" />
                <span>Las &apos;Cookies&apos; deben estar habilitadas en su navegador</span>
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-white/80" />
              </div>
              <p className="text-sm font-semibold text-white/95 pt-1">
                Registrarse como usuario
              </p>
            </div>

            {/* Aviso de Bienvenida */}
            <div className="pt-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mb-2 leading-tight">
                BIENVENIDO AL AULA VIRTUAL 2026
              </h2>
              <div className="text-[12px] leading-relaxed text-white/90 space-y-2">
                <p>
                  Se comunica a todos los estudiantes de ingresantes 2026-II que,
                  para acceder a la plataforma del Aula Virtual deberán digitar los
                  siguientes datos:
                </p>

                <div className="pl-1 space-y-0.5 font-medium">
                  <p>
                    <span className="font-bold text-white">Usuario:</span> *código
                    universitario* (ejemplo: 2026-999999)
                  </p>
                  <p>
                    <span className="font-bold text-white">Contraseña:</span>{" "}
                    *Número de DNI*
                  </p>
                  <p className="text-[11px] text-white/80 italic">
                    (Se les recuerda que deben cambiar su contraseña cuando
                    accedan por primera vez)
                  </p>
                </div>

                <p className="pt-1">
                  Asimismo, los horarios de clase 2026-II los puede ubicar en el
                  siguiente enlace{" "}
                  <span className="font-bold underline cursor-pointer text-white">
                    HORARIO DE CLASE 2026-II
                  </span>
                </p>

                <p className="font-bold uppercase tracking-wider text-[11px] pt-1 text-white">
                  MANUALES Y GUÍAS
                </p>

                <p className="text-[11.5px] text-white/85">
                  Y para dudas o consulta puede enviar un mensaje al correo de{" "}
                  <span className="font-semibold text-white">
                    avirtual@unjbg.edu.pe
                  </span>{" "}
                  o llamar al 052-583000 Anexo 2998
                </p>
              </div>
            </div>
          </div>

          {/* Footer Izquierdo */}
          <div className="pt-6 mt-4 text-center border-t border-white/20">
            <span className="text-xs font-bold tracking-widest text-white/90 uppercase">
              AULA VIRTUAL
            </span>
          </div>
        </div>

        {/* Columna Derecha (Formulario de Ingreso) */}
        <div className="md:col-span-5 bg-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-5">
              ¿Ya tiene una cuenta?
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Usuario */}
              <div>
                <div className="flex border border-slate-300 rounded-xs overflow-hidden focus-within:border-[#6d021c] focus-within:ring-1 focus-within:ring-[#6d021c]/20 transition-all bg-white">
                  <div className="w-10 bg-[#f8f9fa] border-r border-slate-300 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario"
                    autoComplete="off"
                    className="flex-1 h-9 px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div className="flex border border-slate-300 rounded-xs overflow-hidden focus-within:border-[#6d021c] focus-within:ring-1 focus-within:ring-[#6d021c]/20 transition-all bg-white">
                  <div className="w-10 bg-[#f8f9fa] border-r border-slate-300 flex items-center justify-center text-slate-500 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 h-9 px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-white font-mono"
                  />
                </div>
              </div>

              {/* Checkbox Recordar */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberUser}
                    onChange={(e) => setRememberUser(e.target.checked)}
                    className="rounded-xs border-slate-300 text-[#6d021c] focus:ring-[#6d021c]"
                  />
                  <span>Recordar nombre de usuario</span>
                </label>
              </div>

              {/* Botón Acceder */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-9 bg-[#6d021c] hover:bg-[#580116] active:bg-[#440111] text-white text-xs sm:text-sm font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <span>
                    {submitting ? "Accediendo..." : "Iniciar sesión (ingresar)"}
                  </span>
                </button>
              </div>

              {/* Enlace Recuperar */}
              <div className="pt-2">
                <a
                  href="#recuperar"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-slate-600 hover:text-[#6d021c] hover:underline cursor-pointer block"
                >
                  ¿Olvidó su usuario o contraseña?
                </a>
              </div>
            </form>
          </div>

          {nombreEmpresa && (
            <div className="pt-6 text-center border-t border-slate-100 text-[11px] text-slate-400 mt-6">
              <span>{nombreEmpresa}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
