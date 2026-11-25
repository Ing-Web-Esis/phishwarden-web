# Plan de Implementación - Fase 5C: Landing Page Pública y Registro con Selección de Planes

## 1. Resumen Ejecutivo y Metas

El propósito de esta fase es implementar la página de inicio pública (`/`) de **PhishWarden** con máxima fidelidad visual respecto al diseño aprobado en las capturas adjuntas, y construir el flujo completo de incorporación y registro institucional (`/registro`, con alias en `/register`), integrando la selección de planes comerciales (**Essential**, **Professional**, **Enterprise**) y el auto-login con bienvenida inmediata al panel administrativo.

Asimismo, se extiende el backend de forma mínima, limpia e idempotente para persistir el plan seleccionado en la tabla `empresas` y exponerlo en los endpoints correspondientes sin comandos interactivos.

---

## 2. Ajustes en Backend (`phishwarden-backend-nj/`)

### 2.1 Migración SQL Idempotente y Esquema Prisma
- **Script SQL:** `supabase/migrations/20261124_fase5c_add_plan_to_empresas.sql`
  ```sql
  -- Agregar columna plan a la tabla empresas si no existe
  ALTER TABLE empresas 
  ADD COLUMN IF NOT EXISTS plan VARCHAR(30) DEFAULT 'professional';

  -- Asegurar que los registros existentes cuenten con un plan por defecto
  UPDATE empresas 
  SET plan = 'professional' 
  WHERE plan IS NULL;
  ```
- **Ejecución no interactiva:**
  `npx prisma db execute --file supabase/migrations/20261124_fase5c_add_plan_to_empresas.sql --schema prisma/schema.prisma`
  y actualización de `phishwarden-backend/phishwarden.sql`.
- **Actualización de `prisma/schema.prisma`:**
  ```prisma
  model empresas {
    id                 Int                  @id @default(autoincrement())
    nombre             String               @db.VarChar(150)
    codigo_acceso      String               @unique @db.VarChar(20)
    plan               String?              @default("professional") @db.VarChar(30)
    fecha_creacion     DateTime?            @default(now()) @db.Timestamptz(6)
    administradores    administradores[]
    departamentos      departamentos[]
    usuarios           usuarios[]
    plantillas         plantillas[]
    portales_simulados portales_simulados[]
  }
  ```
- **Generación de cliente Prisma:**
  `npx prisma generate --schema prisma/schema.prisma`

### 2.2 DTOs, Entidad y Repositorio
1. **`RegisterCompanyDto` (`src/empresas/infrastructure/register-company.dto.ts`):**
   - Incorporar campo opcional `plan?: string` validado con `@IsOptional()`, `@IsString()`, `@IsIn(['essential', 'professional', 'enterprise'])`.
2. **`CompanyEntity` (`src/empresas/domain/company.entity.ts`):**
   - Añadir parámetro `public readonly plan?: string` al constructor.
3. **Puertos y Repositorio Prisma:**
   - En `company.repository.port.ts`, añadir `plan?: string` a `CreateCompanyAndAdminInput` y `UpdateCompanyInput`.
   - En `prisma-company.repository.ts`, guardar `plan: data.plan || 'professional'` en `createCompanyWithAdmin` y retornar `plan` en `findById` y `createCompanyWithAdmin`.
4. **Casos de Uso y Controlador:**
   - En `RegisterCompanyUseCase`, recibir `plan`, normalizar a minúsculas (por defecto `'professional'`) y retornarlo en el payload `{ empresa: { id, nombre, codigoAcceso, plan }, ... }`.
   - En `GetCompanyByIdUseCase`, retornar `{ id, nombre, codigoAcceso, plan, fechaCreacion }`.
5. **Contratos API:**
   - Actualizar `phishwarden-backend-nj/specs/API_CONTRACTS.md` reflejando el campo `plan` en `POST /empresas/register` y `GET /empresas/:empresaId`.

---

## 3. Arquitectura Frontend (`phishwarden-web-tl/`)

