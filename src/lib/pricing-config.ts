// MrGlass Pricing Configuration
// Calibrated with real MrGlass quote data

export const TAX_RATE = 0.07; // 7% Florida sales tax

// Wind Zones with price adjustments
export const windZones = [
  { key: 'zone_2', name: 'Zone 2', adjustment: 0 },
  { key: 'zone_3', name: 'Zone 3', adjustment: 0.08 },
  { key: 'zone_4', name: 'Zone 4', adjustment: 0.15 },
  { key: 'zone_5', name: 'Zone 5', adjustment: 0.25 },
];

// MrGlass Window Types (MG350 removed - not available)
export const windowTypes = [
  { key: 'MG200_SH', code: 'MG200', name: 'Single Hung' },
  { key: 'MG300_HR', code: 'MG300', name: 'Horizontal Roller' },
  { key: 'MG400_PW', code: 'MG400', name: 'Picture Window' },
  { key: 'MG450_PW', code: 'MG450', name: 'Picture Window Premium' },
  { key: 'MG600_CA', code: 'MG600', name: 'Casement/Awning' },
];

// MrGlass Door Types
export const doorTypes = [
  { key: 'MG1000_SGD', code: 'MG1000', name: 'Sliding Glass Door' },
  { key: 'MG1100_SGD', code: 'MG1100', name: 'SGD MultiTrack' },
  { key: 'MG1500_SGD', code: 'MG1500', name: 'Sliding Glass Door Premium' },
  { key: 'MG3000_FD', code: 'MG3000', name: 'French Door' },
  { key: 'MG3500_FD', code: 'MG3500', name: 'French Door Premium' },
  { key: 'MG4000_PD', code: 'MG4000', name: 'Pivot Door' },
];

// MrGlass Frame Colors with price adjustments (simplified)
export const frameColors = [
  { key: 'white_2605', color: '#FFFFFF', adjustment: 0 },
  { key: 'gray_2605', color: '#808080', adjustment: 0.03 },
  { key: 'black_matte', color: '#1a1a1a', adjustment: 0.06 },
  { key: 'bronze_2605', color: '#6B5344', adjustment: 0.06 },
];

// Glass Types - Simplified: Laminated and Insulated Laminated only
export const glassTypes = [
  { key: 'clear_laminated', name: 'Laminated Glass', adjustment: 0 },
  { key: 'insulated_laminated', name: 'Insulated Laminated Glass', adjustment: 0.15 },
];

// Legacy glass tints for backward compatibility
export const glassTints = {
  basic: [
    { key: 'clear', adjustment: 0 },
    { key: 'gray', adjustment: 0.03 },
    { key: 'bronze_tint', adjustment: 0.03 },
  ],
  green: [
    { key: 'solex_green', adjustment: 0.05 },
    { key: 'blue_green', adjustment: 0.05 },
  ],
  blue: [
    { key: 'azuria', adjustment: 0.05 },
    { key: 'solar_blue', adjustment: 0.06 },
    { key: 'artic_blue', adjustment: 0.06 },
    { key: 'pacific_blue', adjustment: 0.06 },
    { key: 'pacifica_blue', adjustment: 0.06 },
  ],
  special: [
    { key: 'solar_cool_gray', adjustment: 0.08 },
    { key: 'solar_cool_bronze', adjustment: 0.08 },
    { key: 'double_gray', adjustment: 0.07 },
    { key: 'double_bronze', adjustment: 0.07 },
    { key: 'gray_lite_ii', adjustment: 0.06 },
    { key: 'solarcool_azuria', adjustment: 0.08 },
    { key: 'solarcool_pacifica', adjustment: 0.08 },
  ],
};

// All tints flattened for easy lookup
export const allGlassTints = [
  ...glassTints.basic,
  ...glassTints.green,
  ...glassTints.blue,
  ...glassTints.special,
];

// Low-E Options removed - no longer used
export const lowEOptions = [
  { key: 'none', adjustment: 0 },
];

// Door configurations
export const doorConfigurations = ['OX', 'XO', 'OXO', 'OXXO'];

// Window configurations (for specific window types like MG300 HR)
export const windowConfigurations: Record<string, string[]> = {
  'MG300_HR': ['XO', 'OX', 'XOX[1/3][1/3][1/3]', 'XOX[1/4][1/2][1/4]'],
};

