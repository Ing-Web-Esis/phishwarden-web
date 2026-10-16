"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, Send, BookOpen, Users, BarChart2, 
  Settings, HelpCircle, Bell, Search, ChevronDown, Shield 
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Logo = () => (
  <div className="flex items-center gap-2 px-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5A93C]">
      <Shield className="h-5 w-5 text-[#283F50]" />
    </div>
    <span className="text-lg font-bold text-white tracking-wide">PhishWarden</span>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isUsuarios = pathname.includes("/dashboard/usuarios");

  const [adminUser, setAdminUser] = useState<any>(null);

  // Consultamos el endpoint /auth/me usando el token guardado
  useEffect(() => {
    const fetchPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // *Nota: Si la ruta que creó Russell es distinta a /auth/me, cámbiala aquí
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAdminUser(data);
          // Guardamos también el empresaId globalmente para que otras páginas lo usen facilito
          if (data.empresaId) {
            localStorage.setItem("empresaId", data.empresaId.toString());
          }
        }
      } catch (error) {
        console.error("Error al obtener perfil del admin:", error);
      }
    };

    fetchPerfil();
  }, []);

  const nombreAdmin = adminUser?.nombre || "Administrador";
  const inicialesAdmin = getInitials(nombreAdmin);
  const nombreEmpresa = adminUser?.empresa?.nombre || "Mi Organización";
  const inicialesEmpresa = nombreEmpresa.substring(0, 2).toUpperCase();

  function getInitials(name: string) {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Sidebar Lateral */}
      <aside className="w-[260px] flex-shrink-0 bg-[#283F50] flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="h-20 flex items-center px-6">
            <Logo />
          </div>

          <div className="px-6 mb-6">
            <button className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-[#E5A93C] flex items-center justify-center text-xs font-bold text-[#283F50]">
                  {inicialesEmpresa}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organización</p>
                  <p className="text-sm text-white font-medium leading-none truncate max-w-[110px]">
                    {nombreEmpresa}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <nav className="px-4 space-y-1">
            <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4">
              Menú Principal
            </p>
            
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                isDashboard 
                  ? "bg-[#E5A93C]/10 border-[#E5A93C]/20 text-[#E5A93C]" 
                  : "border-transparent text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="text-sm font-medium">Vista general</span>
            </Link>
            
            <Link href="#" className="flex items-center justify-between px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5" />
                <span className="text-sm font-medium">Gestión de campañas</span>
              </div>
              <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
            </Link>

            <Link href="#" className="flex items-center justify-between px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Biblioteca de plantillas</span>
              </div>
              <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
            </Link>

            <div className="flex flex-col">
              <Link 
                href="/dashboard/usuarios" 
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  isUsuarios 
                    ? "bg-[#E5A93C]/10 border-[#E5A93C]/20 text-[#E5A93C]" 
                    : "border-transparent text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">Gestión de usuarios</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isUsuarios ? "rotate-0 opacity-100" : "-rotate-90 opacity-50"}`} />
              </Link>
              
              {isUsuarios && (
                <div className="mt-1 ml-6 pl-4 border-l border-white/10 space-y-1">
                  <Link href="/dashboard/usuarios" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white font-medium transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]"></div>
                    <span className="text-sm">Directorio</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                    <span className="text-sm">Departamentos</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                    <span className="text-sm">Carga masiva</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <BarChart2 className="h-5 w-5" />
              <span className="text-sm font-medium">Reportes ejecutivos</span>
            </Link>
          </nav>
        </div>

        <div className="p-4">
          <nav className="space-y-1 mb-4">
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Configuración</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Centro de ayuda</span>
            </Link>
          </nav>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                {inicialesAdmin}
              </div>
              <div>
                <p className="text-sm text-white font-medium leading-none truncate max-w-[120px]">
                  {nombreAdmin}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Administrador</p>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="w-1 h-1 rounded-full bg-slate-400"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center text-sm">
            <span className="text-slate-400">PhishWarden</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-[#283F50]">
              {isUsuarios ? "Usuarios" : "Vista general"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar..." 
                className="pl-9 bg-slate-50 border-slate-200 h-9 rounded-md focus-visible:ring-[#E5A93C]"
              />
            </div>
            <button className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}