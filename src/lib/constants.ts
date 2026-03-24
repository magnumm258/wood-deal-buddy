export const PRODUCT_CATEGORIES = [
  'Telhado', 'Deck', 'Forro', 'Assoalho', 'Parede', 'Esquadrias', 'Outros'
] as const;

export const PRIORITY_LEVELS = ['Baixo', 'Médio', 'Alto', 'Premium'] as const;

export const LEAD_SOURCES = ['WhatsApp', 'Instagram', 'Tráfego Pago', 'Indicação'] as const;

export const LEAD_STATUSES = [
  'Contato Iniciado',
  'Definindo Medidas',
  'Orçamento Enviado',
  'Negociação',
  'Fechado Ganho',
  'Fechado Perdido',
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

export function getNextFollowup(status: string): Date {
  const now = new Date();
  switch (status) {
    case 'Contato Iniciado': return new Date(now.getTime() + 1 * 86400000);
    case 'Definindo Medidas': return new Date(now.getTime() + 2 * 86400000);
    case 'Orçamento Enviado': return new Date(now.getTime() + 1 * 86400000);
    case 'Negociação': return new Date(now.getTime() + 3 * 86400000);
    default: return now;
  }
}

export type AlertLevel = 'none' | 'yellow' | 'orange' | 'red';

export function getAlertLevel(status: string, lastInteraction: string | null): AlertLevel {
  if (!lastInteraction) return 'none';
  if (['Fechado Ganho', 'Fechado Perdido'].includes(status)) return 'none';

  const diff = (Date.now() - new Date(lastInteraction).getTime()) / 86400000;

  if (diff > 7) return 'red';
  if (['Negociação'].includes(status) && diff > 3) return 'orange';
  if (['Contato Iniciado', 'Orçamento Enviado'].includes(status) && diff > 1) return 'yellow';
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
