# Contratos frontend hacia la API

Este documento traduce los contratos del backend a las pantallas implementadas de PhishWarden Web tras completar el blindaje de Fase 0. La fuente de verdad funcional en el backend es `specs/API_CONTRACTS.md`.

## Arquitectura del Cliente HTTP Compartido (`src/lib/api-client.ts`)

Todas las comunicaciones con el backend se canalizan a través del cliente unificado `apiClient`:
- **URL base objetivo:** Variable de entorno `NEXT_PUBLIC_API_URL` con fallback automático a `http://localhost:3000`.
- **Inyección automática de credenciales:**
  - Si existe `localStorage.getItem("token")` y la opción `skipAuth` no es `true`, se inyecta automáticamente el encabezado:
    ```http
    Authorization: Bearer <token>
    ```
- **Soporte de cuerpos JSON y Multipart:**
  - Si el cuerpo es una instancia de `FormData` (e.g. importación masiva de CSV), el cliente omite el header `Content-Type` para permitir que el navegador compute automáticamente el límite multipart con su `boundary`.
  - Para objetos JavaScript estándar, serializa a JSON e inyecta `Content-Type: application/json`.
- **Parseo seguro de respuestas vacías:**
  - Para peticiones `DELETE` o respuestas `204 No Content` sin cuerpo, el cliente invoca `await response.text()` antes de intentar `JSON.parse(text)`, evitando excepciones de sintaxis JSON.
- **Tipado estricto y manejo de errores (`ApiError`):**
  - Los errores HTTP lanzan una instancia tipada `ApiError(status, message, errors)`.
  - Extrae de forma transparente respuestas de NestJS `ValidationPipe`: `{ message: string | string[] }`.
- **Ciclo de vida de sesión ante códigos HTTP:**
  - **401 Unauthorized:** Cuando `status === 401`, `skipAuth !== true` y `window.location.pathname !== '/login'`, limpia `localStorage.token` y `localStorage.empresaId` y redirige inmediatamente a `/login`.
  - **403 Forbidden:** Informa en UI con mensaje específico (ej. `"Las plantillas globales del sistema están protegidas y no pueden ser modificadas ni eliminadas."` o `"No tienes permisos para realizar esta acción"`), **sin** eliminar la sesión ni alterar destructivamente `localStorage.empresaId`.
  - **400 Bad Request / 422 Unprocessable Entity:** Muestra mensajes de validación en toasts o alertas sin borrar los datos editados en los formularios.

---

## Identidad y Sesión

### Login

**Pantalla:** `src/app/login/page.tsx`  
**Formulario:** `src/components/auth/LoginForm.tsx`  

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@dominio.pe",
  "password": "Admin123*"
}
```

- **Cliente:** `apiClient.post<AuthLoginResponse>("/auth/login", { email, password }, { skipAuth: true })`.
- **Sesión:** Normaliza tanto `data.token` como `data.access_token` guardándolo en `localStorage.setItem("token", token)`.
- No envía `codigoEmpresa` desde el panel web.
- Si las credenciales son inválidas (401), se captura en el componente mostrando el mensaje de error en pantalla sin interrupción de redirección.

---

### Perfil Autenticado y Tenant Guard Cliente

**Request:**

```http
GET /auth/me
Authorization: Bearer <token>
```

**Pantallas que lo consumen:**
- `src/app/dashboard/layout.tsx` (Tenant Guard y navegación)
- `src/app/dashboard/page.tsx` (Saludo del dashboard)
- `src/app/dashboard/perfil/page.tsx` (Carga del formulario de perfil)

**Manejo de Tenant en `src/app/dashboard/layout.tsx`:**
- Valida la existencia del token; si no existe, redirige a `/login`.
- Durante la verificación (`isChecking === true`), suspende la renderización de rutas protegidas mostrando un indicador de carga para evitar fuga de vistas no autenticadas.
- Resuelve `empresaId` con fallback seguro:
  ```typescript
  const resolvedEmpresaId = data.empresaId ?? data.empresa?.id;
  ```
- Almacena `localStorage.setItem("empresaId", resolvedEmpresaId.toString())` **únicamente tras recibir respuesta HTTP 200**.

---

### Actualizar Perfil de Administrador

**Pantalla:** `src/app/dashboard/perfil/page.tsx`

```http
PUT /auth/me
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "nombre": "María García",
  "correo": "maria.garcia@interbank.pe",
  "nombreEmpresa": "Interbank",
  "contraseñaActual": "Admin123*",
  "nuevaContraseña": "NuevaAdmin123*"
}
```

- Valida que `contraseñaActual` y `nuevaContraseña` se envíen **juntos** únicamente cuando el usuario decide cambiar su contraseña.
- Tras 400 muestra el mensaje de validación preservando los campos editados.
- Tras 200 limpia las contraseñas de la memoria y actualiza el estado.

---

## Departamentos

### Estadísticas y Listado de Organización

**Pantalla:** `src/app/dashboard/usuarios/page.tsx`

```http
GET /departamentos
Authorization: Bearer <token>
```

- El tenant se deriva **exclusivamente del JWT**. El frontend **no envía** `?empresaId=...`.
- Respuesta: Arreglo de `DepartmentItem[]` con conteos y score de riesgo.

---

## Usuarios / Empleados

**Pantalla:** `src/app/dashboard/usuarios/page.tsx`

### Resumen Paginado

```http
GET /empresas/:empresaId/empleados/resumen?page=1&limit=10&search=Mariano&departmentId=1
Authorization: Bearer <token>
```

- Filtro opcional `departmentId` como entero.
- Respuesta: `PaginatedResponse<EmployeeSummaryItem>` (`{ data, total, page, limit }`).
- Validador UUIDv4 en cliente (`isValidUUID(id)`) antes de interactuar con registros específicos.

### Importación Masiva CSV

```http
POST /empresas/:empresaId/empleados/import-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

