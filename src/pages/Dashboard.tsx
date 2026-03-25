import { useLeads } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, getAlertLevel } from '@/lib/constants';
import NewLeadDialog from '@/components/NewLeadDialog';
import CommercialAlerts from '@/components/CommercialAlerts';
import TemperatureBadge from '@/components/TemperatureBadge';
import { Users, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: leads = [] } = useLeads();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const leadsToday = leads.filter(l => new Date(l.created_at).toDateString() === today).length;
  const activeQuotes = leads.filter(l => l.status === 'Orçamento enviado').length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const salesThisMonth = leads
    .filter(l => l.status === 'Fechado ganho' && new Date(l.updated_at) >= monthStart)
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);
  const overdueLeads = leads.filter(l => l.next_followup_at && new Date(l.next_followup_at) < now && !['Fechado ganho', 'Perdido'].includes(l.status)).length;

  const metrics = [
    { label: 'Leads Hoje', value: leadsToday, icon: Users, color: 'text-primary' },
    { label: 'Orçamentos Ativos', value: activeQuotes, icon: FileText, color: 'text-accent' },
    { label: 'Vendas no Mês', value: formatCurrency(salesThisMonth), icon: TrendingUp, color: 'text-primary' },
    { label: 'Follow-ups Pendentes', value: overdueLeads, icon: AlertTriangle, color: 'text-destructive', link: '/followup' },
  ];

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'Vendedor';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Olá, {firstName}! 👋</h1>
          <p className="text-muted-foreground text-sm">Resumo do dia</p>
        </div>
        <NewLeadDialog />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map(m => (
          <div
            key={m.label}
            className={`metric-card ${(m as any).link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => (m as any).link && navigate((m as any).link)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">{m.label}</span>
              <m.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${m.color}`} />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Commercial Alerts */}
      <CommercialAlerts leads={leads} />

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Leads Recentes</h2>
          <Link to="/followup" className="text-sm text-primary hover:underline">Ver agenda →</Link>
        </div>
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Produto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Cidade</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Temp.</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 8).map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/lead/${l.id}`)}>
                  <td className="p-3">
                    <span className="font-medium">{l.name}</span>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{l.product_category}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{l.city}</td>
                  <td className="p-3 hidden lg:table-cell"><TemperatureBadge lead={l} /></td>
                  <td className="p-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum lead ainda. Clique em "Novo Lead" para começar!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
