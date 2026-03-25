import { useState, useMemo } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { getAlertLevel } from '@/lib/constants';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewLeadDialog from '@/components/NewLeadDialog';
import LeadFilters from '@/components/LeadFilters';

export default function LeadsList() {
  const { data: leads = [] } = useLeads();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const cities = useMemo(() => [...new Set(leads.map(l => l.city).filter(Boolean))].sort(), [leads]);
  const products = useMemo(() => [...new Set(leads.map(l => l.product_category).filter(Boolean))].sort(), [leads]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (budgetFilter !== 'all' && (l as any).orcamento !== budgetFilter) return false;
      if (urgencyFilter !== 'all' && (l as any).urgencia !== urgencyFilter) return false;
      if (cityFilter !== 'all' && l.city !== cityFilter) return false;
      if (productFilter !== 'all' && l.product_category !== productFilter) return false;
      return true;
    });
  }, [leads, search, statusFilter, budgetFilter, urgencyFilter, cityFilter, productFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Leads</h1>
        <NewLeadDialog />
      </div>

      <LeadFilters
        search={search} onSearchChange={setSearch}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        budgetFilter={budgetFilter} onBudgetChange={setBudgetFilter}
        urgencyFilter={urgencyFilter} onUrgencyChange={setUrgencyFilter}
        cityFilter={cityFilter} onCityChange={setCityFilter} cities={cities}
        productFilter={productFilter} onProductChange={setProductFilter} products={products}
      />

      <div className="bg-card rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Produto</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Cidade</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Orçamento</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Urgência</th>
              <th className="text-left p-3 font-medium">Data</th>
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
                    <p className="text-xs text-muted-foreground sm:hidden">{l.product_category}</p>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{l.product_category}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{l.city}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{(l as any).orcamento || '—'}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{(l as any).urgencia || '—'}</td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
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
