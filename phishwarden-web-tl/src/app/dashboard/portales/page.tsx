"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Plus,
  Search,
  Loader2,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  PortalSimuladoItem,
  CreatePortalInput,
  UpdatePortalInput,
} from "@/lib/types";
import { PortalCard } from "./components/PortalCard";
import { PortalFormModal } from "./components/PortalFormModal";
import { PortalPreviewModal } from "./components/PortalPreviewModal";
import { PortalDeleteModal } from "./components/PortalDeleteModal";

type TabFilter = "todos" | "globales" | "personalizados";

export default function PortalesPage() {
  const [portales, setPortales] = useState<PortalSimuladoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [portalToEdit, setPortalToEdit] = useState<PortalSimuladoItem | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [portalToPreview, setPortalToPreview] = useState<PortalSimuladoItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<PortalSimuladoItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notificaciones Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const showToast = (title: string, message: string, type: "success" | "error") => {
    setToast({ visible: true, title, message, type });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(
        () => setToast((prev) => ({ ...prev, visible: false })),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Carga de portales desde el backend
  const loadPortales = async () => {
    setIsLoading(true);
    const empresaId = localStorage.getItem("empresaId");
    if (!empresaId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<PortalSimuladoItem[]>(
        `/empresas/${empresaId}/portales`
      );
      if (Array.isArray(data)) {
        setPortales(data);
      }
    } catch (err) {
      console.error("Error al cargar portales simulados:", err);
      showToast("Error", "No fue posible cargar el catálogo de portales.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortales();
  }, []);

  // Filtrado de portales en memoria
  const filteredPortales = useMemo(() => {
    return portales.filter((portal) => {
      // Precisión técnica 2: Cálculo seguro de portal global
      const isGlobal = portal.esGlobal ?? portal.empresaId === null;

      if (activeTab === "globales" && !isGlobal) return false;
      if (activeTab === "personalizados" && isGlobal) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNombre = portal.nombre.toLowerCase().includes(query);
        const matchesTitulo = portal.tituloPortal.toLowerCase().includes(query);
        const matchesTipo = portal.tipoBase.toLowerCase().includes(query);
        return matchesNombre || matchesTitulo || matchesTipo;
      }

      return true;
    });
  }, [portales, activeTab, searchTerm]);

  // Conteos para tabs
  const countGlobales = useMemo(
    () => portales.filter((p) => p.esGlobal ?? p.empresaId === null).length,
    [portales]
  );
  const countPersonalizados = useMemo(
    () => portales.filter((p) => !(p.esGlobal ?? p.empresaId === null)).length,
    [portales]
  );

  // Handlers para Crear / Editar
  const handleOpenCreate = () => {
    setPortalToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (portal: PortalSimuladoItem) => {
    setPortalToEdit(portal);
    setIsFormOpen(true);
  };

  const handleSavePortal = async (
    data: CreatePortalInput | UpdatePortalInput,
    portalId?: number
  ) => {
    const empresaId = localStorage.getItem("empresaId");
    if (!empresaId) {
      showToast("Sesión expirada", "Por favor inicia sesión nuevamente.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (portalId) {
        // Actualizar
        await apiClient.put(
          `/empresas/${empresaId}/portales/${portalId}`,
          data
        );
        showToast("Portal actualizado", "Los cambios han sido guardados.", "success");
      } else {
        // Crear
        await apiClient.post(
          `/empresas/${empresaId}/portales`,
          data
        );
        showToast("Portal creado", "El portal simulado está listo para usarse.", "success");
      }
      setIsFormOpen(false);
      await loadPortales();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("Error", err.message || "No se pudo guardar el portal.", "error");
      } else {
        showToast("Error", "Ocurrió un error inesperado al guardar.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers para Previsualizar
  const handleOpenPreview = (portal: PortalSimuladoItem) => {
    setPortalToPreview(portal);
    setIsPreviewOpen(true);
  };

  // Handlers para Eliminar
  const handleOpenDelete = (portal: PortalSimuladoItem) => {
    setPortalToDelete(portal);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!portalToDelete) return;
    const empresaId = localStorage.getItem("empresaId");
    if (!empresaId) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(
        `/empresas/${empresaId}/portales/${portalToDelete.id}`
      );
      showToast(
        "Portal eliminado",
        `El portal "${portalToDelete.nombre}" fue retirado.`,
        "success"
      );
      setIsDeleteOpen(false);
      await loadPortales();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("Error", err.message || "No se pudo eliminar el portal.", "error");
      } else {
        showToast("Error", "Ocurrió un error al intentar eliminar.", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notificación */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-slate-200 shadow-xl rounded-xl p-4 animate-in slide-in-from-top-4 duration-200">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{toast.title}</h4>
            <p className="text-xs text-slate-500">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#283F50] tracking-tight mb-1">
            Catálogo de Portales Simulados
          </h1>
          <p className="text-sm text-slate-500">
            Administra las páginas de aterrizaje falsas hacia donde son dirigidos los
            colaboradores en las pruebas de simulación.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#283F50] text-white hover:bg-[#1a2936] shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Portal Personalizado</span>
        </Button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Pestañas de Filtrado */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("todos")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "todos"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Todos ({portales.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("globales")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "globales"
                ? "bg-white text-[#283F50] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield className="h-3 w-3 text-amber-500" />
            <span>Globales ({countGlobales})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personalizados")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "personalizados"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="h-3 w-3" />
            <span>Personalizados ({countPersonalizados})</span>
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C] text-sm"
          />
        </div>
      </div>

      {/* Listado de Tarjetas */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-slate-400" />
          <p className="text-xs">Cargando portales simulados...</p>
        </div>
      ) : filteredPortales.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">
            No se encontraron portales
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
              : activeTab === "personalizados"
              ? "Tu organización no tiene portales simulados personalizados aún. Crea el primero haciendo clic en el botón superior."
              : "No hay portales registrados."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortales.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <PortalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSavePortal}
        portalToEdit={portalToEdit}
        isSubmitting={isSubmitting}
      />

      <PortalPreviewModal
        isOpen={isPreviewOpen}
        portal={portalToPreview}
        onClose={() => setIsPreviewOpen(false)}
      />

      <PortalDeleteModal
        isOpen={isDeleteOpen}
        portal={portalToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
