import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Check,
  Activity,
  Send,
  BarChart3,
  Award,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#283F50] selection:bg-[#E5A93C]/20 font-sans">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#283F50]">
              PhishWarden
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#solucion" className="hover:text-[#283F50] transition-colors">
              Solución
            </a>
            <a href="#planes" className="hover:text-[#283F50] transition-colors">
              Planes
            </a>
            <a href="#recursos" className="hover:text-[#283F50] transition-colors">
              Recursos
            </a>
          </nav>

          {/* Action buttons (Theme toggle omitted as per instructions) */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#283F50] hover:text-[#E5A93C] transition-colors px-3 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro?plan=professional"
              className="text-sm font-medium bg-[#E5A93C] hover:bg-[#d6992d] text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Solicitar acceso</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="solucion" className="pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF6E9] border border-[#E5A93C]/30 text-[#E5A93C] text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
                Seguridad humana, automatizada
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#283F50] tracking-tight leading-[1.12]">
                Convierte cada simulación en una{" "}
                <span className="text-[#E5A93C]">decisión más segura.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Automatiza campañas de phishing y smishing, detecta riesgos
                humanos en tiempo real y fortalece la cultura de ciberseguridad
                de tu organización.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/registro?plan=professional"
                  className="bg-[#E5A93C] hover:bg-[#d6992d] text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-base"
                >
                  <span>Comenzar ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#planes"
                  className="text-[#283F50] hover:text-[#E5A93C] font-semibold px-5 py-3.5 flex items-center gap-1.5 text-base transition-colors"
                >
                  <span>Ver planes</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-[#283F50] text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                    MC
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                    JP
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#E5A93C] text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                    AR
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-[#283F50] block">
                    +12,000 colaboradores
                  </span>
                  <span className="text-slate-500">
                    entrenados de forma segura
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Dashboard Mockup */}
            <div className="lg:col-span-6 relative flex justify-center">
              {/* Floating Badge: Top Right */}
              <div className="absolute -top-3 -right-2 sm:right-4 z-20 bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#283F50] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Detección en vivo
                  </span>
                  <span className="text-xs font-bold text-[#283F50]">
                    3 eventos nuevos
                  </span>
                </div>
              </div>

              {/* Main Window Frame */}
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 sm:p-4 relative">
                {/* Window top dots */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    phishwarden.app
                  </span>
                </div>

                {/* Dashboard layout with mini-sidebar */}
                <div className="flex gap-3">
                  {/* Mini Sidebar */}
                  <div className="w-12 bg-[#283F50] rounded-xl py-3 flex flex-col items-center gap-3 shrink-0">
                    <div className="w-6 h-6 rounded bg-[#E5A93C] flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-[#283F50]" />
                    </div>
                    <div className="w-5 h-5 rounded bg-white/20" />
                    <div className="w-5 h-5 rounded bg-white/10" />
                    <div className="w-5 h-5 rounded bg-white/10" />
                    <div className="w-5 h-5 rounded bg-white/10" />
                  </div>

                  {/* Mockup Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Resumen de seguridad
                        </span>
                        <h4 className="text-xs font-bold text-[#283F50]">
                          Vulnerabilidad humana
                        </h4>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Últimos 30 días
                      </span>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block uppercase">
                          Riesgo Global
                        </span>
                        <span className="text-sm font-bold text-[#283F50] block">
                          14.8%
                        </span>
                        <span className="text-[9px] text-emerald-600 font-medium">
                          ↓ 3.2%
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block uppercase">
                          Usuarios
                        </span>
                        <span className="text-sm font-bold text-[#283F50] block">
                          2,480
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          +180
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block uppercase">
                          Campañas
                        </span>
                        <span className="text-sm font-bold text-[#283F50] block">
                          24
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          Activas
                        </span>
                      </div>
                    </div>

                    {/* Evolution Chart Area */}
                    <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-slate-600">
                          Evolución del riesgo
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Cobertura
                        </span>
                      </div>
                      {/* SVG Wave */}
                      <div className="h-20 w-full relative">
                        <svg
                          viewBox="0 0 300 80"
                          className="w-full h-full overflow-visible"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="goldenGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#E5A93C"
                                stopOpacity="0.45"
                              />
                              <stop
                                offset="100%"
                                stopColor="#E5A93C"
                                stopOpacity="0.02"
                              />
                            </linearGradient>
                          </defs>
                          {/* Area */}
                          <path
                            d="M0,45 C40,48 70,25 110,40 C150,55 190,30 230,45 C270,55 290,52 300,50 L300,80 L0,80 Z"
                            fill="url(#goldenGradient)"
                          />
                          {/* Line */}
                          <path
                            d="M0,45 C40,48 70,25 110,40 C150,55 190,30 230,45 C270,55 290,52 300,50"
                            fill="none"
                            stroke="#E5A93C"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Bottom Left */}
              <div className="absolute -bottom-4 -left-2 sm:left-4 z-20 bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF6E9] text-[#E5A93C] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Índice de protección
                  </span>
                  <span className="text-xs font-bold text-[#283F50]">
                    85.2% seguro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics Strip */}
      <section className="border-y border-slate-200/70 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#283F50] block">
                67%
              </span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1 block">
                menos clics riesgosos
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#283F50] block">
                24/7
              </span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1 block">
                monitoreo en tiempo real
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#283F50] block">
                4.9/5
              </span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1 block">
                satisfacción de clientes
              </span>
            </div>
            <div className="pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#283F50] block">
                ISO
              </span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1 block">
                prácticas alineadas a 27001
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Flexible Pricing Section */}
      <section id="planes" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[#E5A93C] text-xs font-semibold tracking-widest uppercase block">
              Planes Flexibles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#283F50]">
              Protección que crece contigo
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Elige el nivel de cobertura ideal para tu organización. Todos los
              planes incluyen acceso seguro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Card 1: Essential */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#283F50]">Essential</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Para equipos que inician su cultura de seguridad.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-b border-slate-100 pb-6">
                  <span className="text-3xl font-extrabold text-[#283F50]">
                    S/ 390
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/mes</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Hasta 250 usuarios</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>2 campañas mensuales</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Reportes esenciales</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/registro?plan=essential"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span>Elegir plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Professional (Destacada) */}
            <div className="bg-white rounded-2xl border-2 border-[#E5A93C] p-8 flex flex-col justify-between shadow-xl relative scale-105">
              {/* Badge Más Elegido */}
              <div className="absolute -top-3.5 right-6">
                <span className="bg-[#FEF6E9] border border-[#E5A93C]/40 text-[#E5A93C] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Más Elegido
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#283F50]">
                    Professional
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Automatización avanzada para organizaciones en crecimiento.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-b border-slate-100 pb-6">
                  <span className="text-3xl font-extrabold text-[#283F50]">
                    S/ 790
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/mes</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Hasta 1,000 usuarios</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Campañas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Analítica avanzada</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Soporte prioritario</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/registro?plan=professional"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E5A93C] hover:bg-[#d6992d] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Elegir plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Enterprise */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#283F50]">
                    Enterprise
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Control, escalabilidad e integraciones corporativas.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-b border-slate-100 pb-6">
                  <span className="text-3xl font-extrabold text-[#283F50]">
                    A medida
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Usuarios ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>SSO y API</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span>Acompañamiento dedicado</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/registro?plan=enterprise"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span>Elegir plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Resources and Workflow Section */}
      <section id="recursos" className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[#E5A93C] text-xs font-semibold tracking-widest uppercase block">
              Metodología Defensiva
            </span>
            <h2 className="text-3xl font-extrabold text-[#283F50]">
              Cómo protege PhishWarden a tu equipo
            </h2>
            <p className="text-slate-600 text-sm">
              Un ciclo de seguridad continuo diseñado para transformar la
              vulnerabilidad en alerta activa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF6E9] text-[#E5A93C] flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#283F50]">
                1. Simula ataques creíbles
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Despacha simulaciones automatizadas de phishing por correo y
                smishing por SMS utilizando plantillas adaptadas al contexto
                corporativo real.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#283F50] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#283F50]">
                2. Mide el riesgo en tiempo real
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitorea aperturas, clics y envíos de credenciales en portales
                señuelo defensivos con cálculo instantáneo del Risk Score por
                departamento.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF6E9] text-[#E5A93C] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#283F50]">
                3. Capacita con gamificación
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asigna microlecciones interactivas a los colaboradores vulnerables
                a través de la app móvil institucional, reforzando con medallas y
                logros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E5A93C] flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#283F50]">PhishWarden</span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Simulaciones responsables. Decisiones más seguras.
          </p>

          <p className="text-xs text-slate-400">
            © 2026 PhishWarden. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
