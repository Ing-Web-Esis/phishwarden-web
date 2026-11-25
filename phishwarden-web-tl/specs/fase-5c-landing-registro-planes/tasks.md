# Tareas de Implementación - Fase 5C: Landing Page Pública y Registro con Selección de Planes

Estado general: Implementación completada y verificada al 100%. Ambas aplicaciones (backend y frontend) compilan con 0 errores.

---

## Fase 1: Ajustes en Backend (`phishwarden-backend-nj/`)

- [x] **T5C.1: Migración de Base de Datos y Esquema Prisma para `plan`**
  - Crear script SQL idempotente en `supabase/migrations/20261124_fase5c_add_plan_to_empresas.sql` (`ALTER TABLE empresas ADD COLUMN IF NOT EXISTS plan VARCHAR(30) DEFAULT 'professional'; UPDATE empresas SET plan = 'professional' WHERE plan IS NULL;`).
  - Ejecutar la migración con `npx prisma db execute --file supabase/migrations/20261124_fase5c_add_plan_to_empresas.sql --schema prisma/schema.prisma`.
  - Actualizar `prisma/schema.prisma` agregando `plan String? @default("professional") @db.VarChar(30)` al modelo `empresas`.
  - Actualizar `phishwarden-backend/phishwarden.sql` con la nueva columna para mantener sincronizada la copia de seguridad.
  - Ejecutar `npx prisma generate --schema prisma/schema.prisma` para regenerar el cliente de Prisma.

- [x] **T5C.2: DTO de Registro en Backend (`RegisterCompanyDto`)**
  - Actualizar `src/empresas/infrastructure/register-company.dto.ts`.
  - Agregar campo opcional `plan?: string` validado con `@IsOptional()`, `@IsString()`, `@IsIn(['essential', 'professional', 'enterprise'])`.
  - Documentar el campo con `@ApiPropertyOptional({ enum: ['essential', 'professional', 'enterprise'], default: 'professional' })`.

- [x] **T5C.3: Dominio e Infraestructura de Repositorio para `plan`**
  - Actualizar `CompanyEntity` en `src/empresas/domain/company.entity.ts` incorporando `public readonly plan?: string` en su constructor.
  - Actualizar interfaces en `src/empresas/domain/company.repository.port.ts` para aceptar `plan?: string` en `CreateCompanyAndAdminInput` y `UpdateCompanyInput`.
  - Actualizar `PrismaCompanyRepository` en `src/empresas/infrastructure/prisma-company.repository.ts` para guardar `plan: data.plan || 'professional'` en `createCompanyWithAdmin`, mapearlo a `CompanyEntity` y retornarlo en `findById`.

- [x] **T5C.4: Casos de Uso y Respuestas de Empresa**
  - Actualizar `RegisterCompanyUseCase` en `src/empresas/application/register-company.use-case.ts` para recibir `plan`, normalizarlo a minúsculas y retornar `plan` dentro del objeto `empresa` (`{ id, nombre, codigoAcceso, plan }`).
  - Actualizar `GetCompanyByIdUseCase` en `src/empresas/application/get-company-by-id.use-case.ts` para incluir `plan` en el payload retornado.

- [x] **T5C.5: Actualización de Contratos API**
  - Actualizar `phishwarden-backend-nj/specs/API_CONTRACTS.md` reflejando el campo `plan` en el cuerpo de `POST /empresas/register` y en las respuestas de `POST /empresas/register` y `GET /empresas/:empresaId`.

---

## Fase 2: Implementación en Frontend (`phishwarden-web-tl/`)

- [x] **T5C.6: Definición de Tipos en Frontend (`src/lib/types.ts`)**
  - Agregar tipo `CompanyPlan = 'essential' | 'professional' | 'enterprise'`.
  - Extender `RegisterCompanyInput` con `plan?: CompanyPlan`.
  - Extender `RegisterCompanyResponse` para incluir `plan: CompanyPlan` dentro del objeto `empresa`.

- [x] **T5C.7: Servicio de Registro en Frontend (`src/services/company.service.ts`)**
  - Agregar método `registerCompany(data: RegisterCompanyInput): Promise<RegisterCompanyResponse>` utilizando `apiClient.post('/empresas/register', data)`.

