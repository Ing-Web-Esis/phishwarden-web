# Plan de Arquitectura e Implementación: Fase 2 Frontend

**Objetivo:** Implementar en `phishwarden-web-tl/` la ruta pública de verificación de simulaciones (`/sim/verificar`) con portales dinámicos bajo estricto **Zero-Credential Storage**, la selección y visualización de `landingTipo` en el módulo de plantillas, y el despacho manual de campañas programadas (`POST /empresas/:empresaId/campanas/:id/despachar`).

---

## 1. Aislamiento y Accesibilidad de la Ruta Pública `/sim/verificar`

### 1.1. Estructura de Enrutamiento en Next.js App Router
- La ruta se ubica en `src/app/sim/verificar/page.tsx`.
- Al pertenecer a `src/app/sim/`, hereda únicamente el `RootLayout` (`src/app/layout.tsx`).
- **Aislamiento Total del Layout Administrativo:** Está completamente fuera del árbol `src/app/dashboard/layout.tsx`. Por lo tanto:
  - Nunca ejecuta `fetchPerfil()`, ni verifica tokens JWT en `localStorage`.
  - No renderiza sidebar, barra superior, dropdowns administrativos ni logos de PhishWarden durante la etapa de trampa/captura, garantizando verosimilitud visual absoluta.
- Se implementará con un wrapper `<Suspense fallback={<LoadingPortal />}>` para envolver la lectura de parámetros `useSearchParams` (`?t=<token>`), cumpliendo estrictamente los estándares de compilación de Next.js 16.

### 1.2. Protección y Configuración en `src/lib/api-client.ts`
- Las llamadas a los endpoints públicos de tracking:
  - `GET /track/context/:token`
  - `POST /track/submit`
  se realizarán con la opción `{ skipAuth: true }`, evitando inyectar encabezados `Authorization: Bearer ...`.
- Se reforzará `api-client.ts` para que, en caso de recibir un error `401`, la redirección forzada a `/login` quede anulada si la ruta del navegador comienza por `/sim/` (`window.location.pathname.startsWith('/sim/')`).

---

## 2. Componentes de Landing Page Dinámica y Zero-Credential Storage

### 2.1. Arquitectura de Componentes de Simulación (`src/components/simulacion/`)
Se organizará una suite de componentes desacoplados para cada portal:

```
src/components/simulacion/
├── MicrosoftLanding.tsx       # Interfaz estilo Microsoft 365 / Outlook
├── GoogleLanding.tsx          # Interfaz estilo Google Workspace / Gmail
├── BancarioLanding.tsx        # Interfaz de Validación de Seguridad Bancaria
├── CorporativoLanding.tsx     # Interfaz SSO Corporativo con nombreEmpresa
├── EducationalFeedbackView.tsx# Vista post-trampa con alertas y recomendaciones
└── InvalidSimulationView.tsx  # Vista neutral para token expirado / inválido / error
```

### 2.2. Garantía Estricta de Zero-Credential Storage en el Navegador
Cumplimiento riguroso de las políticas de seguridad:
1. **Inputs de Credenciales:**
   - `<input type="password" autoComplete="off" spellCheck={false} />`
2. **Ciclo de Envío (`onSubmit`):**
   - Inmediatamente al disparar el envío, se limpia la referencia en memoria del formulario (`setPassword('')`).
   - Queda **estrictamente prohibido** registrar credenciales en `console.log`, `localStorage`, `sessionStorage`, cookies o variables globales.
   - El cuerpo de la petición HTTP enviado a `POST /track/submit` contiene **única y exclusivamente**:
     ```json
     {
       "token": "7b520fa5-df93-4560-96f0-1c39050d248b"
     }
     ```
   - Al recibir la respuesta exitosa del backend, el componente cambia el estado interno a `isCompromised = true`, renderizando inmediatamente `EducationalFeedbackView`.

