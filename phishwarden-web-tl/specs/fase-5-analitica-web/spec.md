# Fase 5 (Web): Dashboard de Analítica Ejecutiva, Riesgo Organizacional y Reportes

## Objetivo

Implementar en `phishwarden-web-tl/` la vista de analítica ejecutiva y reportes para administradores de cada organización (`empresaId`), consumiendo los endpoints de `/empresas/:empresaId/analytics/*` documentados en `phishwarden-backend-nj/specs/API_CONTRACTS.md`.

## Alcance

### Incluido

1. **Capa de Servicios y Tipos (`src/services/` y `src/types/`):**
   - Tipado estricto en TypeScript para las respuestas de:
     - `GET /empresas/:empresaId/analytics/resumen`
     - `GET /empresas/:empresaId/analytics/departamentos`
     - `GET /empresas/:empresaId/analytics/vectores`
     - `GET /empresas/:empresaId/analytics/evolucion`
     - `GET /empresas/:empresaId/analytics/usuarios-destacados`
     - `GET /empresas/:empresaId/analytics/exportar`
   - Soporte de parámetros opcionales `desde` y `hasta` (`YYYY-MM-DD`).
   - Descarga autenticada del reporte CSV (`Authorization: Bearer <token>`) mediante `Blob` y descarga directa del archivo `reporte-phishwarden-empresa-{empresaId}.csv`.

2. **Vista de Analítica Ejecutiva y Reportes (Dashboard / Módulo Analítica):**
   - **Barra Superior de Controles:**
     - Filtro por rango de fechas (`Desde` y `Hasta`) con validación (`desde <= hasta`) y botón para limpiar filtros.
     - Botón **"Exportar Reporte CSV"** con estado de carga mientras descarga el archivo.
   - **Tarjetas KPI y Postura de Riesgo (`/resumen`):**
     - **Score de Riesgo Promedio (`0` a `100`):** Indicador visual respetando la escala `0 = seguro` y `100 = crítico`, con badge de nivel (`Bajo: 0–30`, `Medio: 31–69`, `Crítico: 70–100`) y barra/distribución de colaboradores por tramo de riesgo.
     - **Adopción App Móvil:** Colaboradores vinculados vs total activos y porcentaje de adopción.
     - **Efectividad de Simulaciones:** Tasa de apertura, tasa de clic, tasa de compromiso de credenciales y tasa de reporte temprano.
     - **Progreso de Capacitación:** Microlecciones completadas, pendientes, reprobadas y tasa de aprobación.
   - **Evolución Temporal Mensual (`/evolucion`):**
     - Visualización comparativa por mes (`YYYY-MM`) de `simulacionesEnviadas`, `incidentesSimulacion`, `reportesSospechosos` y `leccionesCompletadas`.
   - **Riesgo por Departamento (`/departamentos`):**
     - Tabla comparativa ordenada por `scoreRiesgoPromedio` descendente mostrando área (`"Sin departamento"` cuando corresponda), colaboradores, score promedio, badge de nivel de riesgo, tasa de vulnerabilidad (%), reportes realizados y lecciones completadas.
   - **Vulnerabilidad por Vector de Ataque (`/vectores`):**
     - Comparativa entre `phishing`, `smishing`, `vishing` e `ingenieria_social` con envíos, clics, envío de credenciales, `tasaClic` (%) y `tasaCompromiso` (%).
   - **Usuarios Destacados (`/usuarios-destacados`):**
     - Dos paneles paralelos (Top 5):
       - **Intervención Prioritaria (`mayorRiesgo`):** Colaboradores con mayor `scoreRiesgo` y simulaciones fallidas.
       - **Mejores Defensores (`mejoresDefensores`):** Colaboradores con mayor puntaje en capacitación, reportes sospechosos y menor `scoreRiesgo`.

3. **Estados de Interfaz:**
   - Estados de carga (*skeletons* o indicadores limpios), manejo de errores HTTP y estados vacíos claros cuando aún no existan datos en el rango seleccionado.

### Excluido

- **CRUD web de microlecciones o insignias:** Todo el contenido de capacitación es predefinido por plataforma (no debe existir interfaz de creación/edición de lecciones).
- Cambios en el backend (`phishwarden-backend-nj/`) o en la aplicación móvil Flutter.

## Reglas de Diseño y Arquitectura

1. **Interfaz Minimalista y Profesional sin Emojis:** No utilizar emojis en títulos, etiquetas, badges ni alertas; emplear únicamente iconografía vectorial limpia (iconos SVG / librería de iconos ya instalada en el proyecto).
2. **Coherencia Semántica de Riesgo (`0` a `100`):**
   - `0–30` (`bajo`): Verde / esmeralda (postura segura).
   - `31–69` (`medio`): Ámbar / naranja (atención requerida).
   - `70–100` (`critico`): Rojo / carmesí (riesgo crítico).
3. **Sin Instalación de Dependencias Innecesarias:** Reutilizar las librerías de estilos, iconos y gráficas ya presentes en `phishwarden-web-tl/package.json` (o componentes SVG/CSS puros si no hay librería de charts instalada).

## Criterios de Aceptación

- Consumo completo de los 6 endpoints de `/empresas/:empresaId/analytics/*` usando el `empresaId` del usuario autenticado.
- Filtro funcional por rango de fechas (`desde`, `hasta`) y descarga operativa del CSV.
- Escala de riesgo (`0 = seguro`, `100 = crítico`) y estética minimalista sin emojis respetadas en toda la interfaz.
- `npm run build` en `phishwarden-web-tl/` finaliza con **0 errores**.