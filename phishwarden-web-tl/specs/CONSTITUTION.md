# Constitución técnica de PhishWarden Web

## 1. Stack y Versiones Obligatorias

- **Framework:** Next.js 16 con App Router y React 19.
- **Lenguaje:** TypeScript estricto. `tsconfig.json` habilita `isolatedModules` y `strict`; está prohibido usar `any` nuevo en código de producción.
- **Estilos:** Tailwind CSS 4, componentes reutilizables bajo `src/components/ui/` y componentes propios bajo `src/components/`.
- **Iconografía:** `lucide-react`.
- **Clientes HTTP:** Fetch API nativo hasta que se adopte formalmente un cliente compartido. Las llamadas deben centralizar URL, headers, payload y manejo de errores.
- **Autenticación:** El token JWT del administrador web se conserva en `localStorage.token` y se envía como `Authorization: Bearer <token>`.
- **Tenant:** El identificador `empresaId` se obtiene preferentemente de `GET /auth/me` y se conserva temporalmente en `localStorage.empresaId`; nunca se acepta como autoridad independiente frente al backend.
- **Configuración:** La URL base debe provenir de una variable de entorno pública como `NEXT_PUBLIC_API_URL`, con `http://localhost:3000` únicamente como fallback local.
- **Calidad:** El código debe cumplir `npm run build` y `npm run lint` sin errores.

## 2. Arquitectura Frontend Obligatoria

- **App Router:** Las páginas se implementan bajo `src/app/` y las rutas protegidas se ubican bajo `src/app/dashboard/`.
- **Separación de responsabilidades:**
  - `src/app/`: composición de páginas y layouts.
  - `src/components/`: componentes visuales y formularios reutilizables.
  - `src/lib/`: utilidades, configuración API, tipos compartidos y helpers de autenticación.
- **Layouts:** `src/app/dashboard/layout.tsx` debe verificar la sesión antes de renderizar navegación protegida.
- **Acceso HTTP:** Las páginas no deben duplicar strings de endpoints ni construir headers manualmente si existe un helper/API client compartido.
- **Tipos:** Toda respuesta HTTP intercambiada con el backend debe tener una interfaz o tipo explícito; no se permite inferir contratos mediante `any`.
- **Componentes cliente:** Solo se usa `"use client"` cuando la página necesita hooks, estado, navegador o eventos interactivos.
- **URLs relativas no administrables:** No se deben codificar rutas absolutas nuevas fuera de la configuración centralizada.

## 3. Integración API y Contratos

- La fuente de verdad de los endpoints es `specs/API_CONTRACTS.md` de este repositorio y el contrato API del backend ubicado en `specs/API_CONTRACTS.md` dentro de `phishwarden-backend-nj`.
- Toda integración debe respetar payloads JSON, parámetros, query params, UUIDv4 e INT según el contrato.
- Los listados paginados deben consumir `{ data, total, page, limit }`.
- Las fechas ISO 8601 se muestran solo después de validar/parsear la respuesta.
- Las respuestas 401 deben cerrar la sesión local y redirigir a `/login`.
- Las respuestas 403 deben mostrar que el recurso no pertenece al tenant o que la sesión carece de permiso; no deben reintentar con otro `empresaId`.
- Los errores deben extraerse de manera segura de `{ message }`, sin asumir que siempre es un string.
- La UI nunca debe mostrar `password_hash`, credenciales ni payloads sensibles.

## 4. Reglas de Seguridad y Sesión Multi-tenant

- El frontend distingue claramente dos tipos de identidad:
  - **Administrador Web:** usa `POST /auth/login` con `email` y `password`, obtiene el JWT y accede a `/dashboard`.
  - **Colaborador Móvil:** no forma parte de las pantallas web administrativas actuales.
- Toda operación administrativa bajo `/empresas/:empresaId/...` debe enviar el token JWT.
- `empresaId` mostrado o escrito por el usuario no es confiable. El valor usado en URLs debe coincidir con el perfil autenticado devuelto por `GET /auth/me`.
- Al recibir 401 o 403 en una operación protegida:
  - limpiar `token`;
  - limpiar `empresaId` cuando el 403 indique pérdida de tenant o sesión inválida;
  - redirigir a `/login` si la autenticación falla;
  - mostrar un error no técnico si el usuario carece de acceso.
- No almacenar contraseñas ni credenciales en estado persistente. Los campos temporales se mantienen solo en memoria y se limpian tras actualizar perfil.
- Los CSVs, formularios simulados y rastreo deben tratarse como datos operativos; el frontend no debe inventar campos de credenciales Zero-Credential.

## 5. Compatibilidad con Fase 0 del Backend

- Fase 0 agrega `JwtAuthGuard` y `CompanyTenantGuard` en rutas administrativas del backend.
- La integración web debe mantenerse funcional sin cambios de UX:
  - login sigue siendo `POST /auth/login`;
  - perfil sigue siendo `GET /auth/me`;
  - perfil se actualiza mediante `PUT /auth/me`;
  - las rutas `/empresas/:empresaId/...` siguen siendo válidas si coinciden con el tenant.
- El frontend no debe enviar `empresaId` como query param a endpoints que lo reciban por JWT o por ruta.
- Antes de consumir usuarios, departamentos o plantillas, el layout debe tener `token` y `empresaId` consistentes con `GET /auth/me`.
- Las pantallas existentes deben manejar explícitamente 401 y 403.
- Cambios posteriores del backend deben actualizar primero los contratos y luego las implementaciones frontend.

## 6. Hoja de Ruta y Criterios de Aceptación

- **Fase 0: Blindaje JWT y Multi-tenant**
- **Fase 1: Motor de Campañas**
- **Fase 2: Rastreo y Eventos Zero-Credential**
- **Fase 3: Backend App Móvil y FCM**
- **Fase 4: Capacitación y Gamificación**
- **Fase 5: Analítica Ejecutiva**
- **Fase 6: Rate Limiting y Cierre de Contratos**

Ninguna fase frontend se considera terminada hasta que:

1. Se respeten los contratos documentados y no haya campos o endpoints inventados.
2. Todas las llamadas protegidas envíen Bearer JWT y usen el `empresaId` autenticado.
3. `npm run build` termine con 0 errores de TypeScript/Next.js.
4. `npm run lint` termine sin errores.
5. Las páginas manejen 401, 403, 400/422 y errores de conexión.
6. Los listados paginados consuman `{ data, total, page, limit }`.
7. Se actualice `specs/API_CONTRACTS.md` con las nuevas pantallas, payloads, estados y dependencias de API.
