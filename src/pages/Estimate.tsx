import { useState } from 'react';
import { Phone, Plus, Trash2, ArrowRight, ArrowLeft, Home, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import WindowPreview from '@/components/WindowPreview';
import WindowAnimationPreview from '@/components/WindowAnimationPreview';
import { Link } from 'react-router-dom';
import SaveEstimateModal from '@/components/SaveEstimateModal';
import { usePricingSettings } from '@/hooks/usePricingSettings';
import {
  windowTypes,
  doorTypes,
  frameColors,
  glassTypes,
  windZones,
  doorConfigurations,
  windowConfigurations,
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

const EstimateCalculatorContent = () => {
  const { t, language } = useLanguage();
  const phoneNumber = '+1 786 779 7140';
  const { data: pricingSettings, isLoading: isPricingLoading } = usePricingSettings();
  
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
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
  const [configuration, setConfiguration] = useState('XO');
  const [windowConfig, setWindowConfig] = useState('XO');
  const [screen, setScreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

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

    // 1) Intentar precio real de MrGlass via proxy
    const apiWholesale = await fetchMrGlassPrice({
      productCode, widthInches: w, heightInches: h, frameColor, windZone, glassType,
    });

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

  const getPreviewFrameColor = (key: string): string => {
    if (key.includes('white')) return 'white';
    if (key.includes('black') || key.includes('charcoal')) return 'black';
    if (key.includes('silver') || key.includes('anodized')) return 'silver';
    if (key.includes('bronze') || key.includes('walnut') || key.includes('java')) return 'bronze';
    return 'white';
  };

  const getPreviewGlassTint = (key: string): string => {
    if (key.includes('clear')) return 'clear';
    if (key.includes('gray')) return 'gray';
    if (key.includes('bronze')) return 'bronze';
    if (key.includes('green')) return 'green';
    if (key.includes('blue')) return 'blue';
    return 'clear';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-anton">{t('calc.title')}</h1>
              <p className="text-sm text-primary-foreground/80 hidden sm:block">{t('calc.subtitle')}</p>
            </div>
          </div>
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
            <Button variant="secondary" className="gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{t('hero.cta.call')}</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Product Type */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">{t('calc.selectProduct')}</h2>
              
              {/* Product Category */}
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setProductType('window');
                    setSelectedProduct('');
                  }}
                  className={`p-8 rounded-xl border-2 transition-all text-center ${
                    productType === 'window'
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <svg className="w-14 h-14 mx-auto mb-3 text-primary" viewBox="0 0 80 80" fill="none" stroke="currentColor">
                    {/* Outer frame */}
                    <rect x="8" y="8" width="64" height="64" rx="2" strokeWidth="2.5" />
                    {/* Center cross */}
                    <line x1="40" y1="8" x2="40" y2="72" strokeWidth="1.5" />
                    <line x1="8" y1="40" x2="72" y2="40" strokeWidth="1.5" />
                    {/* Inner frame lines for depth */}
                    <rect x="12" y="12" width="24" height="24" strokeWidth="1" />
                    <rect x="44" y="12" width="24" height="24" strokeWidth="1" />
                    <rect x="12" y="44" width="24" height="24" strokeWidth="1" />
                    <rect x="44" y="44" width="24" height="24" strokeWidth="1" />
                  </svg>
                  <div className="font-semibold text-lg">{t('calc.windows')}</div>
                </button>
                <button
                  onClick={() => {
                    setProductType('door');
                    setSelectedProduct('');
                  }}
                  className={`p-8 rounded-xl border-2 transition-all text-center ${
                    productType === 'door'
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <svg className="w-14 h-14 mx-auto mb-3 text-primary" viewBox="0 0 80 100" fill="none" stroke="currentColor">
                    {/* Outer frame */}
                    <rect x="12" y="5" width="56" height="90" rx="2" strokeWidth="2.5" />
                    {/* Inner panel frame */}
                    <rect x="18" y="12" width="44" height="75" strokeWidth="1.5" />
                    {/* Glass panels */}
                    <rect x="22" y="16" width="17" height="32" rx="1" strokeWidth="1" />
                    <rect x="41" y="16" width="17" height="32" rx="1" strokeWidth="1" />
                    {/* Bottom panel detail */}
                    <line x1="22" y1="52" x2="58" y2="52" strokeWidth="1" />
                    <line x1="40" y1="52" x2="40" y2="83" strokeWidth="1" />
                    {/* Door handle */}
                    <circle cx="52" cy="55" r="2.5" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="font-semibold text-lg">{t('calc.doors')}</div>
                </button>
              </div>

              {/* Auto-play toggle */}
              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Auto-play animations
                  </span>
                </label>
              </div>

              {/* Product Selection with Animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <button
                    key={product.key}
                    onClick={() => setSelectedProduct(product.key)}
                    className={`p-6 rounded-xl border-2 transition-all text-center group ${
                      selectedProduct === product.key
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    {/* Animated Preview */}
                    <div className="mb-4">
                      <WindowAnimationPreview 
                        productKey={product.key} 
                        isActive={selectedProduct === product.key}
                        autoPlay={autoPlay}
                      />
                    </div>
                    
                    <div className="font-bold text-xl text-primary">{product.code}</div>
                    <div className="text-muted-foreground text-sm">{t(`calc.${product.key}`)}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedProduct}
                  size="lg"
                  className="gap-2 px-12"
                >
                  {t('calc.next')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Configure Product */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">
                {t('calc.configure')}: {currentProducts.find(p => p.key === selectedProduct)?.code}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Configuration Form */}
                <div className="space-y-6 order-2 lg:order-1">
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
                        className="text-lg"
                      />
                    </div>
                    
                    {/* Area Display */}
                    <div className="space-y-2">
                      <Label>{t('calc.area')}</Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted text-lg font-semibold flex items-center">
                        {getSqFt(Math.max(12, width), Math.max(12, height))} ft²
                      </div>
                    </div>
                    
                    {/* Width */}
                    <div className="space-y-2">
                      <Label>{t('calc.width')}</Label>
                      <Input
                        type="number"
                        min={12}
                        max={120}
                        value={width === 0 ? '' : width}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setWidth(0);
                          } else {
                            setWidth(parseInt(val) || 0);
                          }
                        }}
                        onBlur={() => {
                          if (width < 12) setWidth(12);
                        }}
                        className="text-lg"
                      />
                    </div>
                    
                    {/* Height */}
                    <div className="space-y-2">
                      <Label>{t('calc.height')}</Label>
                      <Input
                        type="number"
                        min={12}
                        max={120}
                        value={height === 0 ? '' : height}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setHeight(0);
                          } else {
                            setHeight(parseInt(val) || 0);
                          }
                        }}
                        onBlur={() => {
                          if (height < 12) setHeight(12);
                        }}
                        className="text-lg"
                      />
                    </div>
                  </div>

                  {/* Wind Zone */}
                  <div className="space-y-2">
                    <Label>{t('calc.windZone')}</Label>
                    <Select value={windZone} onValueChange={setWindZone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  {/* Frame Color */}
                  <div className="space-y-2">
                    <Label>{t('calc.frameColor')}</Label>
                    <Select value={frameColor} onValueChange={setFrameColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frameColors.map((color) => (
                          <SelectItem key={color.key} value={color.key}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded border"
                                style={{ backgroundColor: color.color }}
                              />
                              {t(`calc.${color.key}`)}
                              {color.adjustment > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  (+{Math.round(color.adjustment * 100)}%)
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
                      <SelectContent>
                        {glassTypes.map((glass) => (
                          <SelectItem key={glass.key} value={glass.key}>
                            {t(`calc.${glass.key}`)}
                            {glass.adjustment > 0 && ` (+${Math.round(glass.adjustment * 100)}%)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={privacy}
                      onChange={(e) => setPrivacy(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <Label htmlFor="privacy" className="cursor-pointer">
                      {t('calc.privacy')} (+15%)
                    </Label>
                  </div>

                  {/* Window-specific configurations (MG300 HR) */}
                  {productType === 'window' && windowConfigurations[selectedProduct] && (
                    <div className="space-y-2">
                      <Label>{t('calc.configuration')}</Label>
                      <Select value={windowConfig} onValueChange={setWindowConfig}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {windowConfigurations[selectedProduct].map((config) => (
                            <SelectItem key={config} value={config}>
                              {config}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Door-specific options */}
                  {productType === 'door' && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('calc.configuration')}</Label>
                        <Select value={configuration} onValueChange={setConfiguration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {doorConfigurations.map((config) => (
                              <SelectItem key={config} value={config}>
                                {config}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="screen"
                          checked={screen}
                          onChange={(e) => setScreen(e.target.checked)}
                          className="w-5 h-5 rounded"
                        />
                        <Label htmlFor="screen" className="cursor-pointer">
                          {t('calc.screen')} (+$95)
                        </Label>
                      </div>
                    </>
                  )}

                  {/* Live Price Display */}
                  <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary">
                    <div className="text-sm text-muted-foreground mb-1">Precio estimado (c/u)</div>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(currentPrice.unitPrice)}
                    </div>
                    {quantity > 1 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {quantity}x = {formatPrice(currentPrice.subtotal)} + {formatPrice(currentPrice.taxes)} tax = <span className="font-semibold text-foreground">{formatPrice(currentPrice.total)}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {language === 'en' 
                        ? '* This is only an approximate price. For an accurate quote, please call us or contact us directly.' 
                        : '* Este es solo un precio aproximado. Para una cotización precisa, llámenos o contáctenos directamente.'}
                    </p>
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                  <WindowPreview
                    width={Math.max(12, width)}
                    height={Math.max(12, height)}
                    frameColor={getPreviewFrameColor(frameColor)}
                    glassTint={getPreviewGlassTint(glassType)}
                    privacy={privacy}
                    productType={productType}
                    productKey={getPreviewType(selectedProduct)}
                    windowConfig={windowConfigurations[selectedProduct] ? windowConfig : undefined}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('calc.back')}
                </Button>
                <Button onClick={addProduct} disabled={isAddingProduct} size="lg" className="gap-2 px-8">
                  {isAddingProduct ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Cotizando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {t('calc.addProduct')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">{t('calc.summary')}</h2>

              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('calc.noProducts')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => {
                    const productInfo = [...windowTypes, ...doorTypes].find(p => p.key === product.productKey);
                    const zoneInfo = windZones.find(z => z.key === product.windZone);
                    const glassInfo = glassTypes.find(g => g.key === product.glassType);
                    return (
                      <div
                        key={product.id}
                        className="p-6 bg-card rounded-xl border shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-primary">
                              {productInfo?.code} - {t(`calc.${product.productKey}`)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2 space-y-1">
                              <p>{t('calc.quantity')}: {product.quantity} | {product.width}" × {product.height}" ({getSqFt(product.width, product.height)} ft²)</p>
                              <p>{t('calc.windZone')}: {zoneInfo?.name}</p>
                              <p>{t('calc.frameColor')}: {t(`calc.${product.frameColor}`)}</p>
                              <p>{t('calc.glassType')}: {glassInfo?.name}</p>
                              <p>{t('calc.lowE')}: {t(`calc.${product.lowE}`)}</p>
                              {product.privacy && <p>✓ {t('calc.privacy')}</p>}
                              {product.configuration && <p>{t('calc.configuration')}: {product.configuration}</p>}
                              {product.screen && <p>✓ {t('calc.screen')}</p>}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-lg text-primary">
                              {formatPrice(product.pricing.subtotal)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.quantity > 1 && `${product.quantity} × ${formatPrice(product.pricing.unitPrice)}`}
                            </div>
                            {product.pricingSource === 'api' && (
                              <div className="text-xs text-green-600 font-medium mt-0.5">✓ MrGlass</div>
                            )}
                            {product.pricingSource === 'formula' && (
                              <div className="text-xs text-blue-500 font-medium mt-0.5">~ Fórmula</div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                              className="text-destructive hover:text-destructive mt-2"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {t('calc.remove')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total with Tax Breakdown */}
                  <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>{formatPrice(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Taxes (7%):</span>
                        <span>{formatPrice(totals.taxes)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-semibold">{t('calc.estimatedTotal')}</span>
                          <span className="text-2xl md:text-3xl font-bold text-primary">
                            {formatPrice(totals.total)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed text-center">
                        {language === 'en' 
                          ? '* This is only an approximate price. For an accurate quote, please call us or contact us directly.' 
                          : '* Este es solo un precio aproximado. Para una cotización precisa, llámenos o contáctenos directamente.'}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">{t('calc.disclaimer.title')}</p>
                    <p>{t('calc.disclaimer.text')}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('calc.addMore')}
                </Button>
                
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button variant="outline" onClick={resetAll}>
                    {t('calc.reset')}
                  </Button>
                  {products.length > 0 && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="gap-2"
                      onClick={() => setShowSaveModal(true)}
                    >
                      <Save className="w-5 h-5" />
                      {language === 'en' ? 'Save Estimate' : 'Guardar Estimado'}
                    </Button>
                  )}
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                    <Button size="lg" className="gap-2 w-full">
                      <Phone className="w-5 h-5" />
                      {t('calc.callNow')}
                    </Button>
                  </a>
                </div>
              </div>

              <SaveEstimateModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                estimateData={{
                  products,
                  subtotal: totals.subtotal,
                  taxes: totals.taxes,
                  total: totals.total,
                  windZone,
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Estimate = () => {
  return (
    <LanguageProvider>
      <EstimateCalculatorContent />
    </LanguageProvider>
  );
};

export default Estimate;