- Envía `FormData` con archivo CSV en el campo `file`.
- Tras éxito, actualiza automáticamente la lista de empleados y departamentos.

### Crear Empleado

```http
POST /empresas/:empresaId/empleados
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Mariano Silva",
  "email": "mariano.silva@techcorp.com",
  "departmentId": 1,
  "phone": "+51 987654321"
}
```

### Actualizar Empleado

```http
PUT /empresas/:empresaId/empleados/:id
Authorization: Bearer <token>
Content-Type: application/json
```

- `:id` debe ser UUIDv4 válido.

### Eliminar Empleado

```http
DELETE /empresas/:empresaId/empleados/:id
Authorization: Bearer <token>
```

- `:id` debe ser UUIDv4 válido.

### Consultar Detalle de Empleado

```http
GET /empleados/:id
Authorization: Bearer <token>
```

- `:id` debe ser UUIDv4 válido.
- Devuelve `EmployeeDetail` incluyendo score de riesgo y racha de días seguros.

---

## Plantillas de Phishing y Smishing

**Pantalla:** `src/app/dashboard/plantillas/page.tsx`

### Listar Biblioteca

```http
GET /empresas/:empresaId/plantillas?page=1&limit=12&search=Microsoft&attackType=PHISHING&difficulty=MEDIO
Authorization: Bearer <token>
```

- Enums tipados: `attackType` (`PHISHING | SMISHING`), `difficulty` (`BAJO | MEDIO | ALTO`).
- Respuesta paginada con plantillas propias de la empresa y globales (`isGlobal: true`).

### Crear Plantilla

```http
POST /empresas/:empresaId/plantillas
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Actualización Urgente de Credenciales",
  "subject": "Acción Requerida",
  "bodyHtml": "<p>Estimado {{nombre}}</p>",
  "attackType": "PHISHING",
  "difficulty": "MEDIO"
}
```

### Actualizar y Eliminar (Protección de Plantillas Globales)

```http
PUT    /empresas/:empresaId/plantillas/:id
DELETE /empresas/:empresaId/plantillas/:id
Authorization: Bearer <token>
```

- `:id` es entero (INT).
- Si el backend rechaza la mutación con `403 Forbidden` (por pertenecer a una plantilla global con `empresa_id = null`), el frontend captura el error con `err.status === 403` y muestra un toast informativo:
  > *"Las plantillas globales del sistema están protegidas y no pueden ser modificadas ni eliminadas."*

---

## Gestión Integral de Campañas (Fase 1 Frontend)

**Pantalla:** `src/app/dashboard/campanas/page.tsx`  
**Modales:** `src/components/campanas/CreateEditCampaignModal.tsx`, `src/components/campanas/CampaignDetailModal.tsx`, `src/components/campanas/DuplicateCampaignModal.tsx`

### 1. Resumen Ejecutivo (KPIs)

```http
GET /empresas/:empresaId/campanas/resumen
Authorization: Bearer <token>
```

- **Respuesta:** 200 OK
  ```json
  {
    "total": 12,
    "programadas": 4,
    "enCurso": 2,
    "finalizadas": 5,
    "canceladas": 1
  }
  ```

### 2. Listado Paginado y Filtrado

```http
GET /empresas/:empresaId/campanas?page=1&limit=10&search=Q4&status=programada&attackType=phishing
Authorization: Bearer <token>
```

- **Query Params:** `page` (default 1), `limit` (default 10), `search` (opcional con debouncing), `status` (`programada | en_curso | finalizada | cancelada`), `attackType` (`phishing | smishing`, case-insensitive).
- **Respuesta:** 200 OK con `{ data: CampaignItem[], total, page, limit }`.
- **Estructura de `CampaignItem`:**
  ```json
  {
    "id": "7b520fa5-df93-4560-96f0-1c39050d248b",
    "templateId": 1,
    "name": "Campaña de concientización Q4",
    "scheduledDate": "2026-11-01T09:00:00.000Z",
    "shippingMethod": "masivo",
    "status": "programada",
    "createdAt": "2026-10-25T14:30:00.000Z",
    "targetUserIds": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"],
    "template": {
      "id": 1,
      "titulo": "Actualización Urgente de Credenciales Microsoft 365",
      "metodoAtaque": "phishing"
    },
    "totalParticipants": 25
  }
  ```

