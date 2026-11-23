import type {
  ExecutiveSummaryResponse,
  DepartmentMetricItem,
  AttackVectorMetricItem,
  FeaturedUsersResponse,
  AnalyticsDateRangeFilter,
} from '@/types/analytics';

interface GeneratePdfReportOptions {
  companyName: string;
  dateRange: AnalyticsDateRangeFilter;
  summary: ExecutiveSummaryResponse | null;
  departments: DepartmentMetricItem[];
  vectors: AttackVectorMetricItem[];
  featured: FeaturedUsersResponse | null;
}

export function generateExecutivePdfReport(options: GeneratePdfReportOptions): void {
  const { companyName, dateRange, summary, departments, vectors, featured } = options;

  // Filtrar exclusivamente Phishing y Smishing
  const visibleVectors = (vectors || []).filter(
    (v) => v.metodoAtaque === 'phishing' || v.metodoAtaque === 'smishing',
  );

  const formattedDate = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const periodLabel =
    dateRange.desde && dateRange.hasta
      ? `Desde ${dateRange.desde} hasta ${dateRange.hasta}`
      : dateRange.desde
      ? `Desde ${dateRange.desde} en adelante`
      : dateRange.hasta
      ? `Hasta ${dateRange.hasta}`
      : 'Histórico consolidado completo';

  const riskBadgeColor = (level?: string) => {
    switch (level) {
      case 'bajo':
        return 'background:#ECFDF5; color:#047857; border:1px solid #A7F3D0;';
      case 'medio':
        return 'background:#FFFBEB; color:#B45309; border:1px solid #FDE68A;';
      case 'critico':
        return 'background:#FFF1F2; color:#BE123C; border:1px solid #FECDD3;';
      default:
        return 'background:#F8FAFC; color:#475569; border:1px solid #E2E8F0;';
    }
  };

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Ejecutivo - ${companyName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.45;
      font-size: 13px;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #283F50;
      color: #fff;
      padding: 12px 24px;
      margin: -24px -24px 24px -24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .btn {
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      padding: 8px 18px;
      border-radius: 6px;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #E5A93C; color: #283F50; }
    .btn-primary:hover { background: #d49529; }
    .btn-secondary { background: rgba(255,255,255,0.15); color: #fff; margin-left: 8px; }
    .btn-secondary:hover { background: rgba(255,255,255,0.25); }

    .sheet {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 36px 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #283F50;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      background: #E5A93C;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #283F50;
      font-weight: 900;
      font-size: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #283F50;
      letter-spacing: -0.5px;
    }
    .report-meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .report-meta strong {
      font-size: 13px;
      color: #0f172a;
      display: block;
      margin-bottom: 2px;
    }
    .confidential-tag {
      display: inline-block;
      margin-top: 6px;
      background: #FEF3C7;
      color: #92400E;
      font-weight: 700;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #283F50;
      margin: 24px 0 12px 0;
      padding-left: 8px;
      border-left: 4px solid #E5A93C;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #283F50;
      line-height: 1;
    }
    .kpi-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 6px;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 16px;
    }
    th {
      background: #283F50;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .signatures {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-around;
      page-break-inside: avoid;
    }
    .signature-box {
      text-align: center;
      width: 220px;
    }
    .signature-line {
      border-top: 1px solid #475569;
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 28px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }

    @media print {
      body { background: #fff; padding: 0; font-size: 11px; }
      .no-print-bar { display: none !important; }
      .sheet {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .page-break { page-break-before: always; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>Vista previa del Reporte Ejecutivo PDF</strong> — ${companyName}
    </div>
    <div>
      <button class="btn btn-primary" onclick="window.print()">Guardar como PDF / Imprimir</button>
      <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
    </div>
  </div>

  <div class="sheet">
    <!-- Encabezado Principal -->
    <div class="header">
      <div class="brand">
        <div class="brand-icon">PW</div>
        <div>
          <div class="brand-title">PhishWarden</div>
          <p style="font-size: 11px; color: #64748b; font-weight: 500;">
            Plataforma de Simulación de Ciberseguridad y Riesgo Humano
          </p>
        </div>
      </div>
      <div class="report-meta">
        <strong>${companyName}</strong>
        <span>Periodo: ${periodLabel}</span><br>
        <span>Generado el: ${formattedDate}</span><br>
        <span class="confidential-tag">CONFIDENCIAL — INFORME DE DIRECCIÓN</span>
      </div>
    </div>

    <!-- 1. Postura Global y KPIs Clave -->
    <div class="section-title">1. Postura de Riesgo y Resumen Ejecutivo</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Score de Riesgo Global</div>
        <div class="kpi-value">${summary?.posturaRiesgo.scoreRiesgoPromedio ?? 0} <span style="font-size: 13px; font-weight: 500; color: #64748b;">/ 100</span></div>
        <div class="kpi-sub">
          <span class="badge" style="${riskBadgeColor(summary?.posturaRiesgo.nivelRiesgoGlobal)}">
            ${summary?.posturaRiesgo.nivelRiesgoGlobal ?? 'N/A'}
          </span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Adopción Móvil</div>
        <div class="kpi-value">${summary?.adopcionMovil.tasaAdopcion ?? 0}%</div>
        <div class="kpi-sub">
          ${summary?.adopcionMovil.colaboradoresVinculados ?? 0} de ${summary?.adopcionMovil.totalColaboradores ?? 0} vinculados
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Tasa de Clic en Enlaces</div>
        <div class="kpi-value" style="color: #d97706;">${summary?.metricasSimulaciones.tasaClic ?? 0}%</div>
        <div class="kpi-sub">
          Compromiso: ${summary?.metricasSimulaciones.tasaCompromisoCredenciales ?? 0}%
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Capacitación y Éxito</div>
        <div class="kpi-value" style="color: #059669;">${summary?.metricasCapacitacion.tasaAprobacion ?? 0}%</div>
        <div class="kpi-sub">
          ${summary?.metricasCapacitacion.totalLeccionesCompletadas ?? 0} lecciones aprobadas
        </div>
      </div>
    </div>

    <!-- 2. Vectores de Ataque Principales (Phishing y Smishing únicamente) -->
    <div class="section-title">2. Vulnerabilidad por Vector de Ataque (Phishing y Smishing)</div>
    <table>
      <thead>
        <tr>
          <th>Canal de Simulación</th>
          <th class="text-center">Envíos Totales</th>
          <th class="text-center">Clics Registrados</th>
          <th class="text-center">Credenciales Comprometidas</th>
          <th class="text-center">Tasa de Clic</th>
          <th class="text-center">Tasa de Compromiso</th>
        </tr>
      </thead>
      <tbody>
        ${
          visibleVectors.length > 0
            ? visibleVectors
                .map(
                  (v) => `
          <tr>
            <td><strong>${v.metodoAtaque === 'phishing' ? 'Correo Electrónico (Phishing)' : 'Mensajería SMS (Smishing)'}</strong></td>
            <td class="text-center">${v.totalEnvios}</td>
            <td class="text-center" style="color: #d97706; font-weight: 600;">${v.totalClics}</td>
            <td class="text-center" style="color: #e11d48; font-weight: 600;">${v.totalEnviosCredenciales}</td>
            <td class="text-center font-bold">${v.tasaClic}%</td>
            <td class="text-center font-bold" style="color: #e11d48;">${v.tasaCompromiso}%</td>
          </tr>`,
                )
                .join('')
            : '<tr><td colspan="6" class="text-center" style="color:#94a3b8;">Sin datos en el periodo.</td></tr>'
        }
      </tbody>
    </table>

    <!-- 3. Desglose Departamental -->
    <div class="section-title">3. Comparativa de Riesgo por Departamento</div>
    <table>
      <thead>
        <tr>
          <th>Área / Departamento</th>
          <th class="text-center">Colaboradores</th>
          <th class="text-center">Score Promedio</th>
          <th class="text-center">Nivel</th>
          <th class="text-center">Simulaciones</th>
          <th class="text-center">Clics</th>
          <th class="text-center">Credenciales</th>
          <th class="text-center">Vulnerabilidad</th>
          <th class="text-center">Reportes</th>
          <th class="text-center">Capacitados</th>
        </tr>
      </thead>
      <tbody>
        ${
          departments.length > 0
            ? departments
                .map(
                  (d) => `
          <tr>
            <td><strong>${d.departamento || 'Sin departamento'}</strong></td>
            <td class="text-center">${d.totalColaboradores}</td>
            <td class="text-center" style="font-weight: 700;">${d.scoreRiesgoPromedio}</td>
            <td class="text-center">
              <span class="badge" style="${riskBadgeColor(d.nivelRiesgo)}">${d.nivelRiesgo}</span>
            </td>
            <td class="text-center">${d.simulacionesRecibidas}</td>
            <td class="text-center" style="color:#d97706;">${d.clicsEnSimulacion}</td>
            <td class="text-center" style="color:#e11d48;">${d.credencialesComprometidas}</td>
            <td class="text-center font-bold" style="color:${d.tasaVulnerabilidad > 20 ? '#e11d48' : '#059669'};">${d.tasaVulnerabilidad}%</td>
            <td class="text-center" style="color:#059669; font-weight:600;">${d.reportesRealizados}</td>
            <td class="text-center">${d.leccionesCompletadas}</td>
          </tr>`,
                )
                .join('')
            : '<tr><td colspan="10" class="text-center" style="color:#94a3b8;">Sin departamentos evaluados.</td></tr>'
        }
      </tbody>
    </table>

    <!-- 4. Colaboradores Destacados -->
    <div class="section-title">4. Cuadro de Colaboradores Clave (Top 5)</div>
    <div class="two-col-grid">
      <div>
        <div style="font-weight: 700; color: #be123c; margin-bottom: 8px; font-size: 11px; text-transform: uppercase;">
          Intervención Prioritaria (Mayor Riesgo)
        </div>
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th class="text-center">Área</th>
              <th class="text-center">Fallos</th>
              <th class="text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            ${
              featured?.mayorRiesgo && featured.mayorRiesgo.length > 0
                ? featured.mayorRiesgo
                    .map(
                      (u) => `
              <tr>
                <td><strong>${u.nombre}</strong><br><span style="color:#64748b; font-size:9px;">${u.correo}</span></td>
                <td class="text-center">${u.departamento}</td>
                <td class="text-center" style="color:#e11d48; font-weight:700;">${u.simulacionesFallidas}</td>
                <td class="text-center font-bold">${u.scoreRiesgo}</td>
              </tr>`,
                    )
                    .join('')
                : '<tr><td colspan="4" class="text-center" style="color:#94a3b8;">Sin incidentes críticos.</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <div>
        <div style="font-weight: 700; color: #047857; margin-bottom: 8px; font-size: 11px; text-transform: uppercase;">
          Líderes de Seguridad (Mejores Defensores)
        </div>
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th class="text-center">Puntos</th>
              <th class="text-center">Reportes</th>
              <th class="text-center">Racha</th>
            </tr>
          </thead>
          <tbody>
            ${
              featured?.mejoresDefensores && featured.mejoresDefensores.length > 0
                ? featured.mejoresDefensores
                    .map(
                      (u) => `
              <tr>
                <td><strong>${u.nombre}</strong><br><span style="color:#64748b; font-size:9px;">${u.correo}</span></td>
                <td class="text-center" style="color:#d97706; font-weight:700;">${u.puntosCapacitacion}</td>
                <td class="text-center" style="color:#059669; font-weight:700;">${u.reportesRealizados}</td>
                <td class="text-center font-bold">${u.rachaDiasSeguros}d</td>
              </tr>`,
                    )
                    .join('')
                : '<tr><td colspan="4" class="text-center" style="color:#94a3b8;">Sin datos de líderes.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Firmas y Validaciones -->
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong style="color: #283F50;">Dirección de Ciberseguridad</strong>
        <p style="font-size: 10px; color: #64748b;">Responsable de Seguridad de la Información</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong style="color: #283F50;">Auditoría Interna / TI</strong>
        <p style="font-size: 10px; color: #64748b;">Revisión y Cumplimiento Normativo</p>
      </div>
    </div>

    <div class="footer">
      Documento generado automáticamente por PhishWarden Platform • Cumplimiento Zero-Credential & ISO 27001 • Todos los derechos reservados.
    </div>
  </div>

  <script>
    window.onload = function() {
      // Dispara automáticamente el cuadro de impresión para Guardar como PDF
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Por favor permite abrir ventanas emergentes para generar el reporte en PDF.');
  }
}
