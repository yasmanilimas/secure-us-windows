/**
 * MrGlass Manufacturing Proxy Server
 *
 * Autentica en mrglassmanufacturing.herokuapp.com, crea un ítem temporal
 * en el quote, lee el precio real y lo elimina. Devuelve el precio wholesale
 * (costo al contratista) al frontend.
 *
 * Setup:
 *   cd server
 *   npm install
 *   cp .env.example .env     ← poner MG_EMAIL y MG_PASSWORD
 *   node proxy.js            ← corre en http://localhost:3001
 */
require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const cors    = require('cors');

const app      = express();
const BASE_URL = 'https://mrglassmanufacturing.herokuapp.com';
const QUOTE_ID = '722779';

app.use(cors({ origin: true }));
app.use(express.json());

// ─── Manejo de sesión ────────────────────────────────────────────────────────
let _session     = { cookie: '', csrfToken: '', expiresAt: 0 };
let _loginPromise = null;

function extractCookies(headers) {
  const raw = headers.raw?.()?.['set-cookie'];
  if (!raw || !raw.length) return '';
  return raw.map(c => c.split(';')[0]).join('; ');
}

function mergeCookies(existing, incoming) {
  const map = new Map();
  for (const c of [...existing.split('; '), ...incoming.split('; ')]) {
    const eq = c.indexOf('=');
    if (eq > 0) map.set(c.slice(0, eq).trim(), c.slice(eq + 1).trim());
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

function extractCsrf(html) {
  const m = html.match(/name="authenticity_token" value="([^"]+)"/)
         || html.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"/i)
         || html.match(/<meta[^>]+content="([^"]+)"[^>]*name="csrf-token"/i);
  return m ? m[1] : '';
}

async function login() {
  if (!process.env.MG_EMAIL || !process.env.MG_PASSWORD) {
    throw new Error('MG_EMAIL y MG_PASSWORD deben estar en server/.env');
  }

  // Paso 1: GET /login → cookie inicial + CSRF
  const pageRes  = await fetch(`${BASE_URL}/login`);
  const pageHtml = await pageRes.text();
  const pageCsrf    = extractCsrf(pageHtml);
  const pageCookies = extractCookies(pageRes.headers);

  // Paso 2: POST credenciales (campos: client[email], client[password])
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method:   'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie':        pageCookies,
    },
    body: new URLSearchParams({
      'client[email]':      process.env.MG_EMAIL,
      'client[password]':   process.env.MG_PASSWORD,
      'authenticity_token': pageCsrf,
      'commit':             'Log in',
    }).toString(),
  });

  const sessionCookies = extractCookies(loginRes.headers) || pageCookies;

  // Paso 3: Navegar al quote para obtener CSRF autenticado
  // (el redirect post-login va a '/', pero necesitamos el CSRF del quote)
  const fullRedirect = `${BASE_URL}/quotes/${QUOTE_ID}`;

  const authRes  = await fetch(fullRedirect, { headers: { 'Cookie': sessionCookies } });
  const authHtml = await authRes.text();
  const authCsrf = extractCsrf(authHtml);

  if (!authCsrf) {
    throw new Error('Login fallido: no se encontró CSRF token. Verifica MG_EMAIL y MG_PASSWORD.');
  }

  const redirectCookies = extractCookies(authRes.headers);
  const finalCookies    = redirectCookies
    ? mergeCookies(sessionCookies, redirectCookies)
    : sessionCookies;

  _session = {
    cookie:    finalCookies,
    csrfToken: authCsrf,
    expiresAt: Date.now() + 25 * 60_000,
  };
  console.log('[proxy] Login exitoso — sesión válida 25 minutos');
  return _session;
}

async function getSession() {
  if (_session.cookie && _session.csrfToken && Date.now() < _session.expiresAt) {
    return _session;
  }
  if (!_loginPromise) {
    _loginPromise = login().finally(() => { _loginPromise = null; });
  }
  return _loginPromise;
}

// ─── Mapeos de producto y color ───────────────────────────────────────────────
const SERIES_MAP = {
  MG200:  'mg200s',
  MG300:  'mg300s',
  MG400:  'mg400s',
  MG450:  'mg450s',
  MG600:  'mg600s',
  MG1000: 'mg1000s',
  MG1500: 'mg1500s',
  MG3000: 'mg3000s',
};

// Claves internas → valores que usa el formulario de MrGlass
const FRAME_COLOR_API = {
  white_2605:     'White 2605',
  white:          'White',
  gray_2605:      'White 2605',      // más cercano disponible
  black_matte:    'Black Matte',
  bronze_2605:    'Bronze 2605',
  clear_anodized: 'Clear Anodized',
  arcadia_silver: 'Arcadia Silver',
  bronze_pc:      'Bronze Powdercoat',
  charcoal:       'MG Charcoal',
  texture_black:  'Texture Black',
  wg_java:        'Wood Grain Java',
  wg_walnut:      'Wood Grain Dark Walnut',
};

