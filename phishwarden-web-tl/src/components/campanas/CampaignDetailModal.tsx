"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  FileText,
  Users,
  Send,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CampaignDetail,
  CampaignParticipantItem,
  DepartmentItem,
  EmployeeSummaryItem,
  PaginatedResponse,
  ManageParticipantsInput,
  DispatchCampaignResponse,
} from "@/lib/types";

interface CampaignDetailModalProps {
  campaignId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCampaignUpdated?: () => void;
}

function CampaignDetailModalDialog({
  campaignId,
  onClose,
  onCampaignUpdated,
}: {
  campaignId: string;
  onClose: () => void;
  onCampaignUpdated?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"info" | "participants">("info");
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [campaignError, setCampaignError] = useState("");

  // Participants Tab State
  const [participants, setParticipants] = useState<CampaignParticipantItem[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [participantsPage, setParticipantsPage] = useState(1);
  const participantsLimit = 10;
  const [participantSearch, setParticipantSearch] = useState("");
  const [debouncedParticipantSearch, setDebouncedParticipantSearch] = useState("");

  // Add Participants Drawer/State
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeSummaryItem[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [empSearch, setEmpSearch] = useState("");

  // Feedback notifications
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [campaignRefreshTrigger, setCampaignRefreshTrigger] = useState(0);

  // Debounce participant search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParticipantSearch(participantSearch);
      setParticipantsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [participantSearch]);

  // Load Campaign Details
  useEffect(() => {
    let isMounted = true;
    const loadCampaign = async () => {
      try {
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) throw new Error("No se encontró la organización activa.");

        const data = await apiClient.get<CampaignDetail>(
          `/empresas/${empresaId}/campanas/${campaignId}`
        );
        if (isMounted) {
          setCampaign(data);
        }
      } catch (err: unknown) {
        console.error("Error al cargar detalle de campaña:", err);
        if (!isMounted) return;
        if (err instanceof ApiError) {
          setCampaignError(err.message);
        } else if (err instanceof Error) {
          setCampaignError(err.message);
        } else {
          setCampaignError("No se pudo obtener la información de la campaña.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCampaign(false);
        }
      }
    };

    loadCampaign();
    return () => {
      isMounted = false;
    };
  }, [campaignId, campaignRefreshTrigger]);

  // Load Participants
  useEffect(() => {
    let isMounted = true;
    const loadParticipants = async () => {
      try {
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) return;

        const params: Record<string, string | number> = {
          page: participantsPage,
          limit: participantsLimit,
        };
        if (debouncedParticipantSearch.trim()) {
          params.search = debouncedParticipantSearch.trim();
        }

        const res = await apiClient.get<PaginatedResponse<CampaignParticipantItem>>(
          `/empresas/${empresaId}/campanas/${campaignId}/participantes`,
          { params }
        );

        if (!isMounted) return;

        if (res && Array.isArray(res.data)) {
          setParticipants(res.data);
          setParticipantsTotal(res.total ?? res.data.length);
        } else if (Array.isArray(res)) {
          setParticipants(res);
          setParticipantsTotal((res as CampaignParticipantItem[]).length);
        } else {
          setParticipants([]);
          setParticipantsTotal(0);
        }
      } catch (err) {
        console.error("Error al cargar participantes:", err);
      } finally {
        if (isMounted) {
          setIsLoadingParticipants(false);
        }
      }
    };

    loadParticipants();
    return () => {
      isMounted = false;
    };
  }, [campaignId, participantsPage, debouncedParticipantSearch, campaignRefreshTrigger]);

  // Load catalogs for adding participants when drawer opens
  useEffect(() => {
    if (!isAddingParticipants) return;

    let isMounted = true;
    const loadCatalogs = async () => {
      setIsLoadingAvailable(true);
      setAddError("");
      try {
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) return;

        const [depsRes, empsRes] = await Promise.all([
          apiClient.get<DepartmentItem[] | { data: DepartmentItem[] }>(`/empresas/${empresaId}/departamentos`),
          apiClient.get<PaginatedResponse<EmployeeSummaryItem>>(`/empresas/${empresaId}/empleados/resumen`, {
            params: { page: 1, limit: 100 },
          }),
        ]);

        if (!isMounted) return;

        const rawDeps = (
          Array.isArray(depsRes)
            ? depsRes
            : depsRes && Array.isArray((depsRes as any).data)
            ? (depsRes as any).data
            : []
        ) as Array<{ id: number; nombre?: string; name?: string }>;
        const normalizedDeps: DepartmentItem[] = rawDeps.map((d) => {
          const resolvedName = d.nombre || d.name || (d as any).departamento || `Departamento ${d.id}`;
          return {
            ...d,
            id: d.id,
            nombre: resolvedName,
            name: resolvedName,
          };
        });
        setDepartments(normalizedDeps);

        if (empsRes && Array.isArray(empsRes.data)) {
          setAvailableEmployees(empsRes.data);
        } else if (Array.isArray(empsRes)) {
          setAvailableEmployees(empsRes);
        }
      } catch (err) {
        console.error("Error al cargar disponibles:", err);
      } finally {
        if (isMounted) {
          setIsLoadingAvailable(false);
        }
      }
    };

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, [isAddingParticipants]);

  // Add participants handler
  const handleAddParticipants = async () => {
    setAddError("");
    if (selectedDeptIds.length === 0 && selectedUserIds.length === 0) {
      setAddError("Selecciona al menos un departamento o colaborador.");
      return;
    }

    try {
      setIsSubmittingAdd(true);
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId || !campaignId) return;

      const payload: ManageParticipantsInput = {
        departmentIds: selectedDeptIds.length > 0 ? selectedDeptIds : undefined,
        targetUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      };

      const res = await apiClient.post<{ message?: string; added?: number }>(
        `/empresas/${empresaId}/campanas/${campaignId}/participantes`,
        payload
      );

      setActionMessage({
        text: res?.message || "Participantes agregados exitosamente.",
        type: "success",
      });
      setIsAddingParticipants(false);
      setSelectedDeptIds([]);
      setSelectedUserIds([]);

      // Precision 4: Live sync of totalParticipants by re-fetching detail + list
      setCampaignRefreshTrigger((prev) => prev + 1);
      onCampaignUpdated?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAddError(err.message);
      } else if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError("Error al agregar participantes.");
      }
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Remove participant handler
  const handleRemoveParticipant = async (usuarioId: string, nombre: string) => {
    if (!campaign || campaign.status !== "programada") return;

    if (campaign.totalParticipants <= 1) {
      setActionMessage({
        text: "No se puede retirar al participante: la campaña debe conservar al menos 1 colaborador.",
        type: "error",
      });
      return;
    }

    const confirm = window.confirm(
      `¿Estás seguro de que deseas retirar a "${nombre}" de esta campaña?`
    );
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId || !campaignId) return;

      await apiClient.delete(
        `/empresas/${empresaId}/campanas/${campaignId}/participantes/${usuarioId}`
      );

      setActionMessage({
        text: `Colaborador "${nombre}" retirado de la campaña.`,
        type: "success",
      });

      // Precision 4: Live sync of totalParticipants by re-fetching detail + list
      setCampaignRefreshTrigger((prev) => prev + 1);
      onCampaignUpdated?.();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionMessage({ text: err.message, type: "error" });
      } else {
        setActionMessage({ text: "Error al retirar participante.", type: "error" });
      }
    }
  };

  // Despacho Manual Directo
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // Finalización Directa
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");

  const handleDirectFinalize = async () => {
    if (!campaign) return;

    try {
      setIsFinalizing(true);
      setFinalizeError("");
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      const result = await apiClient.patch<{ message?: string; campaignId?: string }>(
        `/empresas/${empresaId}/campanas/${campaign.id}/finalizar`
      );

      setActionMessage({
        text: result?.message || `Campaña "${campaign.name}" finalizada exitosamente.`,
        type: "success",
      });
      setCampaign((prev) => (prev ? { ...prev, status: "finalizada" } : null));
      setIsFinalizeModalOpen(false);
      if (onCampaignUpdated) {
        onCampaignUpdated();
      }
    } catch (err: unknown) {
      console.error("Error al finalizar campaña desde modal:", err);
      if (err instanceof ApiError) {
        setFinalizeError(err.message);
      } else if (err instanceof Error) {
        setFinalizeError(err.message);
      } else {
        setFinalizeError("Ocurrió un error inesperado al finalizar la campaña.");
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDirectDispatch = async () => {
    if (!campaign) return;

    try {
      setIsDispatching(true);
      setDispatchError("");
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      const result = await apiClient.post<DispatchCampaignResponse>(
        `/empresas/${empresaId}/campanas/${campaign.id}/despachar`
      );

      setActionMessage({
        text: `Campaña despachada exitosamente a ${result.totalTargets} participantes (Modo: ${result.mode.toUpperCase()}).`,
        type: "success",
      });
      setCampaign((prev) => (prev ? { ...prev, status: "en_curso" } : null));
      setIsDispatchModalOpen(false);
      if (onCampaignUpdated) {
        onCampaignUpdated();
      }
    } catch (err: unknown) {
      console.error("Error al despachar campaña desde modal:", err);
      if (err instanceof ApiError) {
        setDispatchError(err.message);
      } else if (err instanceof Error) {
        setDispatchError(err.message);
      } else {
        setDispatchError("Ocurrió un error inesperado al despachar la campaña.");
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "programada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Programada
          </span>
        );
      case "en_curso":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            En Curso
          </span>
        );
      case "finalizada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Finalizada
          </span>
        );
      case "cancelada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(participantsTotal / participantsLimit));

  const filteredAvailableEmployees = availableEmployees.filter((emp) => {
    if (!empSearch.trim()) return true;
    const q = empSearch.toLowerCase();
    return (emp.nombre || "").toLowerCase().includes(q) || (emp.correo || "").toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#283F50]/10 text-[#283F50]">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#283F50]">
                  {campaign?.name || "Detalle de Campaña"}
                </h2>
                {campaign && getStatusBadge(campaign.status)}
              </div>
              <p className="text-xs text-slate-500">
                ID: <span className="font-mono text-[11px]">{campaignId}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaign && campaign.status === "programada" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setIsDispatchModalOpen(true);
                  setDispatchError("");
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Despachar Ahora</span>
              </Button>
            )}
            {campaign && campaign.status === "en_curso" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setIsFinalizeModalOpen(true);
                  setFinalizeError("");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Finalizar Campaña</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notificación de acción rápida */}
        {actionMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-100"
                : "bg-red-50 text-red-800 border-b border-red-100"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="font-bold ml-2 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {/* Pestañas */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "info"
                ? "border-[#283F50] text-[#283F50]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            Información y Plantilla
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "participants"
                ? "border-[#283F50] text-[#283F50]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Colaboradores Asignados ({campaign?.totalParticipants ?? "..."})
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingCampaign && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#283F50] mb-2" />
              <p className="text-xs">Cargando detalles de la campaña...</p>
            </div>
          )}

          {campaignError && !isLoadingCampaign && (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{campaignError}</span>
            </div>
          )}

          {!isLoadingCampaign && campaign && activeTab === "info" && (
            <div className="space-y-6">
              {/* Metadatos Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Modalidad
                  </span>
                  <span className="text-xs font-medium text-slate-800 capitalize">
                    {campaign.shippingMethod}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Fecha Programada
                  </span>
                  <span className="text-xs font-medium text-slate-800">
                    {new Date(campaign.scheduledDate).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Participantes
                  </span>
                  <span className="text-xs font-semibold text-[#283F50]">
                    {campaign.totalParticipants} colaborador(es)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Creada el
                  </span>
                  <span className="text-xs font-medium text-slate-800">
                    {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>

              {/* Detalle de la Plantilla */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#E5A93C]" />
                    <h3 className="text-sm font-bold text-[#283F50]">
                      Plantilla Asociada: {campaign.template?.titulo || "Sin plantilla asignada"}
                    </h3>
                  </div>
                  {campaign.template && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase font-semibold">
                        {campaign.template.metodoAtaque}
                      </span>
                      {campaign.template.indicadorDificultad && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 uppercase font-semibold">
                          Dificultad: {campaign.template.indicadorDificultad}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {campaign.template?.asunto && (
                  <div className="text-xs">
                    <span className="font-semibold text-slate-600">Asunto del correo:</span>{" "}
                    <span className="text-slate-800">{campaign.template.asunto}</span>
                  </div>
                )}

                {/* Precision 3: Aislamiento con iframe srcDoc sandbox="" */}
                <div>
                  <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Vista Previa del Contenido del Correo:
                  </span>
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <iframe
                      srcDoc={campaign.template?.cuerpoHtml || "<p class='text-slate-400 p-4'>Sin contenido HTML disponible.</p>"}
                      sandbox=""
                      title="Vista previa del correo"
                      className="w-full h-72 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoadingCampaign && campaign && activeTab === "participants" && (
            <div className="space-y-4">
              {/* Barra superior de participantes */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Buscar participante por nombre o correo..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-50"
                  />
                </div>

                {campaign.status === "programada" && (
                  <Button
                    type="button"
                    onClick={() => setIsAddingParticipants(!isAddingParticipants)}
                    className="text-xs h-9 bg-[#283F50] hover:bg-[#1f313e] text-white flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isAddingParticipants ? "Cerrar Panel" : "Agregar Participantes"}</span>
                  </Button>
                )}
              </div>

              {/* Sub-panel para agregar participantes (solo si está programada) */}
              {isAddingParticipants && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-[#283F50] flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#E5A93C]" />
                      Incorporar Nuevos Destinatarios
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingParticipants(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {addError && (
                    <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{addError}</span>
                    </div>
                  )}

                  {isLoadingAvailable ? (
                    <div className="flex items-center justify-center py-6 text-xs text-slate-400 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando catálogo de colaboradores...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Por departamento */}
                      {departments.length > 0 && (
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                            Por Departamento
                          </span>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {departments.map((dept) => {
                              const isSelected = selectedDeptIds.includes(dept.id);
                              const deptName = dept.nombre || dept.name || (dept as any).departamento || `Departamento ${dept.id}`;
                              return (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedDeptIds((prev) =>
                                      prev.includes(dept.id)
                                        ? prev.filter((id) => id !== dept.id)
                                        : [...prev, dept.id]
                                    )
                                  }
                                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                                    isSelected
                                      ? "bg-[#283F50] text-white border-[#283F50]"
                                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  <span>{deptName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Por colaborador */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            Por Colaborador Específico ({selectedUserIds.length} seleccionados)
                          </span>
                          <Input
                            type="text"
                            placeholder="Filtrar disponibles..."
                            value={empSearch}
                            onChange={(e) => setEmpSearch(e.target.value)}
                            className="h-6 w-44 text-[11px] bg-white"
                          />
                        </div>

                        <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white">
                          {filteredAvailableEmployees.length === 0 ? (
                            <p className="p-3 text-center text-xs text-slate-400">
                              No hay colaboradores para mostrar.
                            </p>
                          ) : (
                            filteredAvailableEmployees.map((emp) => {
                              const isSelected = selectedUserIds.includes(emp.id);
                              return (
                                <div
                                  key={emp.id}
                                  onClick={() =>
                                    setSelectedUserIds((prev) =>
                                      prev.includes(emp.id)
                                        ? prev.filter((id) => id !== emp.id)
                                        : [...prev, emp.id]
                                    )
                                  }
                                  className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50 ${
                                    isSelected ? "bg-amber-50/50" : ""
                                  }`}
                                >
                                  <div className="truncate pr-2">
                                    <span className="font-medium text-slate-800">{emp.nombre}</span>
                                    <span className="text-slate-400 ml-2">({emp.correo})</span>
                                  </div>
                                  <div
                                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? "bg-[#283F50] border-[#283F50] text-white"
                                        : "border-slate-300"
                                    }`}
                                  >
                                    {isSelected && <span className="text-[10px]">✓</span>}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingParticipants(false)}
                          disabled={isSubmittingAdd}
                          className="h-8 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddParticipants}
                          disabled={isSubmittingAdd}
                          className="h-8 text-xs bg-[#283F50] text-white flex items-center gap-1.5"
                        >
                          {isSubmittingAdd ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Agregando...</span>
                            </>
                          ) : (
                            <span>Confirmar Incorporación</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advertencia si la campaña solo tiene 1 participante */}
              {campaign.status === "programada" && campaign.totalParticipants <= 1 && (
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    La campaña tiene solo 1 participante. Por regla de integridad, no se puede retirar al último participante.
                  </span>
                </div>
              )}

              {/* Tabla de participantes inscritos */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                {isLoadingParticipants ? (
                  <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#283F50]" />
                    <span className="text-xs">Cargando participantes...</span>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No se encontraron colaboradores registrados en esta campaña.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Colaborador</th>
                          <th className="py-3 px-4">Correo</th>
                          <th className="py-3 px-4">Departamento</th>
                          <th className="py-3 px-4">Estado</th>
                          {campaign.status === "programada" && (
                            <th className="py-3 px-4 text-right">Acción</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {participants.map((p) => (
                          <tr key={p.usuarioId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-slate-800">{p.nombre}</td>
                            <td className="py-2.5 px-4 text-slate-500">{p.correo}</td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {p.departamento || <span className="text-slate-400 italic">Sin departamento</span>}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                                {p.estado}
                              </span>
                            </td>
                            {campaign.status === "programada" && (
                              <td className="py-2.5 px-4 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={campaign.totalParticipants <= 1}
                                  onClick={() => handleRemoveParticipant(p.usuarioId, p.nombre)}
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400"
                                  title={
                                    campaign.totalParticipants <= 1
                                      ? "No se puede retirar al último participante"
                                      : "Retirar de la campaña"
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Paginación de participantes */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>
                    Página {participantsPage} de {totalPages} ({participantsTotal} participantes)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={participantsPage <= 1}
                      onClick={() => setParticipantsPage((p) => p - 1)}
                      className="h-7 px-2"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={participantsPage >= totalPages}
                      onClick={() => setParticipantsPage((p) => p + 1)}
                      className="h-7 px-2"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-9 px-4 border-slate-200"
          >
            Cerrar
          </Button>
        </div>

        {/* DIÁLOGO DE CONFIRMACIÓN DE DESPACHO INMEDIATO */}
        {isDispatchModalOpen && campaign && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-2">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">¿Despachar campaña inmediatamente?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Estás a punto de despachar la campaña{" "}
                  <strong className="text-slate-800">&ldquo;{campaign.name}&rdquo;</strong> para{" "}
                  <strong className="text-slate-800">{campaign.totalParticipants} participante(s)</strong> vía modalidad{" "}
                  <strong className="text-slate-800 uppercase">{campaign.shippingMethod}</strong>.
                </p>
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                  El estado cambiará inmediatamente a <strong>En curso</strong> y se enviarán los correos o SMS a los destinatarios.
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
                    setIsDispatchModalOpen(false);
                    setDispatchError("");
                  }}
                  disabled={isDispatching}
                  className="h-8 text-xs bg-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDirectDispatch}
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
        {isFinalizeModalOpen && campaign && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">¿Finalizar campaña de simulación?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Estás a punto de finalizar la campaña{" "}
                  <strong className="text-slate-800">&ldquo;{campaign.name}&rdquo;</strong>.
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
                    setIsFinalizeModalOpen(false);
                    setFinalizeError("");
                  }}
                  disabled={isFinalizing}
                  className="h-8 text-xs bg-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDirectFinalize}
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
    </div>
  );
}

export function CampaignDetailModal(props: CampaignDetailModalProps) {
  if (!props.isOpen || !props.campaignId) return null;
  return <CampaignDetailModalDialog key={props.campaignId} {...props} campaignId={props.campaignId} />;
}
