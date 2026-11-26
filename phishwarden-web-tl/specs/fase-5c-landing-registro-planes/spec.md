# Fase 5C (Web + Backend): Landing Page Pública y Registro de Cuenta con Selección de Plan

## Objetivo

Implementar la página de aterrizaje pública (`/`) de **PhishWarden** siguiendo la identidad visual definida (paleta blanco/crema, azul pizarra `#283F50` y dorado `#E5A93C`) y el flujo completo de registro de nueva organización y administrador (`/registro`, con alias en `/register`), permitiendo elegir el plan (`Essential`, `Professional`, `Enterprise`), completar los datos obligatorios y acceder directamente al panel administrativo con sesión iniciada.

## Alcance

### Incluido

1. **Landing Page Pública (`phishwarden-web-tl/src/app/page.tsx`):**
   - **Barra de navegación superior:**
     - Logotipo **PhishWarden**.
     - Enlaces de navegación por anclas suaves (`#solucion`, `#planes`, `#recursos`).
     - Botones de acción: **Iniciar sesión** (`/login`) y **Solicitar acceso** (`/registro`).
   - **Sección Hero (`#solucion`):**
     - Etiqueta superior: `SEGURIDAD HUMANA, AUTOMATIZADA`.
     - Titular principal: *"Convierte cada simulación en una **decisión más segura**."* con énfasis tipográfico en dorado `#E5A93C`.
     - Subtítulo descriptivo sobre automatización de campañas de phishing y smishing, detección en tiempo real y fortalecimiento de cultura de ciberseguridad.
     - Botones principales: **Comenzar ahora** (`/registro`) y **Ver planes** (`#planes`).
     - Indicador de respaldo social (`+12,000 colaboradores entrenados de forma segura`).
     - Vista previa visual interactiva/estilizada del dashboard ejecutivo (tarjetas KPI de Riesgo Global, Usuarios, Campañas Activas, curva de evolución del riesgo y badges flotantes de detección en vivo).
   - **Franja de Métricas Clave:**
     - `67%` menos clics riesgosos | `24/7` monitoreo en tiempo real | `4.9/5` satisfacción de clientes | `ISO` prácticas alineadas a 27001.
   - **Sección de Planes Flexibles (`#planes`):**
     - Encabezado: `PLANES FLEXIBLES` — *"Protección que crece contigo"*.
     - **3 Tarjetas de Planes:**
       1. **Essential** (`S/ 390 /mes`): *"Para equipos que inician su cultura de seguridad."* — Hasta 250 usuarios, 2 campañas mensuales, Reportes esenciales. Botón **Elegir plan** (`/registro?plan=essential`).
       2. **Professional** (`S/ 790 /mes`, destacada con borde dorado `#E5A93C` y badge `MÁS ELEGIDO`): *"Automatización avanzada para organizaciones en crecimiento."* — Hasta 1,000 usuarios, Campañas ilimitadas, Analítica avanzada, Soporte prioritario. Botón **Elegir plan** (`/registro?plan=professional`).
       3. **Enterprise** (`A medida`): *"Control, escalabilidad e integraciones corporativas."* — Usuarios ilimitados, SSO y API, Acompañamiento dedicado. Botón **Elegir plan** (`/registro?plan=enterprise`).
   - **Sección Recursos / Cómo Funciona (`#recursos`) y Footer:**
     - Resumen en 3 pasos del flujo PhishWarden (Configura y lanza simulaciones -> Detecta y alerta en tiempo real vía app móvil -> Capacita con microlecciones y mide el riesgo).
     - Footer institucional con marca PhishWarden y copyright.

2. **Flujo de Creación de Cuenta con Selección de Plan (`/registro`):**
   - **Paso 1 / Selector Visual de Plan:**
     - Permite elegir o cambiar entre **Essential** (`S/ 390/mes`), **Professional** (`S/ 790/mes`, seleccionado por defecto si no llega `?plan=` en la URL) y **Enterprise** (`A medida`), mostrando los límites y beneficios incluidos del plan activo.
   - **Paso 2 / Formulario de Creación de Organización y Administrador:**
     - Campos obligatorios con validación en tiempo real:
       - **Nombre de la empresa / organización** (`companyName`, mín. 2 caracteres).
       - **Nombre completo del administrador** (`adminName`, mín. 2 caracteres).
       - **Correo electrónico corporativo** (`adminEmail`, formato email válido).
       - **Contraseña** (`password`, mínimo 8 caracteres, con botón para mostrar/ocultar) y **Confirmar contraseña**.
       - Aceptación de términos de uso ético y simulaciones autorizadas.
     - Manejo claro de errores HTTP (`409 Conflict` si el correo ya existe, `400 Bad Request` si hay validación fallida).
   - **Paso 3 / Creación, Auto-Login y Bienvenida con Código de Acceso:**
     - Llama a `POST /empresas/register` enviando `{ companyName, adminName, adminEmail, password, plan }`.
     - Inicia sesión automáticamente llamando a `POST /auth/login` (o usando el token devuelto) para guardar `token`, `empresaId` y datos del usuario en `localStorage`.
     - Muestra una pantalla/modal de confirmación de cuenta creada con el **Código de Acceso Institucional (`codigoAcceso`)** listo para copiar y botón **"Ir al panel de control"** (`/dashboard`).
   - **Conexión bidireccional con `/login`:**
     - En `/login`, añadir enlace visible *"¿Aún no tienes una cuenta? Crea tu organización"* hacia `/registro`.
     - En `/registro`, añadir enlace visible *"¿Ya tienes una cuenta? Inicia sesión"* hacia `/login`.

3. **Soporte de Plan en Backend (`phishwarden-backend-nj/`):**
   - Agregar columna opcional `plan VARCHAR(30) DEFAULT 'professional'` en `empresas` mediante migración SQL idempotente (`supabase/migrations/`) y actualizar `prisma/schema.prisma`.
   - Actualizar `RegisterCompanyDto` para aceptar `@IsOptional() @IsIn(['essential', 'professional', 'enterprise']) plan?: string` (cumpliendo con `forbidNonWhitelisted: true`) y exponer el `plan` activo en `POST /empresas/register` y `GET /empresas/:empresaId`.

## Reglas de Diseño y Arquitectura

1. **Cero Emojis:** Emplear exclusivamente iconos vectoriales de `lucide-react` (`Shield`, `ArrowRight`, `Check`, `Activity`, `Building2`, `Lock`, `Eye`, `EyeOff`, `Copy`, `CheckCircle2`, etc.).
2. **Coherencia Visual:** Mantener la paleta exacta de las capturas (`#283F50` azul oscuro, `#E5A93C` dorado, fondos limpios `bg-white` / `bg-slate-50`).
3. **Sin `npm install` ni comandos interactivos (`prisma migrate dev`).**

## Criterios de Aceptación

- Landing page `/` operativa, responsiva y fiel a la identidad visual de PhishWarden, con redirección directa de cada plan a `/registro?plan=...`.
- Registro `/registro` funcional con selector de plan, validaciones completas, creación real en PostgreSQL, obtención de `codigoAcceso` y acceso inmediato a `/dashboard`.
- Enlace bidireccional operativo entre `/login` y `/registro`.
- `npm run build` finaliza con **0 errores** tanto en `phishwarden-backend-nj/` como en `phishwarden-web-tl/`.