import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLead, useUpdateLead, useInteractions, useCreateInteraction } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PRODUCT_CATEGORIES, LEAD_STATUSES, BUDGET_OPTIONS, URGENCY_OPTIONS, INTERACTION_CHANNELS, INTERACTION_DIRECTIONS, getPriorityClass, getAlertLevel } from '@/lib/constants';
import { ArrowLeft, MessageCircle, Sparkles, Copy, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(id!);
  const { data: interactions = [] } = useInteractions(id!);
  const updateLead = useUpdateLead();
  const createInteraction = useCreateInteraction();
  const { user } = useAuth();
  const { toast } = useToast();

  const [note, setNote] = useState('');
  const [noteChannel, setNoteChannel] = useState('Sistema');
  const [noteDirection, setNoteDirection] = useState('Interno');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  if (isLoading || !lead) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const alert = getAlertLevel(lead.status, lead.last_interaction_at);
  const phoneClean = lead.phone.replace(/\D/g, '');
  const vendorName = user?.user_metadata?.name || 'Vendedor';
  const whatsappMessage = encodeURIComponent(
    `Olá, sou ${vendorName}. Quero falar sobre seu orçamento de ${lead.product_category}. Medidas: ${lead.measurement || 'não informado'}. Cidade: ${lead.city || 'não informada'}. Orçamento: ${(lead as any).orcamento || 'não informado'}. Prazo: ${(lead as any).urgencia || 'não informado'}.`
  );
  const whatsappLink = `https://wa.me/55${phoneClean}?text=${whatsappMessage}`;

  const handleUpdate = (updates: Record<string, unknown>) => {
    updateLead.mutate({ id: lead.id, ...updates } as any, {
      onSuccess: () => toast({ title: 'Lead atualizado!' }),
      onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await createInteraction.mutateAsync({
        lead_id: lead.id,
        channel: noteChannel,
        direction: noteDirection,
        note_text: note,
        ai_generated: false,
      });
      setNote('');
      toast({ title: 'Anotação salva!' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleAI = async (type: string) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          type,
          lead: {
            name: lead.name, product_category: lead.product_category,
            estimated_value: lead.estimated_value, status: lead.status,
            city: lead.city, measurement: lead.measurement,
            lost_reason: lead.lost_reason,
            orcamento: (lead as any).orcamento,
            urgencia: (lead as any).urgencia,
          },
          interactions: interactions.slice(0, 5).map(i => ({ note_text: i.note_text, channel: i.channel, created_at: i.created_at })),
        },
      });
      if (error) throw error;
      setAiText(data.text || data.message || JSON.stringify(data));
    } catch (e: any) {
      toast({ title: 'Erro na IA', description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const saveAiAsNote = async () => {
    if (!aiText.trim()) return;
    await createInteraction.mutateAsync({
      lead_id: lead.id, channel: 'Sistema', direction: 'Interno',
      note_text: aiText, ai_generated: true,
    });
    setAiText('');
    toast({ title: 'Nota de IA salva!' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link to="/leads"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{lead.name}</h1>
            {alert !== 'none' && (
              <AlertCircle className={`h-5 w-5 shrink-0 ${alert === 'red' ? 'text-destructive' : alert === 'orange' ? 'text-orange-500' : 'text-amber-500'}`} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={getPriorityClass(lead.priority_level)}>{lead.priority_level}</Badge>
            <span className="text-sm text-muted-foreground">{lead.product_category}</span>
            {(lead as any).urgencia && <Badge variant="secondary" className="text-xs">{(lead as any).urgencia}</Badge>}
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      {lead.phone && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
          <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-base h-14 gap-3 text-lg font-semibold">
            <Phone className="h-6 w-6" />
            <MessageCircle className="h-5 w-5" />
            Chamar no WhatsApp
          </Button>
        </a>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Lead form */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4 sm:p-5 space-y-3">
            <h2 className="font-semibold">Dados do Lead</h2>
            <Input defaultValue={lead.name} onBlur={e => e.target.value !== lead.name && handleUpdate({ name: e.target.value })} placeholder="Nome" className="h-12 hover:bg-muted/50 transition-colors" />
            <Input defaultValue={lead.phone} onBlur={e => handleUpdate({ phone: e.target.value })} placeholder="WhatsApp" className="h-12 hover:bg-muted/50 transition-colors" />
            <div className="grid grid-cols-2 gap-3">
              <Input defaultValue={lead.city} onBlur={e => handleUpdate({ city: e.target.value })} placeholder="Cidade" className="h-12 hover:bg-muted/50 transition-colors" />
              <Input defaultValue={lead.state} maxLength={2} onBlur={e => handleUpdate({ state: e.target.value.toUpperCase() })} placeholder="UF" className="h-12 hover:bg-muted/50 transition-colors" />
            </div>
            <Select defaultValue={lead.product_category} onValueChange={v => handleUpdate({ product_category: v })}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="text" defaultValue={lead.measurement || ''} onBlur={e => handleUpdate({ measurement: e.target.value })} placeholder="Medidas" className="h-12 hover:bg-muted/50 transition-colors" />
            <Select defaultValue={(lead as any).orcamento || '_none'} onValueChange={v => handleUpdate({ orcamento: v === '_none' ? '' : v })}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Orçamento estimado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Selecione o orçamento</SelectItem>
                {BUDGET_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue={(lead as any).urgencia || '_none'} onValueChange={v => handleUpdate({ urgencia: v === '_none' ? '' : v })}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Urgência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Selecione a urgência</SelectItem>
                {URGENCY_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue={lead.status} onValueChange={v => handleUpdate({ status: v })}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {lead.status === 'Perdido' && (
              <Input defaultValue={lead.lost_reason || ''} onBlur={e => handleUpdate({ lost_reason: e.target.value })} placeholder="Motivo da perda" className="h-12" />
            )}
          </div>

          {/* AI Panel */}
          <div className="bg-card rounded-xl border p-4 sm:p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />Assistente IA</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'respond', label: 'Gerar Resposta' },
                { type: 'summarize', label: 'Resumir Lead' },
                { type: 'next_step', label: 'Próximo Passo' },
                { type: 'objection', label: 'Contornar Objeção' },
                { type: 'reactivate', label: 'Reativar Lead' },
              ].map(btn => (
                <Button key={btn.type} variant="outline" size="sm" onClick={() => handleAI(btn.type)} disabled={aiLoading}>
                  {btn.label}
                </Button>
              ))}
            </div>
            {aiLoading && <p className="text-sm text-muted-foreground animate-pulse">Gerando resposta...</p>}
            {aiText && (
              <div className="space-y-2">
                <Textarea value={aiText} onChange={e => setAiText(e.target.value)} rows={5} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveAiAsNote}>Salvar como nota</Button>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(aiText); toast({ title: 'Copiado!' }); }}>
                    <Copy className="h-3 w-3 mr-1" />Copiar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4 sm:p-5 space-y-3">
            <h2 className="font-semibold">Nova Anotação</h2>
            <div className="flex gap-2">
              <Select value={noteChannel} onValueChange={setNoteChannel}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>{INTERACTION_CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={noteDirection} onValueChange={setNoteDirection}>
                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent>{INTERACTION_DIRECTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Escreva uma anotação..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
            <Button onClick={handleAddNote} disabled={!note.trim() || createInteraction.isPending} className="w-full h-12 text-base">Salvar Anotação</Button>
          </div>

          <div className="bg-card rounded-xl border p-4 sm:p-5">
            <h2 className="font-semibold mb-3">Histórico</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {interactions.map(i => (
                <div key={i.id} className="border-l-2 border-border pl-3 py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium">{i.channel}</span>
                    <span>•</span>
                    <span>{i.direction}</span>
                    <span>•</span>
                    <span>{new Date(i.created_at).toLocaleString('pt-BR')}</span>
                    {i.ai_generated && <Badge variant="outline" className="text-[10px] px-1">IA</Badge>}
                  </div>
                  <p className="text-sm mt-1">{i.note_text}</p>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma interação registrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
