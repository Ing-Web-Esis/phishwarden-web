"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  BookOpen,
  Send,
  Globe,
  Smartphone,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  HelpCircle,
  FileText,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { companyService } from "@/services/company.service";
import type { AdminProfile, CompanyDetail } from "@/lib/types";

interface GuideItem {
  id: string;
  categoria: "campanas" | "portales" | "movil" | "riesgo";
  categoriaLabel: string;
  titulo: string;
  descripcion: string;
  pasos: string[];
  tips: string[];
}

const GUIAS: GuideItem[] = [
  {
    id: "guia-campana-lanzamiento",
    categoria: "campanas",
    categoriaLabel: "Campañas",
    titulo: "Cómo diseñar y lanzar una campaña de simulación",
    descripcion: "Flujo paso a paso para programar un simulacro defensivo dirigido a departamentos específicos.",
    pasos: [
      "Navega a 'Gestión de campañas' y presiona el botón 'Nueva campaña'.",
      "Asigna un nombre descriptivo (ej. 'Simulación Notificación RRHH - Diciembre').",
      "Selecciona el vector de ataque deseado: Phishing por correo electrónico, Smishing o Código QR.",
      "Elige una plantilla prediseñada o personaliza las variables dinámicas {{nombre}} y {{empresa}}.",
      "Selecciona los departamentos objetivo o incluye a toda la organización.",
      "Define si el despacho será inmediato o programado para una fecha y hora específicas.",
    ],
    tips: [
      "Evita lanzar simulacros masivos a la misma hora exacta para entrenar a tus filtros de correo y evitar saturación en el área de TI.",
      "Los colaboradores que caigan en la simulación recibirán automáticamente una microlección de refuerzo sin ser penalizados punitivamente.",
    ],
  },
  {
    id: "guia-portales-simulados",
    categoria: "portales",
    categoriaLabel: "Portales Simulados",
    titulo: "Configuración y previsualización de portales falsos",
    descripcion: "Mecanismo defensivo de recolección de eventos de credenciales sin almacenar contraseñas reales.",
    pasos: [
      "Accede a la sección 'Portales simulados' en el menú principal.",
      "Revisa la biblioteca de portales corporativos disponibles (Microsoft 365, Google Workspace, Portales Bancarios, Intranet).",
      "Utiliza el botón 'Previsualizar' para verificar cómo verá la pantalla de inicio de sesión el colaborador si hace clic en el enlace simulado.",
      "Cuando un colaborador envía sus credenciales en el portal falso, el sistema marca el evento 'Envío de credenciales' y destruye inmediatamente el texto de la contraseña, registrando solo el token de auditoría.",
    ],
    tips: [
      "Por estrictas normas éticas y de privacidad, PhishWarden jamás almacena contraseñas reales ni textos ingresados en los campos de clave.",
    ],
  },
  {
    id: "guia-app-movil-fcm",
    categoria: "movil",
    categoriaLabel: "App Móvil y FCM",
    titulo: "Enrolamiento de colaboradores y notificaciones push",
    descripcion: "Procedimiento para que los empleados vinculen su smartphone con el código institucional de la empresa.",
    pasos: [
      "Comparte con tus colaboradores la plantilla oficial de incorporación provista en esta página con tu código institucional único.",
      "El colaborador descarga la aplicación PhishWarden en su dispositivo móvil (Android / iOS).",
      "Al abrir la aplicación por primera vez, el colaborador ingresa el Código de Acceso Institucional y su correo electrónico registrado en la organización.",
      "El dispositivo registra automáticamente su token de Firebase Cloud Messaging (FCM) para recibir alertas instantáneas de simulacros y cápsulas de capacitación.",
    ],
    tips: [
      "Si un colaborador cambia de smartphone, solo debe volver a ingresar el código de la empresa y su correo institucional para reactivar su cuenta.",
    ],
  },
  {
    id: "guia-riesgo-microlecciones",
    categoria: "riesgo",
    categoriaLabel: "Riesgo y Microlecciones",
    titulo: "Cálculo del Score de Riesgo (0 a 100) y Microlecciones reactivas",
    descripcion: "Entiende la fórmula de evaluación de vulnerabilidad humana y la gamificación formativa.",
    pasos: [
      "Cada usuario inicia con un Score de Riesgo base según su historial de seguridad (escala de 0 = seguro a 100 = crítico).",
      "Si un usuario abre un correo simulado, hace clic en el enlace o ingresa credenciales, su score de riesgo se incrementa proporcionalmente.",
      "Si el usuario detecta el engaño y presiona el botón 'Reportar correo sospechoso', su score de riesgo disminuye y suma puntos de defensor.",
      "Al caer en un simulacro, el backend asigna automáticamente una microlección interactiva de 2 a 3 minutos acorde al vector atacado.",
      "Al aprobar la evaluación de la microlección, el usuario recupera reputación y desbloquea medallas de superación.",
    ],
    tips: [
      "Escala oficial: 0–30 Nivel Bajo (Verde esmeralda), 31–69 Nivel Medio (Ámbar), 70–100 Nivel Crítico (Rojo).",
    ],
  },
];

