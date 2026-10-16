"use client";

import { ShieldAlert, Users, Send, Zap, Mail, MessageSquare, MoreHorizontal, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Datos de prueba para gráficas
const areaData = [
  { name: "ENE", riesgo: 25 },
  { name: "FEB", riesgo: 22 },
  { name: "MAR", riesgo: 16 },
  { name: "ABR", riesgo: 15 },
  { name: "MAY", riesgo: 14 },
  { name: "JUN", riesgo: 10 },
];

const pieData = [
  { name: "Bajo riesgo", value: 62, color: "#E5A93C" },
  { name: "Riesgo medio", value: 24, color: "#F97316" },
  { name: "Alto riesgo", value: 14, color: "#EF4444" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Saludo */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Buenos días, María</h1>
        <p className="text-slate-500 mt-1">Esto es lo que ocurre con la seguridad de tu organización hoy.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-[#E5A93C]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Riesgo Global</p>
              <h3 className="text-2xl font-bold text-[#283F50]">14.8%</h3>
              <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center">
                ↓ 3.2% <span className="text-slate-400 font-normal ml-1">vs. mes anterior</span>
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-300" />
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Usuarios Evaluados</p>
              <h3 className="text-2xl font-bold text-[#283F50]">2,480</h3>
              <p className="text-xs text-[#E5A93C] font-medium mt-1 flex items-center">
                +180 <span className="text-slate-400 font-normal ml-1">este mes</span>
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-300" />
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campañas Activas</p>
              <h3 className="text-2xl font-bold text-[#283F50]">06</h3>
              <p className="text-xs text-[#E5A93C] font-medium mt-1 flex items-center">
                2 finalizan <span className="text-slate-400 font-normal ml-1">esta semana</span>
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-300" />
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-[#E5A93C]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eventos Hoy</p>
              <h3 className="text-2xl font-bold text-[#283F50]">128</h3>
              <p className="text-xs text-[#E5A93C] font-medium mt-1 flex items-center">
                12 requieren <span className="text-slate-400 font-normal ml-1">atención</span>
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-300" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Evolución */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#283F50]">Evolución del riesgo</h3>
              <p className="text-sm text-slate-500">Porcentaje de interacción vulnerable</p>
            </div>
            <button className="text-sm border border-slate-200 rounded-md px-3 py-1.5 flex items-center gap-2 text-slate-600">
              Últimos 6 meses <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRiesgo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E5A93C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Area type="monotone" dataKey="riesgo" stroke="#E5A93C" strokeWidth={3} fillOpacity={1} fill="url(#colorRiesgo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-[#283F50]">Nivel de vulnerabilidad</h3>
              <p className="text-sm text-slate-500">Distribución actual</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-slate-300" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="h-[160px] w-[160px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#283F50]">2,480</span>
                <span className="text-[10px] text-slate-400">usuarios</span>
              </div>
            </div>
            <div className="space-y-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600 min-w-[80px]">{item.name}</span>
                  <span className="text-sm font-bold text-[#283F50]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Campañas */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#283F50]">Campañas recientes</h3>
            <p className="text-sm text-slate-500">Actividad y desempeño de los últimos envíos</p>
          </div>
          <button className="text-sm font-medium text-[#E5A93C] flex items-center gap-1 hover:text-[#c79130] transition-colors">
            Ver todas &rarr;
          </button>
        </div>
        
        <div className="w-full">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-medium">Campaña</th>
                <th className="pb-3 font-medium">Canal</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Enviados</th>
                <th className="pb-3 font-medium">Tasa de riesgo</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-[#283F50]">Actualización de credenciales</span>
                  </div>
                </td>
                <td className="py-4">Email</td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> En curso
                  </span>
                </td>
                <td className="py-4 font-medium">1,240</td>
                <td className="py-4 font-bold text-[#283F50]">18.4%</td>
                <td className="py-4 text-right"><MoreHorizontal className="h-5 w-5 text-slate-300 inline-block cursor-pointer" /></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-[#283F50]">Beneficio corporativo Q2</span>
                  </div>
                </td>
                <td className="py-4">SMS</td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E5A93C]"></span> Programada
                  </span>
                </td>
                <td className="py-4 font-medium">860</td>
                <td className="py-4 font-medium text-slate-400">—</td>
                <td className="py-4 text-right"><MoreHorizontal className="h-5 w-5 text-slate-300 inline-block cursor-pointer" /></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-[#283F50]">Simulación Microsoft 365</span>
                  </div>
                </td>
                <td className="py-4">Email</td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Finalizada
                  </span>
                </td>
                <td className="py-4 font-medium">2,180</td>
                <td className="py-4 font-bold text-[#283F50]">12.7%</td>
                <td className="py-4 text-right"><MoreHorizontal className="h-5 w-5 text-slate-300 inline-block cursor-pointer" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}