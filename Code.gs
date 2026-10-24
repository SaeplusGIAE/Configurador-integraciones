/**
 * Configurador de Integración SmartOLT – SaePLUS
 * Recibe los archivos desde la página y los envía por correo con plantilla SaePLUS.
 *
 * CONFIGURACIÓN (solo editar estas 3 líneas):
 */
var DESTINATARIOS = 'francisco.jimenez@saeplus.com'; // varios: 'a@saeplus.com,b@saeplus.com'
var TOKEN = 'SAE*2027#';                      // debe ser igual al TOKEN de index.html
var COPIA = 'soporte7.saeplus@gmail.com';                                         // opcional: correo en copia (CC)

var COLORES = { navy: '#0d2b52', navy2: '#16406f', azul: '#1f6fc4', cielo: '#8fc4e8', fondo: '#eef2f7', texto: '#1c2b3a', gris: '#6b7c8f', linea: '#e2e8f0' };

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || d.token !== TOKEN) return salida({ ok: false, error: 'No autorizado' });
    if (!d.files || !d.files.length) return salida({ ok: false, error: 'Sin archivos' });

    var adjuntos = d.files.map(function (f) {
      return Utilities.newBlob(Utilities.base64Decode(f.b64), f.type || 'application/octet-stream', f.name);
    });
    var opciones = { htmlBody: plantilla(d), attachments: adjuntos, name: 'SaePLUS · Integraciones' };
    if (d.logo) opciones.inlineImages = { logo: Utilities.newBlob(Utilities.base64Decode(d.logo), 'image/png', 'logo.png') };
    if (COPIA) opciones.cc = COPIA;

    GmailApp.sendEmail(DESTINATARIOS, 'Configurador integración SmartOLT - ' + (d.empresa || ''), textoPlano(d), opciones);
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

function doGet() { return salida({ ok: true, servicio: 'Configurador SmartOLT – SaePLUS' }); }

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textoPlano(d) {
  var r = d.resumen || [];
  return 'Configuración de la integración SaePLUS – SmartOLT terminada.\n\n' +
    r.map(function (x) { return x[0] + ': ' + x[1]; }).join('\n') +
    '\n\nAdjuntos:\n' + d.files.map(function (f) { return '- ' + f.name; }).join('\n');
}

function plantilla(d) {
  var C = COLORES;
  var filas = (d.resumen || []).map(function (x, i) {
    return '<tr><td style="padding:11px 16px;background:' + (i % 2 ? '#ffffff' : '#f6f9fc') + ';border-bottom:1px solid ' + C.linea + ';color:' + C.gris + ';font-size:13px;width:38%">' + esc(x[0]) + '</td>' +
           '<td style="padding:11px 16px;background:' + (i % 2 ? '#ffffff' : '#f6f9fc') + ';border-bottom:1px solid ' + C.linea + ';color:' + C.texto + ';font-size:14px;font-weight:600">' + esc(x[1]) + '</td></tr>';
  }).join('');
  var archivos = d.files.map(function (f) {
    var ext = (f.name.split('.').pop() || '').toUpperCase();
    return '<tr><td style="padding:8px 0"><span style="display:inline-block;min-width:42px;text-align:center;background:' + C.azul + ';color:#fff;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;margin-right:10px">' + esc(ext) + '</span>' +
           '<span style="color:' + C.texto + ';font-size:14px">' + esc(f.name) + '</span></td></tr>';
  }).join('');
  var logo = d.logo ? '<img src="cid:logo" width="46" height="46" alt="SaePLUS" style="display:block;border-radius:10px;background:#fff;padding:3px">' : '';

  return '<!doctype html><html><body style="margin:0;padding:0;background:' + C.fondo + ';font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.fondo + ';padding:24px 12px"><tr><td align="center">' +
  '<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(16,42,76,.12)">' +
    // Encabezado
    '<tr><td style="background:' + C.navy + ';background-image:linear-gradient(100deg,' + C.navy + ',' + C.navy2 + ');padding:24px 28px">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
      '<td width="60" valign="middle">' + logo + '</td>' +
      '<td valign="middle" style="padding-left:6px"><div style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.25">Integración SmartOLT lista</div>' +
      '<div style="color:' + C.cielo + ';font-size:13px;margin-top:3px">Configurador generado · SaePLUS Integraciones</div></td>' +
      '</tr></table></td></tr>' +
    '<tr><td style="height:4px;background:' + C.azul + ';font-size:0;line-height:0">&nbsp;</td></tr>' +
    // Saludo
    '<tr><td style="padding:26px 28px 6px;color:' + C.texto + ';font-size:15px;line-height:1.55">' +
      'Se terminó el diligenciamiento del configurador de la empresa <b style="color:' + C.navy + '">' + esc(d.empresa) + '</b>. ' +
      'Adjuntamos los archivos para configurar la integración y actualizar el NAME en SmartOLT.</td></tr>' +
    // Resumen
    '<tr><td style="padding:16px 28px 4px"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:' + C.azul + ';font-weight:700;margin-bottom:8px">Resumen</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' + C.linea + ';border-radius:10px;overflow:hidden;border-collapse:separate">' + filas + '</table></td></tr>' +
    // Adjuntos
    '<tr><td style="padding:20px 28px 6px"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:' + C.azul + ';font-weight:700;margin-bottom:6px">Archivos adjuntos</div>' +
      '<table role="presentation" cellpadding="0" cellspacing="0">' + archivos + '</table></td></tr>' +
    // Pasos
    '<tr><td style="padding:18px 28px 26px"><div style="background:' + C.fondo + ';border-radius:10px;padding:14px 16px;color:' + C.texto + ';font-size:13px;line-height:1.6">' +
      '<b>Qué sigue:</b> 1) Configurar SaePLUS con las hojas del Excel. 2) Subir el CSV a SmartOLT (Reports → Import). 3) Auditar que todos los clientes crucen.</div></td></tr>' +
    // Pie
    '<tr><td style="background:' + C.navy + ';padding:16px 28px;color:' + C.cielo + ';font-size:12px;line-height:1.6;text-align:center">' +
      'Corporación Saeplus S.A.S. · <span style="color:#ffffff">www.saeplus.com</span> · PBX: +60 (1) 8418160<br>Calle 93B # 13-30 oficina 304 · Edificio Centro Empresarial 2 · Bogotá D.C</td></tr>' +
  '</table></td></tr></table></body></html>';
}

/** Prueba manual: ejecútela una vez desde el editor para autorizar permisos de Gmail. */
function probarEnvio() {
  var d = { empresa: 'Empresa de prueba', resumen: [['Contacto', 'Prueba'], ['OLTs', '1']], files: [{ name: 'prueba.txt', type: 'text/plain', b64: Utilities.base64Encode('hola') }] };
  GmailApp.sendEmail(DESTINATARIOS, 'Prueba configurador SmartOLT', textoPlano(d), { htmlBody: plantilla(d), name: 'SaePLUS · Integraciones' });
}