// ─── Endpoints ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    sessionActive:    Date.now() < _session.expiresAt,
    sessionExpiresIn: `${Math.max(0, Math.round((_session.expiresAt - Date.now()) / 1000))}s`,
  });
});

app.post('/api/mrprice', async (req, res) => {
  const { productCode, widthInches, heightInches, frameColor, windZone, glassType } = req.body;

  const series = SERIES_MAP[productCode];
  if (!series) {
    return res.status(400).json({ error: `Producto no soportado: ${productCode}` });
  }

  let session;
  try {
    session = await getSession();
  } catch (err) {
    return res.status(503).json({ error: `Autenticación fallida: ${err.message}` });
  }

  const prefix  = series.slice(0, -1);                        // 'mg200s' → 'mg200'
  const mgColor = FRAME_COLOR_API[frameColor] || 'White 2605';
  const addComp = glassType === 'insulated_laminated' ? '3/16' : '1/8';

  // Para Zone 5 pedimos Zone 4 a la API y multiplicamos × 1.10 después
  const apiZone = windZone === 'zone_5' ? 'zone_4' : windZone; // 'zone_2', 'zone_3' o 'zone_4'

  const body = new URLSearchParams({
    [`${prefix}[width]`]:                        String(widthInches),
    [`${prefix}[height]`]:                       String(heightInches),
    [`${prefix}[mark_attributes][frame_color]`]: mgColor,
    [`${prefix}[additional_composition]`]:       addComp,
    [`${prefix}[mark_attributes][${apiZone}]`]:  '1',
    'glass_type':    'Laminated',
    'g_interlayer':  'PVB',
    'g_tint':        'CLEAR',
    'g_low_e':       'NONE',
    'g_supplier':    'CONVENTIONAL',
  });

  try {
    const createRes = await fetch(`${BASE_URL}/quotes/${QUOTE_ID}/${series}`, {
      method: 'POST',
      headers: {
        'Content-Type':     'application/x-www-form-urlencoded',
        'Cookie':           session.cookie,
        'X-CSRF-Token':     session.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept':           'text/javascript, application/javascript',
        'Referer':          `${BASE_URL}/quotes/${QUOTE_ID}`,
      },
      body: body.toString(),
    });

    const jsBody = await createRes.text();

    // Extraer precio del response JS (formato: $550.90)
    const priceMatch = jsBody.match(/\$\s*([\d,]+\.\d{2})/)
                    || jsBody.match(/"price"\s*:\s*"?([\d,]+\.\d{2})"?/i)
                    || jsBody.match(/>\s*\$\s*([\d,]+\.\d{2})\s*</);

    if (!priceMatch) {
      _session.expiresAt = 0; // forzar re-login en próximo intento
      console.error('[proxy] Precio no encontrado. Preview:', jsBody.slice(0, 400));
      return res.status(422).json({
        error: 'Precio no encontrado en respuesta de MrGlass',
        hint:  'Verifica MG_EMAIL y MG_PASSWORD en server/.env',
      });
    }

    const rawPrice = parseFloat(priceMatch[1].replace(/,/g, ''));

    // Extraer ID del ítem para limpieza
    const idMatch = jsBody.match(new RegExp(`/quotes/${QUOTE_ID}/${series}/(\\d+)`))
                 || jsBody.match(/data-id="(\d+)"/)
                 || jsBody.match(/"id"\s*:\s*(\d+)/);
    const itemId = idMatch?.[1] ?? null;

    // Eliminar ítem sin bloquear la respuesta
    if (itemId) {
      setImmediate(() => {
        fetch(`${BASE_URL}/quotes/${QUOTE_ID}/${series}/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Cookie':           session.cookie,
            'X-CSRF-Token':     session.csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept':           'text/javascript, application/javascript',
          },
        }).catch(e => console.warn('[proxy] Limpieza fallida para ítem', itemId, e.message));
      });
    } else {
      console.warn('[proxy] No se pudo extraer el ID del ítem — puede quedar en el quote');
    }

    // Zone 5 = Zone 4 × 1.10
    const price = windZone === 'zone_5'
      ? Math.round(rawPrice * 1.10 * 100) / 100
      : rawPrice;

    res.json({ price, source: 'api' });

  } catch (err) {
    _session.expiresAt = 0;
    console.error('[proxy] Error al consultar MrGlass:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nMrGlass proxy → http://localhost:${PORT}`);
  console.log('POST /api/mrprice   GET /api/health');
  if (!process.env.MG_EMAIL)    console.warn('⚠  MG_EMAIL no configurado en server/.env');
  if (!process.env.MG_PASSWORD) console.warn('⚠  MG_PASSWORD no configurado en server/.env');
});
