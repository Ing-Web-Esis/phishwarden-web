"use client";

import { useState } from "react";
import { X, Copy, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CampaignItem, DuplicateCampaignInput } from "@/lib/types";

interface DuplicateCampaignModalProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function DuplicateCampaignModalDialog({
  campaign,
  onClose,
  onSuccess,
}: {
  campaign: CampaignItem;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [name, setName] = useState(`Copia de ${campaign.name}`);
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!scheduledDate) {
      setErrorMessage("Debes especificar la nueva fecha y hora programada.");
      return;
    }

    const dateObj = new Date(scheduledDate);
    if (isNaN(dateObj.getTime())) {
      setErrorMessage("La fecha programada no es válida.");
      return;
    }

    try {
      setIsSubmitting(true);
      const empresaId = localStorage.getItem("empresaId");
      if (!empresaId) throw new Error("No se encontró la organización activa.");

      const payload: DuplicateCampaignInput = {
        name: name.trim() ? name.trim() : undefined,
        scheduledDate: dateObj.toISOString(),
      };

      await apiClient.post(
        `/empresas/${empresaId}/campanas/${campaign.id}/duplicar`,
        payload
      );

      onSuccess(`Campaña "${campaign.name}" duplicada exitosamente como nueva campaña programada.`);
      onClose();
    } catch (err: unknown) {
      console.error("Error al duplicar campaña:", err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Error al duplicar la campaña.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al duplicar la campaña.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#283F50]/10 text-[#283F50]">
              <Copy className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#283F50]">Duplicar Campaña</h2>
              <p className="text-xs text-slate-500">
                Clona la plantilla, modalidad y colaboradores en una nueva campaña.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1">
              Nombre de la Nueva Campaña
            </label>
            <Input
              type="text"
              placeholder="Nombre para la campaña clonada"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 border-slate-200 text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Si se deja vacío, conservará el nombre de la campaña original.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#283F50] uppercase tracking-wider mb-1">
              Nueva Fecha y Hora Programada *
            </label>
            <div className="relative">
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-slate-50 border-slate-200 text-xs"
                required
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              La nueva campaña quedará en estado <strong>programada</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-8 px-3 border-slate-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-8 px-4 bg-[#283F50] hover:bg-[#1f313e] text-white flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Clonando...</span>
                </>
              ) : (
                <span>Confirmar y Duplicar</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DuplicateCampaignModal(props: DuplicateCampaignModalProps) {
  if (!props.isOpen || !props.campaign) return null;
  return <DuplicateCampaignModalDialog key={props.campaign.id} {...props} campaign={props.campaign} />;
}
