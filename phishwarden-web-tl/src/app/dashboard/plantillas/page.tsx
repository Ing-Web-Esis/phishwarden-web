"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, BookOpen, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, Monitor, Smartphone, X, CheckCircle2, AlertCircle, Eye, Edit, Trash2, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estados para modales de acciones
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedPlantilla, setSelectedPlantilla] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    bodyHtml: "",
    attackType: "PHISHING",
    difficulty: "MEDIO"
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    subject: "",
    bodyHtml: "",
    attackType: "PHISHING",
    difficulty: "MEDIO"
  });

  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: "success" | "error" }>({
    visible: false, title: "", message: "", type: "success"
  });

  // Filtros y Paginación
  const [page, setPage] = useState(1);
  const limit = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [attackTypeFiltro, setAttackTypeFiltro] = useState("");
  const [difficultyFiltro, setDifficultyFiltro] = useState("");

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

  const fetchPlantillas = async () => {
    setIsLoading(true);
    try {
      const empresaId = localStorage.getItem("empresaId");
      const token = localStorage.getItem("token");
      if (!empresaId || !token) return;

      const url = new URL(`http://localhost:3000/empresas/${empresaId}/plantillas`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      
      if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
      if (attackTypeFiltro) url.searchParams.append("attackType", attackTypeFiltro);
      if (difficultyFiltro) url.searchParams.append("difficulty", difficultyFiltro);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPlantillas(data.data || []);
        setTotalRegistros(data.total || data.data?.length || 0);
      }
    } catch (err) {
      console.error("Error al cargar plantillas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, [page, debouncedSearch, attackTypeFiltro, difficultyFiltro]);

  const handleCreatePlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/plantillas`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ title: "", subject: "", bodyHtml: "", attackType: "PHISHING", difficulty: "MEDIO" });
        showToast("Plantilla creada", "La plantilla se agregó correctamente a tu biblioteca.", "success");
        fetchPlantillas();
      } else {
        const err = await response.json().catch(() => ({}));
        showToast("No se pudo guardar", err.message || "Revisa los campos ingresados.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: editFormData.title,
      subject: editFormData.subject,
      bodyHtml: editFormData.bodyHtml,
      attackType: editFormData.attackType,
      difficulty: editFormData.difficulty
    };

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/plantillas/${editFormData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        showToast("Plantilla actualizada", "Los cambios han sido guardados.", "success");
        fetchPlantillas();
      } else {
        const err = await response.json().catch(() => ({}));
        showToast("No se pudo actualizar", err.message || "Revisa los datos ingresados.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlantilla = async () => {
    setIsSubmitting(true);
    const empresaId = localStorage.getItem("empresaId");
    const token = localStorage.getItem("token");

    if (!empresaId || !token) {
      showToast("Error de sesión", "Vuelve a iniciar sesión.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/empresas/${empresaId}/plantillas/${selectedPlantilla.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        showToast("Plantilla eliminada", "La plantilla fue retirada de la biblioteca.", "success");
        fetchPlantillas();
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

  const openViewModal = (plantilla: any) => {
    setSelectedPlantilla(plantilla);
    setIsViewModalOpen(true);
  };

  const openEditModal = (plantilla: any) => {
    setEditFormData({
      id: plantilla.id,
      title: plantilla.title || "",
      subject: plantilla.subject || "",
      bodyHtml: plantilla.bodyHtml || "",
      attackType: plantilla.attackType || "PHISHING",
      difficulty: plantilla.difficulty || "MEDIO"
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (plantilla: any) => {
    setSelectedPlantilla(plantilla);
    setIsDeleteModalOpen(true);
  };

  const PreviewBrowser = ({ subject, bodyHtml }: { subject: string, bodyHtml: string }) => {
    const plainText = bodyHtml?.replace(/<[^>]+>/g, '') || "";
    return (
      <div className="w-[85%] h-[85%] bg-white rounded-md shadow border border-slate-200 flex flex-col overflow-hidden text-left transition-transform group-hover:scale-105">
        <div className="h-5 border-b border-slate-100 flex items-center px-2 bg-slate-100/80 gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        </div>
        <div className="p-1.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <p className="text-[8px] font-semibold text-slate-700 truncate">Asunto: {subject || "Sin asunto"}</p>
        </div>
        <div className="flex-1 p-2 overflow-hidden bg-white">
          <p className="text-[7px] text-slate-500 leading-[1.4] line-clamp-6">{plainText || "Sin contenido"}</p>
        </div>
      </div>
    );
  };

  const PreviewPhone = ({ bodyHtml }: { bodyHtml: string }) => {
    const plainText = bodyHtml?.replace(/<[^>]+>/g, '') || "";
    return (
      <div className="w-[60px] h-[120px] bg-slate-800 rounded-[14px] p-[3px] shadow border border-slate-700 transition-transform group-hover:scale-105">
        <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex flex-col relative text-left">
          <div className="h-3 bg-slate-100 flex justify-center items-center flex-shrink-0">
            <div className="w-4 h-[2px] bg-slate-300 rounded-full"></div>
          </div>
          <div className="flex-1 p-1.5 flex flex-col gap-1 overflow-hidden bg-slate-50">
            <div className="bg-[#E9E9EB] text-slate-800 rounded-[4px] p-1.5 w-[90%] self-start">
              <p className="text-[4px] leading-tight line-clamp-5">{plainText || "Sin contenido"}</p>
            </div>
          </div>
        </div>
      </div>
    );
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

      {/* Modal Crear */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50]">Nueva plantilla</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlantilla} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Título de la plantilla</label>
                <Input required placeholder="Ej. Actualización Urgente de Credenciales" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Asunto (Remitente)</label>
                <Input required placeholder="Ej. Acción Requerida: Verificar su cuenta" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de Ataque</label>
                  <select required value={formData.attackType} onChange={(e) => setFormData({...formData, attackType: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]">
                    <option value="PHISHING">Email (Phishing)</option>
                    <option value="SMISHING">SMS (Smishing)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dificultad</label>
                  <select required value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]">
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contenido HTML / Mensaje</label>
                <textarea required rows={4} placeholder="<p>Estimado {{nombre}}, detectamos un inicio de sesión inusual.</p>" value={formData.bodyHtml} onChange={(e) => setFormData({...formData, bodyHtml: e.target.value})} className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] font-mono resize-y"/>
                <p className="text-[11px] text-slate-500">Variables disponibles: <code className="bg-slate-100 px-1 py-0.5 rounded">{"{{nombre}}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{"{{correo}}"}</code></p>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-200">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#283F50] text-white hover:bg-[#1a2936]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear plantilla"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50]">Editar plantilla</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditPlantilla} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Título de la plantilla</label>
                <Input required value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Asunto (Remitente)</label>
                <Input required value={editFormData.subject} onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})} className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C]"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de Ataque</label>
                  <select required value={editFormData.attackType} onChange={(e) => setEditFormData({...editFormData, attackType: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]">
                    <option value="PHISHING">Email (Phishing)</option>
                    <option value="SMISHING">SMS (Smishing)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dificultad</label>
                  <select required value={editFormData.difficulty} onChange={(e) => setEditFormData({...editFormData, difficulty: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]">
                    <option value="BAJO">Bajo</option>
                    <option value="MEDIO">Medio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contenido HTML / Mensaje</label>
                <textarea required rows={4} value={editFormData.bodyHtml} onChange={(e) => setEditFormData({...editFormData, bodyHtml: e.target.value})} className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] font-mono resize-y"/>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-slate-200">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#283F50] text-white hover:bg-[#1a2936]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Actualizar plantilla"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA INMERSIVA */}
      {isViewModalOpen && selectedPlantilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          
          {selectedPlantilla.attackType === "SMISHING" ? (
            /* --- VISTA SMS (SIMULACIÓN SMARTPHONE) --- */
            <div className="relative w-[320px] h-[650px] bg-slate-50 rounded-[45px] shadow-2xl border-[12px] border-slate-900 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-32 h-5 bg-slate-900 rounded-b-2xl"></div>
              </div>
              
              {/* Status bar */}
              <div className="h-12 bg-slate-100 flex justify-between items-end px-6 pb-2 text-[10px] font-medium text-slate-800 z-10">
                <span>10:45</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 items-end h-2.5">
                    <div className="w-0.5 h-1 bg-slate-800 rounded-full"></div>
                    <div className="w-0.5 h-1.5 bg-slate-800 rounded-full"></div>
                    <div className="w-0.5 h-2 bg-slate-800 rounded-full"></div>
                    <div className="w-0.5 h-2.5 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="w-4 h-2.5 border border-slate-800 rounded-sm relative">
                    <div className="absolute inset-[1px] bg-slate-800 w-[70%] rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Header SMS */}
              <div className="bg-slate-100/80 backdrop-blur-md pb-2 px-2 flex items-center justify-between border-b border-slate-200 z-10 relative">
                <button onClick={() => setIsViewModalOpen(false)} className="flex items-center text-blue-500 hover:text-blue-600">
                  <ChevronLeft className="h-6 w-6" />
                  <span className="text-xs font-medium -ml-1">Atrás</span>
                </button>
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center mb-0.5">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-900 truncate max-w-[120px]">{selectedPlantilla.subject || "Desconocido"}</span>
                </div>
                <div className="w-12 text-blue-500 text-xs text-right pr-2">Detalles</div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-white p-4 overflow-y-auto flex flex-col gap-3 relative pb-20">
                <p className="text-[10px] text-center text-slate-400 font-medium mb-2 mt-2">Hoy 10:45 a.m.</p>
                <div className="bg-[#E9E9EB] text-black px-3.5 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%] self-start text-[14px] leading-snug break-words shadow-sm">
                  {selectedPlantilla.bodyHtml?.replace(/<[^>]+>/g, '')}
                </div>
              </div>

              {/* Input SMS Falso */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-100 border-t border-slate-200 flex items-center px-4 gap-3 z-10">
                <Plus className="h-5 w-5 text-slate-400" />
                <div className="flex-1 h-8 rounded-full border border-slate-300 bg-white flex items-center px-3">
                  <span className="text-slate-400 text-xs">Mensaje de texto</span>
                </div>
              </div>

              {/* Botón cerrar externo */}
              <div className="absolute -top-3 -right-3 hidden md:block">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-white rounded-full p-1.5 shadow-lg border border-slate-200 text-slate-500 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* --- VISTA EMAIL (SIMULACIÓN GMAIL) --- */
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex gap-3">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-6 w-px bg-slate-300 mx-2"></div>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5" /> Vista previa en PC
                  </span>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                {/* Cabecera del correo */}
                <div className="px-8 pt-8 pb-4">
                  <h1 className="text-[22px] font-normal text-slate-900 mb-6">{selectedPlantilla.subject}</h1>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#283F50] flex items-center justify-center text-white font-medium text-lg">
                        {selectedPlantilla.subject ? selectedPlantilla.subject.charAt(0).toUpperCase() : "R"}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm text-slate-900">Remitente</span>
                          <span className="text-xs text-slate-500">&lt;notificaciones@empresa.com&gt;</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">para usuario <ChevronDown className="inline h-3 w-3" /></p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Hoy, 10:45 AM</div>
                  </div>
                </div>
                
                {/* Cuerpo del correo renderizado */}
                <div className="px-8 pb-10">
                  <div 
                    className="prose prose-sm max-w-none text-slate-800" 
                    dangerouslySetInnerHTML={{ __html: selectedPlantilla.bodyHtml }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteModalOpen && selectedPlantilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">¿Eliminar plantilla?</h2>
              <p className="text-sm text-slate-500">
                Estás a punto de eliminar <strong>{selectedPlantilla.title}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="bg-white">Cancelar</Button>
              <Button onClick={handleDeletePlantilla} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Biblioteca de plantillas</h1>
          <p className="text-slate-500 mt-1">Vectores listos para adaptar a tus campañas de concientización.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#E5A93C] text-[#283F50] hover:bg-[#D49A35] font-semibold h-11 px-6 rounded-lg shadow-sm">
          <Plus className="mr-2 h-5 w-5" /> Crear plantilla
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar plantillas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-slate-200 h-10 rounded-lg focus-visible:ring-[#E5A93C]"
          />
        </div>
        <select value={attackTypeFiltro} onChange={(e) => { setAttackTypeFiltro(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] w-full sm:w-48 cursor-pointer">
          <option value="">Todos los canales</option>
          <option value="PHISHING">Email (Phishing)</option>
          <option value="SMISHING">SMS (Smishing)</option>
        </select>
        <select value={difficultyFiltro} onChange={(e) => { setDifficultyFiltro(e.target.value); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C] w-full sm:w-48 cursor-pointer">
          <option value="">Todas las dificultades</option>
          <option value="BAJO">Nivel Bajo</option>
          <option value="MEDIO">Nivel Medio</option>
          <option value="ALTO">Nivel Alto</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#E5A93C]" />
          <p>Cargando biblioteca...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {plantillas.map((plantilla) => (
            <div key={plantilla.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
              <div className="bg-slate-50 h-48 flex items-center justify-center p-6 relative overflow-hidden border-b border-slate-100">
                {plantilla.attackType === "SMISHING" ? <PreviewPhone bodyHtml={plantilla.bodyHtml} /> : <PreviewBrowser subject={plantilla.subject} bodyHtml={plantilla.bodyHtml} />}
                
                {plantilla.isGlobal && (
                  <span className="absolute top-3 left-3 bg-[#283F50]/10 text-[#283F50] text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                    Global
                  </span>
                )}
                <span className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                  plantilla.difficulty === "BAJO" ? "bg-amber-100 text-amber-700" :
                  plantilla.difficulty === "MEDIO" ? "bg-orange-100 text-orange-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  Dificultad {plantilla.difficulty}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                <div>
                  <p className="text-[#E5A93C] text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    {plantilla.attackType === "SMISHING" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                    {plantilla.attackType === "SMISHING" ? "SMS" : "EMAIL"}
                  </p>
                  <h3 className="font-semibold text-[#283F50] text-sm line-clamp-2 leading-snug mb-1" title={plantilla.title}>
                    {plantilla.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1" title={plantilla.subject}>
                    {plantilla.subject || "Sin asunto"}
                  </p>
                </div>
                
                <div className="absolute bottom-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none outline-none">
                      <div className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white border-slate-200 text-slate-600 shadow-md">
                      <DropdownMenuItem onClick={() => openViewModal(plantilla)} className="hover:bg-slate-50 cursor-pointer py-2">
                        <Eye className="mr-2 h-4 w-4" /> Vista previa
                      </DropdownMenuItem>
                      {!plantilla.isGlobal && (
                        <>
                          <DropdownMenuItem onClick={() => openEditModal(plantilla)} className="hover:bg-slate-50 cursor-pointer py-2">
                            <Edit className="mr-2 h-4 w-4" /> Editar plantilla
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem onClick={() => openDeleteModal(plantilla)} className="hover:bg-red-50 focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer py-2">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar plantilla
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {!isLoading && totalRegistros > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 mt-6 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-slate-500">
            Mostrando página <span className="font-semibold text-[#283F50]">{page}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-slate-200">
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={plantillas.length < limit} className="h-8 px-3 border-slate-200">
              Siguiente <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}