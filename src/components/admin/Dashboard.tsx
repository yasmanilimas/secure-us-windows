import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, Trophy, XCircle, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  negotiatingLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalEstimates: number;
  totalRevenue: number;
  recentLeads: Array<{
    id: string;
    email: string;
    full_name: string | null;
    status: string;
    created_at: string;
  }>;
}

const Dashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    negotiatingLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    totalEstimates: 0,
    totalRevenue: 0,
    recentLeads: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch all estimates
      const { data: estimates, error: estimatesError } = await supabase
        .from('estimates')
        .select('total');

      if (estimatesError) throw estimatesError;

      const leadsList = leads || [];
      const estimatesList = estimates || [];

      setStats({
        totalLeads: leadsList.length,
        newLeads: leadsList.filter(l => l.status === 'new').length,
        contactedLeads: leadsList.filter(l => l.status === 'contacted').length,
        negotiatingLeads: leadsList.filter(l => l.status === 'negotiating').length,
        wonLeads: leadsList.filter(l => l.status === 'won').length,
        lostLeads: leadsList.filter(l => l.status === 'lost').length,
        totalEstimates: estimatesList.length,
        totalRevenue: estimatesList.reduce((sum, e) => sum + Number(e.total || 0), 0),
        recentLeads: leadsList.slice(0, 5).map(l => ({
          id: l.id,
          email: l.email,
          full_name: l.full_name,
          status: l.status,
          created_at: l.created_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'negotiating': return 'bg-purple-500';
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const conversionRate = stats.totalLeads > 0 
    ? ((stats.wonLeads / stats.totalLeads) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.totalLeads')}
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.estimates')}
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEstimates}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.wonDeals')}
            </CardTitle>
            <Trophy className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.wonLeads}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.conversion')}
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('dashboard.leadsByStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">{stats.newLeads}</div>
              <div className="text-sm text-muted-foreground">{t('crm.status.new')}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-600">{stats.contactedLeads}</div>
              <div className="text-sm text-muted-foreground">{t('crm.status.contacted')}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-600">{stats.negotiatingLeads}</div>
              <div className="text-sm text-muted-foreground">{t('crm.status.negotiating')}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{stats.wonLeads}</div>
              <div className="text-sm text-muted-foreground">{t('crm.status.won')}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-600">{stats.lostLeads}</div>
              <div className="text-sm text-muted-foreground">{t('crm.status.lost')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Recent Leads */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Total Revenue */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('dashboard.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.revenueDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('dashboard.recentLeads')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {t('crm.noLeads')}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {lead.full_name || lead.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(lead.status)}`}>
                      {t(`crm.status.${lead.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
