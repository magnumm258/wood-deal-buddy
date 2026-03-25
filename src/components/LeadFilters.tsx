import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BUDGET_OPTIONS, URGENCY_OPTIONS, LEAD_STATUSES } from '@/lib/constants';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  budgetFilter: string;
  onBudgetChange: (v: string) => void;
  urgencyFilter: string;
  onUrgencyChange: (v: string) => void;
  cityFilter: string;
  onCityChange: (v: string) => void;
  cities: string[];
  productFilter: string;
  onProductChange: (v: string) => void;
  products: string[];
}

export default function LeadFilters({
  search, onSearchChange,
  statusFilter, onStatusChange,
  budgetFilter, onBudgetChange,
  urgencyFilter, onUrgencyChange,
  cityFilter, onCityChange, cities,
  productFilter, onProductChange, products,
}: LeadFiltersProps) {
  const hasFilters = statusFilter !== 'all' || budgetFilter !== 'all' || urgencyFilter !== 'all' || cityFilter !== 'all' || productFilter !== 'all' || search;

  const clearAll = () => {
    onSearchChange('');
    onStatusChange('all');
    onBudgetChange('all');
    onUrgencyChange('all');
    onCityChange('all');
    onProductChange('all');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 items-center">
      <div className="relative sm:col-span-2 lg:flex-1 lg:min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." className="pl-9 h-10" value={search} onChange={e => onSearchChange(e.target.value)} />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={budgetFilter} onValueChange={onBudgetChange}>
        <SelectTrigger className="w-[170px] h-10"><SelectValue placeholder="Orçamento" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo Orçamento</SelectItem>
          {BUDGET_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={urgencyFilter} onValueChange={onUrgencyChange}>
        <SelectTrigger className="w-[150px] h-10"><SelectValue placeholder="Urgência" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toda Urgência</SelectItem>
          {URGENCY_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
        </SelectContent>
      </Select>
      {cities.length > 0 && (
        <Select value={cityFilter} onValueChange={onCityChange}>
          <SelectTrigger className="w-[140px] h-10"><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Cidades</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      {products.length > 0 && (
        <Select value={productFilter} onValueChange={onProductChange}>
          <SelectTrigger className="w-[140px] h-10"><SelectValue placeholder="Produto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Produtos</SelectItem>
            {products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground">
          <X className="h-3 w-3" />Limpar
        </Button>
      )}
    </div>
  );
}
