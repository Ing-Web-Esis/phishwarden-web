# Plan Técnico: Fase 0 Frontend - Compatibilidad con Blindaje JWT y Multi-tenant

## 1. Diagnóstico del Estado Actual y Objetivos de la Fase 0

### 1.1. Diagnóstico del Código Fuente Frontend
Tras inspeccionar el código fuente en `src/app/`, `src/components/` y `src/lib/`, se identificaron los siguientes puntos críticos que rompen la compatibilidad con el backend recién blindado:
1. **Llamadas HTTP no centralizadas y URLs hardcodeadas:** Las pantallas realizan llamadas directas con `fetch("http://localhost:3000/...")` sin utilizar la variable de entorno `NEXT_PUBLIC_API_URL`.
2. **Falta de inyección de Token Bearer:** En `src/app/dashboard/usuarios/page.tsx` (línea 120), la consulta a `/empresas/:empresaId/empleados/resumen` se realiza mediante `fetch(url.toString())` sin incluir cabeceras de autorización (`Authorization: Bearer <token>`), lo que actualmente produce un rechazo inmediato `401 Unauthorized` por el backend.
3. **Parámetros obsoletos en URLs:** En `src/app/dashboard/usuarios/page.tsx` (línea 86), se consulta `GET /departamentos?empresaId=${empresaId}`, violando la regla del backend donde el tenant se deriva exclusivamente del token JWT en `GET /departamentos`.
4. **Riesgo en Carga de Archivos (`multipart/form-data`):** La importación de CSV en usuarios requiere que no se fuerce `Content-Type: application/json` para permitir que el navegador asigne el boundary multipart correspondiente.
5. **Formato de Errores de Validación de NestJS:** El `ValidationPipe` del backend devuelve errores con `{ message: string | string[] }`. Cuando `message` es un arreglo de errores de validación, la UI actual no realiza un formateo amigable.
6. **Manejo de Contraseñas en Perfil:** En `src/app/dashboard/perfil/page.tsx`, si el usuario llena solo uno de los campos de contraseña, se envía un string vacío o undefined parcial que desencadena un error `400 Bad Request`. Además, las contraseñas no se limpian de memoria tras una actualización exitosa.
7. **Protección de Plantillas Globales:** En `src/app/dashboard/plantillas/page.tsx`, si bien se ocultan opciones para plantillas globales, las respuestas `403 Forbidden` disparadas por el backend no muestran un mensaje explicativo al usuario indicando que las plantillas base del sistema son de solo lectura.
8. **Ausencia de Validación UUIDv4:** Las consultas y mutaciones de empleados operan sobre strings sin validar preventivamente el formato UUIDv4 exigido por el backend (`ParseUUIDPipe`).
9. **Uso Excesivo de `any` e Inconsistencias de Linting:** Existen múltiples usos de `any` en estados y componentes (`LoginForm.tsx`, `layout.tsx`, `usuarios/page.tsx`, `plantillas/page.tsx`), generando 34 problemas detectados por ESLint (`@typescript-eslint/no-explicit-any` y variables no utilizadas).

---

## 2. Diseño del Cliente HTTP Compartido (`src/lib/api-client.ts`)

### 2.1. Arquitectura y Configuración
Se creará un cliente HTTP centralizado bajo `src/lib/api-client.ts` que sustituirá todos los `fetch` manuales del frontend.
- **Resolución de URL:** Se determinará la URL base mediante `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'`.
- **Inyección Automática de Bearer Token:**
  - Extraerá el token JWT desde `localStorage.getItem("token")` en entornos del navegador (`typeof window !== "undefined"`).
  - Incluirá automáticamente el encabezado `Authorization: Bearer <token>` en todas las solicitudes que no especifiquen la opción `skipAuth: true`.
- **Soporte Inteligente de Payloads (`JSON` vs `multipart/form-data`):**
  - Si el cuerpo (`body`) es una instancia de `FormData` (usado para carga masiva de CSV), **no** se establecerá la cabecera `Content-Type`, permitiendo que el navegador genere automáticamente `multipart/form-data; boundary=...`.
  - Si el cuerpo es un objeto plano, se serializará con `JSON.stringify()` y se añadirá `Content-Type: application/json`.
- **Parseo de Parámetros de Consulta (`params`):** Soporte para objetos de parámetros query (`params: { page, limit, search, departmentId, attackType, difficulty }`) codificándolos limpiamente e ignorando valores `undefined` o `null`.

