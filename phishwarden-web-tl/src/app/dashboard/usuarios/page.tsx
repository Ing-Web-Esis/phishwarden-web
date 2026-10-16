"use client";

import { useState, useEffect } from "react";
import { Upload, FileSpreadsheet, Search, MoreHorizontal, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const departamentos = [
  { id: "TE", nombre: "Tecnología", colaboradores: 684, riesgo: "11.2%" },
  { id: "OP", nombre: "Operaciones", colaboradores: 928, riesgo: "17.8%" },
  { id: "CO", nombre: "Comercial", colaboradores: 576, riesgo: "21.4%" },
  { id: "AD", nombre: "Administración", colaboradores: 292, riesgo: "9.6%" },
];

export default function UsuariosPage() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estados para la paginación y búsqueda
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10; 

  // Efecto para crear el "Debounce" (espera 500ms tras dejar de escribir)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Si buscamos algo nuevo, regresamos automáticamente a la página 1
    }, 500);

    return () => {
      clearTimeout(handler); // Limpiamos el temporizador si el usuario sigue escribiendo
    };
  }, [searchTerm]);

  // Efecto principal para traer los datos (depende de la página y de la búsqueda)
  useEffect(() => {
    const fetchEmpleados = async () => {
      setIsLoading(true);
      try {
        // Obtenemos el ID real guardado en el login
        const empresaId = localStorage.getItem("empresaId");

        // Validamos si realmente existe un ID de empresa vinculado al admin
        if (!empresaId || empresaId === "undefined" || empresaId === "null") {
          throw new Error("No se encontró una organización asociada a este administrador. Vuelve a iniciar sesión.");
        }

        const url = new URL(`http://localhost:3000/empresas/${empresaId}/empleados/resumen`);
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", limit.toString());
        
        if (debouncedSearch) {
          url.searchParams.append("search", debouncedSearch); 
        }

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          setEmpleados(data.data);
          setTotalRegistros(data.total || data.data.length);
        } else if (Array.isArray(data)) {
          setEmpleados(data);
          setTotalRegistros(data.length);
        } else if (data.users && Array.isArray(data.users)) {
          setEmpleados(data.users);
          setTotalRegistros(data.total || data.users.length);
        } else {
          setEmpleados([]);
          setTotalRegistros(0);
        }

      } catch (err: any) {
        console.error("Error al traer usuarios:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpleados();
  }, [page, debouncedSearch]);

  const getInitials = (nombre: string) => {
    if (!nombre) return "US";
    const parts = nombre.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  const getRiesgoInfo = (score: number) => {
    const valor = Number(score) || 0;
    if (valor >= 70) return { texto: "Alto", color: "bg-red-50 text-red-600" };
    if (valor >= 30) return { texto: "Medio", color: "bg-orange-50 text-orange-600" };
    return { texto: "Bajo", color: "bg-amber-50 text-amber-600" };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Gestión de usuarios</h1>
          <p className="text-slate-500 mt-1">Administra empleados, departamentos y niveles de acceso.</p>
        </div>
        <Button variant="outline" className="border-slate-200 text-[#283F50] bg-white hover:bg-slate-50 font-semibold h-11 px-6 rounded-lg shadow-sm">
          <Upload className="mr-2 h-5 w-5" />
          Carga masiva
        </Button>
      </div>

      {/* Banner de Importación */}
      <div className="bg-[#283F50] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A93C] border border-white/5">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-xl tracking-tight mb-1">Agrega usuarios en minutos</h3>
            <p className="text-slate-300 text-sm md:text-base">
              Importa tu directorio desde archivos CSV o Excel. Validaremos los datos antes de publicar.
            </p>
          </div>
        </div>
        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-11 px-6 rounded-lg font-medium transition-colors flex-shrink-0">
          <Upload className="mr-2 h-4 w-4" />
          Importar archivo
        </Button>
      </div>

      {/* Tarjetas de Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departamentos.map((dep) => (
          <div key={dep.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
              {dep.id}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#283F50] truncate">{dep.nombre}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{dep.colaboradores} colaboradores</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">Riesgo</p>
              <p className="text-sm font-bold text-[#283F50]">{dep.riesgo}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla del Directorio conectada al Backend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#283F50]">Directorio de empleados</h3>
            <p className="text-sm text-slate-500">
              {isLoading ? "Buscando..." : `${totalRegistros} usuarios encontrados`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar empleado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 h-10 rounded-lg focus-visible:ring-[#E5A93C]"
            />
          </div>
        </div>
        
        <div className="w-full overflow-x-auto min-h-[200px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#E5A93C]" />
              <p>Buscando en la base de datos...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-48 text-red-500 bg-red-50/50">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="font-medium">Error de conexión</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && empleados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Search className="h-10 w-10 mb-4 opacity-50" />
              <p className="font-medium text-[#283F50]">No se encontraron resultados</p>
              <p className="text-sm">Carga usuarios en la base de datos.</p>
            </div>
          )}

          {!isLoading && !error && empleados.length > 0 && (
            <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp, index) => {
                  const riesgoInfo = getRiesgoInfo(emp.score);
                  
                  return (
                    <tr key={emp.id || index} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                            {getInitials(emp.nombre)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#283F50]">{emp.nombre || "Sin nombre"}</p>
                            <p className="text-xs text-slate-400">{emp.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {emp.departamento?.nombre || emp.departamento || "Sin área"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${riesgoInfo.color}`}>
                          {riesgoInfo.texto} ({emp.score || 0})
                        </span>
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right">
                        <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Controles de Paginación */}
        {!isLoading && !error && totalRegistros > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Mostrando página <span className="font-semibold text-[#283F50]">{page}</span>
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={empleados.length < limit}
                className="h-8 px-3"
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}