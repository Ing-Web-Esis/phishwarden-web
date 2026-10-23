"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileSpreadsheet, Search, MoreHorizontal, Loader2, AlertCircle, ChevronLeft, ChevronRight, Plus, X, CheckCircle2, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function UsuariosPage() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [isLoadingDeps, setIsLoadingDeps] = useState(true);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [departamentoFiltro, setDepartamentoFiltro] = useState<{id: string | number, nombre: string} | null>(null);
  const limit = 10; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedEmpleado, setSelectedEmpleado] = useState<any>(null);
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

  const scrollDeps = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      scrollContainerRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const fetchDepartamentos = async () => {
    setIsLoadingDeps(true);
    try {
      const empresaId = localStorage.getItem("empresaId");
      const token = localStorage.getItem("token");
      if (!empresaId || !token) return;

      const response = await fetch(`http://localhost:3000/departamentos?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDepartamentos(data.data || data);
      }
    } catch (err) {
      console.error("Error al cargar departamentos:", err);
    } finally {
      setIsLoadingDeps(false);
    }
  };

  const fetchEmpleados = async () => {
    setIsLoading(true);
    try {
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró una organización asociada.");

      const url = new URL(`http://localhost:3000/empresas/${empresaId}/empleados/resumen`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      
      if (debouncedSearch) {
        url.searchParams.append("search", debouncedSearch); 
      }
      
      // Enviamos exactamente 'departmentId' como lo requiere tu backend
      if (departamentoFiltro?.id) {
        url.searchParams.append("departmentId", departamentoFiltro.id.toString());
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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [page, debouncedSearch, departamentoFiltro]);

  const toggleDepartamentoFiltro = (dep: any) => {
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
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append("file", file);

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/empleados/import-csv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fileFormData
      });

      if (response.ok) {
        showToast("Éxito", "Directorio importado correctamente.", "success");
        fetchEmpleados();
        fetchDepartamentos();
      } else {
        const err = await response.json().catch(() => ({}));
        showToast("Error al importar", err.message || "Revisa el formato del archivo CSV.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "No se pudo subir el archivo.", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    // Payload exacto según tu estructura de backend
    const payload = {
      name: formData.nombre,
      email: formData.correo,
      departmentId: Number(formData.departmentId),
      phone: `+51 ${formData.telefono}`
    };

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/empleados`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ nombre: "", correo: "", departmentId: "", telefono: "" });
        showToast("Usuario creado", `${payload.name} fue añadido al directorio.`, "success");
        fetchEmpleados();
        fetchDepartamentos();
      } else {
        const err = await response.json().catch(() => ({}));
        const mensajeTraducido = err.message ? (Array.isArray(err.message) ? err.message.join(", ") : err.message) : "Revisa los datos ingresados.";
        showToast("No se pudo guardar", mensajeTraducido, "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    let phoneStr = editFormData.telefono;
    if (!phoneStr.startsWith("+51")) {
      phoneStr = `+51 ${phoneStr}`;
    }

    // Payload exacto según tu estructura
    const payload = {
      name: editFormData.nombre,
      email: editFormData.correo,
      departmentId: Number(editFormData.departmentId),
      phone: phoneStr
    };

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/empleados/${editFormData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        showToast("Usuario actualizado", `Los datos de ${payload.name} fueron actualizados.`, "success");
        fetchEmpleados();
        fetchDepartamentos();
      } else {
        const err = await response.json().catch(() => ({}));
        const mensajeTraducido = err.message ? (Array.isArray(err.message) ? err.message.join(", ") : err.message) : "Revisa los datos ingresados.";
        showToast("No se pudo actualizar", mensajeTraducido, "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/empleados/${selectedEmpleado.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        showToast("Usuario eliminado", "El empleado fue retirado del directorio.", "success");
        fetchEmpleados();
        fetchDepartamentos();
      } else {
        const err = await response.json().catch(() => ({}));
        showToast("No se pudo eliminar", err.message || "Error al intentar borrar el registro.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = async (emp: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/empleados/${emp.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const detalleData = await response.json();
        setSelectedEmpleado({ ...emp, ...detalleData });
        setIsViewModalOpen(true);
      } else {
        showToast("No se pudo cargar", "Error al obtener los detalles del empleado.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    }
  };

  const openEditModal = async (emp: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/empleados/${emp.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const detalleData = await response.json();
        const fullEmp = { ...emp, ...detalleData };

        let cleanPhone = fullEmp.telefono || fullEmp.phone || "";
        cleanPhone = cleanPhone.replace("+51 ", "");

        // Buscamos el ID del departamento desde los datos combinados
        const depId = fullEmp.departmentId || fullEmp.departamentoId || fullEmp.departamento?.id || "";

        setEditFormData({
          id: fullEmp.id,
          nombre: fullEmp.nombre || fullEmp.name || "",
          correo: fullEmp.correo || fullEmp.email || "",
          departmentId: depId.toString(),
          telefono: cleanPhone
        });
        setIsEditModalOpen(true);
      } else {
        showToast("No se pudo cargar", "Error al obtener los detalles para editar.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    }
  };

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
                  {getInitials(selectedEmpleado.nombre || selectedEmpleado.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#283F50]">{selectedEmpleado.nombre || selectedEmpleado.name}</h3>
                  <p className="text-sm text-slate-500">{selectedEmpleado.departamento?.nombre || selectedEmpleado.departamento || "Sin área asignada"}</p>
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
                  <p className="text-sm text-slate-700 font-bold">{selectedEmpleado.scoreRiesgo ?? selectedEmpleado.score ?? 0}%</p>
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
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <p className="text-sm">{departamentoFiltro ? "No hay usuarios en este departamento." : "Prueba con otro nombre o correo."}</p>
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
                            {getInitials(emp.nombre || emp.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#283F50]">{emp.nombre || emp.name || "Sin nombre"}</p>
                            <p className="text-xs text-slate-400">{emp.correo || emp.email}</p>
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