### 2.2. Manejo Centralizado de Respuestas y Errores HTTP
- **Clase de Error Específica (`ApiError`):**
  ```typescript
  export class ApiError extends Error {
    constructor(
      public status: number,
      public message: string,
      public errors?: string[]
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  ```
- **Parseo de Mensajes:** Si el cuerpo de respuesta JSON contiene `{ message }`:
  - Si `message` es un arreglo de cadenas (`string[]`, típico de `ValidationPipe`), se consolidará en un mensaje legible separado por comas o saltos de línea y se almacenará en `errors`.
  - Si `message` es una cadena (`string`), se utilizará directamente.
  - Si no hay mensaje, se utilizará un mensaje estándar según el código de estado HTTP.
- **Manejo de Respuestas 401 (Unauthorized):**
  - Si una petición protegida recibe `401`, el cliente limpiará inmediatamente la sesión local (`localStorage.removeItem("token")`, `localStorage.removeItem("empresaId")`).
  - Redirigirá al usuario a `/login` si no se encuentra ya en dicha ruta.
- **Manejo de Respuestas 403 (Forbidden):**
  - Lanzará un `ApiError` con `status: 403`.
  - **No modificará ni alterará `empresaId`** en el almacenamiento local, permitiendo que la UI muestre un mensaje controlado de acceso denegado sin provocar estados inconsistentes.

---

## 3. Tipado Estricto del Sistema (`src/lib/types.ts`)

Se creará el archivo `src/lib/types.ts` definiendo interfaces estrictas que eliminen el uso de `any` en producción:

### 3.1. Interfaces de Dominio y Contratos de API
```typescript
// Paginación estándar de la API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Sesión y Autenticación
export interface AuthLoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    rol: string;
  };
  token?: string;
  access_token?: string;
}

export interface AdminProfile {
  id: string | number;
  nombre: string;
  correo: string;
  empresaId: number | null;
  empresa: {
    id: number;
    nombre: string;
  } | null;
}

export interface UpdateAdminProfileInput {
  nombre?: string;
  correo?: string;
  nombreEmpresa?: string;
  contraseñaActual?: string;
  nuevaContraseña?: string;
}

// Departamentos
export interface DepartmentItem {
  id: number;
  nombre: string;
  colaboradores?: number;
  scoreRiesgo?: number;
}

// Empleados / Usuarios
export interface EmployeeSummaryItem {
  id: string; // UUIDv4
  nombre: string;
  correo: string;
  departamento: string | null;
  scoreRiesgo: number;
}

export interface EmployeeDetail {
  nombre: string;
  correo: string;
  telefono: string | null;
  scoreRiesgo: number;
  rachaDiasSeguros: number;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  phone?: string;
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  departmentId?: number;
  phone?: string;
}

// Plantillas
export type AttackType = 'PHISHING' | 'SMISHING';
export type DifficultyLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export interface PlantillaItem {
  id: number;
  companyId?: number | null;
  empresa_id?: number | null;
  title: string;
  subject: string;
  bodyHtml: string;
  attackType: AttackType;
  difficulty: DifficultyLevel;
  isGlobal: boolean;
  createdAt?: string;
}

export interface CreatePlantillaInput {
  title: string;
  subject: string;
  bodyHtml: string;
  attackType: AttackType;
  difficulty: DifficultyLevel;
}

export interface UpdatePlantillaInput {
  title?: string;
  subject?: string;
  bodyHtml?: string;
  attackType?: AttackType;
  difficulty?: DifficultyLevel;
}
```

### 3.2. Matriz de Erradicación de `any`
- `src/components/auth/LoginForm.tsx`: `err: any` reemplazado por `err: unknown` con validación de tipo mediante `instanceof ApiError` o `Error`.
- `src/app/dashboard/layout.tsx`: `adminUser: any` reemplazado por `AdminProfile | null`.
- `src/app/dashboard/perfil/page.tsx`: `payload: any` reemplazado por `UpdateAdminProfileInput`.
- `src/app/dashboard/usuarios/page.tsx`:
  - `empleados: any[]` -> `EmployeeSummaryItem[]`
  - `departamentos: any[]` -> `DepartmentItem[]`
  - `selectedEmpleado: any` -> `EmployeeDetail | null`
  - Métodos `(emp: any)` -> `(emp: EmployeeSummaryItem)`
- `src/app/dashboard/plantillas/page.tsx`:
  - `plantillas: any[]` -> `PlantillaItem[]`
  - `selectedPlantilla: any` -> `PlantillaItem | null`
  - Métodos `(plantilla: any)` -> `(plantilla: PlantillaItem)`

---

## 4. Sesión y Tenant Guard (`LoginForm.tsx` y `DashboardLayout`)

### 4.1. Normalización de Sesión en `LoginForm.tsx`
- Enviar únicamente `{ email, password }` mediante `apiClient.post<AuthLoginResponse>('/auth/login', { email, password }, { skipAuth: true })`.
- No enviar `codigoEmpresa` (exclusivo de la aplicación móvil).
- Normalizar la extracción del token: `const token = data.access_token || data.token;`.
- Almacenar el token en `localStorage.setItem("token", token)`.
- Redirigir a `/dashboard`.