### 3.1 Landing Page Pública (`src/app/page.tsx`)
Fiel al diseño visual de las capturas (paleta azul `#283F50`, dorado `#E5A93C`, fondo blanco/crema):

1. **Barra de Navegación Superior (Navbar):**
   - **Logotipo:** Escudo dorado con icono de protección + texto `PhishWarden` en `#283F50`.
   - **Enlaces de anclaje suave:** `Solución` (`#solucion`), `Planes` (`#planes`), `Recursos` (`#recursos`).
   - **Acciones:**
     - Pastilla decorativa de tema (Sol activo / Luna).
     - Enlace `Iniciar sesión` -> `/login`.
     - Botón principal dorado `Solicitar acceso ->` -> `/registro?plan=professional`.
2. **Sección Hero (`#solucion`):**
   - Pastilla superior: punto ámbar + `SEGURIDAD HUMANA, AUTOMATIZADA`.
   - Titular: *"Convierte cada simulación en una **decisión más segura**."* (énfasis en tipografía dorada `#E5A93C`).
   - Párrafo de valor: *"Automatiza campañas de phishing y smishing, detecta riesgos humanos en tiempo real y fortalece la cultura de ciberseguridad de tu organización."*
   - Botón primario: `Comenzar ahora ->` -> `/registro?plan=professional`.
   - Enlace secundario: `Ver planes >` -> `#planes`.
   - Prueba social: Círculos superpuestos de avatares `MC`, `JP`, `AR` + texto `+12,000 colaboradores entrenados de forma segura`.
   - **Vista Previa Estilizada del Dashboard:**
     - Ventana estilo navegador con marco sutil y botones de control.
     - Mini-sidebar azul marino con icono de escudo y pastilla dorada.
     - Cabecera: `Resumen de seguridad - Vulnerabilidad humana` con filtro `Últimos 30 días`.
     - 3 Tarjetas KPI:
       - Riesgo Global: `14.8%` (flecha verde descenso `↓ 3.2%`).
       - Usuarios: `2,480` (`+180`).
       - Campañas: `24` (`Activas`).
     - Gráfica de área dorada fluida de `Evolución del riesgo`.
     - **Badges flotantes:**
       - Inferior izquierdo: Escudo + `Índice de protección` `85.2% seguro`.
       - Superior derecho: Pulso de actividad + `Detección en vivo` `3 eventos nuevos`.
3. **Franja de Métricas de Confianza:**
   - 4 columnas con separadores limpios:
     - `67%` menos clics riesgosos.
     - `24/7` monitoreo en tiempo real.
     - `4.9/5` satisfacción de clientes.
     - `ISO` prácticas alineadas a 27001.
4. **Sección de Planes Flexibles (`#planes`):**
   - Etiqueta dorada: `PLANES FLEXIBLES`.
   - Título principal: *"Protección que crece contigo"*.
   - Subtítulo: *"Elige el nivel de cobertura ideal para tu organización. Todos los planes incluyen acceso seguro."*
   - **3 Tarjetas de Precios:**
     - **Essential:** `S/ 390 /mes` | *"Para equipos que inician su cultura de seguridad."* | Hasta 250 usuarios, 2 campañas mensuales, Reportes esenciales. Botón `Elegir plan ->` (`/registro?plan=essential`).
     - **Professional (Destacada):** `S/ 790 /mes` | Borde dorado destacado + badge superior `MÁS ELEGIDO` | *"Automatización avanzada para organizaciones en crecimiento."* | Hasta 1,000 usuarios, Campañas ilimitadas, Analítica avanzada, Soporte prioritario. Botón dorado `Elegir plan ->` (`/registro?plan=professional`).
     - **Enterprise:** `A medida` | *"Control, escalabilidad e integraciones corporativas."* | Usuarios ilimitados, SSO y API, Acompañamiento dedicado. Botón `Elegir plan ->` (`/registro?plan=enterprise`).
