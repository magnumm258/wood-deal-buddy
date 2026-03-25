import { Badge } from '@/components/ui/badge';
import { getTemperature, getTemperatureEmoji, getTemperatureClass, calculateLeadScore } from '@/lib/leadScoring';
import type { Lead } from '@/hooks/useLeads';

interface Props {
  lead: Lead;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export default function TemperatureBadge({ lead, showScore, size = 'sm' }: Props) {
  const score = calculateLeadScore(lead);
  const temp = getTemperature(score);
  const emoji = getTemperatureEmoji(temp);
  const cls = getTemperatureClass(temp);

  return (
    <Badge variant="outline" className={`${cls} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}`}>
      {emoji} {temp}{showScore ? ` (${score})` : ''}
    </Badge>
  );
}