### 2.3. Contratos de Comunicación con el Backend
1. **Consulta de Contexto (`GET /track/context/:token`):**
   - Entrada: Token UUIDv4 leído del query param `?t=...`.
   - Respuesta esperada:
     ```json
     {
       "token": "7b520fa5-df93-4560-96f0-1c39050d248b",
       "landingTipo": "microsoft",
       "metodoAtaque": "phishing",
       "nombreEmpresa": "TechCorp Perú S.A.C.",
       "tituloPlantilla": "Actualización Urgente de Credenciales Microsoft 365",
       "asunto": "Acción Requerida: Verifique su cuenta institucional",
       "indicadorDificultad": "media"
     }
     ```
   - Si el backend responde `404 Not Found` o `400 Bad Request`, se muestra `InvalidSimulationView` (pantalla limpia y neutral indicando "Enlace expirado o no disponible", sin revelar detalles internos).

2. **Captura de Simulación (`POST /track/submit`):**
   - Payload enviado: `{ "token": token }`
   - Respuesta esperada:
     ```json
     {
       "status": "compromised",
       "message": "Simulación detectada: Has ingresado credenciales en una prueba de concientización de seguridad de tu organización.",
       "landingTipo": "microsoft",
       "recomendaciones": [
         "Verifica siempre la URL y el certificado SSL del sitio antes de ingresar tus contraseñas.",
         "Nunca proporciones tus credenciales corporativas en enlaces recibidos por correos o SMS imprevistos.",
         "Comunícate inmediatamente con el área de TI o Ciberseguridad de tu organización ante cualquier sospecha."
       ]
     }
     ```

### 2.4. Diseño Visual de Cada Portal
- **`MicrosoftLanding`:** Logotipo de 4 colores de Microsoft, tipografía Segoe/sans, tarjeta centrada, campo de correo con botón "Siguiente" o usuario y contraseña directos, botón azul institucional `#0067b8`, enlaces "Opciones de inicio de sesión", pie de página con "Términos de uso" y "Privacidad y cookies".
- **`GoogleLanding`:** Logotipo multicolor clásico de Google, contenedor blanco con esquinas redondeadas sobre fondo gris suave (`bg-slate-50`), tipografía clara, inputs con foco azul Google `#1a73e8`, botón primario azul y enlaces inferiores de ayuda y términos.
- **`BancarioLanding`:** Header institucional bancario con insignia de seguridad SSL 256 bits, banner preventivo de validación obligatoria de credenciales para transferencias seguras, formulario con número de documento/tarjeta y clave de internet, y advertencia de sesión encriptada.
- **`CorporativoLanding`:** Portal corporativo SSO que destaca con prominencia `nombreEmpresa`, título "Acceso Único a Sistemas Centralizados", formulario con usuario de red y contraseña de dominio corporativo.
- **`EducationalFeedbackView`:**
  - Header impactante con alerta preventiva (amarillo/rojo ámbar).
  - Mensaje explicativo: *"Esta ha sido una simulación de seguridad controlada de PhishWarden para tu organización."*
  - Aclaración explícita: *"Tus contraseñas reales NO fueron guardadas ni transferidas (Zero-Credential Policy)."*
  - Metadatos del ataque: Plantilla utilizada, Remitente/Asunto simulado, Canal (Phishing/Smishing) y Nivel de Dificultad.
  - Lista de recomendaciones de seguridad provistas por el backend.
  - Botón "Comprendido, seré más precavido" para cerrar la experiencia.

---

## 3. Módulo de Plantillas: Soporte de `landingTipo`

### 3.1. Tipos en `src/lib/types.ts`
- Definir enum/tipo:
  ```ts
  export type LandingTipo = 'microsoft' | 'google' | 'corporativo' | 'bancario' | 'generico';
  ```
- Incorporar `landingTipo?: LandingTipo` en:
  - `PlantillaItem`
  - `CreatePlantillaInput`
  - `UpdatePlantillaInput`

