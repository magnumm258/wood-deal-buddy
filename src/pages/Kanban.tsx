import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { LEAD_STATUSES, getAlertLevel, getPriorityClass, formatCurrency } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Phone } from 'lucide-react';
import LostReasonDialog from '@/components/LostReasonDialog';
import NewLeadDialog from '@/components/NewLeadDialog';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  'Contato Iniciado': 'bg-blue-500',
  'Definindo Medidas': 'bg-purple-500',
  'Orçamento Enviado': 'bg-orange-500',
  'Negociação': 'bg-amber-500',
  'Fechado Ganho': 'bg-emerald-500',
  'Fechado Perdido': 'bg-red-500',
};

export default function Kanban() {
  const { data: leads = [] } = useLeads();
  const updateLead = useUpdateLead();
  const { toast } = useToast();
  const [lostDialog, setLostDialog] = useState<{ open: boolean; leadId: string }>({ open: false, leadId: '' });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const leadId = result.draggableId;

    if (newStatus === 'Fechado Perdido') {
      setLostDialog({ open: true, leadId });
      return;
    }

    updateLead.mutate({ id: leadId, status: newStatus }, {
      onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
    });
  };

  const handleLostConfirm = (reason: string) => {
    updateLead.mutate({ id: lostDialog.leadId, status: 'Fechado Perdido', lost_reason: reason });
    setLostDialog({ open: false, leadId: '' });
  };

  return (
    <div className="p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Funil de Vendas</h1>
        <NewLeadDialog />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {LEAD_STATUSES.map(status => {
            const columnLeads = leads.filter(l => l.status === status);
            return (
              <div key={status} className="min-w-[260px] w-[260px] shrink-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
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
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-semibold">{formatCurrency(lead.estimated_value)}</span>
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
