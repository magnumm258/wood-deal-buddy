import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PROMPTS: Record<string, string> = {
  respond: `Você é um vendedor experiente de madeiras para construção da empresa "Madeiras Teresense". Gere uma resposta de WhatsApp profissional e amigável para o cliente com base no contexto do lead. Seja direto, cordial e focado em fechar a venda.`,
  summarize: `Resuma o histórico deste lead de forma concisa. Inclua: situação atual, valor envolvido, produto de interesse e próximos passos sugeridos.`,
  next_step: `Com base no status atual e histórico deste lead, sugira o próximo passo ideal que o vendedor deve tomar. Seja específico e prático.`,
  objection: `O cliente tem objeções. Com base no contexto do lead, sugira 2-3 formas de contornar as objeções mais comuns para venda de madeiras (preço, prazo, qualidade). Seja persuasivo mas honesto.`,
  reactivate: `Este lead está inativo. Crie uma mensagem de reativação para WhatsApp que desperte o interesse do cliente novamente. Seja criativo e use gatilhos de urgência ou novidades.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, lead, interactions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = PROMPTS[type] || PROMPTS.respond;
    const leadContext = `
Lead: ${lead.name}
Produto: ${lead.product_category}
Valor: R$ ${lead.estimated_value}
Status: ${lead.status}
Cidade: ${lead.city}
Medidas: ${lead.measurement || 'Não informado'}
${lead.lost_reason ? `Motivo perda: ${lead.lost_reason}` : ''}

Últimas interações:
${(interactions || []).map((i: any) => `- [${i.channel}] ${i.note_text}`).join('\n') || 'Nenhuma'}
    `.trim();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: leadContext },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Sem resposta";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ai-response error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
