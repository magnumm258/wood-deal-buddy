import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateLead } from '@/hooks/useLeads';
import { PRODUCT_CATEGORIES, BUDGET_OPTIONS, URGENCY_OPTIONS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function NewLeadDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', city: '', state: '',
    product_category: 'Outros', source: 'WhatsApp' as string,
    estimated_value: 0, measurement: '',
    orcamento: '', urgencia: '',
  });
  const create = useCreateLead();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Preencha Nome e WhatsApp', variant: 'destructive' });
      return;
    }
    try {
      await create.mutateAsync(form);
      toast({ title: 'Lead criado com sucesso!' });
      setOpen(false);
      setForm({ name: '', phone: '', city: '', state: '', product_category: 'Outros', source: 'WhatsApp', estimated_value: 0, measurement: '', orcamento: '', urgencia: '' });
    } catch (err: any) {
      toast({ title: 'Erro ao criar lead', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 text-base"><Plus className="h-5 w-5" />Novo Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact - Required */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato</Label>
            <Input placeholder="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="h-12 text-base" />
            <Input placeholder="WhatsApp *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className="h-12 text-base" />
          </div>

          {/* Pre-qualification */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pré-qualificação</Label>
            <Select value={form.product_category} onValueChange={v => setForm(f => ({ ...f, product_category: v }))}>
              <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Produto de interesse" /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Medidas" value={form.measurement} onChange={e => setForm(f => ({ ...f, measurement: e.target.value }))} className="h-12 text-base" />
            <Input placeholder="Cidade" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="h-12 text-base" />
            <Select value={form.orcamento || '_none'} onValueChange={v => setForm(f => ({ ...f, orcamento: v === '_none' ? '' : v }))}>
              <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Qual seu orçamento estimado?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Selecione o orçamento</SelectItem>
                {BUDGET_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.urgencia || '_none'} onValueChange={v => setForm(f => ({ ...f, urgencia: v === '_none' ? '' : v }))}>
              <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Para quando você precisa?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Selecione a urgência</SelectItem>
                {URGENCY_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full text-base h-12" disabled={create.isPending}>
            {create.isPending ? 'Salvando...' : 'Criar Lead'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
