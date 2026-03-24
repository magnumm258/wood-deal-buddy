import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateLead } from '@/hooks/useLeads';
import { PRODUCT_CATEGORIES, LEAD_SOURCES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export default function NewLeadDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', city: '', state: '',
    product_category: 'Outros', source: 'WhatsApp' as string,
    estimated_value: 0, measurement: '',
  });
  const create = useCreateLead();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync(form);
      toast({ title: 'Lead criado com sucesso!' });
      setOpen(false);
      setForm({ name: '', phone: '', city: '', state: '', product_category: 'Outros', source: 'WhatsApp', estimated_value: 0, measurement: '' });
    } catch (err: any) {
      toast({ title: 'Erro ao criar lead', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Novo Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="Cidade" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="UF" maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
            <Input placeholder="Medidas" value={form.measurement} onChange={e => setForm(f => ({ ...f, measurement: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.product_category} onValueChange={v => setForm(f => ({ ...f, product_category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input type="number" placeholder="Valor estimado (R$)" value={form.estimated_value || ''} onChange={e => setForm(f => ({ ...f, estimated_value: Number(e.target.value) }))} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Salvando...' : 'Criar Lead'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
