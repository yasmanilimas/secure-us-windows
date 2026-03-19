import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Calendar, DollarSign, Package, User, RefreshCw, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { generateEstimatePDF } from '@/lib/pdf-utils';

interface EstimateProduct {
  type: string;
  model: string;
  quantity: number;
  width: number;
  height: number;
  frameColor: string;
  glassTint: string;
  lowE: string;
  privacy: boolean;
  screen: boolean;
  unitPrice: number;
  totalPrice: number;
}

interface Estimate {
  id: string;
  created_at: string;
  wind_zone: string | null;
  products: EstimateProduct[];
  subtotal: number;
  taxes: number;
  total: number;
  lead: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
  } | null;
}

const EstimatesList = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEstimate, setExpandedEstimate] = useState<string | null>(null);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          lead:leads(id, email, full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEstimates = (data || []).map(est => ({
        ...est,
        products: Array.isArray(est.products) ? (est.products as unknown as EstimateProduct[]) : [],
        lead: est.lead as Estimate['lead'],
      }));

      setEstimates(formattedEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
      toast({
        title: t('crm.error.fetchTitle'),
        description: t('crm.error.fetchDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEstimates = estimates.filter(estimate => {
    const searchLower = searchTerm.toLowerCase();
    const leadEmail = estimate.lead?.email?.toLowerCase() || '';
    const leadName = estimate.lead?.full_name?.toLowerCase() || '';
    return leadEmail.includes(searchLower) || leadName.includes(searchLower);
  });

  const toggleExpand = (id: string) => {
    setExpandedEstimate(expandedEstimate === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-anton text-foreground">{t('estimates.title')}</h2>
          <p className="text-muted-foreground">{t('estimates.subtitle')}</p>
        </div>
        <Button onClick={fetchEstimates} variant="outline" size="lg" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('crm.refresh')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('estimates.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Estimates List */}
      {filteredEstimates.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? t('crm.noResults') : t('estimates.noEstimates')}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? t('crm.noResultsDesc') : t('estimates.noEstimatesDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEstimates.map((estimate) => (
            <Card key={estimate.id} className="bg-card overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpand(estimate.id)}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {estimate.lead?.full_name || estimate.lead?.email || t('estimates.anonymous')}
                      </CardTitle>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(estimate.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {estimate.products.length} {t('crm.products')}
                        </span>
                        {estimate.wind_zone && (
                          <span className="px-2 py-0.5 bg-muted rounded text-xs">
                            {estimate.wind_zone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(estimate.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('estimates.taxIncluded')}
                      </p>
                    </div>
                    {expandedEstimate === estimate.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedEstimate === estimate.id && (
                <CardContent className="border-t border-border pt-4">
                  {/* Contact Info */}
                  {estimate.lead && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('estimates.contactInfo')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('estimate.email')}: </span>
                          <span className="font-medium">{estimate.lead.email}</span>
                        </div>
                        {estimate.lead.full_name && (
                          <div>
                            <span className="text-muted-foreground">{t('estimate.fullName')}: </span>
                            <span className="font-medium">{estimate.lead.full_name}</span>
                          </div>
                        )}
                        {estimate.lead.phone && (
                          <div>
                            <span className="text-muted-foreground">{t('estimate.phone')}: </span>
                            <span className="font-medium">{estimate.lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium text-muted-foreground">{t('estimates.product')}</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">{t('calc.quantity')}</th>
                          <th className="text-center py-2 px-2 font-medium text-muted-foreground">{t('estimates.dimensions')}</th>
                          <th className="text-left py-2 px-2 font-medium text-muted-foreground">{t('estimates.options')}</th>
                          <th className="text-right py-2 px-2 font-medium text-muted-foreground">{t('estimates.price')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimate.products.map((product, idx) => (
                          <tr key={idx} className="border-b border-border/50">
                            <td className="py-2 px-2">
                              <span className="font-medium">{product.model}</span>
                              <span className="text-muted-foreground ml-1">({product.type})</span>
                            </td>
                            <td className="py-2 px-2 text-center">{product.quantity}</td>
                            <td className="py-2 px-2 text-center">{product.width}" x {product.height}"</td>
                            <td className="py-2 px-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{product.frameColor}</span>
                                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{product.glassTint}</span>
                                {product.lowE !== 'none' && (
                                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-xs">Low-E</span>
                                )}
                                {product.privacy && (
                                  <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 rounded text-xs">Privacy</span>
                                )}
                                {product.screen && (
                                  <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded text-xs">Screen</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right font-medium">
                              {formatCurrency(product.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateEstimatePDF(estimate);
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('estimates.exportPDF')}
                    </Button>
                    <div className="space-y-1 text-right">
                      <div className="flex justify-end gap-8">
                        <span className="text-muted-foreground">{t('estimates.subtotal')}:</span>
                        <span className="font-medium w-24">{formatCurrency(estimate.subtotal)}</span>
                      </div>
                      <div className="flex justify-end gap-8">
                        <span className="text-muted-foreground">{t('estimates.taxes')} (7%):</span>
                        <span className="font-medium w-24">{formatCurrency(estimate.taxes)}</span>
                      </div>
                      <div className="flex justify-end gap-8 text-lg">
                        <span className="font-semibold">{t('estimates.total')}:</span>
                        <span className="font-bold text-primary w-24">{formatCurrency(estimate.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstimatesList;