5. **Sección Flujo y Recursos (`#recursos`):**
   - Explicación concisa en 3 pasos:
     1. *Configura y lanza simulaciones:* correos, SMS y códigos QR con portales simulados defensivos.
     2. *Monitorea en tiempo real:* detección inmediata de interacciones y reportes de empleados.
     3. *Capacita y reduce el riesgo:* asignación reactiva de microlecciones móviles y gamificación.
6. **Footer Institucional:**
   - Logotipo PhishWarden, lema *"Simulaciones responsables. Decisiones más seguras."*, y copyright © 2026 PhishWarden.

---

### 3.2 Flujo Completo de Registro (`src/app/registro/page.tsx` y `/register`)
1. **Selector Visual e Interactivo de Plan:**
   - Conexión reactiva con la query string `?plan=` (`essential`, `professional`, `enterprise`).
   - Selector en 3 pastillas/tarjetas interactivas con cambio instantáneo de selección. Si no hay parámetro en la URL, selecciona por defecto **Professional**.
   - Tarjeta resumen con el costo y capacidades del plan seleccionado.
2. **Formulario de Registro Validado:**
   - **Nombre de la organización (`companyName`):** texto, mín. 2 caracteres.
   - **Nombre del administrador (`adminName`):** texto, mín. 2 caracteres.
   - **Correo electrónico corporativo (`adminEmail`):** validación de sintaxis de email.
   - **Contraseña (`password`):** mínimo 8 caracteres con botón para mostrar/ocultar clave.
   - **Confirmar contraseña (`confirmPassword`):** verificación de coincidencia.
   - **Términos éticos:** Checkbox obligatorio confirmando uso defensivo y autorizado.
3. **Integración con Servicios y Auto-Login:**
   - Llamada a `companyService.registerCompany(...)`.
   - Manejo de respuestas:
     - `409 Conflict`: Alerta clara *"El correo corporativo ya está registrado. Inicia sesión o utiliza otra dirección."*
     - `400 Bad Request`: Alerta con los errores de validación retornados por el backend.
   - Tras creación exitosa, ejecución automática de `POST /auth/login` con las credenciales registradas.
   - Almacenamiento seguro en `localStorage` de `token`, `empresaId`, `codigoAcceso`, `adminNombre` y `nombreEmpresa`.
4. **Vista de Bienvenida y Despliegue de Código de Acceso:**
   - Pantalla de éxito post-registro:
     - Título: *"¡Organización creada exitosamente!"*
     - Despliegue en fuente monoespaciada grande del **Código de Acceso Institucional (`codigoAcceso`)** generado por el backend.
     - Botón de un solo clic para **Copiar código** con feedback visual.
     - Instrucciones breves para que el administrador comparta el código con su equipo móvil.
     - Botón principal: **"Ir al Panel de Control ->"** que redirige a `/dashboard`.
5. **Navegación Cruzada y Alias:**
   - En `/login`: añadir enlace visible *"¿Aún no tienes una cuenta? Crea tu organización"* -> `/registro`.
   - En `/registro`: añadir enlace *"¿Ya tienes una cuenta? Inicia sesión"* -> `/login`.
   - En `src/app/register/page.tsx`: alias que redirige de forma limpia a `/registro`.

---

## 4. Criterios de Calidad y Cero Emojis

1. **Cero Emojis:** Uso estricto de iconografía vectorial de `lucide-react` (`Shield`, `ArrowRight`, `Check`, `Activity`, `Building2`, `Lock`, `Eye`, `EyeOff`, `Copy`, `CheckCircle2`, `Sun`, `Moon`, etc.).
2. **Prevención de Errores de Hidratación:**
   - No utilizar `localStorage` ni `typeof window` en inicializaciones síncronas de `useState`.
   - Envolver el lector de `useSearchParams()` en `<Suspense>` para cumplir las directrices de Next.js App Router.
3. **Validación de Compilación:**
   - `npm run build` sin errores en `phishwarden-backend-nj/`.
   - `npm run build` sin errores en `phishwarden-web-tl/`.