### 3.2. Formulario y Modales en `src/app/dashboard/plantillas/page.tsx`
- En el modal **Crear Plantilla** y modal **Editar Plantilla**:
  - Incorporar selector de `landingTipo` con opciones:
    - `generico` (Detección automática inteligente según título/asunto)
    - `microsoft` (Microsoft 365 / Outlook)
    - `google` (Google Workspace / Gmail)
    - `bancario` (Validación de Seguridad Bancaria)
    - `corporativo` (Portal Corporativo SSO)
  - Texto explicativo de ayuda: *"Define la apariencia visual de la página falsa a la que será dirigido el usuario al hacer clic en el enlace simulado."*
- En la cuadrícula/tarjetas y tabla de plantillas:
  - Añadir un badge visual que identifique claramente el portal simulado asociado (`Microsoft`, `Google`, `Bancario`, `Corporativo` o `Automático`).
- En el modal de previsualización ("Ver Plantilla"):
  - Mostrar la etiqueta del portal simulado seleccionado.

---

## 4. Módulo de Campañas: Despacho Manual Inmediato

### 4.1. Tipos en `src/lib/types.ts`
- Incorporar interfaz para la respuesta de despacho:
  ```ts
  export interface DispatchCampaignResponse {
    message: string;
    campaignId: string;
    totalTargets: number;
    mode: 'sandbox' | 'live';
  }
  ```

### 4.2. Despacho en `src/app/dashboard/campanas/page.tsx`
- En la tabla de campañas, dentro del menú de acciones (`<DropdownMenu>`):
  - Para campañas con `camp.status === 'programada'`:
    - Añadir acción **"Despachar Ahora"** con ícono `Send` en color ámbar.
- Diálogo modal de confirmación `DispatchConfirmModal`:
  - Informa al usuario: *"¿Confirmas el lanzamiento inmediato de la campaña '{nombre}' para {totalParticipants} participantes vía modalidad {shippingMethod}?"*
  - Notifica que el estado cambiará de `'programada'` a `'en_curso'`.
  - Botón de confirmación con estado `isDispatching` (Loader).
  - Al confirmarse:
    - Ejecuta `apiClient.post<DispatchCampaignResponse>('/empresas/:empresaId/campanas/:id/despachar')`.
    - Muestra toast de éxito informando participantes y modo (`sandbox` o `live`).
    - Dispara recarga con `setReloadTrigger(prev => prev + 1)` para refrescar contadores KPI y el listado de campañas.

### 4.3. Despacho en `src/components/campanas/CampaignDetailModal.tsx`
- En la vista detallada de una campaña, si su estado es `'programada'`:
  - Añadir botón destacado **"Despachar Campaña"** en la barra superior de acciones.
  - Al pulsarlo, abre el diálogo de confirmación de despacho y sincroniza la actualización con el listado padre mediante `onCampaignUpdated`.

### 4.4. Robustez en Selector de Departamentos
- Validar exhaustivamente en `CreateEditCampaignModal.tsx` y `CampaignDetailModal.tsx` la lectura de `dept.nombre || dept.name || 'Departamento ' + dept.id` asegurando que todos los departamentos muestren su nombre descriptivo en las etiquetas interactivas.

---

## 5. Resumen de Flujo de Datos

```
[ Colaborador recibe correo/SMS simulado ]
                   │
                   ▼
  GET /sim/verificar?t=<token>
                   │
                   ▼ (Sin Authorization header, skipAuth: true)
     GET /track/context/:token
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
200 OK Context               404 / 400 Error
Renderiza Landing                 Renderiza
(Microsoft, Google, Bancario,    InvalidSimulationView
 Corporativo)
    │
    ▼
Colaborador ingresa datos y envía formulario
    │
    ├─ Inmediatamente limpia password de memoria
    ├─ NO guarda nada en storage / NO loguea
    │
    ▼ (POST con { token: string } exclusivamente)
     POST /track/submit
    │
    ▼
200 OK { status, message, recomendaciones }
    │
    ▼
Renderiza EducationalFeedbackView
(Alerta pedagógica, detalles del ataque y consejos preventivos)
```