// Base price per sqft for each product code (calibrated from MrGlass data)
// Data points:
// - MG200 30x30 (6.25 sqft) Zone 4 = $249.85 -> base ~$34.76/sqft (before zone adjustment)
// - MG200 50x50 (17.36 sqft) Zone 4 = $514.39 -> base ~$25.76/sqft (before zone adjustment)
// - MG300 36x48 (12 sqft) Zone 4 = $367.68 -> base ~$26.64/sqft (before zone adjustment)
export const getBasePricePerSqFt = (sqFt: number, productCode: string): number => {
  // Non-linear pricing: smaller = higher per sqft (handling charges, minimum material)
  
  if (productCode === 'MG200') {
    if (sqFt <= 6) return 34.80;
    if (sqFt <= 8) return 32.00;
    if (sqFt <= 12) return 28.00;
    if (sqFt <= 15) return 26.50;
    return 25.76;
  }
  
  if (productCode === 'MG300') {
    if (sqFt <= 8) return 33.00;
    if (sqFt <= 12) return 26.64;
    if (sqFt <= 15) return 25.00;
    return 24.00;
  }
  
  // MG350 removed - not available
  
  if (productCode === 'MG400') {
    if (sqFt <= 8) return 30.00;
    if (sqFt <= 12) return 26.00;
    if (sqFt <= 15) return 24.00;
    return 22.00;
  }
  
  if (productCode === 'MG450') {
    if (sqFt <= 8) return 36.00;
    if (sqFt <= 12) return 31.00;
    if (sqFt <= 15) return 28.00;
    return 26.00;
  }
  
  if (productCode === 'MG600') {
    if (sqFt <= 8) return 42.00;
    if (sqFt <= 12) return 36.00;
    if (sqFt <= 15) return 32.00;
    return 29.00;
  }
  
  // Doors
  if (productCode === 'MG1000') {
    if (sqFt <= 15) return 58.00;
    if (sqFt <= 25) return 52.00;
    return 48.00;
  }
  
  if (productCode === 'MG1100') {
    if (sqFt <= 15) return 65.00;
    if (sqFt <= 25) return 58.00;
    return 54.00;
  }
  
  if (productCode === 'MG1500') {
    if (sqFt <= 15) return 72.00;
    if (sqFt <= 25) return 64.00;
    return 58.00;
  }
  
  if (productCode === 'MG3000') {
    if (sqFt <= 15) return 68.00;
    if (sqFt <= 25) return 60.00;
    return 55.00;
  }
  
  if (productCode === 'MG3500') {
    if (sqFt <= 15) return 78.00;
    if (sqFt <= 25) return 68.00;
    return 62.00;
  }
  
  if (productCode === 'MG4000') {
    if (sqFt <= 15) return 95.00;
    if (sqFt <= 25) return 85.00;
    return 78.00;
  }
  
  // Default fallback
  return 30.00;
};

// Calculate exact price (no range)
export interface PriceCalculationParams {
  type: 'window' | 'door';
  productKey: string;
  quantity: number;
  width: number;
  height: number;
  frameColor: string;
  glassType: string;
  windZone: string;
  lowE: string;
  privacy: boolean;
  configuration?: string;
  screen?: boolean;
  marginPercentage?: number; // Admin-configured margin (default 50%)
}

export interface PriceResult {
  unitPrice: number;
  subtotal: number;
  taxes: number;
  total: number;
}

export const calculateExactPrice = (params: PriceCalculationParams): PriceResult => {
  const sqInches = params.width * params.height;
  const sqFt = sqInches / 144;
  
  // Get product code from key
  const productCode = params.productKey.split('_')[0];
  
  // Base price per sqft
  let basePricePerSqFt = getBasePricePerSqFt(sqFt, productCode);
  
  // Minimum prices
  const minWindowPrice = 180;
  const minDoorPrice = 550;
  
  let basePrice = basePricePerSqFt * sqFt;
  
  if (params.type === 'window' && basePrice < minWindowPrice) {
    basePrice = minWindowPrice;
  } else if (params.type === 'door' && basePrice < minDoorPrice) {
    basePrice = minDoorPrice;
  }
  
  // Wind Zone adjustment
  const zoneData = windZones.find(z => z.key === params.windZone);
  if (zoneData && zoneData.adjustment > 0) {
    basePrice *= (1 + zoneData.adjustment);
  }
  
  // Frame color adjustment
  const frameData = frameColors.find(f => f.key === params.frameColor);
  if (frameData && frameData.adjustment > 0) {
    basePrice *= (1 + frameData.adjustment);
  }
  
  // Glass type adjustment
  const glassData = glassTypes.find(g => g.key === params.glassType);
  if (glassData && glassData.adjustment > 0) {
    basePrice *= (1 + glassData.adjustment);
  }
  
  // Low-E adjustment
  const lowEData = lowEOptions.find(l => l.key === params.lowE);
  if (lowEData && lowEData.adjustment > 0) {
    basePrice *= (1 + lowEData.adjustment);
  }
  
  // Privacy glass adjustment
  if (params.privacy) {
    basePrice *= 1.15;
  }
  
  // Screen adjustment for doors
  if (params.type === 'door' && params.screen) {
    basePrice += 95;
  }
  
  // Apply margin (default 50% if not specified)
  const margin = params.marginPercentage ?? 50;
  const priceWithMargin = basePrice * (1 + margin / 100);
  
  const unitPrice = Math.round(priceWithMargin * 100) / 100;
  const subtotal = Math.round(unitPrice * params.quantity * 100) / 100;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;
  
  return {
    unitPrice,
    subtotal,
    taxes,
    total,
  };
};

// Helper to format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Helper to calculate sqft
export const getSqFt = (width: number, height: number): string => {
  return ((width * height) / 144).toFixed(2);
};
