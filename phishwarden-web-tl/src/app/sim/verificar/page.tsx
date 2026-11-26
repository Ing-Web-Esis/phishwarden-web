"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { SimulationContext, TrackSubmitResponse } from "@/lib/types";

// Portales simulados (Zero-Credential Storage)
import { MicrosoftLanding } from "@/components/simulacion/MicrosoftLanding";
import { GoogleLanding } from "@/components/simulacion/GoogleLanding";
import { BancarioLanding } from "@/components/simulacion/BancarioLanding";
import { CorporativoLanding } from "@/components/simulacion/CorporativoLanding";
import { UnjbgLanding } from "@/components/simulacion/UnjbgLanding";
import { CustomBrandedLanding } from "@/components/simulacion/CustomBrandedLanding";
import { EducationalFeedbackView } from "@/components/simulacion/EducationalFeedbackView";
import { InvalidSimulationView } from "@/components/simulacion/InvalidSimulationView";

function SimulationVerifierContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || searchParams.get("token") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [context, setContext] = useState<SimulationContext | null>(null);

  // Estados post-captura (Zero-Credential)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompromised, setIsCompromised] = useState(false);
  const [feedback, setFeedback] = useState<TrackSubmitResponse | null>(null);

  useEffect(() => {
    if (!token || token.trim() === "") {
      setIsLoading(false);
      setErrorMsg("El parámetro de verificación no fue proporcionado en el enlace.");
      return;
    }

    let isMounted = true;
    const fetchSimulationContext = async () => {
      try {
        const data = await apiClient.get<SimulationContext>(`/track/context/${token}`, {
          skipAuth: true,
        });
        if (isMounted) {
          setContext(data);
          setErrorMsg(null);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiError) {
          setErrorMsg(err.message || "El enlace de verificación no es válido o ha expirado.");
        } else {
          setErrorMsg("No fue posible contactar con el servicio de verificación.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSimulationContext();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Manejo de envío de credenciales con Zero-Credential Storage
  const handleCaptureCredentials = async () => {
    if (!token || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Envío ESTRICTO únicamente de { token } - ninguna credencial viaja en el payload
      const response = await apiClient.post<TrackSubmitResponse>(
        "/track/submit",
        { token },
        { skipAuth: true }
      );

      setFeedback(response);
      setIsCompromised(true);
    } catch (err) {
      console.error("Error al registrar interacción de simulación:", err);
      // Aún si ocurre un error de red, mostramos la pantalla educativa al usuario
      setIsCompromised(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
        <p className="text-xs">Cargando servicio de verificación...</p>
      </div>
    );
  }

  if (errorMsg || !context) {
    return <InvalidSimulationView message={errorMsg || undefined} />;
  }

  // Vista de concientización una vez disparada la trampa
  if (isCompromised) {
    return (
      <EducationalFeedbackView
        message={feedback?.message}
        landingTipo={feedback?.landingTipo || context.landingTipo}
        recomendaciones={feedback?.recomendaciones}
        simulationContext={context}
      />
    );
  }

  // Renderizado dinámico según landingTipo y portalConfig
  const landing = context.landingTipo?.toLowerCase();

  switch (landing) {
    case "unjbg":
      return (
        <UnjbgLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "personalizado":
      return (
        <CustomBrandedLanding
          onSubmit={handleCaptureCredentials}
          portalConfig={context.portalConfig}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "microsoft":
      return (
        <MicrosoftLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "google":
      return (
        <GoogleLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "bancario":
      return (
        <BancarioLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "corporativo":
      return (
        <CorporativoLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );

    case "generico":
    default:
      // Si existe portalConfig con tipo personalizado, renderiza CustomBrandedLanding
      if (context.portalConfig?.tipoBase === "personalizado") {
        return (
          <CustomBrandedLanding
            onSubmit={handleCaptureCredentials}
            portalConfig={context.portalConfig}
            nombreEmpresa={context.nombreEmpresa}
            submitting={isSubmitting}
          />
        );
      }
      // Precisión técnica: 'generico' y cualquier fallback renderiza CorporativoLanding
      return (
        <CorporativoLanding
          onSubmit={handleCaptureCredentials}
          nombreEmpresa={context.nombreEmpresa}
          submitting={isSubmitting}
        />
      );
  }
}

export default function SimulationVerifierPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-xs">Cargando verificación...</p>
        </div>
      }
    >
      <SimulationVerifierContent />
    </Suspense>
  );
}
