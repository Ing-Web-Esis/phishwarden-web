"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  CheckCheck,
  Ban,
  Eye,
  Edit,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
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
  CampaignItem,
  CampaignSummary,
  CampaignStatus,
  PaginatedResponse,
  DispatchCampaignResponse,
} from "@/lib/types";
import { CreateEditCampaignModal } from "@/components/campanas/CreateEditCampaignModal";
import { CampaignDetailModal } from "@/components/campanas/CampaignDetailModal";
import { DuplicateCampaignModal } from "@/components/campanas/DuplicateCampaignModal";

export default function CampanasPage() {
  // Resumen Ejecutivo (KPIs)
  const [summary, setSummary] = useState<CampaignSummary>({
    total: 0,
    programadas: 0,
    enCurso: 0,
    finalizadas: 0,
    canceladas: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Listado de Campañas
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [errorCampaigns, setErrorCampaigns] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Filtros y Paginación
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [attackTypeFiltro, setAttackTypeFiltro] = useState<string>("");

  // Recarga sincronizada
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<CampaignItem | null>(null);

  const [detailCampaignId, setDetailCampaignId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [campaignToDuplicate, setCampaignToDuplicate] = useState<CampaignItem | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Cancelación
  const [campaignToCancel, setCampaignToCancel] = useState<CampaignItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Finalización
  const [campaignToFinalize, setCampaignToFinalize] = useState<CampaignItem | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");

  // Despacho Manual Inmediato
  const [campaignToDispatch, setCampaignToDispatch] = useState<CampaignItem | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // Toast
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
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Cargar resumen de KPIs
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoadingSummary(true);
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) return;

        const data = await apiClient.get<CampaignSummary>(
          `/empresas/${empresaId}/campanas/resumen`
        );
        if (data) {
          setSummary(data);
        }
      } catch (err) {
        console.error("Error al cargar resumen de campañas:", err);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadSummary();
  }, [reloadTrigger]);

  // Cargar listado paginado de campañas
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true);
        setErrorCampaigns("");
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) return;

        const params: Record<string, string | number> = {
          page,
          limit,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (statusFiltro) {
          params.status = statusFiltro;
        }
        if (attackTypeFiltro) {
          params.attackType = attackTypeFiltro;
        }

        const res = await apiClient.get<PaginatedResponse<CampaignItem>>(
          `/empresas/${empresaId}/campanas`,
          { params }
        );

        if (res && Array.isArray(res.data)) {
          setCampaigns(res.data);
          setTotalRegistros(res.total ?? res.data.length);
        } else if (Array.isArray(res)) {
          setCampaigns(res);
          setTotalRegistros((res as CampaignItem[]).length);
        } else {
          setCampaigns([]);
          setTotalRegistros(0);
        }
      } catch (err: unknown) {
        console.error("Error al cargar campañas:", err);
        if (err instanceof ApiError) {
          setErrorCampaigns(err.message);
        } else if (err instanceof Error) {
          setErrorCampaigns(err.message);
        } else {
          setErrorCampaigns("No se pudieron obtener las campañas.");
        }
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    loadCampaigns();
  }, [page, debouncedSearch, statusFiltro, attackTypeFiltro, reloadTrigger]);

  // Confirmar cancelación de campaña
  const handleConfirmCancel = async () => {
    if (!campaignToCancel) return;

    try {
      setIsCancelling(true);
      setCancelError("");
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      await apiClient.patch(
        `/empresas/${empresaId}/campanas/${campaignToCancel.id}/cancelar`
      );

      showToast("Campaña Cancelada", `La campaña "${campaignToCancel.name}" fue cancelada exitosamente.`, "success");
      setCampaignToCancel(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error al cancelar campaña:", err);
      if (err instanceof ApiError) {
        setCancelError(err.message);
      } else if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("Error inesperado al cancelar la campaña.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Confirmar finalización de campaña
  const handleConfirmFinalize = async () => {
    if (!campaignToFinalize) return;

    try {
      setIsFinalizing(true);
      setFinalizeError("");
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      const result = await apiClient.patch<{ message?: string; campaignId?: string }>(
        `/empresas/${empresaId}/campanas/${campaignToFinalize.id}/finalizar`
      );

      showToast(
        "Campaña Finalizada",
        result?.message || `La campaña "${campaignToFinalize.name}" fue finalizada exitosamente.`,
        "success"
      );
      setCampaignToFinalize(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error al finalizar campaña:", err);
      if (err instanceof ApiError) {
        setFinalizeError(err.message);
      } else if (err instanceof Error) {
        setFinalizeError(err.message);
      } else {
        setFinalizeError("Error inesperado al finalizar la campaña.");
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  // Confirmar despacho manual de campaña
  const handleConfirmDispatch = async () => {
    if (!campaignToDispatch) return;

    try {
      setIsDispatching(true);
      setDispatchError("");
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      const result = await apiClient.post<DispatchCampaignResponse>(
        `/empresas/${empresaId}/campanas/${campaignToDispatch.id}/despachar`
      );

      showToast(
        "Campaña Despachada",
        `Se despacharon los mensajes a ${result.totalTargets} participantes exitosamente (Modo: ${result.mode.toUpperCase()}).`,
        "success"
      );
      setCampaignToDispatch(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error al despachar campaña:", err);
      if (err instanceof ApiError) {
        setDispatchError(err.message);
      } else if (err instanceof Error) {
        setDispatchError(err.message);
      } else {
        setDispatchError("Error inesperado al despachar la campaña.");
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const getStatusBadge = (status: CampaignStatus | string) => {
    switch (status) {
      case "programada":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Programada
          </span>
        );
      case "en_curso":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            En Curso
          </span>
        );
      case "finalizada":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Finalizada
          </span>
        );
      case "cancelada":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalRegistros / limit));

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      {/* Toast de Notificaciones */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 p-4 rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-[320px] ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-slate-800"
              : "bg-white border-rose-200 text-slate-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <h4
              className={`font-bold text-xs uppercase tracking-wider ${
                toast.type === "success" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {toast.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#283F50] tracking-tight">Gestión de Campañas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Diseña, programa y analiza simulaciones de ciberataques contra tus colaboradores.
          </p>
        </div>
        <Button
          onClick={() => {
            setCampaignToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="bg-[#E5A93C] text-[#283F50] hover:bg-[#d6992d] font-bold h-11 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Campaña</span>
        </Button>
      </div>

      {/* TARJETAS KPI (Resumen Ejecutivo) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Layers className="h-4 w-4 text-[#283F50]" />
          </div>
          <div className="text-2xl font-bold text-[#283F50]">
            {isLoadingSummary ? "..." : summary.total}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Campañas registradas</span>
        </div>

        {/* Programadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Programadas</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {isLoadingSummary ? "..." : summary.programadas}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Pendientes de inicio</span>
        </div>

        {/* En Curso */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">En Curso</span>
            <PlayCircle className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {isLoadingSummary ? "..." : summary.enCurso}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Envíos activos</span>
        </div>

        {/* Finalizadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Finalizadas</span>
            <CheckCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {isLoadingSummary ? "..." : summary.finalizadas}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Simulaciones concluidas</span>
        </div>

        {/* Canceladas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Canceladas</span>
            <Ban className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {isLoadingSummary ? "..." : summary.canceladas}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Desactivadas</span>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre de campaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Estado */}
          <div className="relative">
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#283F50]"
            >
              <option value="">Todos los Estados</option>
              <option value="programada">Programadas</option>
              <option value="en_curso">En Curso</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {/* Filtro Canal */}
          <div className="relative">
            <select
              value={attackTypeFiltro}
              onChange={(e) => {
                setAttackTypeFiltro(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#283F50]"
            >
              <option value="">Todos los Canales</option>
              <option value="phishing">Phishing (Correo)</option>
              <option value="smishing">Smishing (SMS)</option>
            </select>
          </div>

          {(searchTerm || statusFiltro || attackTypeFiltro) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFiltro("");
                setAttackTypeFiltro("");
                setPage(1);
              }}
              className="h-10 px-3 text-xs text-slate-500 hover:text-slate-800"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* TABLA DE CAMPAÑAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoadingCampaigns ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#E5A93C] mb-3" />
            <p className="text-xs">Cargando campañas registradas...</p>
          </div>
        ) : errorCampaigns ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50/50 flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span className="font-semibold">{errorCampaigns}</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center">
            <Send className="h-10 w-10 mb-3 opacity-30 text-[#283F50]" />
            <h3 className="font-semibold text-sm text-[#283F50]">No se encontraron campañas</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm || statusFiltro || attackTypeFiltro
                ? "Prueba cambiando o eliminando los filtros aplicados."
                : "Aún no has creado campañas de simulación. Haz clic en 'Nueva Campaña' para iniciar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Campaña</th>
                  <th className="py-3.5 px-4">Canal</th>
                  <th className="py-3.5 px-4">Plantilla Asociada</th>
                  <th className="py-3.5 px-4">Fecha Programada</th>
                  <th className="py-3.5 px-4">Modalidad</th>
                  <th className="py-3.5 px-4">Participantes</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Campaña */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-sm text-[#283F50]">{camp.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {camp.id.substring(0, 8)}...
                          </p>
                        </div>
                      </td>

                      {/* Canal */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {camp.template?.metodoAtaque || "PHISHING"}
                        </span>
                      </td>

                      {/* Plantilla */}
                      <td className="py-4 px-4 max-w-[200px] truncate text-slate-700 font-medium">
                        {camp.template?.titulo || `Plantilla #${camp.templateId}`}
                      </td>

                      {/* Fecha Programada */}
                      <td className="py-4 px-4 text-slate-600">
                        {new Date(camp.scheduledDate).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Modalidad */}
                      <td className="py-4 px-4 capitalize text-slate-700 font-medium">
                        {camp.shippingMethod}
                      </td>

                      {/* Participantes */}
                      <td className="py-4 px-4 font-semibold text-[#283F50]">
                        {camp.totalParticipants}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4">{getStatusBadge(camp.status)}</td>

                      {/* Menú de Acciones con Restricciones de Negocio */}
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs p-1">
                            {/* Ver Detalles (Siempre permitido) */}
                            <DropdownMenuItem
                              onClick={() => {
                                setDetailCampaignId(camp.id);
                                setIsDetailModalOpen(true);
                              }}
                              className="cursor-pointer flex items-center gap-2 py-2"
                            >
                              <Eye className="h-4 w-4 text-slate-500" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>

                            {/* Editar Parámetros (SOLO 'programada') */}
                            {camp.status === "programada" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCampaignToEdit(camp);
                                  setIsCreateModalOpen(true);
                                }}
                                className="cursor-pointer flex items-center gap-2 py-2"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                                <span>Editar Parámetros</span>
                              </DropdownMenuItem>
                            )}

                            {/* Despachar Ahora (SOLO 'programada') */}
                            {camp.status === "programada" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCampaignToDispatch(camp);
                                  setDispatchError("");
                                }}
                                className="cursor-pointer flex items-center gap-2 py-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                              >
                                <Send className="h-4 w-4 text-amber-600" />
                                <span>Despachar Ahora</span>
                              </DropdownMenuItem>
                            )}

                            {/* Finalizar Campaña (SOLO 'en_curso') */}
                            {camp.status === "en_curso" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCampaignToFinalize(camp);
                                  setFinalizeError("");
                                }}
                                className="cursor-pointer flex items-center gap-2 py-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                              >
                                <CheckCheck className="h-4 w-4 text-emerald-600" />
                                <span>Finalizar Campaña</span>
                              </DropdownMenuItem>
                            )}

                            {/* Duplicar Campaña (Siempre permitido) */}
                            <DropdownMenuItem
                              onClick={() => {
                                setCampaignToDuplicate(camp);
                                setIsDuplicateModalOpen(true);
                              }}
                              className="cursor-pointer flex items-center gap-2 py-2"
                            >
                              <Copy className="h-4 w-4 text-slate-500" />
                              <span>Duplicar Campaña</span>
                            </DropdownMenuItem>

                            {/* Cancelar Campaña (SOLO 'programada' o 'en_curso') */}
                            {(camp.status === "programada" || camp.status === "en_curso") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCampaignToCancel(camp);
                                    setCancelError("");
                                  }}
                                  className="cursor-pointer flex items-center gap-2 py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                >
                                  <Ban className="h-4 w-4 text-rose-600" />
                                  <span>Cancelar Campaña</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && !isLoadingCampaigns && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50/50">
            <span>
              Página {page} de {totalPages} ({totalRegistros} campañas totales)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-3 text-xs bg-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 text-xs bg-white"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR CAMPAÑA */}
      <CreateEditCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCampaignToEdit(null);
        }}
        onSuccess={(msg) => {
          showToast("Éxito", msg, "success");
          setReloadTrigger((prev) => prev + 1);
        }}
        campaign={campaignToEdit}
      />

      {/* MODAL DETALLES Y PARTICIPANTES */}
      <CampaignDetailModal
        isOpen={isDetailModalOpen}
        campaignId={detailCampaignId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailCampaignId(null);
        }}
        onCampaignUpdated={() => {
          setReloadTrigger((prev) => prev + 1);
        }}
      />

      {/* MODAL DUPLICAR CAMPAÑA */}
      <DuplicateCampaignModal
        isOpen={isDuplicateModalOpen}
        campaign={campaignToDuplicate}
        onClose={() => {
          setIsDuplicateModalOpen(false);
          setCampaignToDuplicate(null);
        }}
        onSuccess={(msg) => {
          showToast("Éxito", msg, "success");
          setReloadTrigger((prev) => prev + 1);
        }}
      />

      {/* DIÁLOGO DE CONFIRMACIÓN DE CANCELACIÓN */}
      {campaignToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-600 mb-2">
                <Ban className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Cancelar campaña de simulación?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estás a punto de cancelar la campaña{" "}
                <strong className="text-slate-800">&ldquo;{campaignToCancel.name}&rdquo;</strong>. La simulación no
                se ejecutará o se detendrán los envíos en curso. Esta acción no se puede deshacer.
              </p>

              {cancelError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{cancelError}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setCampaignToCancel(null);
                  setCancelError("");
                }}
                disabled={isCancelling}
                className="h-8 text-xs bg-white"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cancelando...</span>
                  </>
                ) : (
                  <span>Sí, Cancelar Campaña</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN DE DESPACHO INMEDIATO */}
      {campaignToDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-2">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Despachar campaña inmediatamente?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estás a punto de despachar la campaña{" "}
                <strong className="text-slate-800">&ldquo;{campaignToDispatch.name}&rdquo;</strong> para{" "}
                <strong className="text-slate-800">{campaignToDispatch.totalParticipants} participante(s)</strong> vía modalidad{" "}
                <strong className="text-slate-800 uppercase">{campaignToDispatch.shippingMethod}</strong>.
              </p>
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                El estado de la campaña cambiará inmediatamente a <strong>En curso</strong> y se iniciará el envío de las simulaciones por correo o SMS a los colaboradores seleccionados.
              </p>

              {dispatchError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{dispatchError}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setCampaignToDispatch(null);
                  setDispatchError("");
                }}
                disabled={isDispatching}
                className="h-8 text-xs bg-white"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirmDispatch}
                disabled={isDispatching}
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Despachando...</span>
                  </>
                ) : (
                  <span>Sí, Despachar Ahora</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN DE FINALIZACIÓN */}
      {campaignToFinalize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Finalizar campaña de simulación?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estás a punto de finalizar la campaña{" "}
                <strong className="text-slate-800">&ldquo;{campaignToFinalize.name}&rdquo;</strong>.
              </p>
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                Al finalizar, los enlaces y píxeles de rastreo expirarán de inmediato. Los clics o intentos de envío posteriores no se registrarán y la campaña pasará formalmente al estado <strong>Finalizada</strong>.
              </p>

              {finalizeError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{finalizeError}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setCampaignToFinalize(null);
                  setFinalizeError("");
                }}
                disabled={isFinalizing}
                className="h-8 text-xs bg-white"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirmFinalize}
                disabled={isFinalizing}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Finalizando...</span>
                  </>
                ) : (
                  <span>Sí, Finalizar Campaña</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
