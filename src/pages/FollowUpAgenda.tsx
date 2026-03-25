import { useMemo, useState } from 'react';
import { useLeads, useUpdateLead, useCreateInteraction } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { calculateLeadScore, getTemperature, getTemperatureEmoji } from '@/lib/leadScoring';
import { buildWhatsAppUrl } from '@/lib/whatsappTemplates';
import TemperatureBadge from '@/components/TemperatureBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ExternalLink, Check, Clock, CalendarClock, Eye, StickyNote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/hooks/useLeads';

const COMPLETION_STATUSES = [
  'Falou com cliente',
  'Sem resposta',
  'Pediu para retornar depois',
  'Aguardando medidas',
  'Aguardando decisão',
  'Fechou',
  'Perdeu',
] as const;

interface Section {
  key: string;
  title: string;
  icon: React.ElementType;
  color: string;
  leads: Lead[];
}

export default function FollowUpAgenda() {
  const { data: leads = [] } = useLeads();
  const { user } = useAuth();
  const updateLead = useUpdateLead();
  const createInteraction = useCreateInteraction();
  const { toast } = useToast();
  const vendorName = user?.user_metadata?.name || 'Vendedor';

  const [noteDialog, setNoteDialog] = useState<{ open: boolean; leadId: string }>({ open: false, leadId: '' });
  const [noteText, setNoteText] = useState('');
  const [rescheduleDialog, setRescheduleDialog] = useState<{ open: boolean; leadId: string }>({ open: false, leadId: '' });

  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString();

  const sections: Section[] = useMemo(() => {
    const active = leads.filter(l => !['Fechado ganho', 'Perdido'].includes(l.status));

    const overdue = active.filter(l => l.next_followup_at && new Date(l.next_followup_at) < now && new Date(l.next_followup_at).toDateString() !== todayStr);
    const today = active.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === todayStr);
    const tomorrow = active.filter(l => l.next_followup_at && new Date(l.next_followup_at).toDateString() === tomorrowStr);
    const forgotten = active.filter(l => {
      if (!l.last_interaction_at) return true;
      return (Date.now() - new Date(l.last_interaction_at).getTime()) / 86400000 > 7;
    });
    const hotStalled = active.filter(l => {
      const score = calculateLeadScore(l);
      if (score < 50) return false;
      if (!l.last_interaction_at) return false;
      return (Date.now() - new Date(l.last_interaction_at).getTime()) / 86400000 > 2;
    });

    return [
      { key: 'overdue', title: '⚠️ Follow-ups Vencidos', icon: Clock, color: 'text-destructive', leads: overdue },
      { key: 'today', title: '📅 Hoje', icon: CalendarClock, color: 'text-primary', leads: today },
      { key: 'tomorrow', title: '🗓️ Amanhã', icon: CalendarClock, color: 'text-muted-foreground', leads: tomorrow },
      { key: 'forgotten', title: '😴 Leads Esquecidos (+7 dias)', icon: Clock, color: 'text-orange-500', leads: forgotten },
      { key: 'hot', title: '🔥 Leads Quentes Parados', icon: Clock, color: 'text-red-500', leads: hotStalled },
    ];
  }, [leads]);

  const handleComplete = async (leadId: string, status: string) => {
    try {
      if (status === 'Fechou') {
        updateLead.mutate({ id: leadId, status: 'Fechado ganho' });
      } else if (status === 'Perdeu') {
        updateLead.mutate({ id: leadId, status: 'Perdido' });
      } else {
        // Mark follow-up as done, reschedule to +1 day
        const next = new Date(Date.now() + 86400000).toISOString();
        updateLead.mutate({ id: leadId, next_followup_at: next } as any);
      }
      await createInteraction.mutateAsync({
        lead_id: leadId,
        channel: 'Sistema',
        direction: 'Interno',
        note_text: `Follow-up concluído: ${status}`,
        ai_generated: false,
      });
      toast({ title: 'Follow-up registrado!' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleReschedule = (leadId: string, days: number) => {
    const next = new Date(Date.now() + days * 86400000).toISOString();
    updateLead.mutate({ id: leadId, next_followup_at: next } as any, {
      onSuccess: () => {
        toast({ title: `Remarcado para +${days} dia(s)` });
        setRescheduleDialog({ open: false, leadId: '' });
      },
    });
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await createInteraction.mutateAsync({
      lead_id: noteDialog.leadId,
      channel: 'Sistema',
      direction: 'Interno',
      note_text: noteText,
      ai_generated: false,
    });
    toast({ title: 'Observação salva!' });
    setNoteText('');
    setNoteDialog({ open: false, leadId: '' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">📋 Agenda de Follow-up</h1>

      {sections.map(section => (
        <div key={section.key}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold">{section.title}</h2>
            <Badge variant="secondary" className="text-xs">{section.leads.length}</Badge>
          </div>

          {section.leads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nenhum lead nesta seção.</p>
          ) : (
            <div className="space-y-2">
              {section.leads.map(lead => {
                const phoneClean = lead.phone.replace(/\D/g, '');
                return (
                  <div key={lead.id} className="bg-card border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {/* Lead info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/lead/${lead.id}`} className="font-semibold text-sm hover:text-primary transition-colors truncate">
                            {lead.name}
                          </Link>
                          <TemperatureBadge lead={lead} />
                          <Badge variant="outline" className="text-[10px]">{lead.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          <span>📞 {lead.phone}</span>
                          {lead.city && <span>📍 {lead.city}</span>}
                          <span>📦 {lead.product_category}</span>
                          {lead.last_interaction_at && (
                            <span>Último contato: {new Date(lead.last_interaction_at).toLocaleDateString('pt-BR')}</span>
                          )}
                          {lead.next_followup_at && (
                            <span>Follow-up: {new Date(lead.next_followup_at).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        <Select onValueChange={v => handleComplete(lead.id, v)}>
                          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            <SelectValue placeholder="Concluir" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPLETION_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRescheduleDialog({ open: true, leadId: lead.id })}>
                          <Clock className="h-3 w-3 mr-1" />Remarcar
                        </Button>

                        <Link to={`/lead/${lead.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            <Eye className="h-3 w-3 mr-1" />Abrir
                          </Button>
                        </Link>

                        <a href={buildWhatsAppUrl(lead.phone, `Olá ${lead.name}!`)} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                            <MessageCircle className="h-3 w-3 mr-1" />WhatsApp
                          </Button>
                        </a>

                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setNoteDialog({ open: true, leadId: lead.id }); setNoteText(''); }}>
                          <StickyNote className="h-3 w-3 mr-1" />Obs.
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={v => !v && setRescheduleDialog({ open: false, leadId: '' })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remarcar Follow-up</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 5, 7, 14].map(d => (
              <Button key={d} variant="outline" onClick={() => handleReschedule(rescheduleDialog.leadId, d)}>
                +{d} dia{d > 1 ? 's' : ''}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onOpenChange={v => !v && setNoteDialog({ open: false, leadId: '' })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Observação</DialogTitle></DialogHeader>
          <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Escreva uma observação..." rows={3} />
          <Button onClick={handleSaveNote} disabled={!noteText.trim()}>Salvar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