- [x] **T5C.8: Landing Page Pública (`src/app/page.tsx`)**
  - Implementar la página principal pública de PhishWarden con diseño fiel 1:1 a las capturas adjuntas:
    - **Navbar:** Logo PhishWarden con escudo dorado, enlaces ancla `#solucion`, `#planes`, `#recursos`, enlace "Iniciar sesión" a `/login` y botón "Solicitar acceso ->" a `/registro?plan=professional` (interruptor decorativo omitido para evitar controles sin acción).
    - **Hero Section (`#solucion`):** Badge ámbar superior "SEGURIDAD HUMANA, AUTOMATIZADA", título con énfasis dorado "Convierte cada simulación en una decisión más segura.", párrafo de valor, botón "Comenzar ahora ->" y enlace "Ver planes >", prueba social con avatares "+12,000 colaboradores entrenados de forma segura".
    - **Vista previa interactiva del Dashboard:** Ventana estilizada con mini-sidebar, header "Resumen de seguridad - Vulnerabilidad humana" con filtro 30 días, 3 KPI cards (Riesgo Global 14.8%, Usuarios 2,480, Campañas 24), gráfica de área dorada fluida de evolución del riesgo, y badges flotantes ("85.2% seguro" y "3 eventos nuevos").
    - **Franja de Métricas:** 4 columnas con separadores limpios (67% clics riesgosos, 24/7 monitoreo en tiempo real, 4.9/5 satisfacción de clientes, ISO 27001).
    - **Sección de Planes Flexibles (`#planes`):** Titular "Protección que crece contigo", 3 tarjetas de precios:
      - Essential: S/ 390 /mes (250 usuarios, 2 campañas, reportes esenciales) -> `/registro?plan=essential`.
      - Professional: S/ 790 /mes (borde dorado, badge superior "MÁS ELEGIDO", 1,000 usuarios, campañas ilimitadas, analítica avanzada, soporte prioritario) -> `/registro?plan=professional`.
      - Enterprise: A medida (usuarios ilimitados, SSO y API, acompañamiento dedicado) -> `/registro?plan=enterprise`.
    - **Sección de Recursos y Flujo (`#recursos`):** 3 pasos interactivos de valor (Configuración, Monitoreo en vivo, Capacitación con gamificación).
    - **Footer Institucional:** Logotipo, lema "Simulaciones responsables. Decisiones más seguras." y copyright © 2026 PhishWarden.
    - Cero emojis, íconos vectoriales limpios de `lucide-react`.

- [x] **T5C.9: Flujo de Registro Institucional (`src/app/registro/page.tsx`)**
  - Implementar vista de registro con envoltorio `<Suspense>` para lectura segura de `useSearchParams`:
    - **Selector visual interactivo de planes:** 3 opciones (Essential, Professional, Enterprise) sincronizado bidireccionalmente con `?plan=`, mostrando costo y alcance del plan activo.
    - **Formulario validado:** Nombre de la organización, Nombre del administrador, Correo corporativo, Contraseña (mínimo 8 caracteres) con toggle ver/ocultar contraseña, Confirmación de contraseña, y Checkbox obligatorio de aceptación de uso defensivo/ético.
    - **Gestión de Errores:** Manejo de 409 Conflict ("El correo corporativo ya está registrado...") y 400 Bad Request.
    - **Auto-login integrado:** Tras creación exitosa, autenticar automáticamente vía `POST /auth/login` y persistir credenciales de sesión en `localStorage`.
    - **Modal/Pantalla de Bienvenida:** Mostrar en tipografía monoespaciada grande el `codigoAcceso` generado por el backend, botón de "Copiar código" con feedback visual de copiado, instrucciones para el equipo móvil, y botón destacado "Ir al Panel de Control ->" con redirección a `/dashboard`.

- [x] **T5C.10: Alias `/register` (`src/app/register/page.tsx`)**
  - Implementar redirección limpia de `/register` hacia `/registro` utilizando `useSearchParams()` dentro de `<Suspense>`, preservando cualquier query parameter.

- [x] **T5C.11: Enlace a Registro desde Login (`src/app/login/page.tsx`)**
  - Agregar enlace visible "¿Aún no tienes una cuenta? Crea tu organización" con redirección a `/registro`.

---

## Fase 3: Verificación y Compilación

- [x] **T5C.12: Compilación y Verificación del Backend**
  - Ejecutar `npm run build` en `phishwarden-backend-nj/` verificando 0 errores de TypeScript y empaquetado NestJS.

- [x] **T5C.13: Compilación y Verificación del Frontend**
  - Ejecutar `npm run build` en `phishwarden-web-tl/` verificando 0 errores de TypeScript, Next.js App Router, empaquetado de producción y deshidratación.
