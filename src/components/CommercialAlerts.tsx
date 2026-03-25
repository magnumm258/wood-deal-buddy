import type { Lead } from '@/hooks/useLeads';
import { AlertTriangle, Clock, Flame, Mail, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alert {
  icon: React.ElementType;
  label: string;
  leads: Lead[];
  color: string;
}

function getAlerts(leads: Lead[]): Alert[] {
  const active = leads.filter(l => !['Fechado ganho', 'Perdido'].includes(l.status));
  const now = Date.now();

  const noContact = active.filter(l => l.status === 'Novo lead' && (!l.last_interaction_at || (now - new Date(l.last_interaction_at).getTime()) / 86400000 > 1));
  const overdueFollowup = active.filter(l => l.next_followup_at && new Date(l.next_followup_at) < new Date());
  const hotStalled = active.filter(l => {
    if (!l.last_interaction_at) return false;
    const days = (now - new Date(l.last_interaction_at).getTime()) / 86400000;
    return ['Em negociação', 'Orçamento enviado'].includes(l.status) && days > 2;
  });
  const quoteNoReturn = active.filter(l => {
    if (l.status !== 'Orçamento enviado' || !l.last_interaction_at) return false;
    return (now - new Date(l.last_interaction_at).getTime()) / 86400000 > 3;
  });
  const noContactLong = active.filter(l => {
    if (!l.last_interaction_at) return false;
    return (now - new Date(l.last_interaction_at).getTime()) / 86400000 > 7;
  });

  return [
    { icon: UserX, label: 'Leads sem atendimento', leads: noContact, color: 'text-destructive' },
    { icon: Clock, label: 'Follow-up vencido', leads: overdueFollowup, color: 'text-orange-500' },
    { icon: Flame, label: 'Lead quente parado', leads: hotStalled, color: 'text-red-500' },
    { icon: Mail, label: 'Orçamento sem retorno', leads: quoteNoReturn, color: 'text-amber-500' },
    { icon: AlertTriangle, label: 'Sem contato há 7+ dias', leads: noContactLong, color: 'text-destructive' },
  ].filter(a => a.leads.length > 0);
}

export default function CommercialAlerts({ leads }: { leads: Lead[] }) {
  const alerts = getAlerts(leads);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        Alertas Comerciais
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {alerts.map(a => (
          <div key={a.label} className="bg-card border rounded-lg p-3 flex items-start gap-3">
            <a.icon className={`h-5 w-5 shrink-0 mt-0.5 ${a.color}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.leads.length} lead{a.leads.length > 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {a.leads.slice(0, 3).map(l => (
                  <Link key={l.id} to={`/lead/${l.id}`} className="text-[11px] text-primary hover:underline truncate max-w-[120px]">
                    {l.name}
                  </Link>
                ))}
                {a.leads.length > 3 && <span className="text-[11px] text-muted-foreground">+{a.leads.length - 3}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
