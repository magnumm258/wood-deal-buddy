import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { WHATSAPP_TEMPLATES, fillTemplate, buildWhatsAppUrl } from '@/lib/whatsappTemplates';
import { MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/hooks/useLeads';

interface Props {
  lead: Lead;
  vendorName: string;
}

export default function WhatsAppActions({ lead, vendorName }: Props) {
  const { toast } = useToast();
  const [selectedMsg, setSelectedMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const vars = {
    nome: lead.name,
    cidade: lead.city,
    produto: lead.product_category,
    vendedor: vendorName,
  };

  const categories = [...new Set(WHATSAPP_TEMPLATES.map(t => t.category))];

  const handleSelect = (template: string) => {
    setSelectedMsg(fillTemplate(template, vars));
  };

  const filteredTemplates = activeCategory
    ? WHATSAPP_TEMPLATES.filter(t => t.category === activeCategory)
    : WHATSAPP_TEMPLATES;

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-5 space-y-3">
      <h2 className="font-semibold flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        Templates WhatsApp
      </h2>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={activeCategory === null ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => setActiveCategory(null)}
        >
          Todos
        </Badge>
        {categories.map(c => (
          <Badge
            key={c}
            variant={activeCategory === c ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      {/* Template buttons */}
      <div className="flex flex-wrap gap-1.5">
        {filteredTemplates.map(t => (
          <Button key={t.id} variant="outline" size="sm" className="text-xs h-8" onClick={() => handleSelect(t.message)}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Preview & actions */}
      {selectedMsg && (
        <div className="space-y-2">
          <Textarea value={selectedMsg} onChange={e => setSelectedMsg(e.target.value)} rows={4} className="text-sm" />
          <div className="flex gap-2">
            <a href={buildWhatsAppUrl(lead.phone, selectedMsg)} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <ExternalLink className="h-3.5 w-3.5" />
                Enviar no WhatsApp
              </Button>
            </a>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(selectedMsg); toast({ title: 'Copiado!' }); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
