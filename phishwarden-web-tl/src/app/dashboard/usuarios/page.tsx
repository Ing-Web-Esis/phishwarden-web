"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, FileSpreadsheet, Search, MoreHorizontal, Loader2, AlertCircle, 
  ChevronLeft, ChevronRight, Plus, X, CheckCircle2, Eye, Edit, Trash2,
  Smartphone, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  EmployeeSummaryItem,
  DepartmentItem,
  EmployeeDetail,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  PaginatedResponse,
  AdminProfile,
  CompanyDetail,
} from "@/lib/types";

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export default function UsuariosPage() {
  const [empleados, setEmpleados] = useState<EmployeeSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [departamentos, setDepartamentos] = useState<DepartmentItem[]>([]);
  const [isLoadingDeps, setIsLoadingDeps] = useState(true);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [departamentoFiltro, setDepartamentoFiltro] = useState<{id: string | number, nombre: string} | null>(null);
  const limit = 10; 

  const [codigoAcceso, setCodigoAcceso] = useState<string>("");
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [filtroRiesgo, setFiltroRiesgo] = useState<"todos" | "bajo" | "medio" | "critico">("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedEmpleado, setSelectedEmpleado] = useState<(EmployeeSummaryItem & Partial<EmployeeDetail>) | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: "success" | "error" }>({
    visible: false, title: "", message: "", type: "success"
  });

  // Ahora guardamos el ID del departamento en lugar del texto
  const [formData, setFormData] = useState({ nombre: "", correo: "", departmentId: "", telefono: "" });
  const [editFormData, setEditFormData] = useState({ id: "", nombre: "", correo: "", departmentId: "", telefono: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (title: string, message: string, type: "success" | "error") => {
    setToast({ visible: true, title, message, type });
  };

  useEffect(() => {
    const loadCodigoAcceso = async () => {
      const cached = localStorage.getItem("codigoAcceso");
      if (cached) {
        setCodigoAcceso(cached);
        return;
      }

      try {
        const empresaId = localStorage.getItem("empresaId");
        if (empresaId) {
          const comp = await apiClient.get<CompanyDetail>(`/empresas/${empresaId}`);
          if (comp?.codigoAcceso) {
            setCodigoAcceso(comp.codigoAcceso);
            localStorage.setItem("codigoAcceso", comp.codigoAcceso);
            return;
          }
        }

        const perfil = await apiClient.get<AdminProfile>("/auth/me");
        const code = perfil.empresa?.codigoAcceso || perfil.codigoAcceso;
        if (code) {
          setCodigoAcceso(code);
          localStorage.setItem("codigoAcceso", code);
        }
      } catch (err) {
        console.error("Error al cargar código de acceso:", err);
      }
    };

    loadCodigoAcceso();
  }, []);

  const handleCopyCodigo = async () => {
    if (!codigoAcceso) return;
    try {
      await navigator.clipboard.writeText(codigoAcceso);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = codigoAcceso;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCodigoCopiado(true);
    showToast("Código copiado", "Código de acceso copiado al portapapeles", "success");
    setTimeout(() => setCodigoCopiado(false), 2500);
  };

  const scrollDeps = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      scrollContainerRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const loadDeps = async () => {
      try {
        const data = await apiClient.get<DepartmentItem[] | { data: DepartmentItem[] }>("/departamentos");
        const list = Array.isArray(data) ? data : data?.data || [];
        setDepartamentos(list);
      } catch (err) {
        console.error("Error al cargar departamentos:", err);
      } finally {
        setIsLoadingDeps(false);
      }
    };
    loadDeps();
  }, [reloadTrigger]);

  useEffect(() => {
    const loadEmps = async () => {
      try {
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) throw new Error("No se encontró una organización asociada.");

        const params: Record<string, string | number> = {
          page,
          limit,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (departamentoFiltro?.id) {
          params.departmentId = Number(departamentoFiltro.id);
        }

        const data = await apiClient.get<PaginatedResponse<EmployeeSummaryItem>>(
          `/empresas/${empresaId}/empleados/resumen`,
          { params }
        );

        if (data && Array.isArray(data.data)) {
          setEmpleados(data.data);
          setTotalRegistros(data.total ?? data.data.length);
        } else if (Array.isArray(data)) {
          setEmpleados(data);
          setTotalRegistros((data as EmployeeSummaryItem[]).length);
        } else {
          setEmpleados([]);
          setTotalRegistros(0);
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar empleados");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadEmps();
  }, [page, debouncedSearch, departamentoFiltro, reloadTrigger]);

  const toggleDepartamentoFiltro = (dep: DepartmentItem) => {
    if (!dep.id) return;
    if (departamentoFiltro?.id === dep.id) {
      setDepartamentoFiltro(null); 
    } else {
      setDepartamentoFiltro({ id: dep.id, nombre: dep.nombre }); 
    }
    setPage(1);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const empresaId = localStorage.getItem("empresaId");

    if (!empresaId) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append("file", file);

    try {
      await apiClient.post<{ message?: string; count?: number }>(
        `/empresas/${empresaId}/empleados/import-csv`,
        fileFormData
      );
      showToast("Éxito", "Directorio importado correctamente.", "success");
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("Error al importar", err.message || "Revisa el formato del archivo CSV.", "error");
      } else {
        showToast("Error de conexión", "No se pudo subir el archivo.", "error");
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");

    if (!empresaId) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    const payload: CreateEmployeeInput = {
      name: formData.nombre,
      email: formData.correo,
      departmentId: Number(formData.departmentId),
      phone: `+51 ${formData.telefono}`
    };

    try {
      await apiClient.post(`/empresas/${empresaId}/empleados`, payload);
      setIsModalOpen(false);
      setFormData({ nombre: "", correo: "", departmentId: "", telefono: "" });
      showToast("Usuario creado", `${payload.name} fue añadido al directorio.`, "success");
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("No se pudo guardar", err.message || "Revisa los datos ingresados.", "error");
      } else {
        showToast("Error de conexión", "El servidor no responde.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");

    if (!empresaId) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    if (!isValidUUID(editFormData.id)) {
      showToast("Error", "Identificador de empleado inválido.", "error");
      setIsSubmitting(false);
      return;
    }

    let phoneStr = editFormData.telefono;
    if (!phoneStr.startsWith("+51")) {
      phoneStr = `+51 ${phoneStr}`;
    }

    const payload: UpdateEmployeeInput = {
      name: editFormData.nombre,
      email: editFormData.correo,
      departmentId: Number(editFormData.departmentId),
      phone: phoneStr
    };

    try {
      await apiClient.put(`/empresas/${empresaId}/empleados/${editFormData.id}`, payload);
      setIsEditModalOpen(false);
      showToast("Usuario actualizado", `Los datos de ${payload.name} fueron actualizados.`, "success");
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("No se pudo actualizar", err.message || "Revisa los datos ingresados.", "error");
      } else {
        showToast("Error de conexión", "El servidor no responde.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    const empresaId = localStorage.getItem("empresaId");

    if (!empresaId) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    if (!selectedEmpleado?.id || !isValidUUID(selectedEmpleado.id)) {
      showToast("Error", "Identificador de empleado inválido.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      await apiClient.delete(`/empresas/${empresaId}/empleados/${selectedEmpleado.id}`);
      setIsDeleteModalOpen(false);
      showToast("Usuario eliminado", "El empleado fue retirado del directorio.", "success");
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("No se pudo eliminar", err.message || "Error al intentar borrar el registro.", "error");
      } else {
        showToast("Error de conexión", "El servidor no responde.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = async (emp: EmployeeSummaryItem) => {
    if (!isValidUUID(emp.id)) {
      showToast("Error", "Identificador de empleado inválido.", "error");
      return;
    }

    try {
      const detalleData = await apiClient.get<EmployeeDetail>(`/empleados/${emp.id}`);
      setSelectedEmpleado({ ...emp, ...detalleData });
      setIsViewModalOpen(true);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("No se pudo cargar", err.message || "Error al obtener los detalles del empleado.", "error");
      } else {
        showToast("Error de conexión", "El servidor no responde.", "error");
      }
    }
  };

  const openEditModal = async (emp: EmployeeSummaryItem) => {
    if (!isValidUUID(emp.id)) {
      showToast("Error", "Identificador de empleado inválido.", "error");
      return;
    }

    try {
      const detalleData = await apiClient.get<EmployeeDetail>(`/empleados/${emp.id}`);
      const fullEmp = { ...emp, ...detalleData };

      let cleanPhone = fullEmp.telefono || fullEmp.phone || "";
      cleanPhone = cleanPhone.replace("+51 ", "");

      // Buscamos el ID del departamento desde los datos combinados
      const depId = fullEmp.departmentId || fullEmp.departamentoId || (typeof fullEmp.departamento === 'object' && fullEmp.departamento ? fullEmp.departamento.id : "") || "";

      setEditFormData({
        id: fullEmp.id || "",
        nombre: fullEmp.nombre || fullEmp.name || "",
        correo: fullEmp.correo || fullEmp.email || "",
        departmentId: depId.toString(),
        telefono: cleanPhone
      });
      setIsEditModalOpen(true);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("No se pudo cargar", err.message || "Error al obtener los detalles para editar.", "error");
      } else {
        showToast("Error de conexión", "El servidor no responde.", "error");
      }
    }
  };

  const getInitials = (nombre: string) => {
    if (!nombre) return "US";
    const parts = nombre.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  const getRiesgoInfo = (score: number | null | undefined) => {
    const valor = score !== undefined && score !== null ? Number(score) : 0;
    if (valor >= 70) {
      return {
        texto: "Riesgo Crítico",
        color: "bg-rose-50 text-rose-700 border border-rose-200",
        barColor: "bg-rose-500",
      };
    }
    if (valor >= 30) {
      return {
        texto: "Riesgo Medio",
        color: "bg-amber-50 text-amber-700 border border-amber-200",
        barColor: "bg-amber-500",
      };
    }
    return {
      texto: "Riesgo Bajo / Seguro",
      color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      barColor: "bg-emerald-500",
    };
  };

  const empleadosMostrados = empleados.filter((emp) => {
    const score = Number(emp.scoreRiesgo ?? emp.score ?? 0);
    if (filtroRiesgo === "bajo") return score < 30;
    if (filtroRiesgo === "medio") return score >= 30 && score < 70;
    if (filtroRiesgo === "critico") return score >= 70;
    return true;
  });

  const conteoBajo = empleados.filter(e => Number(e.scoreRiesgo ?? e.score ?? 0) < 30).length;
  const conteoMedio = empleados.filter(e => {
    const s = Number(e.scoreRiesgo ?? e.score ?? 0);
    return s >= 30 && s < 70;
  }).length;
  const conteoCritico = empleados.filter(e => Number(e.scoreRiesgo ?? e.score ?? 0) >= 70).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 p-4 rounded-lg shadow-xl border animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-[300px] ${
          toast.type === "success" ? "bg-white border-green-100" : "bg-white border-red-100"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          )}
          <div>
            <h4 className={`font-semibold text-sm ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
              {toast.title}
            </h4>
            <p className="text-sm text-slate-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MODAL NUEVO USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50]">Nuevo usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                <Input required placeholder="Ej. Ana Gomez" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
                <Input required type="email" placeholder="ana@empresa.com" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Departamento</label>
                <select 
                  required 
                  value={formData.departmentId} 
                  onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]"
                >
                  <option value="" disabled>Seleccione un área...</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium text-sm">+51</span>
                  <Input required type="tel" placeholder="987654321" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="rounded-l-none bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-200">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#283F50] text-white hover:bg-[#1a2936]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Guardar usuario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50]">Editar usuario</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                <Input required value={editFormData.nombre} onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
                <Input required type="email" value={editFormData.correo} onChange={(e) => setEditFormData({...editFormData, correo: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Departamento</label>
                <select 
                  required 
                  value={editFormData.departmentId} 
                  onChange={(e) => setEditFormData({...editFormData, departmentId: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]"
                >
                  <option value="" disabled>Seleccione un área...</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium text-sm">+51</span>
                  <Input required type="tel" value={editFormData.telefono} onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})} className="rounded-l-none bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-slate-200">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#283F50] text-white hover:bg-[#1a2936]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Actualizar usuario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER USUARIO */}
      {isViewModalOpen && selectedEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50]">Detalles del empleado</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 border border-slate-200">
                  {getInitials(selectedEmpleado.nombre || selectedEmpleado.name || "")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#283F50]">{selectedEmpleado.nombre || selectedEmpleado.name}</h3>
                  <p className="text-sm text-slate-500">{typeof selectedEmpleado.departamento === 'object' && selectedEmpleado.departamento ? selectedEmpleado.departamento.nombre : (selectedEmpleado.departamento || "Sin área asignada")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase">Correo</p>
                  <p className="text-sm text-slate-700 font-medium break-all">{selectedEmpleado.correo || selectedEmpleado.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase">Teléfono</p>
                  <p className="text-sm text-slate-700 font-medium">{selectedEmpleado.telefono || selectedEmpleado.phone || "No registrado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase">Riesgo Phishing</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-700 font-bold">
                      {selectedEmpleado.scoreRiesgo ?? selectedEmpleado.score ?? 0}%
                    </span>
                    {(() => {
                      const info = getRiesgoInfo(selectedEmpleado.scoreRiesgo ?? selectedEmpleado.score ?? 0);
                      return (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${info.color}`}>
                          {info.texto}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase">Días Seguros (Racha)</p>
                  <p className="text-sm text-slate-700 font-bold">{selectedEmpleado.rachaDiasSeguros ?? 0} días</p>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <Button onClick={() => setIsViewModalOpen(false)} className="bg-[#283F50] text-white hover:bg-[#1a2936]">Cerrar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR USUARIO */}
      {isDeleteModalOpen && selectedEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">¿Eliminar empleado?</h2>
              <p className="text-sm text-slate-500">
                Estás a punto de eliminar a <strong>{selectedEmpleado.nombre || selectedEmpleado.name}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="bg-white">Cancelar</Button>
              <Button onClick={handleDeleteUser} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Gestión de usuarios</h1>
          <p className="text-slate-500 mt-1">Administra empleados y departamentos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#E5A93C] text-[#283F50] hover:bg-[#D49A35] font-semibold h-11 px-6 rounded-lg shadow-sm">
          <Plus className="mr-2 h-5 w-5" /> Agregar usuario
        </Button>
      </div>

      {/* TARJETA CÓDIGO DE VINCULACIÓN MÓVIL */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start md:items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#283F50] border border-slate-200 flex-shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Código de vinculación móvil</h3>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Los colaboradores utilizan este código junto a su correo corporativo para vincular la aplicación móvil PhishWarden.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 pl-3 self-start md:self-auto">
          <div className="flex flex-col pr-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Código de acceso</span>
            <span className="font-mono text-base font-bold text-[#283F50] tracking-wider">
              {codigoAcceso || "..."}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyCodigo}
            disabled={!codigoAcceso}
            className="h-9 px-3 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium transition-all"
          >
            {codigoCopiado ? (
              <>
                <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                <span className="text-emerald-700 text-xs font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1.5 text-slate-500" />
                <span className="text-xs font-medium">Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>

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
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
        <Button onClick={() => fileInputRef.current?.click()} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-11 px-6 rounded-lg font-medium transition-colors flex-shrink-0">
          <Upload className="mr-2 h-4 w-4" /> Importar archivo
        </Button>
      </div>

      {/* CARRUSEL DE DEPARTAMENTOS */}
      <div className="relative group py-1">
        <button
          onClick={() => scrollDeps("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 h-9 w-9 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-500 hover:text-[#E5A93C] hover:border-[#E5A93C] transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 snap-x hide-scrollbar scroll-smooth px-1 py-1">
          {isLoadingDeps ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-pulse min-w-[280px] flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : departamentos.length === 0 ? (
            <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500 text-sm">
              No hay departamentos registrados.
            </div>
          ) : (
            departamentos.map((dep, index) => {
              const isActive = departamentoFiltro?.id === dep.id;
              return (
                <div 
                  key={dep.id || index} 
                  onClick={() => toggleDepartamentoFiltro(dep)}
                  className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 transition-all cursor-pointer min-w-[280px] flex-shrink-0 snap-start ${
                    isActive 
                      ? "border-[#E5A93C] ring-1 ring-[#E5A93C] bg-[#E5A93C]/5" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase transition-colors ${
                    isActive ? "bg-[#E5A93C] text-white" : "bg-slate-50 border border-slate-100 text-slate-500"
                  }`}>
                    {dep.nombre ? dep.nombre.substring(0, 2) : "DP"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#283F50] truncate">{dep.nombre || "Sin nombre"}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {dep.colaboradores || dep._count?.empleados || 0} colaboradores
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-[10px] text-slate-400 font-medium">Riesgo</p>
                    <p className="text-sm font-bold text-[#283F50]">{dep.scoreRiesgo || "0.0"}%</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => scrollDeps("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 h-9 w-9 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-500 hover:text-[#E5A93C] hover:border-[#E5A93C] transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#283F50]">Directorio de empleados</h3>
                <p className="text-sm text-slate-500">{isLoading ? "Buscando..." : `${totalRegistros} usuarios encontrados`}</p>
              </div>
              
              {/* TAG DE FILTRO */}
              {departamentoFiltro && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E5A93C]/20 text-[#283F50] border border-[#E5A93C]/30 ml-0 sm:ml-4">
                  Filtro: {departamentoFiltro.nombre}
                  <button 
                    onClick={() => { setDepartamentoFiltro(null); setPage(1); }} 
                    className="hover:bg-[#E5A93C]/30 rounded-full p-0.5 transition-colors focus:outline-none"
                    aria-label="Quitar filtro"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar empleado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-slate-50 border-slate-200 h-10 rounded-lg focus-visible:ring-[#E5A93C]"/>
            </div>
          </div>

          {/* FILTROS RÁPIDOS POR NIVEL DE RIESGO */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium mr-1">Nivel de riesgo:</span>
            <button
              type="button"
              onClick={() => setFiltroRiesgo("todos")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filtroRiesgo === "todos"
                  ? "bg-[#283F50] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({empleados.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroRiesgo("bajo")}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                filtroRiesgo === "bajo"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Bajo / Seguro ({conteoBajo})
            </button>
            <button
              type="button"
              onClick={() => setFiltroRiesgo("medio")}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                filtroRiesgo === "medio"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Medio ({conteoMedio})
            </button>
            <button
              type="button"
              onClick={() => setFiltroRiesgo("critico")}
              className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                filtroRiesgo === "critico"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Crítico ({conteoCritico})
            </button>
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
          {!isLoading && !error && empleadosMostrados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Search className="h-10 w-10 mb-4 opacity-50" />
              <p className="font-medium text-[#283F50]">No se encontraron resultados</p>
              <p className="text-sm">
                {filtroRiesgo !== "todos"
                  ? "No hay colaboradores en este rango de riesgo en la página actual."
                  : departamentoFiltro
                  ? "No hay usuarios en este departamento."
                  : "Prueba con otro nombre o correo."}
              </p>
            </div>
          )}
          {!isLoading && !error && empleadosMostrados.length > 0 && (
            <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
              <tbody className="divide-y divide-slate-100">
                {empleadosMostrados.map((emp, index) => {
                  const riesgoInfo = getRiesgoInfo(emp.scoreRiesgo ?? emp.score ?? 0);
                  const scoreVal = Number(emp.scoreRiesgo ?? emp.score ?? 0);
                  return (
                    <tr key={emp.id || index} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                            {getInitials(emp.nombre || emp.name || "")}
                          </div>
                          <div>
                            <p className="font-semibold text-[#283F50]">{emp.nombre || emp.name || "Sin nombre"}</p>
                            <p className="text-xs text-slate-400">{emp.correo || emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {typeof emp.departamento === 'object' && emp.departamento ? emp.departamento.nombre : (emp.departamento || "Sin área")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5 min-w-[150px]">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${riesgoInfo.color}`}>
                              {riesgoInfo.texto}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {scoreVal}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${riesgoInfo.barColor}`}
                              style={{ width: `${Math.min(100, Math.max(0, scoreVal))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none outline-none">
                            <div className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 text-slate-600 shadow-md">
                            <DropdownMenuItem onClick={() => openViewModal(emp)} className="hover:bg-slate-50 cursor-pointer py-2">
                              <Eye className="mr-2 h-4 w-4" /> <span>Ver empleado</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(emp)} className="hover:bg-slate-50 cursor-pointer py-2">
                              <Edit className="mr-2 h-4 w-4" /> <span>Editar empleado</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem onClick={() => { setSelectedEmpleado(emp); setIsDeleteModalOpen(true); }} className="hover:bg-red-50 focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer py-2">
                              <Trash2 className="mr-2 h-4 w-4" /> <span>Eliminar empleado</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && !error && totalRegistros > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Mostrando página <span className="font-semibold text-[#283F50]">{page}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3">
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={empleados.length < limit} className="h-8 px-3">
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}