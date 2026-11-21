# Tareas Atómicas: Fase 0 Frontend - Compatibilidad con Blindaje JWT y Multi-tenant

## Grupo 1: Fundaciones de Tipado y Cliente HTTP Compartido

- [x] **T0.1-F** Crear `src/lib/types.ts` definiendo interfaces estrictas para `PaginatedResponse<T>`, sesión (`AuthLoginResponse`), perfil administrativo (`AdminProfile`, `UpdateAdminProfileInput`), departamentos (`DepartmentItem`), empleados (`EmployeeSummaryItem`, `EmployeeDetail`, `CreateEmployeeInput`, `UpdateEmployeeInput`) y plantillas (`PlantillaItem`, `CreatePlantillaInput`, `UpdatePlantillaInput`, `AttackType`, `DifficultyLevel`).
- [x] **T0.2-F** Crear `src/lib/api-client.ts` implementando cliente centralizado con `NEXT_PUBLIC_API_URL` (fallback `http://localhost:3000`), inyección automática de `Authorization: Bearer <token>`, soporte dual JSON y `FormData` (sin forzar `Content-Type`), parseo robusto de errores `{ message: string | string[] }`, cierre automático de sesión y redirección a `/login` ante HTTP 401, y manejo no destructivo de HTTP 403.

---

## Grupo 2: Sesión, Autenticación y Tenant Guard

- [x] **T0.3-F** Refactorizar `src/components/auth/LoginForm.tsx` para consumir `apiClient.post`, normalizar `token` / `access_token` sin enviar `codigoEmpresa`, almacenar `localStorage.token`, y eliminar el tipado `any` en el bloque de captura de errores.
- [x] **T0.4-F** Refactorizar `src/app/dashboard/layout.tsx` para implementar el Tenant Guard cliente obligatorio contra `GET /auth/me` con `apiClient`: almacenar `localStorage.empresaId` únicamente tras respuesta 200, limpiar sesión ante 401, tipar el estado con `AdminProfile` y bloquear la renderización de navegación protegida mientras se verifica la identidad.

---

## Grupo 3: Blindaje de Pantallas del Dashboard

- [x] **T0.5-F** Actualizar `src/app/dashboard/page.tsx` para consumir `GET /auth/me` a través de `apiClient`, manejar limpiamente errores de sesión y eliminar advertencias de ESLint por variables no utilizadas (`error`).
- [x] **T0.6-F** Refactorizar `src/app/dashboard/perfil/page.tsx` migrando a `apiClient`, condicionando el envío de `contraseñaActual` y `nuevaContraseña` a que ambos campos estén completos, preservando los datos ingresados ante error 400, limpiando contraseñas en memoria tras éxito y reemplazando `payload: any` por `UpdateAdminProfileInput`.
- [x] **T0.7-F** Refactorizar `src/app/dashboard/usuarios/page.tsx`:
  - Cambiar consulta a `GET /departamentos` (sin parámetro `?empresaId=...`).
  - Asegurar envío automático de Bearer token en `/empresas/:empresaId/empleados/resumen` usando `apiClient`.
  - Migrar importación masiva de CSV con `FormData` usando `apiClient`.
  - Implementar validador regex de UUIDv4 antes de invocar operaciones de consulta (`GET /empleados/:id`) o mutación (`PUT/DELETE`).
  - Reemplazar todos los usos de `any` en estados y callbacks por `EmployeeSummaryItem`, `DepartmentItem` y `EmployeeDetail`.
- [x] **T0.8-F** Refactorizar `src/app/dashboard/plantillas/page.tsx`:
  - Migrar todas las operaciones (listar, crear, actualizar, eliminar) a `apiClient`.
  - Asegurar uso estricto de enums `attackType` (`PHISHING | SMISHING`) y `difficulty` (`BAJO | MEDIO | ALTO`).
  - Manejar respuestas 403 mostrando toast claro informativo cuando se intente mutar una plantilla global protegida.
  - Reemplazar todos los usos de `any` por `PlantillaItem`.

---

## Grupo 4: Verificación y Calidad

- [x] **T0.9-F** Ejecutar `npm run lint` en `phishwarden-web-tl/` y resolver todos los errores y advertencias de ESLint (garantizando 0 errores y 0 advertencias).
- [x] **T0.10-F** Ejecutar `npm run build` en `phishwarden-web-tl/` y confirmar compilación exitosa de Next.js sin errores de TypeScript ni bundling (0 errores).
- [x] **T0.11-F** Actualizar `specs/API_CONTRACTS.md` del frontend documentando la arquitectura del cliente HTTP centralizado, el formato exacto de las peticiones protegidas con Bearer token, la normalización de la sesión y las respuestas 401/403.
