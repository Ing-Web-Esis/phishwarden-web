# Fase 0 Frontend - Compatibilidad con Blindaje JWT y Multi-tenant

## Objetivo

Adaptar el frontend existente para que continúe funcionando cuando el backend aplique `JwtAuthGuard` y `CompanyTenantGuard` a empresas, departamentos, empleados y plantillas.

No se debe implementar funcionalidad nueva de campañas en esta fase.

## Alcance

### Incluido

- Centralizar la URL base del backend.
- Centralizar encabezados Bearer y manejo de errores.
- Normalizar la sesión desde `/auth/login`.
- Derivar y validar `empresaId` desde `GET /auth/me`.
- Proteger las páginas existentes bajo `/dashboard`.
- Preparar tipos para perfiles, paginación, empleados, departamentos y plantillas.
- Corregir llamadas protegidas sin romper payloads actuales.
- Agregar manejo consistente de 401 y 403.
- Actualizar `specs/API_CONTRACTS.md`.

### Excluido

- Implementar páginas de campañas.
- Implementar eventos Zero-Credential.
- Implementar backend móvil o FCM.
- Implementar gamificación o analítica real.
- Cambiar el diseño visual existente sin necesidad funcional.

## Auditoría inicial

Estado observado que debe preservarse:

- Login usa `POST /auth/login`.
- Dashboard usa `GET /auth/me`.
- Perfil usa `GET/PUT /auth/me`.
- Plantillas usa rutas `/empresas/:empresaId/plantillas`.
- Empleados usa rutas `/empresas/:empresaId/empleados`.
- El layout guarda `empresaId` recibido por el perfil.
- Algunas llamadas protegidas no envían Bearer.
- Una llamada usa `/departamentos?empresaId=...`, aunque Fase 0 debe derivar el tenant del JWT.
- Hay respuestas y estados tipados parcialmente como `any`.

## Reglas de implementación

1. Crear un API client compartido bajo `src/lib/` que:
   - lea `NEXT_PUBLIC_API_URL`;
   - obtenga el token actual;
   - añada `Authorization: Bearer <token>`;
   - lance o devuelva errores tipados;
   - maneje JSON y `multipart/form-data`.

2. Crear tipos mínimos en `src/lib/types.ts` o ubicación equivalente para:
   - sesión;
   - perfil administrador;
   - usuario empleado;
   - departamento;
   - plantilla;
   - respuesta paginada.

3. En el layout de dashboard:
   - exigir token;
   - llamar a `GET /auth/me`;
   - validar `empresaId`;
   - guardar el tenant solo tras una respuesta exitosa;
   - limpiar la sesión ante 401;
   - mostrar la pantalla protegida solo después de validar.

4. En todas las rutas bajo `/empresas/:empresaId/...`:
   - usar el `empresaId` obtenido de `/auth/me`;
   - comprobar que no esté vacío o inválido;
   - enviar Bearer JWT;
   - ante 403 no intentar otra empresa ni modificar el tenant local.

5. En empleados:
   - `/empleados/resumen` debe enviar JWT;
   - `/departamentos` debe llamar a `GET /departamentos` sin `empresaId` en query;
   - validar UUIDv4 visualmente solo como ayuda, sin reemplazar la validación del backend;
   - mantener CSV como `multipart/form-data`.

6. En plantillas:
   - mantener payload y rutas existentes;
   - validar `attackType` y `difficulty` conforme al contrato;
   - enviar siempre Bearer.

7. En perfil:
   - mantener `PUT /auth/me`;
   - limpiar contraseñas temporales después de éxito;
   - manejar correctamente 400 y 401.

## Compatibilidad con el backend

- `POST /auth/login` y `POST /empresas/register` permanecen públicos.
- `GET/PUT /auth/me` siguen usando solo JWT.
- Las rutas administrativas del tenant siguen usando `:empresaId`, pero el backend verifica coincidencia con el JWT.
- Un `empresaId` almacenado y manipulado en localStorage nunca sustituye la decisión del backend.
- Las rutas de campañas quedan fuera hasta completar Fase 1.

## Plan de implementación

1. Documentar endpoints de las pantallas existentes.
2. Crear configuración/API client compartido.
3. Introducir tipos TypeScript y eliminar dependencias nuevas de `any`.
4. Actualizar layout y login para manejar sesión normalizada.
5. Actualizar perfil, empleados y plantillas.
6. Implementar manejo uniforme de 401/403/400/404/409.
7. Ejecutar `npm run lint`.
8. Ejecutar `npm run build`.
9. Comparar cada llamada contra `specs/API_CONTRACTS.md`.

## Criterios de aceptación

- Todas las páginas protegidas requieren un token válido.
- Todo endpoint `/empresas/:empresaId/...` usa el tenant del perfil autenticado.
- Ninguna operación usa un `empresaId` tomado de un parámetro manipulable sin validación backend.
- Las llamadas administrativas ya tienen Bearer JWT.
- No hay llamadas duplicadas o URLs backend fuera del API client compartido.
- Los 401 cierran sesión y los 403 no intentan cross-tenant.
- Los listados usan `{ data, total, page, limit }`.
- Login, perfil, empleados y plantillas mantienen su flujo funcional existente.
- `npm run lint` termina sin errores.
- `npm run build` termina con 0 errores.
