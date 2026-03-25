export const PRODUCT_CATEGORIES = [
  'Telhado', 'Deck', 'Forro', 'Assoalho', 'Parede', 'Esquadrias', 'Outros'
] as const;

export const PRIORITY_LEVELS = ['Baixo', 'Médio', 'Alto', 'Premium'] as const;

export const LEAD_SOURCES = ['WhatsApp', 'Instagram', 'Tráfego Pago', 'Indicação'] as const;

export const LEAD_STATUSES = [
  'Novo lead',
  'Contato iniciado',
  'Orçamento enviado',
  'Em negociação',
  'Fechado ganho',
  'Perdido',
] as const;

export const BUDGET_OPTIONS = [
  'Até R$ 4.000',
  'R$ 4.000 a R$ 10.000',
  'R$ 10.000 a R$ 20.000',
  'Acima de R$ 20.000',
] as const;

export const URGENCY_OPTIONS = [
  'Urgente',
  'Até 30 dias',
  'Só pesquisando',
] as const;

export const INTERACTION_CHANNELS = ['WhatsApp', 'Ligação', 'Instagram', 'Presencial', 'Sistema'] as const;
export const INTERACTION_DIRECTIONS = ['Entrada', 'Saída', 'Interno'] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[number];

export function calculatePriority(value: number): PriorityLevel {
  if (value <= 4000) return 'Baixo';
  if (value <= 10000) return 'Médio';
  if (value <= 20000) return 'Alto';
  return 'Premium';
}

export function calculatePriorityFromBudget(budget: string): PriorityLevel {
  switch (budget) {
    case 'Até R$ 4.000': return 'Baixo';
    case 'R$ 4.000 a R$ 10.000': return 'Médio';
    case 'R$ 10.000 a R$ 20.000': return 'Alto';
    case 'Acima de R$ 20.000': return 'Premium';
    default: return 'Baixo';
  }
}

export function getNextFollowup(status: string): Date {
  const now = new Date();
  switch (status) {
    case 'Novo lead': return new Date(now.getTime() + 1 * 86400000);
    case 'Contato iniciado': return new Date(now.getTime() + 1 * 86400000);
    case 'Orçamento enviado': return new Date(now.getTime() + 1 * 86400000);
    case 'Em negociação': return new Date(now.getTime() + 3 * 86400000);
    default: return now;
  }
}

export type AlertLevel = 'none' | 'yellow' | 'orange' | 'red';

export function getAlertLevel(status: string, lastInteraction: string | null): AlertLevel {
  if (!lastInteraction) return 'none';
  if (['Fechado ganho', 'Perdido'].includes(status)) return 'none';

  const diff = (Date.now() - new Date(lastInteraction).getTime()) / 86400000;

  if (diff > 7) return 'red';
  if (['Em negociação'].includes(status) && diff > 3) return 'orange';
  if (['Novo lead', 'Contato iniciado', 'Orçamento enviado'].includes(status) && diff > 1) return 'yellow';
  return 'none';
}

export function getPriorityClass(priority: string) {
  switch (priority) {
    case 'Baixo': return 'priority-badge-low';
    case 'Médio': return 'priority-badge-medium';
    case 'Alto': return 'priority-badge-high';
    case 'Premium': return 'priority-badge-premium';
    default: return 'priority-badge-low';
  }
}

export function formatCurrency(value: number | null) {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
