/**
 * HANGAR · Backend en Google Apps Script
 * Pégalo en: tu Google Sheet → Extensiones → Apps Script
 * Luego: Implementar → Nueva implementación → Aplicación web
 *   - Ejecutar como: Yo
 *   - Quién tiene acceso: Cualquier persona
 */
const CLAVE = 'LuiguiZapataojeda09';   // <- cámbiala por una clave larga y propia
const HOJA = 'Proyectos';
const CARPETA = 'HANGAR_imagenes';   // carpeta de Drive para las imágenes de referencia
const COLS = ['id','name','url','desc','type','status','tags','tech','notes','img','fav','opens','last','created','updated'];

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(2, 1, 2000, COLS.length).setNumberFormat('@'); // todo como texto: evita fórmulas y conversiones raras
  }
  return sh;
}

function leer_() {
  const sh = hoja_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getValues()
    .filter(r => r[0] !== '')
    .map(r => {
      const o = {};
      COLS.forEach((c, i) => o[c] = r[i]);
      o.id = String(o.id);
      o.tags = String(o.tags || '').split(',').map(s => s.trim()).filter(Boolean);
      o.fav = String(o.fav) === 'true';
      ['opens', 'last', 'created', 'updated'].forEach(k => o[k] = Number(o[k]) || 0);
      return o;
    });
}

function subirImg_(it) {
  const m = String(it.img).match(/^data:(.+?);base64,(.+)$/);
  if (!m) return '';
  const it2 = DriveApp.getFoldersByName(CARPETA);
  const car = it2.hasNext() ? it2.next() : DriveApp.createFolder(CARPETA);
  const nombre = it.id + '.jpg';
  const viejos = car.getFilesByName(nombre);
  while (viejos.hasNext()) viejos.next().setTrashed(true);
  const f = car.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nombre));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w640';
}

function guardar_(it) {
  const sh = hoja_();
  if (it.img && String(it.img).indexOf('data:') === 0) it.img = subirImg_(it);
  const fila = COLS.map(c => c === 'tags' ? (it.tags || []).join(',') : (it[c] == null ? '' : String(it[c])));
  const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat().map(String);
  const i = ids.indexOf(String(it.id));
  const r = i >= 0 ? i + 2 : Math.max(sh.getLastRow(), 1) + 1;
  sh.getRange(r, 1, 1, COLS.length).setNumberFormat('@').setValues([fila]);
  return { id: it.id, img: it.img || '' };
}

function borrar_(id) {
  const sh = hoja_();
  if (sh.getLastRow() < 2) return;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(String);
  const i = ids.indexOf(String(id));
  if (i >= 0) sh.deleteRow(i + 2);
  const car = DriveApp.getFoldersByName(CARPETA);
  if (car.hasNext()) {
    const fs = car.next().getFilesByName(id + '.jpg');
    while (fs.hasNext()) fs.next().setTrashed(true);
  }
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== CLAVE) return out_({ ok: false, error: 'Clave incorrecta' });
  return out_({ ok: true, items: leer_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.key !== CLAVE) return out_({ ok: false, error: 'Clave incorrecta' });
    if (b.action === 'upsert') return out_({ ok: true, item: guardar_(b.item) });
    if (b.action === 'delete') { borrar_(b.id); return out_({ ok: true }); }
    return out_({ ok: false, error: 'Acción no válida' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
