"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Send, Zap, MoreHorizontal, ChevronDown } from "lucide-react";

export default function DashboardHomePage() {
  const [primerNombre, setPrimerNombre] = useState("Cargando...");

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const fullName = data.nombre || data.name || "Administrador";
          // Extraemos solo el primer nombre
          const firstName = fullName.split(" ")[0];
          setPrimerNombre(firstName);
        } else {
          setPrimerNombre("Administrador");
        }
      } catch (error) {
        setPrimerNombre("Administrador");
      }
    };

    fetchPerfil();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Cabecera dinámica */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">
          Buenos días, {primerNombre}
        </h1>
        <p className="text-slate-500 mt-1">
          Esto es lo que ocurre con la seguridad de tu organización hoy.
        </p>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Riesgo Global */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#E5A93C]">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Riesgo Global</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#283F50]">14.8%</h2>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              ↓ 3.2% <span className="text-slate-400 font-normal">vs. mes anterior</span>
            </p>
          </div>
        </div>

        {/* Usuarios Evaluados */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuarios Evaluados</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#283F50]">2,480</h2>
            <p className="text-xs text-[#E5A93C] font-medium mt-1">
              +180 <span className="text-slate-400 font-normal">este mes</span>
            </p>
          </div>
        </div>

        {/* Campañas Activas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <Send className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campañas Activas</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#283F50]">06</h2>
            <p className="text-xs text-[#E5A93C] font-medium mt-1">
              2 finalizan <span className="text-slate-400 font-normal">esta semana</span>
            </p>
          </div>
        </div>

        {/* Eventos Hoy */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#E5A93C]">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eventos Hoy</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#283F50]">128</h2>
            <p className="text-xs text-[#E5A93C] font-medium mt-1">
              12 requieren <span className="text-slate-400 font-normal">atención</span>
            </p>
          </div>
        </div>

      </div>

      {/* Gráficos Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolución del riesgo (Gráfico de línea estático visual) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#283F50]">Evolución del riesgo</h3>
              <p className="text-sm text-slate-500">Porcentaje de interacción vulnerable</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Últimos 6 meses <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="relative h-64 w-full flex items-end">
            {/* Ejes y líneas de fondo */}
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pb-6">
              <div className="flex items-center border-b border-dashed border-slate-100 pb-1 w-full"><span className="w-8">28%</span></div>
              <div className="flex items-center border-b border-dashed border-slate-100 pb-1 w-full"><span className="w-8">21%</span></div>
              <div className="flex items-center border-b border-dashed border-slate-100 pb-1 w-full"><span className="w-8">14%</span></div>
              <div className="flex items-center border-b border-dashed border-slate-100 pb-1 w-full"><span className="w-8">7%</span></div>
              <div className="flex items-center border-b border-slate-200 pb-1 w-full"><span className="w-8">0%</span></div>
            </div>
            
            {/* SVG Decorativo para simular el gráfico */}
            <div className="absolute inset-0 pl-8 pb-6 w-full h-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <path d="M0,20 Q25,25 50,45 T100,55 L100,100 L0,100 Z" fill="url(#gradient)" className="opacity-40" />
                <path d="M0,20 Q25,25 50,45 T100,55" fill="none" stroke="#E5A93C" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#E5A93C" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Etiquetas del eje X */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-medium text-slate-400">
              <span>ENE</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>ABR</span>
              <span>MAY</span>
              <span>JUN</span>
            </div>
          </div>
        </div>

        {/* Nivel de vulnerabilidad (Gráfico de dona estático visual) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#283F50]">Nivel de vulnerabilidad</h3>
              <p className="text-sm text-slate-500">Distribución actual</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>

          <div className="flex flex-col items-center justify-center mt-4">
            <div className="relative w-40 h-40">
              {/* SVG Dona Falsa */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Riesgo Bajo (62%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5A93C" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="95.45" />
                {/* Riesgo Medio (24%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="190.9" className="transform origin-center rotate-[223deg]" />
                {/* Riesgo Alto (14%) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="216.03" className="transform origin-center rotate-[309deg]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#283F50]">2,480</span>
                <span className="text-[10px] text-slate-500 -mt-1">usuarios</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-8">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E5A93C]"></div>
                  <span className="text-slate-600">Bajo riesgo</span>
                </div>
                <span className="font-bold text-[#283F50]">62%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
                  <span className="text-slate-600">Riesgo medio</span>
                </div>
                <span className="font-bold text-[#283F50]">24%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <span className="text-slate-600">Alto riesgo</span>
                </div>
                <span className="font-bold text-[#283F50]">14%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}