export default function AyudaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>("guia-campana-lanzamiento");

  // Datos reales de la empresa
  const [nombreEmpresa, setNombreEmpresa] = useState<string>("Mi Organización");
  const [codigoAcceso, setCodigoAcceso] = useState<string>("PW8Y9K23");
  const [copiadoPlantilla, setCopiadoPlantilla] = useState(false);

  // Verificador de estado y latencia
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState<"checking" | "online" | "degraded" | "offline">("checking");
  const [lastCheckTime, setLastCheckTime] = useState<string>("");

  // Cargar datos de empresa
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const adminData = await apiClient.get<AdminProfile>("/auth/me");
        if (adminData.empresa?.nombre) {
          setNombreEmpresa(adminData.empresa.nombre);
        }
        let code = adminData.empresa?.codigoAcceso || adminData.codigoAcceso || localStorage.getItem("codigoAcceso");
        if (!code && adminData.empresa?.id) {
          try {
            const comp = await companyService.getCompany(adminData.empresa.id);
            if (comp?.codigoAcceso) {
              code = comp.codigoAcceso;
            }
          } catch {
            // Silencioso
          }
        }
        if (code) {
          setCodigoAcceso(code);
        }
      } catch (err) {
        console.error("Error al cargar datos en ayuda:", err);
      }
    };

    fetchCompanyData();
    checkSystemHealth();
  }, []);

  // Comprobar estado y latencia del sistema
  const checkSystemHealth = async () => {
    setSystemStatus("checking");
    const start = performance.now();
    try {
      await apiClient.get<{ message?: string } | string>("/", { skipAuth: true });
      const end = performance.now();
      const diff = Math.round(end - start);
      setLatencyMs(diff);
      setSystemStatus(diff < 600 ? "online" : "degraded");
      setLastCheckTime(new Date().toLocaleTimeString());
    } catch {
      setLatencyMs(null);
      setSystemStatus("offline");
      setLastCheckTime(new Date().toLocaleTimeString());
    }
  };

  // Filtrado de guías en tiempo real
  const filteredGuias = useMemo(() => {
    return GUIAS.filter((guia) => {
      const matchCategory = selectedCategory === "todas" || guia.categoria === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCategory;

      const matchText =
        guia.titulo.toLowerCase().includes(term) ||
        guia.descripcion.toLowerCase().includes(term) ||
        guia.pasos.some((p) => p.toLowerCase().includes(term)) ||
        guia.tips.some((t) => t.toLowerCase().includes(term));

      return matchCategory && matchText;
    });
  }, [searchTerm, selectedCategory]);

  // Texto generado para la plantilla de incorporación
  const plantillaTexto = useMemo(() => {
    return `Estimado(a) colaborador(a),

En ${nombreEmpresa}, tu seguridad y la de nuestra organización es una prioridad estratégica. Te invitamos a descargar la aplicación móvil PhishWarden para participar activamente en nuestro programa de concientización y defensa frente a amenazas cibernéticas.

Instrucciones para comenzar:
1. Descarga e instala la app PhishWarden en tu dispositivo móvil corporativo o personal.
2. Abre la app e ingresa nuestro Código Institucional de Acceso: ${codigoAcceso}
3. Inicia sesión con tu correo electrónico institucional corporativo.
4. Completa tus microlecciones interactivas, mantén tu racha segura y acumula insignias de defensor de ciberseguridad.

Si tienes dudas o detectas un mensaje sospechoso, repórtalo inmediatamente mediante la app o contacta al equipo de TI.

Atentamente,
Equipo de Seguridad de la Información - ${nombreEmpresa}`;
  }, [nombreEmpresa, codigoAcceso]);

  const handleCopyPlantilla = async () => {
    try {
      await navigator.clipboard.writeText(plantillaTexto);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = plantillaTexto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopiadoPlantilla(true);
    setTimeout(() => setCopiadoPlantilla(false), 2500);
  };

  const handleDownloadPlantilla = () => {
    const blob = new Blob([plantillaTexto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `instructivo-enrolamiento-${nombreEmpresa.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabecera y Buscador */}
      <div className="bg-gradient-to-r from-[#283F50] to-[#1E2F3C] text-white p-8 rounded-2xl shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-[#E5A93C] uppercase tracking-wider">
            Soporte y Base de Conocimiento
          </span>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Centro de Ayuda PhishWarden</h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Encuentra guías operativas, directrices de simulación, instructivos descargables para tus colaboradores y verifica el estado de la infraestructura en tiempo real.
          </p>
        </div>

        {/* Buscador interactivo */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por palabra clave (ej. score de riesgo, portales, fcm, microlecciones)..."
            className="pl-11 pr-4 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20 text-sm"
          />
        </div>
      </div>

      {/* Verificador de Estado y Latencia en Vivo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              systemStatus === "online"
                ? "bg-emerald-50 text-emerald-600"
                : systemStatus === "degraded"
                ? "bg-amber-50 text-amber-600"
                : systemStatus === "checking"
                ? "bg-slate-50 text-slate-500"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#283F50]">Disponibilidad de la API PhishWarden</h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  systemStatus === "online"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : systemStatus === "degraded"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : systemStatus === "checking"
                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {systemStatus === "online" ? (
                  <>
                    <Wifi className="h-3 w-3" /> Operativo
                  </>
                ) : systemStatus === "degraded" ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Latencia Alta
                  </>
                ) : systemStatus === "checking" ? (
                  "Comprobando..."
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" /> Sin conexión
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Latencia de respuesta:{" "}
              <span className="font-semibold text-slate-700">
                {latencyMs !== null ? `${latencyMs} ms` : "N/D"}
              </span>{" "}
              · Última comprobación: {lastCheckTime || "Recién iniciada"}
            </p>
          </div>
        </div>

        <Button
          onClick={checkSystemHealth}
          variant="outline"
          size="sm"
          disabled={systemStatus === "checking"}
          className="self-start sm:self-center text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${systemStatus === "checking" ? "animate-spin" : ""}`} />
          Verificar ahora
        </Button>
      </div>

      {/* Grid Principal: Guías y Plantilla de Enrolamiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda (2 Cols): Acordeón de Guías Operativas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pills de Categorías */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "todas", label: "Todas las guías" },
              { id: "campanas", label: "Campañas" },
              { id: "portales", label: "Portales Simulados" },
              { id: "movil", label: "App Móvil y FCM" },
              { id: "riesgo", label: "Riesgo y Microlecciones" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#283F50] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Listado / Acordeón */}
          {filteredGuias.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
              <HelpCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold">No se encontraron guías para tu búsqueda.</p>
              <p className="text-xs text-slate-400 mt-1">Prueba usando términos más generales o cambia de categoría.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuias.map((guia) => {
                const isExpanded = expandedGuideId === guia.id;
                return (
                  <div
                    key={guia.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedGuideId(isExpanded ? null : guia.id)}
                      className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5A93C]">
                          {guia.categoriaLabel}
                        </span>
                        <h3 className="text-base font-semibold text-[#283F50]">{guia.titulo}</h3>
                        <p className="text-xs text-slate-500">{guia.descripcion}</p>
                      </div>
                      <div className="p-1 rounded-lg text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs text-slate-600 bg-slate-50/30">
                        <div>
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                            Procedimiento Recomendado:
                          </h4>
                          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-700">
                            {guia.pasos.map((paso, idx) => (
                              <li key={idx} className="pl-1">
                                {paso}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {guia.tips.length > 0 && (
                          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900 space-y-1">
                            <span className="font-bold text-[11px] block">Consideraciones de Seguridad:</span>
                            {guia.tips.map((tip, idx) => (
                              <p key={idx} className="text-[11px] leading-relaxed">
                                • {tip}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha (1 Col): Plantilla de Enrolamiento Móvil */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#283F50]">
              <Smartphone className="h-5 w-5 text-[#E5A93C]" />
              <h3 className="text-base font-semibold">Plantilla de Incorporación Móvil</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Texto preformateado con el código institucional real de <strong className="text-slate-700">{nombreEmpresa}</strong>. Cópialo o descárgalo para enviarlo por correo o canales de comunicación interna.
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {plantillaTexto}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={handleCopyPlantilla}
                className="flex-1 bg-[#283F50] hover:bg-[#1E2F3C] text-white text-xs font-semibold h-9"
              >
                {copiadoPlantilla ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copiado al portapapeles
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar plantilla
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadPlantilla}
                variant="outline"
                className="text-xs font-semibold h-9 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Descargar .txt
              </Button>
            </div>
          </div>

          {/* Tarjeta de Código Rápido */}
          <div className="bg-[#283F50] text-white p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código Institucional</p>
              <p className="font-mono text-xl font-bold text-[#E5A93C] tracking-widest mt-0.5">
                {codigoAcceso}
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-[#E5A93C]">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
