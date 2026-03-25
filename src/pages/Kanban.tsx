import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { LEAD_STATUSES, getAlertLevel, getPriorityClass } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import TemperatureBadge from '@/components/TemperatureBadge';
import LostReasonDialog from '@/components/LostReasonDialog';
import NewLeadDialog from '@/components/NewLeadDialog';
import LeadFilters from '@/components/LeadFilters';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  'Novo lead': 'bg-blue-500',
  'Contato iniciado': 'bg-purple-500',
  'Orçamento enviado': 'bg-orange-500',
  'Em negociação': 'bg-amber-500',
  'Fechado ganho': 'bg-emerald-500',
  'Perdido': 'bg-red-500',
};

export default function Kanban() {
  const { data: leads = [] } = useLeads();
  const updateLead = useUpdateLead();
  const { toast } = useToast();
  const [lostDialog, setLostDialog] = useState<{ open: boolean; leadId: string }>({ open: false, leadId: '' });

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
      if (budgetFilter !== 'all' && l.orcamento !== budgetFilter) return false;
      if (urgencyFilter !== 'all' && l.urgencia !== urgencyFilter) return false;
      if (cityFilter !== 'all' && l.city !== cityFilter) return false;
      if (productFilter !== 'all' && l.product_category !== productFilter) return false;
      return true;
    });
  }, [leads, search, statusFilter, budgetFilter, urgencyFilter, cityFilter, productFilter]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const leadId = result.draggableId;

    if (newStatus === 'Perdido') {
      setLostDialog({ open: true, leadId });
      return;
    }

    updateLead.mutate({ id: leadId, status: newStatus }, {
      onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
  };

  const handleLostConfirm = (reason: string) => {
    updateLead.mutate({ id: lostDialog.leadId, status: 'Perdido', lost_reason: reason });
    setLostDialog({ open: false, leadId: '' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Funil de Vendas</h1>
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

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-scroll flex gap-3">
          {LEAD_STATUSES.map(status => {
            const columnLeads = filtered.filter(l => l.status === status);
            return (
              <div key={status} className="min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] shrink-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status] || 'bg-muted'}`} />
                  <span className="text-sm font-semibold">{status}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{columnLeads.length}</span>
                </div>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column space-y-2">
                      {columnLeads.map((lead, idx) => {
                        const alert = getAlertLevel(lead.status, lead.last_interaction_at);
                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                            {(provided) => (
                              <Link to={`/lead/${lead.id}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <div className="lead-card">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="font-medium text-sm truncate">{lead.name}</p>
                                    {alert !== 'none' && (
                                      <AlertCircle className={`h-4 w-4 shrink-0 ${
                                        alert === 'red' ? 'text-destructive' : alert === 'orange' ? 'text-orange-500' : 'text-amber-500'
                                      }`} />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{lead.product_category}</p>
                                  {lead.orcamento && (
                                    <p className="text-xs text-muted-foreground">{lead.orcamento}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-2 gap-1">
                                    <TemperatureBadge lead={lead} />
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityClass(lead.priority_level)}`}>
                                      {lead.priority_level}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <LostReasonDialog
        open={lostDialog.open}
        onClose={() => setLostDialog({ open: false, leadId: '' })}
        onConfirm={handleLostConfirm}
      />
    </div>
  );
}
