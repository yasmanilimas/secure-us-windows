import { useState } from 'react';
import { Phone, Plus, Trash2, ArrowRight, ArrowLeft, MessageCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import WindowPreview from './WindowPreview';
import SaveEstimateModal from './SaveEstimateModal';
import { usePricingSettings } from '@/hooks/usePricingSettings';
import {
  windowTypes,
  doorTypes,
  frameColors,
  glassTypes,
  windZones,
  doorConfigurations,
  calculateExactPrice,
  formatPrice,
  getSqFt,
  TAX_RATE,
  type PriceResult,
} from '@/lib/pricing-config';
import { fetchMrGlassPrice, calcFallbackWholesale, buildPriceResult } from '@/lib/mrglassApi';

interface Product {
  id: string;
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
  pricing: PriceResult;
  pricingSource?: 'api' | 'formula' | 'estimate';
}

interface EstimateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstimateCalculator = ({ isOpen, onClose }: EstimateCalculatorProps) => {
  const { t } = useLanguage();
  const phoneNumber = '+1 786 779 7140';
  const { data: pricingSettings } = usePricingSettings();
  
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Current product being configured
  const [productType, setProductType] = useState<'window' | 'door'>('window');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState(36);
  const [height, setHeight] = useState(48);
  const [frameColor, setFrameColor] = useState('white_2605');
  const [glassType, setGlassType] = useState('clear_laminated');
  const [windZone, setWindZone] = useState('zone_4');
  const [lowE, setLowE] = useState('none');
  const [privacy, setPrivacy] = useState(false);
  const [configuration, setConfiguration] = useState('OX');
  const [screen, setScreen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [wakeUpCountdown, setWakeUpCountdown] = useState<number | null>(null);

  // Get margin from pricing settings
  const marginPercentage = pricingSettings?.margin_percentage ?? 50;

  // Calculate current product price (usa fórmulas exactas cuando están disponibles)
  const getCurrentPrice = (): PriceResult => {
    if (!selectedProduct) {
      return { unitPrice: 0, subtotal: 0, taxes: 0, total: 0 };
    }
    const productCode = selectedProduct.split('_')[0];
    const w = Math.max(12, width);
    const h = Math.max(12, height);

    const fallbackWholesale = calcFallbackWholesale(productCode, w, h, frameColor, windZone);
    if (fallbackWholesale !== null) {
      return buildPriceResult(fallbackWholesale, quantity, marginPercentage, privacy, !!screen, productType === 'window');
    }

    return calculateExactPrice({
      type: productType,
      productKey: selectedProduct,
      quantity,
      width: w,
      height: h,
      frameColor,
      glassType,
      windZone,
      lowE,
      privacy,
      configuration: productType === 'door' ? configuration : undefined,
      screen: productType === 'door' ? screen : undefined,
      marginPercentage,
    });
  };

  const addProduct = async () => {
    if (!selectedProduct) return;
    setIsAddingProduct(true);

    const productCode = selectedProduct.split('_')[0];
    const w = Math.max(12, width);
    const h = Math.max(12, height);

    let pricing: PriceResult;
    let pricingSource: 'api' | 'formula' | 'estimate' = 'estimate';

    // Si el proxy tarda más de 3s → mostrar cuenta regresiva (servidor dormido)
    let countdown = 50;
    const wakeTimer = setTimeout(() => {
      setWakeUpCountdown(countdown);
      const interval = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) { clearInterval(interval); return; }
        setWakeUpCountdown(countdown);
      }, 1000);
      (wakeTimer as any)._interval = interval;
    }, 3000);

    // 1) Intentar precio real de MrGlass via proxy
    const apiWholesale = await fetchMrGlassPrice({
      productCode, widthInches: w, heightInches: h, frameColor, windZone, glassType,
    });

    // Limpiar cuenta regresiva
    clearTimeout(wakeTimer);
    clearInterval((wakeTimer as any)._interval);
    setWakeUpCountdown(null);

    if (apiWholesale !== null) {
      pricing = buildPriceResult(apiWholesale, quantity, marginPercentage, privacy, !!screen, productType === 'window');
      pricingSource = 'api';
    } else {
      // 2) Fallback: fórmulas exactas de MrGlass
      const fallbackWholesale = calcFallbackWholesale(productCode, w, h, frameColor, windZone);
      if (fallbackWholesale !== null) {
        pricing = buildPriceResult(fallbackWholesale, quantity, marginPercentage, privacy, !!screen, productType === 'window');
        pricingSource = 'formula';
      } else {
        // 3) Fallback final: tabla por sqft de pricing-config
        pricing = getCurrentPrice();
        pricingSource = 'estimate';
      }
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      type: productType,
      productKey: selectedProduct,
      quantity,
      width: w,
      height: h,
      frameColor,
      glassType,
      windZone,
      lowE,
      privacy,
      configuration: productType === 'door' ? configuration : undefined,
      screen: productType === 'door' ? screen : undefined,
      pricing,
      pricingSource,
    };

    setProducts([...products, newProduct]);
    resetForm();
    setStep(3);
    setIsAddingProduct(false);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setSelectedProduct('');
    setQuantity(1);
    setWidth(36);
    setHeight(48);
    setFrameColor('white_2605');
    setGlassType('clear_laminated');
    setWindZone('zone_4');
    setLowE('none');
    setPrivacy(false);
    setConfiguration('OX');
    setScreen(false);
  };

  const resetAll = () => {
    setProducts([]);
    resetForm();
    setStep(1);
  };

  const getTotals = () => {
    const subtotal = products.reduce((sum, p) => sum + p.pricing.subtotal, 0);
    const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + taxes) * 100) / 100;
    return { subtotal, taxes, total };
  };

  const currentProducts = productType === 'window' ? windowTypes : doorTypes;
  const totals = getTotals();
  const currentPrice = getCurrentPrice();

  // Map productKey to preview type
  const getPreviewType = (key: string): string => {
    if (key.includes('SH')) return 'singleHung';
    if (key.includes('HR')) return 'horizontalSliding';
    if (key.includes('PW')) return 'pictureFixed';
    if (key.includes('CA')) return 'casement';
    if (key.includes('SGD')) return 'slidingGlass';
    if (key.includes('FD')) return 'frenchDoor';
    if (key.includes('PD')) return 'frenchDoor';
    return 'pictureFixed';
  };

  // Map frame color key to simple color for preview
  const getPreviewFrameColor = (key: string): string => {
    if (key.includes('white')) return 'white';
    if (key.includes('black') || key.includes('charcoal')) return 'black';
    if (key.includes('silver') || key.includes('anodized')) return 'silver';
    if (key.includes('bronze') || key.includes('walnut') || key.includes('java')) return 'bronze';
    return 'white';
  };

  // Map glass type key to simple tint for preview
  const getPreviewGlassTint = (key: string): string => {
    if (key.includes('clear')) return 'clear';
    if (key.includes('gray')) return 'gray';
    if (key.includes('bronze')) return 'bronze';
    if (key.includes('green')) return 'green';
    if (key.includes('blue')) return 'blue';
    return 'clear';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-anton text-primary">
            {t('calc.title')}
          </DialogTitle>
          <p className="text-muted-foreground">{t('calc.subtitle')}</p>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-1 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Product Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">{t('calc.selectProduct')}</h3>
            
            {/* Product Category */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setProductType('window');
                  setSelectedProduct('');
                }}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  productType === 'window'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <svg className="w-12 h-12 mx-auto mb-2 text-primary" viewBox="0 0 80 80" fill="none" stroke="currentColor">
                  <rect x="10" y="10" width="60" height="60" rx="2" strokeWidth="2.5" />
                  <line x1="40" y1="10" x2="40" y2="70" strokeWidth="2" />
                  <line x1="10" y1="40" x2="70" y2="40" strokeWidth="2" />
                  <path d="M40 55 L40 65" strokeWidth="2" />
                  <circle cx="40" cy="52" r="2" fill="currentColor" stroke="none" />
                </svg>
                <div className="font-semibold">{t('calc.windows')}</div>
              </button>
              <button
                onClick={() => {
                  setProductType('door');
                  setSelectedProduct('');
                }}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  productType === 'door'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <svg className="w-12 h-12 mx-auto mb-2 text-primary" viewBox="0 0 80 100" fill="none" stroke="currentColor">
                  <rect x="15" y="5" width="50" height="90" rx="2" strokeWidth="2.5" />
                  <rect x="22" y="12" width="36" height="50" rx="1" strokeWidth="2" />
                  <line x1="40" y1="12" x2="40" y2="62" strokeWidth="1.5" />
                  <circle cx="52" cy="55" r="3" fill="currentColor" stroke="none" />
                </svg>
                <div className="font-semibold">{t('calc.doors')}</div>
              </button>
            </div>

            {/* Product Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentProducts.map((product) => (
                <button
                  key={product.key}
                  onClick={() => setSelectedProduct(product.key)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedProduct === product.key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-primary">{product.code}</div>
                  <div className="text-sm text-muted-foreground">{t(`calc.${product.key}`)}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onClose}>
                {t('calc.close')}
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedProduct}
                className="gap-2"
              >
                {t('calc.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure Product */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">
              {t('calc.configure')}: {currentProducts.find(p => p.key === selectedProduct)?.code}
            </h3>
            
            {/* Live Preview */}
            <WindowPreview
              width={Math.max(12, width)}
              height={Math.max(12, height)}
              frameColor={getPreviewFrameColor(frameColor)}
              glassTint={getPreviewGlassTint(glassType)}
              privacy={privacy}
              productType={productType}
              productKey={getPreviewType(selectedProduct)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label>{t('calc.quantity')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setQuantity(0);
                    } else {
                      setQuantity(parseInt(val) || 0);
                    }
                  }}
                  onBlur={() => {
                    if (quantity < 1) setQuantity(1);
                  }}
                />
              </div>
              
              {/* Width */}
              <div className="space-y-2">
                <Label>{t('calc.width')}</Label>
                <Input
                  type="number"
                  min={12}
                  max={120}
                  value={width}
                  onChange={(e) => setWidth(Math.max(12, parseInt(e.target.value) || 36))}
                />
              </div>
              
              {/* Height */}
              <div className="space-y-2">
                <Label>{t('calc.height')}</Label>
                <Input
                  type="number"
                  min={12}
                  max={120}
                  value={height}
                  onChange={(e) => setHeight(Math.max(12, parseInt(e.target.value) || 48))}
                />
              </div>
              
              {/* Area Display */}
              <div className="flex items-end">
                <div className="bg-muted p-3 rounded-lg w-full text-center">
                  <span className="text-sm text-muted-foreground">{t('calc.sqft')}:</span>
                  <span className="font-bold ml-2">{getSqFt(Math.max(12, width), Math.max(12, height))}</span>
                </div>
              </div>
            </div>

            {/* Wind Zone */}
            <div className="space-y-2">
              <Label>{t('calc.windZone')}</Label>
              <Select value={windZone} onValueChange={setWindZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {windZones.map((zone) => (
                    <SelectItem key={zone.key} value={zone.key}>
                      <div className="flex items-center gap-2">
                        {zone.name}
                        {zone.adjustment > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (+{Math.round(zone.adjustment * 100)}%)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Frame Color */}
              <div className="space-y-2">
                <Label>{t('calc.frameColor')}</Label>
                <Select value={frameColor} onValueChange={setFrameColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {frameColors.map((fc) => (
                      <SelectItem key={fc.key} value={fc.key}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: fc.color }}
                          />
                          {t(`calc.${fc.key}`)}
                          {fc.adjustment > 0 && (
                            <span className="text-xs text-muted-foreground">
                              (+{Math.round(fc.adjustment * 100)}%)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Glass Type */}
              <div className="space-y-2">
                <Label>{t('calc.glassType')}</Label>
                <Select value={glassType} onValueChange={setGlassType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {glassTypes.map((glass) => (
                      <SelectItem key={glass.key} value={glass.key}>
                        <span>{glass.name}</span>
                        {glass.adjustment > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (+{Math.round(glass.adjustment * 100)}%)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Door-specific options */}
            {productType === 'door' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Configuration */}
                <div className="space-y-2">
                  <Label>{t('calc.configuration')}</Label>
                  <Select value={configuration} onValueChange={setConfiguration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {doorConfigurations.map((config) => (
                        <SelectItem key={config} value={config}>
                          {config}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Screen */}
                <div className="space-y-2">
                  <Label>{t('calc.screen')}</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScreen(false)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm ${
                        !screen
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {t('calc.no')}
                    </button>
                    <button
                      onClick={() => setScreen(true)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm ${
                        screen
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {t('calc.yes')} (+$95)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Option */}
            <div className="space-y-2">
              <Label>{t('calc.privacy')}</Label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPrivacy(false)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    !privacy
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t('calc.no')}
                </button>
                <button
                  onClick={() => setPrivacy(true)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    privacy
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t('calc.yes')} (+15%)
                </button>
              </div>
            </div>

            {/* Live Price Display */}
            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary">
              <div className="text-sm text-muted-foreground mb-1">Precio estimado (c/u)</div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(currentPrice.unitPrice)}
              </div>
              {quantity > 1 && (
                <div className="text-sm text-muted-foreground mt-1">
                  {quantity}x = {formatPrice(currentPrice.subtotal)} + {formatPrice(currentPrice.taxes)} tax = <span className="font-semibold">{formatPrice(currentPrice.total)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('calc.back')}
              </Button>
              <div className="flex flex-col items-end gap-1">
                {wakeUpCountdown !== null && (
                  <p className="text-xs text-amber-600 font-medium animate-pulse">
                    ⏳ Servidor despertando… {wakeUpCountdown}s
                  </p>
                )}
                <Button onClick={addProduct} disabled={isAddingProduct} className="gap-2">
                  {isAddingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {wakeUpCountdown !== null ? `Esperando ${wakeUpCountdown}s...` : 'Cotizando...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {t('calc.addProduct')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">{t('calc.yourProducts')}</h3>
            
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('calc.noProducts')}
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {products.map((product) => {
                  const productInfo = (product.type === 'window' ? windowTypes : doorTypes)
                    .find(p => p.key === product.productKey);
                  const zoneInfo = windZones.find(z => z.key === product.windZone);
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {product.quantity}x {productInfo?.code} - {t(`calc.${product.productKey}`)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.width}" x {product.height}" ({getSqFt(product.width, product.height)} {t('calc.sqft')}) • {zoneInfo?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t(`calc.${product.frameColor}`)}
                          {product.lowE !== 'none' && ` • ${t(`calc.${product.lowE}`)}`}
                          {product.privacy && ` • ${t('calc.privacy')}`}
                          {product.type === 'door' && product.configuration && ` • ${product.configuration}`}
                          {product.screen && ` • ${t('calc.screen')}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {formatPrice(product.pricing.subtotal)}
                          </div>
                          {product.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {product.quantity} × {formatPrice(product.pricing.unitPrice)}
                            </div>
                          )}
                          {product.pricingSource === 'api' && (
                            <div className="text-xs text-green-600 font-medium mt-0.5">✓ MrGlass</div>
                          )}
                          {product.pricingSource === 'formula' && (
                            <div className="text-xs text-blue-500 font-medium mt-0.5">~ Fórmula</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProduct(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add More Button */}
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('calc.addProduct')}
            </Button>

            {/* Total with Tax Breakdown */}
            {products.length > 0 && (
              <div className="bg-primary/5 border-2 border-primary rounded-lg p-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Taxes (7%):</span>
                    <span>{formatPrice(totals.taxes)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t('calc.priceRange')}</span>
                      <span className="text-2xl font-anton text-primary">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto text-center">
                  {t('calc.disclaimer')}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={resetAll} className="flex-1">
                {t('calc.startOver')}
              </Button>
              {products.length > 0 && (
                <Button 
                  onClick={() => setSaveModalOpen(true)} 
                  className="flex-1 gap-2"
                  variant="secondary"
                >
                  <Save className="w-4 h-4" />
                  {t('calc.saveEstimate')}
                </Button>
              )}
              <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex-1">
                <Button className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Phone className="w-4 h-4" />
                  {t('calc.callForFinal')}
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Save Estimate Modal */}
        <SaveEstimateModal
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          estimateData={{
            products: products.map(p => ({
              type: p.type,
              productKey: p.productKey,
              quantity: p.quantity,
              width: p.width,
              height: p.height,
              frameColor: p.frameColor,
              glassType: p.glassType,
              windZone: p.windZone,
              lowE: p.lowE,
              privacy: p.privacy,
              configuration: p.configuration,
              screen: p.screen,
              unitPrice: p.pricing.unitPrice,
              subtotal: p.pricing.subtotal,
            })),
            subtotal: totals.subtotal,
            taxes: totals.taxes,
            total: totals.total,
            windZone: windZone,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EstimateCalculator;
