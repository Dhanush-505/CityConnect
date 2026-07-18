/**
 * Pure JS Exporter Utility for CSV, Excel XML Spreadsheet, and PDF reports.
 */

// Generate CSV string
export const generateCSV = (headers, rows) => {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
};

// Generate Excel XML Spreadsheet (native .xls / .xlsx readable)
export const generateExcelXML = (title, filters, headers, rows) => {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  let filterSummary = Object.entries(filters || {})
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F4C81"/>
  </Style>
  <Style ss:ID="MetaStyle">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F4C81" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataStyle">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="CityConnect Report">
  <Table>
   <Row ss:Height="25">
    <Cell ss:StyleID="TitleStyle"><Data ss:Type="String">${sanitize(title)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaStyle"><Data ss:Type="String">Generated: ${new Date().toLocaleString()} | ${sanitize(filterSummary)}</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row ss:Height="20">
${headers.map((h) => `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitize(h)}</Data></Cell>`).join('\n')}
   </Row>
`;

  rows.forEach((row) => {
    xml += `   <Row ss:Height="18">\n`;
    row.forEach((cell) => {
      xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${sanitize(cell)}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
};

// Generate HTML PDF printable view or text stream payload
export const generatePDFHtml = (title, filters, headers, rows) => {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const filterSummary = Object.entries(filters || {})
    .filter(([_, v]) => v)
    .map(([k, v]) => `<strong>${k}:</strong> ${sanitize(v)}`)
    .join(' &nbsp;|&nbsp; ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitize(title)}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; padding: 24px; margin: 0; }
    .header { border-bottom: 2px solid #0f4c81; padding-bottom: 12px; margin-bottom: 20px; }
    .brand { font-size: 24px; font-weight: 800; color: #0f4c81; margin: 0; }
    .subtitle { font-size: 14px; color: #475569; margin-top: 4px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; borderRadius: 8px; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #0f4c81; color: white; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="brand">CityConnect • Municipal Grievance Report</h1>
    <div class="subtitle">${sanitize(title)}</div>
  </div>

  <div class="meta-box">
    <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
    <div>${filterSummary || 'Filters: All Records'}</div>
    <div><strong>Total Items:</strong> ${rows.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        ${headers.map((h) => `<th>${sanitize(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${sanitize(cell)}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">
    This document was generated automatically by CityConnect Analytics &amp; Reporting Engine.
  </div>
</body>
</html>`;
};
