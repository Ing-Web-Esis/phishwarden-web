# Fase 5B (Web): Vista General en Vivo, Configuración y Centro de Ayuda Funcional

## Objetivo

Completar al 100% la funcionalidad del panel administrativo web (`phishwarden-web-tl/`) conectando **Vista general** (`/dashboard`), **Configuración** (`/dashboard/configuracion`) y **Centro de ayuda** (`/dashboard/ayuda`) con datos reales del backend (`phishwarden-backend-nj/`), eliminando cualquier dato estático de maqueta.

## Alcance

### Incluido

1. **Identidad Dinámica en Layout (`/dashboard/layout.tsx`):**
   - Mostrar el nombre real de la empresa autenticado en el selector superior del sidebar (reemplazando cualquier texto fijo) y sus iniciales dinámicas.
   - Mostrar el nombre, correo y rol real del administrador en el bloque inferior del sidebar.

2. **Vista General 100% Funcional (`/dashboard/page.tsx`):**
   - **Saludo dinámico:** `Buenos días/tardes/noches, <Nombre real del administrador>` según la hora local.
   - **4 Tarjetas KPI conectadas a APIs reales:**
     1. **Riesgo Global (`scoreRiesgoPromedio`):** Valor real de `/analytics/resumen` (`0` = seguro a `100` = crítico), badge de nivel (`Bajo`, `Medio`, `Crítico`) y variación porcentual calculada frente al mes anterior desde `/analytics/evolucion`.
     2. **Usuarios Evaluados (`totalColaboradores`):** Total real de colaboradores activos desde `/analytics/resumen`, indicando cuántos ya tienen vinculada la app móvil (`colaboradoresVinculados`).
     3. **Campañas Activas:** Conteo real desde `/empresas/:empresaId/campanas` filtrando campañas en estado `en_curso` y `programada`.
     4. **Incidentes y Reportes:** Conteo real de interacciones vulnerables (`totalClics + totalEnviosCredenciales`) y reportes sospechosos (`totalReportes`) desde `/analytics/resumen`.
   - **Gráfica "Evolución del riesgo" (Recharts AreaChart/LineChart):**
     - Conectada a `/empresas/:empresaId/analytics/evolucion` con selector funcional (`Últimos 6 meses` / `Últimos 3 meses`), graficando la tendencia real mensual.
   - **Gráfica "Nivel de vulnerabilidad — Distribución actual" (Recharts PieChart Donut):**
     - Conectada a `posturaRiesgo.distribucion` (`bajo`: 0–30, `medio`: 31–69, `critico`: 70–100) con el total real de usuarios activos en el centro del anillo y porcentajes calculados dinámicamente.
   - **Resumen rápido inferior:** Últimas campañas recientes con acceso directo a `/dashboard/campanas` y `/dashboard/reportes`.

3. **Configuración 100% Funcional (`/dashboard/configuracion/page.tsx`):**
   - **Sección 1 — Datos de la Organización:**
     - Visualización y edición real de los datos de la empresa (`nombre`, `dominio_corporativo` / configuración disponible en backend).
     - Gestión del **Código de Acceso Móvil (`codigo_acceso`)**: botón para copiar con feedback visual y opción para regenerar un nuevo código en base de datos (con diálogo de confirmación).
   - **Sección 2 — Perfil y Seguridad del Administrador:**
     - Visualización/edición del nombre del administrador autenticado y cambio de contraseña validado contra el backend.
   - **Sección 3 — Estado de Integraciones de la Plataforma:**
     - Indicadores reales de estado: motor de simulación/tracking, estado de vinculación móvil (`colaboradoresVinculados / totalColaboradores`) y enlace directo a reportes ejecutivos.
   - *(Si el backend no expone aún algún endpoint de actualización como `PATCH /empresas/:empresaId`, `POST /empresas/:empresaId/regenerar-codigo` o `PATCH /auth/perfil`, implementarlos limpiamente en `phishwarden-backend-nj/` siguiendo arquitectura hexagonal y `JwtAuthGuard` + `CompanyTenantGuard`).*

4. **Centro de Ayuda 100% Funcional (`/dashboard/ayuda/page.tsx`):**
   - **Buscador en tiempo real:** Filtra artículos, guías paso a paso y preguntas frecuentes por palabra clave y categoría (`Campañas`, `Portales Simulados`, `App Móvil y FCM`, `Riesgo y Microlecciones`).
   - **Guías Operativas Detalladas:** Explicación clara del flujo completo de PhishWarden (lanzamiento de campañas, variables de plantillas, cálculo del score de riesgo `0–100`, asignación reactiva de microlecciones y ranking).
   - **Plantilla de Incorporación Móvil Lista para Copiar:** Genera dinámicamente el instructivo de instalación/vinculación con el **nombre real de la empresa** y su **`codigo_acceso` real** para que el administrador lo envíe a sus colaboradores con un clic.
   - **Verificador de Estado del Sistema en Vivo:** Ejecuta una comprobación real contra la API del backend midiendo latencia (`ms`) y disponibilidad de servicios.

## Reglas de Diseño y Arquitectura

1. **Cero Emojis:** Usar exclusivamente iconografía vectorial de `lucide-react`[cite: 5].
2. **Escala Coherente de Riesgo (`0` a `100`):** `0–30` Bajo (esmeralda), `31–69` Medio (ámbar), `70–100` Crítico (rojo).
3. **Sin `npm install` ni comandos interactivos.**

## Criterios de Aceptación

- Ningún valor hardcodeado en `/dashboard` (`Vista general`); todas las tarjetas y gráficas responden a datos reales del tenant.
- `/dashboard/configuracion` permite editar datos reales, copiar/regenerar `codigo_acceso` y actualizar credenciales del administrador.
- `/dashboard/ayuda` ofrece búsqueda funcional, guías reales, plantilla dinámica con `codigo_acceso` y verificación en vivo de la API.
- `npm run build` finaliza con **0 errores** tanto en `phishwarden-web-tl/` como en `phishwarden-backend-nj/` (si se añaden endpoints de configuración).