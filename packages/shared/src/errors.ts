export type BusinessErrorCode = 'LIMITE_FAVORITOS' | 'LIMITE_ITENS' | 'PLANO_NECESSARIO' | 'PLANO_SEM_CUPONS';

export interface FriendlyError {
  code: BusinessErrorCode | 'GENERICO';
  titulo: string;
  mensagem: string;
  /** Ação sugerida para o botão do modal */
  cta?: { label: string; destino: 'premium' | 'planos' };
}

const MESSAGES: Record<BusinessErrorCode, Omit<FriendlyError, 'code'>> = {
  LIMITE_FAVORITOS: {
    titulo: 'Limite de favoritos',
    mensagem: 'Na versão grátis você pode salvar até 5 lojas. Seja Premium para favoritos ilimitados.',
    cta: { label: 'Conhecer o Premium', destino: 'premium' },
  },
  LIMITE_ITENS: {
    titulo: 'Limite do plano',
    mensagem: 'Seu plano atual chegou ao limite de produtos e serviços. Faça upgrade para cadastrar mais.',
    cta: { label: 'Ver planos', destino: 'planos' },
  },
  PLANO_NECESSARIO: {
    titulo: 'Assine um plano',
    mensagem: 'Para cadastrar produtos e serviços sua loja precisa de um plano ativo.',
    cta: { label: 'Ver planos', destino: 'planos' },
  },
  PLANO_SEM_CUPONS: {
    titulo: 'Cupons no Profissional',
    mensagem: 'Cupons de desconto estão disponíveis a partir do plano Profissional.',
    cta: { label: 'Ver planos', destino: 'planos' },
  },
};

export function toFriendlyError(err: unknown): FriendlyError {
  const msg = typeof err === 'string' ? err : ((err as { message?: string } | null)?.message ?? '');
  const code = (Object.keys(MESSAGES) as BusinessErrorCode[]).find((c) => msg.includes(c));
  if (code) return { code, ...MESSAGES[code] };
  return { code: 'GENERICO', titulo: 'Algo deu errado', mensagem: msg || 'Tente novamente em instantes.' };
}
