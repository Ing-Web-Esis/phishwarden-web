import Link from "next/link";
import { Shield, HelpCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* Columna Izquierda - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-[#283F50] p-10 lg:p-12 relative">
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full border-[40px] border-white/5" />
        
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5A93C]/20 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-[#E5A93C]" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight mb-4">
            La seguridad comienza con personas preparadas.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Gestiona la concientización de tu equipo desde una plataforma simple, segura y medible.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md max-w-sm">
            <div>
              <p className="text-3xl font-bold text-[#E5A93C] mb-1">85%</p>
              <p className="text-xs text-slate-300">Índice de protección promedio</p>
            </div>
            <div className="flex items-end gap-1.5 opacity-90">
              <div className="w-1.5 h-3 bg-[#E5A93C]/40 rounded-sm" />
              <div className="w-1.5 h-5 bg-[#E5A93C]/60 rounded-sm" />
              <div className="w-1.5 h-7 bg-[#E5A93C]/80 rounded-sm" />
              <div className="w-1.5 h-9 bg-[#E5A93C] rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Contenedor del Formulario */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8">
        <div className="w-full max-w-[380px] space-y-8">
          
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider text-[#E5A93C] uppercase">
              Acceso Corporativo
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#283F50]">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa tus credenciales para acceder a tu organización.
            </p>
          </div>

          {/* Aquí inyectamos toda la lógica y diseño interactivo */}
          <LoginForm />

          <div className="space-y-6 pt-2">
            <div className="flex justify-center items-center gap-1.5 text-sm text-slate-500">
              <HelpCircle className="h-4 w-4" />
              <span>¿Necesitas ayuda?</span>
              <Link href="#" className="font-medium text-[#E5A93C] hover:text-[#c79130] transition-colors">
                Contacta a soporte
              </Link>
            </div>
            <p className="text-center text-xs text-slate-400">
              Acceso protegido bajo políticas corporativas de seguridad.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}