### 4.2. Tenant Guard en `src/app/dashboard/layout.tsx`
- **Verificación Previa Obligatoria:**
  1. Si no existe `localStorage.getItem("token")`, redirigir inmediatamente a `/login`.
  2. Consultar el perfil administrativo llamando a `GET /auth/me` con `apiClient`.
  3. Si la respuesta es exitosa (200):
     - Validar que `data.empresaId` esté presente.
     - Guardar `localStorage.setItem("empresaId", String(data.empresaId))`.
     - Establecer `adminUser` en el estado y marcar `isChecking = false`.
  4. Si `GET /auth/me` falla con 401 o no tiene empresa asignada:
     - Limpiar `token` y `empresaId`.
     - Redirigir a `/login`.
- **Bloqueo de Renderizado:** El contenido protegido no se mostrará hasta que la validación contra el backend concluya exitosamente (`isChecking === false`), impidiendo peticiones fallidas previas a conocer el `empresaId`.

---

## 5. Auditoría y Plan de Corrección por Pantalla

### 5.1. Usuarios (`src/app/dashboard/usuarios/page.tsx`)
- **Departamentos:** Cambiar la petición a `GET /departamentos` sin `?empresaId=...`, permitiendo que el backend derive la empresa desde el JWT del token.
- **Resumen de Empleados:**
  - Migrar llamada a `apiClient.get<PaginatedResponse<EmployeeSummaryItem>>(/empresas/${empresaId}/empleados/resumen, { params: { page, limit, search, departmentId } })`.
  - Asegurar la inclusión del token Bearer (corrigiendo la falla actual donde se llamaba sin headers).
- **Importación Masiva CSV:**
  - Enviar `fileFormData` mediante `apiClient.post(/empresas/${empresaId}/empleados/import-csv, fileFormData)`.
  - El cliente detectará que es `FormData` y enviará el `multipart/form-data` con el boundary adecuado.
- **Validación de UUIDv4:**
  - Crear helper `isValidUUID(id: string): boolean` (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`).
  - Validar el identificador antes de invocar `GET /empleados/${id}`, `PUT /empresas/${empresaId}/empleados/${id}` o `DELETE /empresas/${empresaId}/empleados/${id}`. Si no es válido, notificar visualmente y abortar la petición.

### 5.2. Plantillas (`src/app/dashboard/plantillas/page.tsx`)
- **Migración a `apiClient`:** Centralizar listado, creación, edición y eliminación.
- **Cumplimiento de Enums:**
  - `attackType`: `'PHISHING' | 'SMISHING'`.
  - `difficulty`: `'BAJO' | 'MEDIO' | 'ALTO'`.
- **Protección de Plantillas Globales:**
  - En `handleEditPlantilla` y `handleDeletePlantilla`, capturar errores con `status === 403` y mostrar toast específico: *"Las plantillas globales del sistema están protegidas y no pueden ser modificadas ni eliminadas."*
  - En el modal y listado, preservar la condición `!plantilla.isGlobal` para ocultar botones de mutación sobre recursos del sistema.

### 5.3. Perfil (`src/app/dashboard/perfil/page.tsx`)
- **Lógica de Contraseñas:**
  - Validar: `const hasPasswords = Boolean(formData.contraseñaActual && formData.nuevaContraseña);`.
  - Solo añadir `contraseñaActual` y `nuevaContraseña` al payload si **ambos** campos tienen contenido. Si solo se llenó uno, advertir al usuario mediante un toast sin disparar la petición al backend.
- **Preservación de Estado en Error 400:**
  - Si el backend rechaza la actualización (HTTP 400), **no** resetear los datos del formulario a `originalData`, permitiendo al usuario corregir los campos.
- **Limpieza Post-Éxito:**
  - Tras HTTP 200, limpiar inmediatamente las contraseñas en memoria: `contraseñaActual: ""`, `nuevaContraseña: ""`.

### 5.4. Dashboard General (`src/app/dashboard/page.tsx`)
- Migrar consumo de `GET /auth/me` a `apiClient`.
- Manejar adecuadamente errores 401 delegando la redirección al cliente.
- Eliminar la variable no utilizada `error` en el bloque `catch` para cumplir las reglas de ESLint.

---

## 6. Verificación de Calidad y Cierre de Contratos

1. **`npm run lint`:** Cero errores y cero advertencias de ESLint en todo el proyecto frontend.
2. **`npm run build`:** Compilación exitosa de Next.js (App Router) sin fallos de TypeScript ni rutas rotas.
3. **`specs/API_CONTRACTS.md`:** Actualización del documento del frontend documentando la integración del cliente centralizado, el formato exacto de las peticiones con Bearer token, la normalización de la sesión y los flujos de respuesta 401/403.
