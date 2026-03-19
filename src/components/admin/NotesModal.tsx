import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { StickyNote, Save, X } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes: string;
  leadName: string;
}

const NotesModal = ({ isOpen, onClose, onSave, initialNotes, leadName }: NotesModalProps) => {
  const { t } = useLanguage();
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(notes);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <StickyNote className="w-5 h-5 text-primary" />
            {t('crm.notesFor')} {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('crm.notesPlaceholder')}
            className="min-h-[200px] text-base resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('crm.notesHint')}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
            className="gap-2 h-12"
          >
            <X className="w-5 h-5" />
            {t('crm.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2 h-12"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {t('crm.saveNotes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
