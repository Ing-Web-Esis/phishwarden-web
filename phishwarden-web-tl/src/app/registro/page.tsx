"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient, ApiError } from "@/lib/api-client";
import { companyService } from "@/services/company.service";
import type { CompanyPlan, AuthLoginResponse } from "@/lib/types";

function RegistroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams.get("plan")?.toLowerCase();
  const initialPlan: CompanyPlan =
    planParam === "essential" || planParam === "enterprise"
      ? planParam
      : "professional";

  const [selectedPlan, setSelectedPlan] = useState<CompanyPlan>(initialPlan);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAccessCode, setCreatedAccessCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync plan if searchParams changes
  useEffect(() => {
    if (planParam === "essential" || planParam === "professional" || planParam === "enterprise") {
      setSelectedPlan(planParam);
    }
  }, [planParam]);

  const handleCopyCode = async () => {
    if (!createdAccessCode) return;
    try {
      await navigator.clipboard.writeText(createdAccessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!acceptedTerms) {
      setErrorMessage("Debes aceptar los términos de uso ético y defensivo.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register company and admin
      const response = await companyService.registerCompany({
        companyName: companyName.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        password,
        plan: selectedPlan,
      });

      const { empresa, administrador } = response;
      const accessCode = empresa.codigoAcceso;
      setCreatedAccessCode(accessCode);

      // 2. Auto-login consistent with LoginForm
      try {
        const loginData = await apiClient.post<AuthLoginResponse>(
          "/auth/login",
          { email: adminEmail.trim(), password },
          { skipAuth: true }
        );

        const token = loginData.access_token || loginData.token;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("empresaId", String(empresa.id));
          localStorage.setItem("codigoAcceso", accessCode);
          localStorage.setItem("adminNombre", administrador.nombre);
          localStorage.setItem("nombreEmpresa", empresa.nombre);
        }
      } catch (loginErr) {
        console.warn("Auto-login error post-register:", loginErr);
      }

      // 3. Show success card with access code
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMessage(
            "El correo corporativo ya se encuentra registrado. Inicia sesión o utiliza otra dirección."
          );
        } else {
          setErrorMessage(err.message || "Error al registrar la organización.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al procesar el registro.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#283F50]">
              ¡Organización creada exitosamente!
            </h1>
            <p className="text-sm text-slate-500">
              Tu entorno empresarial ha sido configurado bajo el plan{" "}
              <span className="font-semibold text-[#E5A93C] capitalize">
                {selectedPlan}
              </span>
              .
            </p>
          </div>

          {/* Access Code Display */}
          <div className="bg-[#FEF6E9] border-2 border-[#E5A93C]/40 rounded-xl p-6 space-y-3 text-center">
            <span className="text-[11px] font-bold tracking-widest text-[#E5A93C] uppercase block">
              Código de Acceso Institucional
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-extrabold text-[#283F50] tracking-wider">
                {createdAccessCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-white border border-[#E5A93C]/30 text-slate-700 hover:text-[#E5A93C] hover:bg-slate-50 transition-colors shadow-xs"
                title="Copiar código al portapapeles"
              >
                {copiedCode ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copiedCode && (
              <p className="text-xs font-medium text-emerald-600 animate-in fade-in">
                Código copiado al portapapeles
              </p>
            )}
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Comparte este código con tus colaboradores para que puedan enrolarse
              fácilmente desde la app móvil institucional.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full h-12 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Ir al Panel de Control</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#283F50] selection:bg-[#E5A93C]/20 font-sans py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#283F50]">
              PhishWarden
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#283F50] tracking-tight">
            Crea la cuenta de tu organización
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            Comienza a proteger tu organización con simulaciones inteligentes y
            capacitación continua en seguridad.
          </p>
        </div>

        {/* 1. Interactive Plan Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] block text-center">
            Paso 1: Selecciona el plan institucional
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Essential */}
            <button
              type="button"
              onClick={() => setSelectedPlan("essential")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedPlan === "essential"
                  ? "border-[#E5A93C] bg-white ring-2 ring-[#E5A93C]/20 shadow-md"
                  : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-[#283F50] block">
                  Essential
                </span>
                {selectedPlan === "essential" && (
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-lg font-extrabold text-[#283F50] block mt-1">
                S/ 390
                <span className="text-[11px] font-normal text-slate-400">
                  {" "}
                  /mes
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Hasta 250 usuarios · 2 campañas/mes
              </p>
            </button>

            {/* Professional */}
            <button
              type="button"
              onClick={() => setSelectedPlan("professional")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedPlan === "professional"
                  ? "border-[#E5A93C] bg-white ring-2 ring-[#E5A93C]/20 shadow-md"
                  : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-[#FEF6E9] border border-[#E5A93C]/40 text-[#E5A93C] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Más Elegido
              </span>
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-[#283F50] block">
                  Professional
                </span>
                {selectedPlan === "professional" && (
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-lg font-extrabold text-[#283F50] block mt-1">
                S/ 790
                <span className="text-[11px] font-normal text-slate-400">
                  {" "}
                  /mes
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Hasta 1,000 usuarios · Campañas ilimitadas
              </p>
            </button>

            {/* Enterprise */}
            <button
              type="button"
              onClick={() => setSelectedPlan("enterprise")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedPlan === "enterprise"
                  ? "border-[#E5A93C] bg-white ring-2 ring-[#E5A93C]/20 shadow-md"
                  : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-[#283F50] block">
                  Enterprise
                </span>
                {selectedPlan === "enterprise" && (
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <span className="text-lg font-extrabold text-[#283F50] block mt-1">
                A medida
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Usuarios ilimitados · SSO & API
              </p>
            </button>
          </div>
        </div>

        {/* 2. Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 sm:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#283F50]">
              Paso 2: Datos de la organización y administrador
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Todos los campos son obligatorios para la inicialización del
              entorno.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Organization Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="companyName"
                  className="text-xs font-semibold text-[#283F50]"
                >
                  Nombre oficial de la organización
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="companyName"
                    type="text"
                    required
                    placeholder="TechCorp Perú S.A.C."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-[#E5A93C]"
                  />
                </div>
              </div>

              {/* Admin Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="adminName"
                  className="text-xs font-semibold text-[#283F50]"
                >
                  Nombre completo del administrador
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="adminName"
                    type="text"
                    required
                    placeholder="Carlos Administrador"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-[#E5A93C]"
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="adminEmail"
                  className="text-xs font-semibold text-[#283F50]"
                >
                  Correo corporativo institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="adminEmail"
                    type="email"
                    required
                    placeholder="carlos.admin@techcorp.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-[#E5A93C]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#283F50]"
                >
                  Contraseña de acceso
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-11 rounded-xl border-slate-200 focus-visible:ring-[#E5A93C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-[#283F50]"
                >
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-9 h-11 rounded-xl border-slate-200 focus-visible:ring-[#E5A93C]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ethical Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms(Boolean(checked))
                  }
                  className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#E5A93C] data-[state=checked]:border-[#E5A93C]"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Confirmo que tengo autorización institucional para ejecutar
                  simulaciones de seguridad defensivas y concientización sobre
                  los colaboradores de esta organización.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configurando organización...</span>
                  </>
                ) : (
                  <>
                    <span>Completar Registro e Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Cross Link to Login */}
          <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta registrada?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#E5A93C] hover:text-[#d6992d] transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegistroFallback() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-[#E5A93C]" />
        <span>Cargando formulario de registro...</span>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<RegistroFallback />}>
      <RegistroContent />
    </Suspense>
  );
}
