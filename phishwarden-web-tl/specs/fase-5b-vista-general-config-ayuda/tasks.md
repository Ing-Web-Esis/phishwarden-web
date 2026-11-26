# Tareas de Implementación - Fase 5B: Vista General en Vivo, Configuración y Centro de Ayuda Funcional

## Fase 1: Backend (`phishwarden-backend-nj/`)

- [x] **T5B.1**: Crear `UpdateCompanyDto` en `src/empresas/infrastructure/update-company.dto.ts` con validación de nombre opcional.
- [x] **T5B.2**: Extender `CompanyRepositoryPort` y `PrismaCompanyRepository` con métodos para actualizar la empresa (`updateCompany`) y regenerar su código de acceso (`updateAccessCode`).
- [x] **T5B.3**: Implementar el caso de uso `UpdateCompanyUseCase` en `src/empresas/application/update-company.use-case.ts`.
- [x] **T5B.4**: Implementar el caso de uso `RegenerateAccessCodeUseCase` en `src/empresas/application/regenerate-access-code.use-case.ts` utilizando `CompanyEntity.generateAccessCode()` y garantizando unicidad.
- [x] **T5B.5**: Registrar los endpoints `PATCH /empresas/:empresaId` y `POST /empresas/:empresaId/regenerar-codigo` en `EmpresasController` (protegidos por `JwtAuthGuard` y `CompanyTenantGuard`) y configurar proveedores en `EmpresasModule`.
- [x] **T5B.6**: Actualizar las especificaciones de API en `phishwarden-backend-nj/specs/API_CONTRACTS.md` con los nuevos endpoints de empresas.

## Fase 2: Frontend Base y Servicios (`phishwarden-web-tl/`)

- [x] **T5B.7**: Extender los tipos TypeScript en `src/lib/types.ts` (`UpdateCompanyInput`, `RegenerateAccessCodeResponse`).
- [x] **T5B.8**: Crear el servicio `src/services/company.service.ts` con métodos `getCompany`, `updateCompany` y `regenerateAccessCode`.
- [x] **T5B.9**: Actualizar `src/app/dashboard/layout.tsx` conectando las rutas activas de Configuración (`/dashboard/configuracion`) y Centro de ayuda (`/dashboard/ayuda`), actualizando los breadcrumbs dinámicos y la identidad corporativa/administrador.

## Fase 3: Vista General en Vivo (`src/app/dashboard/page.tsx`)

- [x] **T5B.10**: Conectar el saludo dinámico según la hora local (`Buenos días`, `Buenas tardes`, `Buenas noches`) y el nombre real del administrador autenticado.
- [x] **T5B.11**: Reemplazar valores estáticos de las 4 tarjetas KPI por llamadas reales a `/analytics/resumen`, `/analytics/evolucion` y `/campanas/resumen` (Riesgo global, Usuarios evaluados, Campañas activas e Incidentes/Reportes).
- [x] **T5B.12**: Implementar la gráfica de Evolución del Riesgo con Recharts `AreaChart`, escala 0–100, tooltip formateado y selector de rango funcional (3 vs 6 meses).
- [x] **T5B.13**: Implementar la gráfica donut de Nivel de Vulnerabilidad con Recharts `PieChart`, total de usuarios en el centro y cálculo de porcentajes en la leyenda (Bajo: 0–30, Medio: 31–69, Crítico: 70–100).
- [x] **T5B.14**: Conectar el bloque de campañas recientes a `GET /campanas` mostrando las 3 últimas actividades con enlaces a Campañas y Reportes.

## Fase 4: Configuración Modular (`src/app/dashboard/configuracion/page.tsx`)

- [x] **T5B.15**: Crear la vista `/dashboard/configuracion/page.tsx` con navegación por secciones limpias (`Organización`, `Seguridad y Perfil`, `Integraciones de Plataforma`).
- [x] **T5B.16**: Implementar la sección de Organización con formulario para editar nombre de empresa, badge del código de acceso con botón para copiar y botón para regenerar código con diálogo modal de confirmación.
- [x] **T5B.17**: Implementar la sección de Perfil y Seguridad del Administrador con edición de nombre y cambio de contraseña validado contra `PUT /auth/me`.
- [x] **T5B.18**: Implementar la sección de Estado de Integraciones con monitor de servicios, tasa de adopción de la app móvil y enlace a reportes ejecutivos.

## Fase 5: Centro de Ayuda Funcional (`src/app/dashboard/ayuda/page.tsx`)

- [x] **T5B.19**: Crear la vista `/dashboard/ayuda/page.tsx` con buscador en tiempo real y selector de categorías (`Todas`, `Campañas`, `Portales Simulados`, `App Móvil y FCM`, `Riesgo y Microlecciones`).
- [x] **T5B.20**: Implementar el acordeón interactivo de guías operativas de PhishWarden (lanzamiento de campañas, variables de plantillas, score de riesgo y microlecciones reactivas) sin emojis, usando `lucide-react`.
- [x] **T5B.21**: Implementar el generador interactivo de plantilla de incorporación móvil que inyecte dinámicamente el nombre real y el `codigo_acceso` actual de la empresa, con botones de copiar al portapapeles y descargar como archivo de texto.
- [x] **T5B.22**: Implementar el comprobador en vivo de estado del sistema y latencia en milisegundos contra `GET /` de la API de PhishWarden con botón de verificación manual.

## Fase 6: Compilación y Verificación de Integridad

- [x] **T5B.23**: Ejecutar compilación del backend (`npm run build` en `phishwarden-backend-nj/`) y verificar 0 errores.
- [x] **T5B.24**: Ejecutar compilación del frontend (`npm run build` en `phishwarden-web-tl/`) y verificar 0 errores.
