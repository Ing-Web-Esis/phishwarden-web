"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, Send, BookOpen, Users, BarChart2, 
  Settings, HelpCircle, Bell, ChevronDown, Shield, MoreHorizontal, LogOut, User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";
  const isUsuarios = pathname.includes("/dashboard/usuarios");
  const isPlantillas = pathname.includes("/dashboard/plantillas");

  const [adminUser, setAdminUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAdminUser(data);
          if (data.empresaId) {
            localStorage.setItem("empresaId", data.empresaId.toString());
          }
          setIsChecking(false);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error al obtener perfil del admin:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    fetchPerfil();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("empresaId");
    localStorage.removeItem("phishWardenUser");
    router.push("/login");
  };

  const nombreAdmin = adminUser?.nombre || adminUser?.name || "Administrador";
  const inicialesAdmin = getInitials(nombreAdmin);
  const nombreEmpresa = adminUser?.empresa?.nombre || "Mi Organización";
  const inicialesEmpresa = nombreEmpresa.substring(0, 2).toUpperCase();

  function getInitials(name: string) {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  if (isChecking) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50"></div>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
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

            <Link 
              href="/dashboard/plantillas" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                isPlantillas 
                  ? "bg-[#E5A93C]/10 border-[#E5A93C]/20 text-[#E5A93C]" 
                  : "border-transparent text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Biblioteca de plantillas</span>
            </Link>

            <Link 
              href="/dashboard/usuarios" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                isUsuarios 
                  ? "bg-[#E5A93C]/10 border-[#E5A93C]/20 text-[#E5A93C]" 
                  : "border-transparent text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Gestión de usuarios</span>
            </Link>

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
          
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full focus:outline-none outline-none">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-left">
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
                <MoreHorizontal className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="w-56 bg-[#283F50] border-white/10 text-slate-200 shadow-xl mb-2" 
              align="start" 
              side="top"
            >
              <DropdownMenuItem 
                onClick={() => router.push("/dashboard/perfil")}
                className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer py-2.5"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="font-medium">Ver perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="hover:bg-red-500/10 focus:bg-red-500/20 focus:text-red-400 text-red-400 cursor-pointer py-2.5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center text-sm">
            <span className="text-slate-400">PhishWarden</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-[#283F50]">
              {pathname === "/dashboard/perfil" ? "Mi perfil" : isUsuarios ? "Usuarios" : isPlantillas ? "Plantillas" : "Vista general"}
            </span>
          </div>

          <div className="flex items-center gap-4">
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