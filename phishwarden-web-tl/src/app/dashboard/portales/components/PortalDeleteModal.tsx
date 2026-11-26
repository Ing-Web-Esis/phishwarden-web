"use client";

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalSimuladoItem } from "@/lib/types";

interface PortalDeleteModalProps {
  portal: PortalSimuladoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function PortalDeleteModal({
  portal,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: PortalDeleteModalProps) {
  if (!isOpen || !portal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-2">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              ¿Eliminar portal simulado?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Estás a punto de eliminar{" "}
              <strong className="text-slate-700">"{portal.nombre}"</strong>. Esta
              acción no se puede deshacer y las plantillas vinculadas utilizarán el
              portal corporativo por defecto.
            </p>
          </div>

          <div className="pt-2 flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="border-slate-200 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Eliminando...
                </>
              ) : (
                "Eliminar portal"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
