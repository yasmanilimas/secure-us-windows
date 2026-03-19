import { useState } from 'react';
import { Phone, MessageCircle, Mail, Calendar, ChevronDown, ChevronUp, StickyNote, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';

export interface Lead {
  id: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  status: LeadStatus;
  notes?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
  estimates?: Array<{
    id: string;
    total: number;
    products: any[];
    created_at: string;
  }>;
}

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onNotesClick: (lead: Lead) => void;
  onViewEstimate?: (estimateId: string) => void;
}

const WHATSAPP_NUMBER = '17867797140';

const LeadCard = ({ lead, onStatusChange, onNotesClick, onViewEstimate }: LeadCardProps) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    negotiating: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    won: 'bg-green-500/10 text-green-600 border-green-500/20',
    lost: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statuses: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won', 'lost'];

  const handleCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone.replace(/\s/g, '')}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    const phone = lead.phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `Hi${lead.full_name ? ` ${lead.full_name}` : ''}, this is Powerful Impact Windows. We received your inquiry and would like to help you with your project.`
    );
    window.open(`https://wa.me/${phone || WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:${lead.email}`, '_blank');
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      {/* Main Info */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Lead Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {lead.full_name || lead.email}
              </h3>
              <Badge className={`${statusColors[lead.status]} border shrink-0`}>
                {t(`crm.status.${lead.status}`)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </p>
              {lead.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{lead.phone}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2">
            <Button
              onClick={handleCall}
              disabled={!lead.phone}
              size="lg"
              className="flex-1 sm:flex-none h-12 gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="w-5 h-5" />
              {t('crm.call')}
            </Button>
            <Button
              onClick={handleWhatsApp}
              size="lg"
              className="flex-1 sm:flex-none h-12 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Button>
            <Button
              onClick={handleEmail}
              size="lg"
              variant="outline"
              className="flex-1 sm:flex-none h-12 gap-2"
            >
              <Mail className="w-5 h-5" />
              Email
            </Button>
          </div>
        </div>

        {/* Notes Preview */}
        {lead.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{lead.notes}</span>
            </p>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {t('crm.showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {t('crm.showMore')}
            </>
          )}
        </button>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="border-t border-border p-4 sm:p-6 bg-muted/30">
          {/* Status Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              {t('crm.changeStatus')}
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(lead.id, status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    lead.status === status
                      ? `${statusColors[status]} border-2`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent'
                  }`}
                >
                  {t(`crm.status.${status}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Button */}
          <div className="mb-6">
            <Button
              onClick={() => onNotesClick(lead)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 gap-2"
            >
              <StickyNote className="w-5 h-5" />
              {lead.notes ? t('crm.editNotes') : t('crm.addNotes')}
            </Button>
          </div>

          {/* Estimates */}
          {lead.estimates && lead.estimates.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                {t('crm.linkedEstimates')} ({lead.estimates.length})
              </label>
              <div className="space-y-2">
                {lead.estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          ${estimate.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(estimate.created_at), 'MMM d, yyyy')} • {estimate.products.length} {t('crm.products')}
                        </p>
                      </div>
                    </div>
                    {onViewEstimate && (
                      <Button
                        onClick={() => onViewEstimate(estimate.id)}
                        variant="ghost"
                        size="sm"
                      >
                        {t('crm.view')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {lead.source && (
            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium">{t('crm.source')}:</span> {lead.source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadCard;
