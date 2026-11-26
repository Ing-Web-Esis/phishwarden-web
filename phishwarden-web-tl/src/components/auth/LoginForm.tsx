"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { AuthLoginResponse } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await apiClient.post<AuthLoginResponse>(
        "/auth/login",
        { email, password },
        { skipAuth: true }
      );

      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof ApiError) {
        setError(err.message || "Credenciales inválidas o error en el servidor");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#283F50]">
            Correo corporativo
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input 
              id="email" 
              type="email" 
              required 
              placeholder="admin@dominio.pe" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-lg border-slate-200 focus-visible:ring-[#E5A93C]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-[#283F50]">
              Contraseña
            </Label>
            <Link href="#" className="text-xs font-medium text-[#E5A93C] hover:text-[#c79130] transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-lg border-slate-200 focus-visible:ring-[#E5A93C]"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" className="data-[state=checked]:bg-[#E5A93C] data-[state=checked]:border-[#E5A93C]" />
        <label htmlFor="remember" className="text-sm font-medium leading-none text-slate-600">
          Recordar este dispositivo
        </label>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-500 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-11 bg-[#E5A93C] hover:bg-[#c79130] text-[#283F50] font-bold rounded-lg text-sm transition-colors disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            Ingresar a PhishWarden
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}