### 3. Detalle Completo de Campaña y Plantilla

```http
GET /empresas/:empresaId/campanas/:id
Authorization: Bearer <token>
```

- **Respuesta:** 200 OK con `CampaignDetail` conteniendo metadatos y plantilla detallada (`titulo`, `metodoAtaque`, `asunto`, `cuerpoHtml`, `indicadorDificultad`).
- **Aislamiento de Seguridad:** `template.cuerpoHtml` se renderiza dentro de un `<iframe srcDoc={cuerpoHtml} sandbox="" />` para garantizar que los estilos CSS embebidos del correo no contaminen los estilos globales de la aplicación.

### 4. Creación y Programación de Campaña

```http
POST /empresas/:empresaId/campanas
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Simulación Phishing Q4 - Finanzas",
  "templateId": 1,
  "scheduledDate": "2026-11-01T09:00:00.000Z",
  "shippingMethod": "masivo",
  "departmentIds": [1, 2],
  "targetUserIds": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"]
}
```

- **Manejo de Fechas:** La interfaz captura la fecha mediante `<input type="datetime-local" />` y la convierte a cadena UTC ISO 8601 (`new Date(value).toISOString()`) inmediatamente antes de emitir la petición.
- **Validación:** Requiere al menos un departamento o un usuario objetivo.

### 5. Edición de Parámetros

```http
PATCH /empresas/:empresaId/campanas/:id
Authorization: Bearer <token>
Content-Type: application/json
```

- **Restricción de Negocio:** Permitido **únicamente** cuando la campaña se encuentra en estado `'programada'`.
- **Formateo Local:** Al abrir el formulario de edición, la fecha ISO 8601 proveniente del backend se convierte a la zona horaria local del navegador mediante getters (`getFullYear`, `getMonth + 1`, `getDate`, `getHours`, `getMinutes`) para evitar desfases horarios visuales.
- **Payload:** `UpdateCampaignInput` (`name?`, `templateId?`, `scheduledDate?`, `shippingMethod?`).

### 6. Participantes de Campaña (Listado, Adición y Retiro)

```http
GET    /empresas/:empresaId/campanas/:id/participantes?page=1&limit=10&search=silva
POST   /empresas/:empresaId/campanas/:id/participantes
DELETE /empresas/:empresaId/campanas/:id/participantes/:usuarioId
Authorization: Bearer <token>
```

- **Restricción de Adición / Retiro:** Disponible **únicamente** cuando la campaña se encuentra en estado `'programada'`.
- **Invariante de 1 Participante:** Si `totalParticipants <= 1`, el botón de eliminación se deshabilita en la tabla y se presenta una advertencia explicativa, protegiendo contra el rechazo HTTP 400 del backend.
- **Sincronización en Vivo:** Al agregar o retirar un colaborador, se re-consulta de forma atómica tanto el listado paginado como `GET /empresas/:empresaId/campanas/:id`, actualizando `totalParticipants` y las reglas reactivas de forma instantánea.

### 7. Duplicación de Campaña

```http
POST /empresas/:empresaId/campanas/:id/duplicar
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Copia de Simulación Phishing Q4",
  "scheduledDate": "2026-12-01T09:00:00.000Z"
}
```

- Clona la plantilla, modalidad y participantes en una nueva campaña en estado `'programada'`.

### 8. Cancelación de Campaña

```http
PATCH /empresas/:empresaId/campanas/:id/cancelar
Authorization: Bearer <token>
```

- **Restricción de Negocio:** Solo ejecutable sobre campañas en estado `'programada'` o `'en_curso'`. El dropdown de acciones oculta esta opción para campañas `'finalizada'` o `'cancelada'`.
- Presenta diálogo modal de confirmación antes de enviar la mutación.

### 9. Matriz de Acciones por Estado

| Estado Campaña | Ver Detalles | Editar Parámetros | Gestionar Participantes | Duplicar | Cancelar |
|---|---|---|---|---|---|
| `programada` | ✅ Habilitado | ✅ Habilitado | ✅ Habilitado | ✅ Habilitado | ✅ Habilitado |
| `en_curso` | ✅ Habilitado | 🚫 Bloqueado | 🚫 Bloqueado | ✅ Habilitado | ✅ Habilitado |
| `finalizada` | ✅ Habilitado | 🚫 Bloqueado | 🚫 Bloqueado | ✅ Habilitado | 🚫 Bloqueado |
| `cancelada` | ✅ Habilitado | 🚫 Bloqueado | 🚫 Bloqueado | ✅ Habilitado | 🚫 Bloqueado |

---

## Resumen de Verificaciones de Calidad

| Comando | Resultado | Estado |
|---|---|---|
| `npm run lint` | 0 errores, 0 advertencias | Aprobado |
| `npm run build` | Compilación exitosa con Webpack (0 errores) | Aprobado |
