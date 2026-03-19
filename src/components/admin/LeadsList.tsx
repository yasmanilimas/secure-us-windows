import { useState, useEffect } from 'react';
import { Search, Filter, Plus, RefreshCw, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LeadCard, { Lead, LeadStatus } from './LeadCard';
import NotesModal from './NotesModal';

const LeadsList = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const statusFilters: Array<LeadStatus | 'all'> = ['all', 'new', 'contacted', 'negotiating', 'won', 'lost'];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          estimates (
            id,
            total,
            products,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to handle the joined data
      setLeads((data || []) as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: t('crm.error.fetchTitle'),
        description: t('crm.error.fetchDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: t('crm.success.statusTitle'),
        description: t('crm.success.statusDesc'),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('crm.error.updateTitle'),
        description: t('crm.error.updateDesc'),
        variant: 'destructive',
      });
    }
  };

  const handleNotesClick = (lead: Lead) => {
    setSelectedLead(lead);
    setNotesModalOpen(true);
  };

  const handleNotesSave = async (notes: string) => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', selectedLead.id);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === selectedLead.id ? { ...lead, notes } : lead
      ));

      setNotesModalOpen(false);
      setSelectedLead(null);

      toast({
        title: t('crm.success.notesTitle'),
        description: t('crm.success.notesDesc'),
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: t('crm.error.updateTitle'),
        description: t('crm.error.updateDesc'),
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    negotiating: leads.filter(l => l.status === 'negotiating').length,
    won: leads.filter(l => l.status === 'won').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-anton text-foreground">{t('crm.leadsTitle')}</h2>
          <p className="text-muted-foreground">{t('crm.leadsSubtitle')}</p>
        </div>
        <Button
          onClick={fetchLeads}
          variant="outline"
          size="lg"
          className="gap-2 h-12"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {t('crm.refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t('crm.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t(`crm.filter.${status}`)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('crm.loading')}</p>
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || statusFilter !== 'all' ? t('crm.noResults') : t('crm.noLeads')}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ? t('crm.noResultsDesc') : t('crm.noLeadsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onNotesClick={handleNotesClick}
            />
          ))}
        </div>
      )}

      {/* Notes Modal */}
      <NotesModal
        isOpen={notesModalOpen}
        onClose={() => {
          setNotesModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleNotesSave}
        initialNotes={selectedLead?.notes || ''}
        leadName={selectedLead?.full_name || selectedLead?.email || ''}
      />
    </div>
  );
};

export default LeadsList;
