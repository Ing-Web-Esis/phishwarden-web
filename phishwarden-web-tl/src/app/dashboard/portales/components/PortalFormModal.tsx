"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Building2, User, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PortalSimuladoItem,
  CreatePortalInput,
  UpdatePortalInput,
  PortalTipoBase,
} from "@/lib/types";

interface PortalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePortalInput | UpdatePortalInput, portalId?: number) => Promise<void>;
  portalToEdit?: PortalSimuladoItem | null;
  isSubmitting?: boolean;
}

export function PortalFormModal({
  isOpen,
  onClose,
  onSubmit,
  portalToEdit,
  isSubmitting = false,
}: PortalFormModalProps) {
  const isEditing = Boolean(portalToEdit);

  const [formData, setFormData] = useState({
    nombre: "",
    tipoBase: "personalizado" as PortalTipoBase,
    tituloPortal: "Iniciar sesión en Intranet",
    subtitulo: "Credenciales de red institucional",
    logoUrl: "",
    colorPrimario: "#0067b8",
    colorFondo: "#f3f4f6",
    labelUsuario: "Correo electrónico o usuario",
    labelPassword: "Contraseña",
    textoBoton: "Iniciar sesión",
  });

  const [logoPreviewError, setLogoPreviewError] = useState(false);

  useEffect(() => {
    if (portalToEdit) {
      setFormData({
        nombre: portalToEdit.nombre || "",
        tipoBase: portalToEdit.tipoBase || "personalizado",
        tituloPortal: portalToEdit.tituloPortal || "Iniciar sesión",
        subtitulo: portalToEdit.subtitulo || "",
        logoUrl: portalToEdit.logoUrl || "",
        colorPrimario: portalToEdit.colorPrimario || "#0067b8",
        colorFondo: portalToEdit.colorFondo || "#f3f4f6",
        labelUsuario: portalToEdit.labelUsuario || "Correo electrónico o usuario",
        labelPassword: portalToEdit.labelPassword || "Contraseña",
        textoBoton: portalToEdit.textoBoton || "Iniciar sesión",
      });
      setLogoPreviewError(false);
    } else {
      setFormData({
        nombre: "",
        tipoBase: "personalizado",
        tituloPortal: "Portal de Acceso Corporativo",
        subtitulo: "Autenticación Única de Red",
        logoUrl: "",
        colorPrimario: "#0067b8",
        colorFondo: "#f3f4f6",
        labelUsuario: "Correo electrónico o usuario",
        labelPassword: "Contraseña",
        textoBoton: "Iniciar sesión",
      });
      setLogoPreviewError(false);
    }
  }, [portalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Precisión técnica 1: Alineación estricta de payloads con API_CONTRACTS.md
    // Se omiten id, empresaId, esGlobal y fechaCreacion. Solo propiedades válidas de DTO.
    const payload: CreatePortalInput = {
      nombre: formData.nombre.trim(),
      tipoBase: formData.tipoBase || "personalizado",
      tituloPortal: formData.tituloPortal.trim(),
      colorPrimario: formData.colorPrimario.trim() || "#0067b8",
      colorFondo: formData.colorFondo.trim() || "#f3f4f6",
      labelUsuario: formData.labelUsuario.trim() || "Correo electrónico o usuario",
      labelPassword: formData.labelPassword.trim() || "Contraseña",
      textoBoton: formData.textoBoton.trim() || "Iniciar sesión",
    };

    if (formData.subtitulo.trim()) {
      payload.subtitulo = formData.subtitulo.trim();
    }
    if (formData.logoUrl.trim()) {
      payload.logoUrl = formData.logoUrl.trim();
    }

    await onSubmit(payload, portalToEdit?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-[#283F50]">
              {isEditing ? "Editar portal simulado" : "Crear portal simulado personalizado"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personaliza la apariencia de la pantalla de inicio de sesión falsa
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido en dos columnas: Formulario + Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Columna Izquierda: Formulario (7 columnas) */}
          <form
            id="portal-form"
            onSubmit={handleFormSubmit}
            className="lg:col-span-7 p-6 space-y-4 border-r border-slate-100"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nombre interno del portal *
              </label>
              <Input
                required
                maxLength={100}
                placeholder="Ej. Portal SSO Ventas Q4"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C] text-sm"
              />
              <p className="text-[11px] text-slate-400">
                Identificador administrativo visible en los reportes y selectores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tipo Base / Arquetipo
                </label>
                <select
                  value={formData.tipoBase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoBase: e.target.value as PortalTipoBase,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E5A93C]"
                >
                  <option value="personalizado">Personalizado (Genérico)</option>
                  <option value="corporativo">Corporativo SSO</option>
                  <option value="bancario">Bancario</option>
                  <option value="microsoft">Microsoft 365</option>
                  <option value="google">Google Workspace</option>
                  <option value="unjbg">Aula Virtual UNJBG</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Título principal en pantalla *
                </label>
                <Input
                  required
                  maxLength={150}
                  placeholder="Ej. Iniciar sesión en Intranet"
                  value={formData.tituloPortal}
                  onChange={(e) =>
                    setFormData({ ...formData, tituloPortal: e.target.value })
                  }
                  className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subtítulo o descripción (Opcional)
              </label>
              <Input
                maxLength={255}
                placeholder="Ej. Ingrese sus credenciales de red institucional"
                value={formData.subtitulo}
                onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                URL del Logotipo (Opcional)
              </label>
              <Input
                type="url"
                placeholder="https://ejemplo.com/assets/logo.png"
                value={formData.logoUrl}
                onChange={(e) => {
                  setFormData({ ...formData, logoUrl: e.target.value });
                  setLogoPreviewError(false);
                }}
                className="bg-slate-50 border-slate-200 focus-visible:ring-[#E5A93C] text-sm"
              />
              <p className="text-[11px] text-slate-400">
                Debe ser un enlace directo HTTPS a la imagen (PNG, JPG o SVG).
              </p>
            </div>

            {/* Selector de Colores */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Color Primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.colorPrimario}
                    onChange={(e) =>
                      setFormData({ ...formData, colorPrimario: e.target.value })
                    }
                    className="h-9 w-9 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <Input
                    maxLength={20}
                    value={formData.colorPrimario}
                    onChange={(e) =>
                      setFormData({ ...formData, colorPrimario: e.target.value })
                    }
                    className="bg-slate-50 border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Color de Fondo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.colorFondo}
                    onChange={(e) =>
                      setFormData({ ...formData, colorFondo: e.target.value })
                    }
                    className="h-9 w-9 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <Input
                    maxLength={20}
                    value={formData.colorFondo}
                    onChange={(e) =>
                      setFormData({ ...formData, colorFondo: e.target.value })
                    }
                    className="bg-slate-50 border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Etiquetas de Formulario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Etiqueta Campo Usuario
                </label>
                <Input
                  maxLength={80}
                  value={formData.labelUsuario}
                  onChange={(e) =>
                    setFormData({ ...formData, labelUsuario: e.target.value })
                  }
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Etiqueta Campo Contraseña
                </label>
                <Input
                  maxLength={80}
                  value={formData.labelPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, labelPassword: e.target.value })
                  }
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Texto del Botón de Acción
              </label>
              <Input
                maxLength={60}
                value={formData.textoBoton}
                onChange={(e) =>
                  setFormData({ ...formData, textoBoton: e.target.value })
                }
                className="bg-slate-50 border-slate-200 text-sm"
              />
            </div>
          </form>

          {/* Columna Derecha: Live Preview (5 columnas) */}
          <div className="lg:col-span-5 bg-slate-100/70 p-6 flex flex-col justify-between border-t lg:border-t-0 border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Vista Previa en Vivo</span>
              </div>

              {/* Contenedor del Preview */}
              <div
                className="rounded-xl p-4 shadow-inner border border-slate-200 min-h-[360px] flex items-center justify-center transition-colors"
                style={{ backgroundColor: formData.colorFondo }}
              >
                <div className="w-full max-w-[280px] bg-white rounded-xl shadow-md border border-slate-200/80 p-5 space-y-3">
                  {/* Logo o Icono */}
                  <div className="text-center">
                    {formData.logoUrl && !logoPreviewError ? (
                      <div className="flex justify-center mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.logoUrl}
                          alt="Logo preview"
                          className="max-h-10 max-w-[120px] object-contain"
                          onError={() => setLogoPreviewError(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-white mb-2 shadow-xs"
                        style={{ backgroundColor: formData.colorPrimario }}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      {formData.tituloPortal || "Título del Portal"}
                    </h4>
                    {formData.subtitulo && (
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        {formData.subtitulo}
                      </p>
                    )}
                  </div>

                  {/* Campos simulados */}
                  <div className="space-y-2 pt-1 text-[10px]">
                    <div>
                      <span className="block font-semibold text-slate-600 mb-0.5">
                        {formData.labelUsuario || "Usuario"}
                      </span>
                      <div className="h-7 px-2 rounded border border-slate-300 bg-slate-50 text-slate-400 flex items-center">
                        <User className="h-3 w-3 mr-1 text-slate-400" />
                        <span>usuario@empresa.com</span>
                      </div>
                    </div>

                    <div>
                      <span className="block font-semibold text-slate-600 mb-0.5">
                        {formData.labelPassword || "Contraseña"}
                      </span>
                      <div className="h-7 px-2 rounded border border-slate-300 bg-slate-50 text-slate-400 flex items-center font-mono">
                        <Lock className="h-3 w-3 mr-1 text-slate-400" />
                        <span>••••••••</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div
                        className="h-8 rounded text-white font-semibold flex items-center justify-center shadow-xs text-[11px]"
                        style={{ backgroundColor: formData.colorPrimario }}
                      >
                        {formData.textoBoton || "Iniciar sesión"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4">
              La vista previa se actualiza inmediatamente con cada ajuste.
            </p>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="portal-form"
            disabled={isSubmitting}
            className="bg-[#283F50] text-white hover:bg-[#1a2936]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar portal"
            ) : (
              "Crear portal"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
