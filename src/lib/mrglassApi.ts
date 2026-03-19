/**
 * mrglassApi.ts
 *
 * Obtiene precios reales del proxy local (server/proxy.js).
 * Si el proxy no responde, usa las fórmulas exactas de MrGlass como fallback.
 *
 * Todas las fórmulas dan el precio WHOLESALE (costo al contratista) en Zone 4,
 * frame blanco y vidrio laminado. El margin y los impuestos se aplican aparte.
 */

import { type PriceResult, TAX_RATE } from './pricing-config';

const PROXY_URL = 'http://localhost:3001';

// Las fórmulas fueron calibradas con precios que ya incluían 50% de margen del instalador.
// Para obtener el costo wholesale real hay que dividir por (1 + FORMULA_TRAINING_MARGIN).
// buildPriceResult luego aplica el margen configurado en el panel de admin.
const FORMULA_TRAINING_MARGIN = 0.50;

// ─── Fórmulas de fallback (W y H en pies) ────────────────────────────────────
// Precio base calibrado: Zone 4, White 2605, Laminated — CON 50% de margen incluido
const FALLBACK_FORMULAS: Record<string, (w: number, h: number) => number> = {
  MG200: (w, h) =>  86.856 * w + 16.932 * h + 24.30 * w * h -  69.00,
  MG300: (w, h) =>  37.94  * w + 47.62  * h + 20.00 * w * h +   9.90,
  MG400: (w, h) =>  31.38  * w + 31.37  * h + 24.88 * w * h -   3.07,
  MG600: (w, h) =>  68.88  * w + 37.57  * h + 20.40 * w * h + 204.62,
};

// Recargo de color de marco ($/pie lineal de perímetro)
const FRAME_COLOR_SURCHARGE: Record<string, number> = {
  // Sin recargo
  white_2605:     0,
  white:          0,
  // $2.81/ft
  bronze_2605:    2.81,
  black_matte:    2.81,
  clear_anodized: 2.81,
  gray_2605:      2.81,   // estimado (no listado explícitamente)
  // $4.50/ft
  arcadia_silver: 4.50,
  bronze_pc:      4.50,
  charcoal:       4.50,
  // $5.50/ft
  texture_black:  5.50,
  wg_java:        5.50,
  wg_walnut:      5.50,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface MrGlassPriceParams {
  productCode:  string;
  widthInches:  number;
  heightInches: number;
  frameColor:   string;
  windZone:     string;
  glassType:    string;
}

// ─── Llamada al proxy ─────────────────────────────────────────────────────────
/**
 * Consulta el proxy local para obtener el precio wholesale real de MrGlass.
 * Retorna el precio en USD o null si el proxy no está disponible.
 */
export async function fetchMrGlassPrice(params: MrGlassPriceParams): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10 s

    const res = await fetch(`${PROXY_URL}/api/mrprice`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
      signal:  controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json() as { price?: number };
    return typeof data.price === 'number' ? data.price : null;
  } catch {
    return null; // proxy no disponible → usar fallback
  }
}

// ─── Fórmula de fallback ──────────────────────────────────────────────────────
/**
 * Calcula el costo wholesale usando las fórmulas exactas de MrGlass.
 * Incluye ajuste de color de marco y zona.
 * Retorna null si el producto no tiene fórmula (puertas, MG450, etc.).
 */
export function calcFallbackWholesale(
  productCode:  string,
  widthInches:  number,
  heightInches: number,
  frameColor:   string,
  windZone:     string,
): number | null {
  const formula = FALLBACK_FORMULAS[productCode];
  if (!formula) return null;

  const W = widthInches  / 12; // pies
  const H = heightInches / 12;

  // Precio calibrado (Zone 4, White, incluye FORMULA_TRAINING_MARGIN)
  let price = formula(W, H);

  // Recargo de color por pie lineal de perímetro (también ya incluía el margen de entrenamiento)
  const perimeter  = 2 * (W + H);
  const colorExtra = (FRAME_COLOR_SURCHARGE[frameColor] ?? 0) * perimeter * (1 + FORMULA_TRAINING_MARGIN);
  price += colorExtra;

  // Ajuste de zona (la fórmula es Zone 4)
  if (windZone === 'zone_5') {
    price *= 1.10;                       // Zone 5 = Zone 4 × 1.10
  } else if (windZone === 'zone_3') {
    price *= 1.08 / 1.15;               // Zone3/Zone4 = 1.08/1.15
  } else if (windZone === 'zone_2') {
    price /= 1.15;                      // Zone 2 es la base sin ajuste
  }
  // zone_4: sin cambio (la fórmula ya es Zone 4)

  // Extraer el margen de entrenamiento → devolver costo wholesale real
  const wholesale = price / (1 + FORMULA_TRAINING_MARGIN);
  return Math.max(0, wholesale);
}

// ─── Construir PriceResult desde costo wholesale ──────────────────────────────
/**
 * A partir del costo wholesale (de API o fórmula), aplica opciones adicionales,
 * margen del administrador e impuestos para obtener el precio al cliente.
 */
export function buildPriceResult(
  wholesaleCost:     number,
  quantity:          number,
  marginPercentage:  number,
  privacy:           boolean,
  screen:            boolean,
  isWindow:          boolean,
): PriceResult {
  let cost = wholesaleCost;

  // Vidrio privacidad +15%
  if (privacy) cost *= 1.15;

  // Screen para puertas +$95
  if (!isWindow && screen) cost += 95;

  // Aplicar margen del administrador
  const withMargin = cost * (1 + marginPercentage / 100);

  // Precio mínimo
  const minPrice = isWindow ? 180 : 550;
  const unitPrice = Math.round(Math.max(withMargin, minPrice) * 100) / 100;

  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const taxes    = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total    = Math.round((subtotal + taxes) * 100) / 100;

  return { unitPrice, subtotal, taxes, total };
}
