import type { Lead } from '@/hooks/useLeads';

export type Temperature = 'Quente' | 'Morno' | 'Frio';

export function calculateLeadScore(lead: Lead): number {
  let score = 0;

  // Budget weight (0-25)
  switch (lead.orcamento) {
    case 'Acima de R$ 20.000': score += 25; break;
    case 'R$ 10.000 a R$ 20.000': score += 20; break;
    case 'R$ 4.000 a R$ 10.000': score += 15; break;
    case 'Até R$ 4.000': score += 5; break;
  }

  // Urgency weight (0-25)
  switch (lead.urgencia) {
    case 'Urgente': score += 25; break;
    case 'Até 30 dias': score += 15; break;
    case 'Só pesquisando': score += 5; break;
  }

  // Status weight (0-20)
  switch (lead.status) {
    case 'Em negociação': score += 20; break;
    case 'Orçamento enviado': score += 15; break;
    case 'Contato iniciado': score += 10; break;
    case 'Novo lead': score += 5; break;
    case 'Fechado ganho': score += 0; break;
    case 'Perdido': score -= 10; break;
  }

  // Has measurements (+10)
  if (lead.measurement && lead.measurement.trim()) score += 10;

  // Recency of interaction (0-15)
  if (lead.last_interaction_at) {
    const daysSince = (Date.now() - new Date(lead.last_interaction_at).getTime()) / 86400000;
    if (daysSince < 1) score += 15;
    else if (daysSince < 3) score += 10;
    else if (daysSince < 5) score += 5;
    else if (daysSince > 7) score -= 10;
  } else {
    // New lead without any interaction — slightly penalize
    score += 5;
  }

  // Overdue follow-up penalty
  if (lead.next_followup_at && new Date(lead.next_followup_at) < new Date()) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

export function getTemperature(score: number): Temperature {
  if (score >= 65) return 'Quente';
  if (score >= 35) return 'Morno';
  return 'Frio';
}

export function getTemperatureEmoji(temp: Temperature): string {
  switch (temp) {
    case 'Quente': return '🔥';
    case 'Morno': return '🌤️';
    case 'Frio': return '❄️';
  }
}

export function getTemperatureClass(temp: Temperature): string {
  switch (temp) {
    case 'Quente': return 'bg-red-100 text-red-700 border-red-200';
    case 'Morno': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Frio': return 'bg-blue-100 text-blue-700 border-blue-200';
  }
}
