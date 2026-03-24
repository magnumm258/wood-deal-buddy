import { useState, useMemo } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { formatCurrency, getPriorityClass, getAlertLevel, LEAD_STATUSES, PRIORITY_LEVELS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewLeadDialog from '@/components/NewLeadDialog';

export default function LeadsList() {
  const { data: leads = [] } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || l.priority_level === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [leads, search, statusFilter, priorityFilter]);

  return (
    <div className="p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <NewLeadDialog />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou cidade..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORITY_LEVELS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Cidade</th>
              <th className="text-left p-3 font-medium">Categoria</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Prioridade</th>
              <th className="text-right p-3 font-medium">Valor</th>
              <th className="text-center p-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const alert = getAlertLevel(l.status, l.last_interaction_at);
              return (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <Link to={`/lead/${l.id}`} className="font-medium hover:text-primary transition-colors">{l.name}</Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{l.city}/{l.state}</td>
                  <td className="p-3 text-muted-foreground">{l.product_category}</td>
                  <td className="p-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary">{l.status}</span></td>
                  <td className="p-3">
                    <Badge variant="outline" className={`text-xs ${getPriorityClass(l.priority_level)}`}>{l.priority_level}</Badge>
                  </td>
                  <td className="p-3 text-right font-medium">{formatCurrency(l.estimated_value)}</td>
                  <td className="p-3 text-center">
                    {alert !== 'none' && (
                      <AlertCircle className={`h-4 w-4 inline ${
                        alert === 'red' ? 'text-destructive' : alert === 'orange' ? 'text-orange-500' : 'text-amber-500'
                      }`} />
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum lead encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
