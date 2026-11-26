"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Calendar, Send, FileText, Users, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CampaignItem,
  ShippingMethod,
  PlantillaItem,
  DepartmentItem,
  EmployeeSummaryItem,
  PaginatedResponse,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "@/lib/types";

interface CreateEditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  campaign?: CampaignItem | null;
}

function formatToLocalDateTimeInput(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function CreateEditCampaignModalDialog({
  onClose,
  onSuccess,
  campaign,
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
  campaign?: CampaignItem | null;
}) {
  const isEdit = Boolean(campaign);

  // Form State initialized from props
  const [name, setName] = useState(campaign?.name || "");
  const [templateId, setTemplateId] = useState<number | "">(campaign?.templateId ?? "");
  const [scheduledDate, setScheduledDate] = useState(
    campaign?.scheduledDate ? formatToLocalDateTimeInput(campaign.scheduledDate) : ""
  );
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(campaign?.shippingMethod || "masivo");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Catalogs
  const [templates, setTemplates] = useState<PlantillaItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummaryItem[]>([]);

  // Status & UI
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [empSearch, setEmpSearch] = useState("");

  // Load catalogs on mount
  useEffect(() => {
    let isMounted = true;
    const loadCatalogs = async () => {
      try {
        const empresaId = localStorage.getItem("empresaId");
        if (!empresaId) throw new Error("No se encontró una organización activa.");

        const [templatesRes, depsRes, empsRes] = await Promise.all([
          apiClient.get<PaginatedResponse<PlantillaItem>>(`/empresas/${empresaId}/plantillas`, {
            params: { page: 1, limit: 100 },
          }),
          apiClient.get<DepartmentItem[] | { data: DepartmentItem[] }>(`/empresas/${empresaId}/departamentos`),
          apiClient.get<PaginatedResponse<EmployeeSummaryItem>>(`/empresas/${empresaId}/empleados/resumen`, {
            params: { page: 1, limit: 100 },
          }),
        ]);

        if (!isMounted) return;

        // Plantillas
        if (templatesRes && Array.isArray(templatesRes.data)) {
          setTemplates(templatesRes.data);
        } else if (Array.isArray(templatesRes)) {
          setTemplates(templatesRes);
        }

        // Departamentos
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

        // Empleados
        if (empsRes && Array.isArray(empsRes.data)) {
          setEmployees(empsRes.data);
        } else if (Array.isArray(empsRes)) {
          setEmployees(empsRes);
        }
      } catch (err) {
        console.error("Error al cargar catálogos para campaña:", err);
      } finally {
        if (isMounted) {
          setIsLoadingCatalogs(false);
        }
      }
    };

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDepartment = (deptId: number) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const toggleEmployee = (empId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!empSearch.trim()) return true;
    const query = empSearch.toLowerCase();
    const nombre = (emp.nombre || "").toLowerCase();
    const correo = (emp.correo || "").toLowerCase();
    return nombre.includes(query) || correo.includes(query);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("El nombre de la campaña es obligatorio.");
      return;
    }

    if (!templateId) {
      setErrorMessage("Debes seleccionar una plantilla para la simulación.");
      return;
    }

    if (!scheduledDate) {
      setErrorMessage("Debes indicar una fecha y hora programada válida.");
      return;
    }

    const scheduledDateObj = new Date(scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      setErrorMessage("La fecha programada no tiene un formato válido.");
      return;
    }

    if (!isEdit && selectedDepartmentIds.length === 0 && selectedUserIds.length === 0) {
      setErrorMessage("Debes seleccionar al menos un departamento o un colaborador objetivo.");
      return;
    }

    try {
      setIsSubmitting(true);
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró el identificador de la organización.");

      const isoDate = scheduledDateObj.toISOString();

      if (isEdit && campaign) {
        const payload: UpdateCampaignInput = {
          name: name.trim(),
          templateId: Number(templateId),
          scheduledDate: isoDate,
          shippingMethod,
        };

        await apiClient.patch(`/empresas/${empresaId}/campanas/${campaign.id}`, payload);
        onSuccess("Campaña actualizada exitosamente.");
        onClose();
      } else {
        const payload: CreateCampaignInput = {
          name: name.trim(),
          templateId: Number(templateId),
          scheduledDate: isoDate,
          shippingMethod,
          departmentIds: selectedDepartmentIds.length > 0 ? selectedDepartmentIds : undefined,
          targetUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
        };

        await apiClient.post(`/empresas/${empresaId}/campanas`, payload);
        onSuccess("Campaña programada exitosamente.");
        onClose();
      }
    } catch (err: unknown) {
      console.error("Error al guardar campaña:", err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Error al procesar la solicitud.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al procesar la campaña.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#283F50]/10 text-[#283F50]">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#283F50]">
                {isEdit ? "Editar Campaña Programada" : "Nueva Campaña de Simulación"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? "Modifica los parámetros principales de la campaña antes de su ejecución."
                  : "Configura los parámetros, plantilla y objetivos de la campaña."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 animate-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoadingCatalogs && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <span>Cargando plantillas y colaboradores disponibles...</span>
            </div>
          )}

          {/* Nombre de la Campaña */}
          <div>
            <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1.5">
              Nombre de la Campaña *
            </label>
            <Input
              type="text"
              placeholder="Ej. Simulación Phishing Q4 - Finanzas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
              required
            />
          </div>

          {/* Plantilla y Modalidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1.5">
                Plantilla de Ataque *
              </label>
              <div className="relative">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#283F50] focus:bg-white"
                  required
                >
                  <option value="">Selecciona una plantilla...</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} ({tpl.attackType})
                    </option>
                  ))}
                </select>
                <FileText className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1.5">
                Modalidad de Envío *
              </label>
              <div className="relative">
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#283F50] focus:bg-white"
                  required
                >
                  <option value="masivo">Masivo (Envío simultáneo)</option>
                  <option value="escalonado">Escalonado (Envío progresivo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fecha y Hora Programada */}
          <div>
            <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1.5">
              Fecha y Hora Programada *
            </label>
            <div className="relative">
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                required
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              La simulación se lanzará automáticamente en la fecha y hora seleccionada (zona local).
            </p>
          </div>

          {/* Sección de Destinatarios (Solo Creación) */}
          {isEdit ? (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-[#283F50]">Participantes inscritos:</span> Los colaboradores y
              departamentos asignados se pueden consultar, agregar o retirar directamente desde la vista detallada
              de la campaña.
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-[#283F50] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#E5A93C]" />
                  Selección de Destinatarios Objetivo *
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Puedes seleccionar departamentos completos, colaboradores específicos o combinar ambos.
                </p>
              </div>

              {/* Departamentos */}
              <div>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  Por Departamentos ({departments.length})
                </span>
                {departments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay departamentos registrados.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                    {departments.map((dept) => {
                      const isSelected = selectedDepartmentIds.includes(dept.id);
                      const deptName = dept.nombre || dept.name || (dept as any).departamento || `Departamento ${dept.id}`;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => toggleDepartment(dept.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? "bg-[#283F50] text-white border-[#283F50]"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{deptName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Colaboradores Individuales */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    Colaboradores Específicos ({selectedUserIds.length} seleccionados)
                  </span>
                  <Input
                    type="text"
                    placeholder="Filtrar por nombre o correo..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="h-7 w-48 text-xs bg-slate-50"
                  />
                </div>

                <div className="border border-slate-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No se encontraron colaboradores.
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSelected = selectedUserIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-amber-50/50" : ""
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-slate-800">{emp.nombre}</span>
                            <span className="text-slate-400 ml-2">({emp.correo})</span>
                          </div>
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isSelected
                                ? "bg-[#283F50] border-[#283F50] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9 px-4 border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 px-5 bg-[#283F50] hover:bg-[#1f313e] text-white font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isEdit ? "Actualizando..." : "Programando..."}</span>
                </>
              ) : (
                <span>{isEdit ? "Guardar Cambios" : "Programar Campaña"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateEditCampaignModal(props: CreateEditCampaignModalProps) {
  if (!props.isOpen) return null;
  const key = props.campaign ? `edit-${props.campaign.id}` : "create";
  return <CreateEditCampaignModalDialog key={key} {...props} />;
}
