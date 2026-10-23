"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, X, Save, User, Mail, Building2, Lock, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PerfilPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: "success" | "error" }>({
    visible: false, title: "", message: "", type: "success"
  });

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    nombreEmpresa: "",
    contraseñaActual: "",
    nuevaContraseña: ""
  });

  // Guardamos una copia para poder restaurar si el usuario cancela la edición
  const [originalData, setOriginalData] = useState({
    nombre: "",
    correo: "",
    nombreEmpresa: "",
    contraseñaActual: "",
    nuevaContraseña: ""
  });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (title: string, message: string, type: "success" | "error") => {
    setToast({ visible: true, title, message, type });
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedData = {
            nombre: data.nombre || data.name || "",
            correo: data.correo || data.email || "",
            nombreEmpresa: data.empresa?.nombre || data.empresa?.name || "",
            contraseñaActual: "",
            nuevaContraseña: ""
          };
          setFormData(fetchedData);
          setOriginalData(fetchedData);
        }
      } catch (error) {
        showToast("Error", "No se pudo cargar la información del perfil.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleCancel = () => {
    setFormData(originalData); // Restauramos los datos originales
    setIsEditing(false); // Salimos del modo edición
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Error", "Sesión no válida.", "error");
      setIsSubmitting(false);
      return;
    }

    const payload: any = {
      nombre: formData.nombre,
      correo: formData.correo,
      nombreEmpresa: formData.nombreEmpresa,
    };

    if (formData.contraseñaActual || formData.nuevaContraseña) {
      payload.contraseñaActual = formData.contraseñaActual;
      payload.nuevaContraseña = formData.nuevaContraseña;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast("Perfil actualizado", "Tus datos han sido guardados correctamente.", "success");
        
        // Actualizamos la copia de seguridad y limpiamos contraseñas
        const updatedData = { ...formData, contraseñaActual: "", nuevaContraseña: "" };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditing(false); // Salimos del modo edición tras guardar con éxito
        
        // Recargar la página después de un momento para que el Layout actualice el nombre
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await response.json().catch(() => ({}));
        showToast("Error al actualizar", err.message || "Revisa tu contraseña actual.", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "El servidor no responde.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E5A93C]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-10">
      {/* Notificación Toast */}
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

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#283F50] tracking-tight">Mi Perfil</h1>
          <p className="text-slate-500 mt-1">Consulta y actualiza tu información personal y de organización.</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-[#E5A93C] text-[#283F50] hover:bg-[#D49A35] font-semibold h-11 px-6 rounded-lg shadow-sm"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Editar perfil
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sección de Información Personal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-[#283F50] flex items-center gap-2">
              <User className="h-5 w-5 text-[#E5A93C]" />
              Información de la cuenta
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  required 
                  disabled={!isEditing}
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className={`pl-9 border-slate-200 focus-visible:ring-[#E5A93C] ${!isEditing ? "bg-slate-50 text-slate-500 opacity-100" : "bg-white"}`}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  required 
                  type="email"
                  disabled={!isEditing}
                  value={formData.correo} 
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  className={`pl-9 border-slate-200 focus-visible:ring-[#E5A93C] ${!isEditing ? "bg-slate-50 text-slate-500 opacity-100" : "bg-white"}`}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nombre de la Organización</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  required 
                  disabled={!isEditing}
                  value={formData.nombreEmpresa} 
                  onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                  className={`pl-9 border-slate-200 focus-visible:ring-[#E5A93C] ${!isEditing ? "bg-slate-50 text-slate-500 opacity-100" : "bg-white"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Seguridad (Solo visible en modo edición) */}
        {isEditing && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-[#283F50] flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-400" />
                Seguridad y Contraseña
              </h2>
              <p className="text-sm text-slate-500 mt-1">Completa estos campos únicamente si deseas actualizar tu contraseña actual.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contraseña actual</label>
                <Input 
                  type="password"
                  placeholder="********"
                  value={formData.contraseñaActual} 
                  onChange={(e) => setFormData({...formData, contraseñaActual: e.target.value})}
                  className="bg-white border-slate-200 focus-visible:ring-[#E5A93C]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
                <Input 
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.nuevaContraseña} 
                  onChange={(e) => setFormData({...formData, nuevaContraseña: e.target.value})}
                  className="bg-white border-slate-200 focus-visible:ring-[#E5A93C]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción (Solo visibles en modo edición) */}
        {isEditing && (
          <div className="flex items-center justify-end gap-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-slate-200 h-11 px-6 rounded-lg text-base"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-[#283F50] text-white hover:bg-[#1a2936] h-11 px-8 rounded-lg text-base"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Guardar cambios
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}