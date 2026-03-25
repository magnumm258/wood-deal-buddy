export interface WhatsAppTemplate {
  id: string;
  label: string;
  category: string;
  message: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'primeira_abordagem',
    label: 'Primeira Abordagem',
    category: 'Prospecção',
    message: 'Olá {nome}! 👋 Sou {vendedor} da Madeiras Teresense. Vi que você tem interesse em {produto}. Gostaria de ajudá-lo(a) com o melhor orçamento! Pode me contar mais sobre o que precisa?',
  },
  {
    id: 'pedido_medidas',
    label: 'Pedido de Medidas',
    category: 'Qualificação',
    message: 'Olá {nome}! Para preparar um orçamento preciso do seu {produto}, preciso das medidas da área. Poderia me enviar comprimento x largura (em metros)? Assim consigo calcular a quantidade exata de material. 📐',
  },
  {
    id: 'envio_orcamento',
    label: 'Envio de Orçamento',
    category: 'Negociação',
    message: 'Olá {nome}! 📋 Preparei o orçamento do seu {produto} para {cidade}. Segue os detalhes... Frete incluso! Caso tenha dúvidas ou queira ajustar, estou à disposição.',
  },
  {
    id: 'followup_1',
    label: 'Follow-up 1',
    category: 'Follow-up',
    message: 'Olá {nome}! Tudo bem? 😊 Gostaria de saber se conseguiu analisar o orçamento que enviei do {produto}. Tem alguma dúvida? Estou à disposição!',
  },
  {
    id: 'followup_2',
    label: 'Follow-up 2',
    category: 'Follow-up',
    message: '{nome}, bom dia! Só passando para lembrar que o orçamento do seu {produto} segue disponível. Temos condição especial para fechamento esta semana! 🤝',
  },
  {
    id: 'followup_3',
    label: 'Follow-up 3',
    category: 'Follow-up',
    message: 'Olá {nome}! Não quero ser insistente, mas gostaria de saber se ainda tem interesse no {produto}. Caso tenha encontrado outra solução, sem problema! Se puder me dar um retorno, agradeço. 🙏',
  },
  {
    id: 'reativacao',
    label: 'Reativação',
    category: 'Reativação',
    message: 'Olá {nome}! Aqui é {vendedor} da Madeiras Teresense. Há um tempo conversamos sobre {produto}. Temos novidades e condições especiais! Ainda tem interesse? 🌟',
  },
  {
    id: 'objecao_preco',
    label: 'Objeção de Preço',
    category: 'Negociação',
    message: '{nome}, entendo sua preocupação com o valor. Nossa madeira é de alta qualidade e durabilidade, o que garante economia a longo prazo. Posso verificar uma condição especial para viabilizar? 💰',
  },
  {
    id: 'fechamento',
    label: 'Fechamento',
    category: 'Fechamento',
    message: '{nome}, ótima notícia! Consegui uma condição especial para o seu pedido de {produto} para {cidade}. Para garantir esse valor, preciso da confirmação até [data]. Vamos fechar? 🎉',
  },
];

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.split(`{${key}}`).join(value || 'não informado');
  });
  return result;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/55${clean}?text=${encodeURIComponent(message)}`;
}
