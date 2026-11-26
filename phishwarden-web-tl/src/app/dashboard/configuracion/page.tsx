"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Shield,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Smartphone,
  Server,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import { companyService } from "@/services/company.service";
import { analyticsService } from "@/services/analytics.service";
import type {
  AdminProfile,
  CompanyDetail,
  UpdateCompanyInput,
  UpdateAdminProfileInput,
} from "@/lib/types";
import type { ExecutiveSummaryResponse } from "@/types/analytics";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<"organizacion" | "seguridad" | "integraciones">("organizacion");
  const [isLoading, setIsLoading] = useState(true);

  // Datos de Empresa y Admin
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [empresa, setEmpresa] = useState<CompanyDetail | null>(null);
  const [summary, setSummary] = useState<ExecutiveSummaryResponse | null>(null);

  // Estados de formularios
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);

  const [nombreAdmin, setNombreAdmin] = useState("");
  const [correoAdmin, setCorreoAdmin] = useState("");
  const [contraseñaActual, setContraseñaActual] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Código de acceso y regeneración
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Mensajes de Toast
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

  // Carga inicial de datos
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const adminData = await apiClient.get<AdminProfile>("/auth/me");
      setAdminUser(adminData);
      setNombreAdmin(adminData.nombre || adminData.name || "");
      setCorreoAdmin(adminData.correo || adminData.email || "");

      const resolvedEmpresaId = adminData.empresaId ?? adminData.empresa?.id;
      if (resolvedEmpresaId) {
        const [companyData, summaryData] = await Promise.allSettled([
          companyService.getCompany(resolvedEmpresaId),
          analyticsService.getSummary(resolvedEmpresaId),
        ]);

        if (companyData.status === "fulfilled") {
          setEmpresa(companyData.value);
          setNombreEmpresa(companyData.value.nombre);
          setCodigoAcceso(companyData.value.codigoAcceso);
          localStorage.setItem("codigoAcceso", companyData.value.codigoAcceso);
        } else if (adminData.empresa) {
          setNombreEmpresa(adminData.empresa.nombre);
          if (adminData.empresa.codigoAcceso) {
            setCodigoAcceso(adminData.empresa.codigoAcceso);
          }
        }

        if (summaryData.status === "fulfilled") {
          setSummary(summaryData.value);
        }
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      showToast("Error", "No se pudo cargar la información de configuración.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Guardar datos de la empresa
  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEmpresa.trim()) {
      showToast("Campo requerido", "El nombre de la organización no puede estar vacío.", "error");
      return;
    }

    const empresaId = adminUser?.empresaId ?? adminUser?.empresa?.id;
    if (!empresaId) return;

    try {
      setIsSavingEmpresa(true);
      const updated = await companyService.updateCompany(empresaId, {
        nombre: nombreEmpresa.trim(),
      });
      setEmpresa(updated);
      setNombreEmpresa(updated.nombre);
      showToast("Éxito", "Organización actualizada correctamente.", "success");

      // Disparar evento para reactividad inmediata en Layout
      window.dispatchEvent(new CustomEvent("phishwarden-session-updated"));
    } catch (error: any) {
      const msg = error instanceof ApiError ? error.message : "No se pudo actualizar la organización.";
      showToast("Error", msg, "error");
    } finally {
      setIsSavingEmpresa(false);
    }
  };

  // Copiar código de acceso al portapapeles
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
    setTimeout(() => setCodigoCopiado(false), 2500);
    showToast("Copiado", "Código de acceso copiado al portapapeles.", "success");
  };

  // Confirmar y regenerar código de acceso
  const handleConfirmRegenerate = async () => {
    const empresaId = adminUser?.empresaId ?? adminUser?.empresa?.id;
    if (!empresaId) return;

    try {
      setIsRegenerating(true);
      const res = await companyService.regenerateAccessCode(empresaId);
      setCodigoAcceso(res.codigoAcceso);
      localStorage.setItem("codigoAcceso", res.codigoAcceso);
      setIsRegenerateModalOpen(false);
      showToast("Código regenerado", "Se generó un nuevo código institucional exitosamente.", "success");

      // Disparar evento de sincronización de sesión
      window.dispatchEvent(new CustomEvent("phishwarden-session-updated"));
    } catch (error: any) {
      const msg = error instanceof ApiError ? error.message : "Error al regenerar código de acceso.";
      showToast("Error", msg, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Guardar datos de administrador y cambio de contraseña
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreAdmin.trim() || !correoAdmin.trim()) {
      showToast("Campos requeridos", "Nombre y correo son obligatorios.", "error");
      return;
    }

    if (nuevaContraseña) {
      if (!contraseñaActual) {
        showToast("Seguridad", "Ingresa tu contraseña actual para confirmar el cambio.", "error");
        return;
      }
      if (nuevaContraseña.length < 8) {
        showToast("Contraseña insegura", "La nueva contraseña debe tener al menos 8 caracteres.", "error");
        return;
      }
      if (nuevaContraseña !== confirmarContraseña) {
        showToast("Contraseña no coincide", "La nueva contraseña y su confirmación no coinciden.", "error");
        return;
      }
    }

    try {
      setIsSavingAdmin(true);
      const payload: UpdateAdminProfileInput = {
        nombre: nombreAdmin.trim(),
        correo: correoAdmin.trim(),
        ...(nuevaContraseña ? { contraseñaActual, nuevaContraseña } : {}),
      };

      await apiClient.put<AdminProfile>("/auth/me", payload);

      setContraseñaActual("");
      setNuevaContraseña("");
      setConfirmarContraseña("");
      showToast("Perfil actualizado", "Los datos de acceso y perfil han sido guardados.", "success");

      // Disparar evento para reactividad inmediata en Layout
      window.dispatchEvent(new CustomEvent("phishwarden-session-updated"));
    } catch (error: any) {
      const msg = error instanceof ApiError ? error.message : "No se pudo actualizar el perfil.";
      showToast("Error", msg, "error");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse mb-6" />
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-6 animate-pulse" />
      </div>
    );
  }

  const vinculados = summary?.adopcionMovil?.colaboradoresVinculados || 0;
  const totalColab = summary?.adopcionMovil?.totalColaboradores || 0;
  const tasaAdopcion = summary?.adopcionMovil?.tasaAdopcion || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast de Notificaciones */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-emerald-800"
              : "bg-white border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold leading-none">{toast.title}</p>
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

      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-1">
          Administra la identidad de tu organización, los accesos para enrolamiento móvil y las credenciales de administración.
        </p>
      </div>

      {/* Pestañas de Navegación Modular */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("organizacion")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "organizacion"
              ? "border-[#E5A93C] text-[#283F50]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Organización y Acceso
        </button>

        <button
          onClick={() => setActiveTab("seguridad")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "seguridad"
              ? "border-[#E5A93C] text-[#283F50]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="h-4 w-4" />
          Perfil y Seguridad
        </button>

        <button
          onClick={() => setActiveTab("integraciones")}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === "integraciones"
              ? "border-[#E5A93C] text-[#283F50]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" />
          Estado de Integraciones
        </button>
      </div>

      {/* Pestaña 1: Organización y Acceso */}
      {activeTab === "organizacion" && (
        <div className="space-y-6">
          {/* Tarjeta de Código de Acceso Móvil */}
          <div className="bg-gradient-to-r from-[#283F50] to-[#1E2F3C] text-white p-6 rounded-xl shadow-md border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/30">
                  <Smartphone className="h-3.5 w-3.5" /> Enrolamiento Móvil PhishWarden
                </div>
                <h3 className="text-xl font-bold">Código Institucional de Acceso</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Tus colaboradores deben introducir este código al abrir la aplicación móvil de PhishWarden para vincular su cuenta corporativa y recibir simulacros interactivos y microlecciones gamificadas.
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2.5 rounded-lg flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold tracking-widest text-[#E5A93C]">
                    {codigoAcceso || "NO_DISPONIBLE"}
                  </span>
                  <button
                    onClick={handleCopyCodigo}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-300 hover:text-white"
                    title="Copiar código"
                  >
                    {codigoCopiado ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>

                <Button
                  onClick={() => setIsRegenerateModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white/20 text-slate-200 hover:bg-white/10 hover:text-white text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerar código
                </Button>
              </div>
            </div>
          </div>

          {/* Formulario de Datos de Organización */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-[#283F50] mb-4">Información de la Organización</h3>
            <form onSubmit={handleSaveEmpresa} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nombre Comercial / Razón Social
                </label>
                <Input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  placeholder="Ej. Interbank Perú S.A."
                  className="h-10 text-sm"
                  required
                />
              </div>

              {empresa?.fechaCreacion && (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Fecha de Registro:</span>{" "}
                  {new Date(empresa.fechaCreacion).toLocaleDateString()}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSavingEmpresa}
                className="bg-[#283F50] hover:bg-[#1E2F3C] text-white text-xs font-semibold px-5"
              >
                {isSavingEmpresa ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar cambios de organización"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Pestaña 2: Perfil y Seguridad del Administrador */}
      {activeTab === "seguridad" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-[#283F50] mb-4">Credenciales y Perfil del Administrador</h3>
          <form onSubmit={handleSaveAdmin} className="space-y-6 max-w-xl">
            {/* Información Personal */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={nombreAdmin}
                  onChange={(e) => setNombreAdmin(e.target.value)}
                  placeholder="Ej. Carlos Administrador"
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Correo Electrónico Corporativo
                </label>
                <Input
                  type="email"
                  value={correoAdmin}
                  onChange={(e) => setCorreoAdmin(e.target.value)}
                  placeholder="carlos.admin@techcorp.com"
                  className="h-10 text-sm"
                  required
                />
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#E5A93C]" />
                <h4 className="text-sm font-semibold text-[#283F50]">Cambiar Contraseña</h4>
              </div>
              <p className="text-xs text-slate-500">
                Deja estos campos en blanco si solo deseas actualizar tus datos personales.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contraseña Actual
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={contraseñaActual}
                  onChange={(e) => setContraseñaActual(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nueva Contraseña
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={nuevaContraseña}
                    onChange={(e) => setNuevaContraseña(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="h-10 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-[#283F50] flex items-center gap-1.5"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPassword ? "Ocultar contraseñas" : "Ver contraseñas"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSavingAdmin}
              className="bg-[#283F50] hover:bg-[#1E2F3C] text-white text-xs font-semibold px-5"
            >
              {isSavingAdmin ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Guardando cambios...
                </>
              ) : (
                "Guardar perfil y credenciales"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Pestaña 3: Estado de Integraciones */}
      {activeTab === "integraciones" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monitor de Servicios Backend */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-[#283F50]" />
                    <h3 className="text-base font-semibold text-[#283F50]">Motor de Simulación y API</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operativo
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Los servicios de seguimiento de aperturas, captura segura de clics y despacho de correos simulados están en línea y respondiendo adecuadamente.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
                <span>Versión: 1.0.0-fase5b</span>
                <span className="font-mono text-slate-600">Ambiente: Local / Producción</span>
              </div>
            </div>

            {/* Sincronización Móvil */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-[#283F50]" />
                    <h3 className="text-base font-semibold text-[#283F50]">Adopción de App Móvil</h3>
                  </div>
                  <span className="text-xs font-bold text-[#E5A93C]">{tasaAdopcion}% vinculados</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Porcentaje de colaboradores que han descargado la app y registrado su dispositivo para recibir microlecciones gamificadas.
                </p>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#E5A93C] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(tasaAdopcion, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{vinculados} vinculados</span>
                  <span>{totalColab} colaboradores totales</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <Link
                  href="/dashboard/usuarios"
                  className="text-xs font-semibold text-[#283F50] hover:text-[#E5A93C] inline-flex items-center gap-1"
                >
                  Gestionar colaboradores <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/dashboard/ayuda"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Plantilla de enrolamiento
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Regenerar Código de Acceso */}
      {isRegenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 text-[#E5A93C] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#283F50]">¿Regenerar código de acceso?</h3>
                <p className="text-xs text-slate-500">Esta acción cambiará el código institucional.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Los nuevos colaboradores que instalen la aplicación deberán ingresar el nuevo código. Los dispositivos que ya se encuentren vinculados no perderán su sesión.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRegenerateModalOpen(false)}
                disabled={isRegenerating}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRegenerate}
                disabled={isRegenerating}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Regenerando...
                  </>
                ) : (
                  "Sí, regenerar código"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
