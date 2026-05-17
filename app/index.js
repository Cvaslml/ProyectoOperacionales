const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = '/data';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/filesystemdb')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log('MongoDB no disponible:', err.message));

const logSchema = new mongoose.Schema({
  operacion: String,
  detalle: String,
  fecha: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', logSchema);

function renderPage(currentPath, mensaje = '') {
  const relPath = currentPath.replace(DATA_DIR, '') || '/';
  const items = fs.existsSync(currentPath) ? fs.readdirSync(currentPath) : [];

  const filas = items.map(item => {
    const full = path.join(currentPath, item);
    const esDir = fs.statSync(full).isDirectory();
    const esTxt = item.endsWith('.txt');
    const encPath = encodeURIComponent(path.join(relPath, item));

    return `<tr>
      <td>${esDir ? '📁' : '📄'} <strong>${item}</strong></td>
      <td>${esDir ? 'Directorio' : 'Archivo'}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        ${esDir ? `<a href="/cd?p=${encodeURIComponent(path.join(relPath, item))}"><button class="btn-blue">Abrir</button></a>` : ''}
        ${esTxt ? `<a href="/read?p=${encPath}"><button class="btn-gray">Leer</button></a>` : ''}
        ${esTxt ? `<a href="/edit?p=${encPath}"><button class="btn-yellow">Editar</button></a>` : ''}
        <form method="POST" action="/rm">
          <input type="hidden" name="p" value="${encPath}">
          <input type="hidden" name="dir" value="${encodeURIComponent(relPath)}">
          <button type="submit" class="btn-red">Eliminar</button>
        </form>
      </td>
    </tr>`;
  }).join('');

  const partes = relPath.split('/').filter(Boolean);
  const breadcrumb = ['<a href="/cd?p=/" style="color:#58a6ff">~</a>']
    .concat(partes.map((p, i) => {
      const ruta = '/' + partes.slice(0, i + 1).join('/');
      return `<a href="/cd?p=${encodeURIComponent(ruta)}" style="color:#58a6ff">${p}</a>`;
    })).join(' / ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Sistema de Archivos</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: monospace; max-width: 900px; margin: 40px auto; padding: 0 20px; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; }
    h2 { color: #8b949e; font-size: 0.95rem; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 10px; border: 1px solid #30363d; text-align: left; vertical-align: middle; }
    th { background: #161b22; }
    .form-row { display: flex; gap: 10px; margin: 8px 0; }
    input[type=text], textarea { background: #161b22; border: 1px solid #30363d; color: #c9d1d9; padding: 8px; border-radius: 4px; font-family: monospace; }
    input[type=text] { flex: 1; }
    textarea { width: 100%; height: 200px; resize: vertical; margin: 10px 0; }
    button, .btn { border: none; padding: 7px 14px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: 0.9rem; }
    .btn-green { background: #238636; color: white; }
    .btn-green:hover { background: #2ea043; }
    .btn-red { background: #da3633; color: white; }
    .btn-red:hover { background: #f85149; }
    .btn-blue { background: #1f6feb; color: white; }
    .btn-blue:hover { background: #388bfd; }
    .btn-gray { background: #30363d; color: #c9d1d9; }
    .btn-gray:hover { background: #444c56; }
    .btn-yellow { background: #9e6a03; color: white; }
    .btn-yellow:hover { background: #d29922; }
    .badge { background: #1f6feb; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; margin-left: 8px; }
    .breadcrumb { background: #161b22; padding: 8px 12px; border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem; }
    .msg { background: #238636; color: white; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; }
    .section { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
    .section h3 { margin: 0 0 10px 0; color: #8b949e; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    code { background: #0d1117; padding: 2px 6px; border-radius: 3px; color: #79c0ff; }
    a { text-decoration: none; }
  </style>
</head>
<body>
  <h1>Sistema de Archivos Simulado <span class="badge">Docker</span></h1>
  <h2>Contenedor: node-web | Puerto: ${PORT} | Ruta actual: ${DATA_DIR}${relPath}</h2>
  ${mensaje ? `<div class="msg">${mensaje}</div>` : ''}
  <div class="breadcrumb">📂 ${breadcrumb}</div>

  <div class="section">
    <h3>Crear directorio (mkdir)</h3>
    <form method="POST" action="/mkdir" class="form-row">
      <input type="hidden" name="dir" value="${encodeURIComponent(relPath)}">
      <input type="text" name="nombre" placeholder="nombre_directorio">
      <button type="submit" class="btn-green">mkdir</button>
    </form>
  </div>

  <div class="section">
    <h3>Crear archivo (touch)</h3>
    <form method="POST" action="/touch" class="form-row">
      <input type="hidden" name="dir" value="${encodeURIComponent(relPath)}">
      <input type="text" name="nombre" placeholder="archivo.txt">
      <button type="submit" class="btn-green">touch</button>
    </form>
  </div>

  <div class="section">
    <h3>Mover / renombrar archivo (mv)</h3>
    <form method="POST" action="/mv" style="display:flex;gap:10px;flex-wrap:wrap">
      <input type="hidden" name="dir" value="${encodeURIComponent(relPath)}">
      <input type="text" name="origen" placeholder="nombre_actual.txt" style="flex:1;min-width:140px">
      <input type="text" name="destino" placeholder="nombre_nuevo.txt" style="flex:1;min-width:140px">
      <button type="submit" class="btn-yellow">mv</button>
    </form>
  </div>

  <div class="section">
    <h3>Contenido de ${DATA_DIR}${relPath}</h3>
    <table>
      <tr><th>Nombre</th><th>Tipo</th><th>Acciones</th></tr>
      ${relPath !== '/' ? `<tr><td colspan="3"><a href="/cd?p=${encodeURIComponent('/' + partes.slice(0, -1).join('/'))}">⬆ ..</a></td></tr>` : ''}
      ${filas || '<tr><td colspan="3">(vacío)</td></tr>'}
    </table>
  </div>

  <a href="/logs" style="color:#58a6ff">📋 Ver log de operaciones en MongoDB →</a>

  <div class="section" style="margin-top:24px">
    <h3>Comandos disponibles</h3>
    <table>
      <tr><th>Comando</th><th>Acción</th><th>Cómo usarlo en la web</th></tr>
      <tr><td><code>mkdir</code></td><td>Crear un directorio</td><td>Sección "Crear directorio" → escribir nombre → botón mkdir</td></tr>
      <tr><td><code>touch</code></td><td>Crear un archivo vacío</td><td>Sección "Crear archivo" → escribir nombre.txt → botón touch</td></tr>
      <tr><td><code>ls</code></td><td>Listar contenido del directorio</td><td>Tabla "Contenido de /data" — se actualiza automáticamente</td></tr>
      <tr><td><code>cd</code></td><td>Navegar entre directorios</td><td>Botón Abrir en cualquier directorio de la tabla</td></tr>
      <tr><td><code>cd ..</code></td><td>Volver al directorio anterior</td><td>Enlace ⬆ .. en la tabla, o el breadcrumb superior</td></tr>
      <tr><td><code>read</code></td><td>Leer contenido de un archivo .txt</td><td>Botón Leer junto al archivo</td></tr>
      <tr><td><code>edit</code></td><td>Editar un archivo .txt</td><td>Botón Editar → modificar → botón Guardar</td></tr>
      <tr><td><code>mv</code></td><td>Mover o renombrar un archivo</td><td>Sección "Mover / renombrar" → origen y destino → botón mv</td></tr>
      <tr><td><code>rm</code></td><td>Eliminar archivo o directorio</td><td>Botón Eliminar junto al elemento en la tabla</td></tr>
    </table>
  </div>
</body>
</html>`;
}

app.get('/', (req, res) => res.redirect('/cd?p=/'));

app.get('/cd', (req, res) => {
  const rel = decodeURIComponent(req.query.p || '/');
  const full = path.join(DATA_DIR, rel);
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    res.send(renderPage(full));
  } else {
    res.redirect('/cd?p=/');
  }
});

app.post('/mkdir', async (req, res) => {
  const dir = decodeURIComponent(req.body.dir || '/');
  const full = path.join(DATA_DIR, dir, req.body.nombre);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    await Log.create({ operacion: 'mkdir', detalle: req.body.nombre }).catch(() => {});
  }
  res.redirect(`/cd?p=${encodeURIComponent(dir)}`);
});

app.post('/touch', async (req, res) => {
  const dir = decodeURIComponent(req.body.dir || '/');
  const full = path.join(DATA_DIR, dir, req.body.nombre);
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, '');
    await Log.create({ operacion: 'touch', detalle: req.body.nombre }).catch(() => {});
  }
  res.redirect(`/cd?p=${encodeURIComponent(dir)}`);
});

app.post('/rm', async (req, res) => {
  const dir = decodeURIComponent(req.body.dir || '/');
  const full = path.join(DATA_DIR, decodeURIComponent(req.body.p));
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true });
    await Log.create({ operacion: 'rm', detalle: req.body.p }).catch(() => {});
  }
  res.redirect(`/cd?p=${encodeURIComponent(dir)}`);
});

app.post('/mv', async (req, res) => {
  const dir = decodeURIComponent(req.body.dir || '/');
  const origen = path.join(DATA_DIR, dir, req.body.origen);
  const destino = path.join(DATA_DIR, dir, req.body.destino);
  if (fs.existsSync(origen)) {
    fs.renameSync(origen, destino);
    await Log.create({ operacion: 'mv', detalle: `${req.body.origen} -> ${req.body.destino}` }).catch(() => {});
  }
  res.redirect(`/cd?p=${encodeURIComponent(dir)}`);
});

app.get('/read', (req, res) => {
  const rel = decodeURIComponent(req.query.p);
  const full = path.join(DATA_DIR, rel);
  const contenido = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '(vacio)';
  const nombre = path.basename(full);
  const dir = encodeURIComponent('/' + rel.split('/').slice(1, -1).join('/'));
  res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Leer - ${nombre}</title>
  <style>body{font-family:monospace;max-width:800px;margin:40px auto;padding:0 20px;background:#0d1117;color:#c9d1d9;}
  pre{background:#161b22;border:1px solid #30363d;padding:16px;border-radius:6px;white-space:pre-wrap;word-break:break-word;}
  a{color:#58a6ff;}</style></head><body>
  <h2>read: ${nombre}</h2>
  <a href="/cd?p=${dir}">← Volver</a> &nbsp; <a href="/edit?p=${encodeURIComponent(rel)}">Editar</a>
  <pre>${contenido || '(archivo vacio)'}</pre>
  </body></html>`);
});

app.get('/edit', (req, res) => {
  const rel = decodeURIComponent(req.query.p);
  const full = path.join(DATA_DIR, rel);
  const contenido = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  const nombre = path.basename(full);
  const dir = encodeURIComponent('/' + rel.split('/').slice(1, -1).join('/'));
  res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Editar - ${nombre}</title>
  <style>body{font-family:monospace;max-width:800px;margin:40px auto;padding:0 20px;background:#0d1117;color:#c9d1d9;}
  textarea{width:100%;height:300px;background:#161b22;border:1px solid #30363d;color:#c9d1d9;padding:12px;border-radius:6px;font-family:monospace;font-size:0.95rem;resize:vertical;}
  button{background:#238636;color:white;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-family:monospace;}
  button:hover{background:#2ea043;} a{color:#58a6ff;}</style></head><body>
  <h2>edit: ${nombre}</h2>
  <a href="/cd?p=${dir}">← Volver sin guardar</a>
  <form method="POST" action="/edit">
    <input type="hidden" name="p" value="${encodeURIComponent(rel)}">
    <input type="hidden" name="dir" value="${dir}">
    <textarea name="contenido">${contenido}</textarea><br>
    <button type="submit">Guardar</button>
  </form>
  </body></html>`);
});

app.post('/edit', async (req, res) => {
  const rel = decodeURIComponent(req.body.p);
  const full = path.join(DATA_DIR, rel);
  const dir = decodeURIComponent(req.body.dir || '/');
  fs.writeFileSync(full, req.body.contenido);
  await Log.create({ operacion: 'edit', detalle: path.basename(full) }).catch(() => {});
  res.redirect(`/cd?p=${encodeURIComponent(dir)}`);
});

app.get('/logs', async (req, res) => {
  const logs = await Log.find().sort({ fecha: -1 }).limit(50).catch(() => []);
  const filas = logs.map(l =>
    `<tr><td>${l.operacion}</td><td>${l.detalle}</td><td>${new Date(l.fecha).toLocaleString()}</td></tr>`
  ).join('');
  res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Logs</title>
  <style>body{font-family:monospace;max-width:800px;margin:40px auto;background:#0d1117;color:#c9d1d9;padding:0 20px;}
  table{width:100%;border-collapse:collapse;}th,td{padding:10px;border:1px solid #30363d;}th{background:#161b22;}
  a{color:#58a6ff;}</style></head><body>
  <h1>Log de operaciones - MongoDB</h1>
  <a href="/">← Volver</a>
  <table><tr><th>Operacion</th><th>Detalle</th><th>Fecha</th></tr>
  ${filas || '<tr><td colspan="3">Sin registros aun</td></tr>'}
  </table></body></html>`);
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
