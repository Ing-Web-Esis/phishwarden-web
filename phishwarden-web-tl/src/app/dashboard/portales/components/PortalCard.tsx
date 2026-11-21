"use client";

import { Eye, Edit, Trash2, MoreHorizontal, Globe, Shield, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PortalSimuladoItem } from "@/lib/types";

interface PortalCardProps {
  portal: PortalSimuladoItem;
  onPreview: (portal: PortalSimuladoItem) => void;
  onEdit: (portal: PortalSimuladoItem) => void;
  onDelete: (portal: PortalSimuladoItem) => void;
}

export function PortalCard({
  portal,
  onPreview,
  onEdit,
  onDelete,
}: PortalCardProps) {
  // Precisión técnica 2: Determinación segura de portal global
  const isGlobal = portal.esGlobal ?? portal.empresaId === null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Cabecera / Vista Previa Visual */}
      <div
        className="h-36 p-5 flex flex-col justify-between relative border-b border-slate-100 transition-colors"
        style={{ backgroundColor: portal.colorFondo || "#f3f4f6" }}
      >
        <div className="flex items-center justify-between">
          {/* Badge Global vs Personalizado */}
          {isGlobal ? (
            <span className="inline-flex items-center gap-1 bg-[#283F50]/90 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
              <Shield className="h-3 w-3 text-amber-400" />
              Global del Sistema
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-500/90 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
              <Building2 className="h-3 w-3" />
              Personalizado
            </span>
          )}

          {/* Muestra de color primario */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-200/60 shadow-xs">
            <span
              className="h-3 w-3 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: portal.colorPrimario || "#0067b8" }}
              title={`Color primario: ${portal.colorPrimario}`}
            />
            <span className="text-[10px] font-mono text-slate-600 font-medium">
              {portal.colorPrimario}
            </span>
          </div>
        </div>

        {/* Tarjeta miniatura simulada */}
        <div className="bg-white/95 rounded-lg p-2.5 border border-slate-200/80 shadow-xs max-w-[85%] self-center text-center">
          <p
            className="text-xs font-bold truncate max-w-[240px]"
            style={{ color: portal.colorPrimario || "#1e293b" }}
          >
            {portal.tituloPortal}
          </p>
          <p className="text-[10px] text-slate-500 truncate max-w-[240px] mt-0.5">
            {portal.subtitulo || "Portal de verificación"}
          </p>
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className="font-semibold text-slate-800 text-sm truncate"
              title={portal.nombre}
            >
              {portal.nombre}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
              {portal.tipoBase}
            </span>
          </div>

          <div className="space-y-1.5 mt-3 text-xs text-slate-500">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Usuario:</span>
              <span className="font-medium text-slate-700 truncate max-w-[170px]" title={portal.labelUsuario}>
                {portal.labelUsuario}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Contraseña:</span>
              <span className="font-medium text-slate-700 truncate max-w-[170px]" title={portal.labelPassword}>
                {portal.labelPassword}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Botón:</span>
              <span className="font-medium text-slate-700 truncate max-w-[170px]" title={portal.textoBoton}>
                {portal.textoBoton}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onPreview(portal)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#283F50] hover:text-[#1a2936] hover:underline cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            Previsualizar
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none outline-none">
              <div className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white border-slate-200 text-slate-600 shadow-md">
              <DropdownMenuItem onClick={() => onPreview(portal)} className="hover:bg-slate-50 cursor-pointer py-2 text-xs">
                <Eye className="mr-2 h-3.5 w-3.5" /> Ver pantalla completa
              </DropdownMenuItem>

              {!isGlobal && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => onEdit(portal)} className="hover:bg-slate-50 cursor-pointer py-2 text-xs">
                    <Edit className="mr-2 h-3.5 w-3.5" /> Editar portal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(portal)}
                    className="hover:bg-red-50 focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer py-2 text-xs"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar portal
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
