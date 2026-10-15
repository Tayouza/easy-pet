export const DEFAULT_LOCATION = { lat: -30.0331, lng: -51.23, label: 'Praça da Matriz, Porto Alegre' } as const;
export const DEFAULT_RADIUS_M = 5000;
export const MIN_RADIUS_M = 1000;
export const MAX_RADIUS_M = 20000;
export const FREE_FAVORITES_LIMIT = 5;
export const PREMIUM_PRICE_CENTS = 990;
export const TIMEZONE = 'America/Sao_Paulo';

export type CategoryId =
  | 'pet-shop'
  | 'agropecuaria'
  | 'veterinario'
  | 'clinica'
  | 'banho-tosa'
  | 'hotel-creche'
  | 'adestrador'
  | 'dog-walker'
  | 'farmacia'
  | 'laboratorio'
  | 'aquarismo'
  | 'petiscaria'
  | 'fotografo'
  | 'ong-adocao'
  | 'funeraria';

export interface CategoryMeta {
  id: CategoryId;
  nome: string;
  cor: string;
  /** Nome do ícone no @expo/vector-icons Ionicons */
  ionicon: string;
  /** Nome do componente em lucide-react */
  lucide: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'pet-shop', nome: 'Pet Shop', cor: '#FF6B35', ionicon: 'storefront', lucide: 'Store' },
  { id: 'agropecuaria', nome: 'Agropecuária', cor: '#7A9E3B', ionicon: 'leaf', lucide: 'Wheat' },
  { id: 'veterinario', nome: 'Veterinário', cor: '#2B7FFF', ionicon: 'medkit', lucide: 'Stethoscope' },
  { id: 'clinica', nome: 'Clínica e Hospital Vet', cor: '#D64545', ionicon: 'medical', lucide: 'Hospital' },
  { id: 'banho-tosa', nome: 'Banho e Tosa', cor: '#3BB3C4', ionicon: 'water', lucide: 'Bath' },
  { id: 'hotel-creche', nome: 'Hotel e Creche', cor: '#8E5CD9', ionicon: 'bed', lucide: 'Hotel' },
  { id: 'adestrador', nome: 'Adestrador', cor: '#E0A100', ionicon: 'ribbon', lucide: 'Award' },
  { id: 'dog-walker', nome: 'Dog Walker e Pet Sitter', cor: '#2E9E5B', ionicon: 'walk', lucide: 'Footprints' },
  { id: 'farmacia', nome: 'Farmácia Veterinária', cor: '#E85D9A', ionicon: 'bandage', lucide: 'Pill' },
  { id: 'laboratorio', nome: 'Laboratório e Exames', cor: '#5468D4', ionicon: 'flask', lucide: 'FlaskConical' },
  { id: 'aquarismo', nome: 'Aquarismo', cor: '#1E88C7', ionicon: 'fish', lucide: 'Fish' },
  { id: 'petiscaria', nome: 'Petiscaria Artesanal', cor: '#B5651D', ionicon: 'nutrition', lucide: 'Cookie' },
  { id: 'fotografo', nome: 'Fotógrafo Pet', cor: '#6D6875', ionicon: 'camera', lucide: 'Camera' },
  { id: 'ong-adocao', nome: 'ONG e Adoção', cor: '#F25C78', ionicon: 'heart', lucide: 'HeartHandshake' },
  { id: 'funeraria', nome: 'Crematório e Memorial', cor: '#4A4E69', ionicon: 'flower', lucide: 'Flower2' },
];

export const CATEGORY_BY_ID: Record<string, CategoryMeta> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryMeta(id: string | null | undefined): CategoryMeta {
  return (id && CATEGORY_BY_ID[id]) || CATEGORIES[0];
}

export const PREMIUM_BENEFITS = [
  { icon: 'ban', titulo: 'Sem anúncios', descricao: 'Navegue sem lojas patrocinadas no meio da busca.' },
  { icon: 'ticket', titulo: 'Cupons exclusivos', descricao: 'Descontos reais nas lojas parceiras.' },
  { icon: 'heart', titulo: 'Favoritos ilimitados', descricao: 'Na versão grátis o limite é 5.' },
  { icon: 'options', titulo: 'Filtros avançados', descricao: '"Aberto agora" e "Melhor avaliadas".' },
  { icon: 'id-card', titulo: 'Carteirinha do pet', descricao: 'Vacinas e próximas doses sempre à mão.' },
  { icon: 'star', titulo: 'Selo Premium', descricao: 'Destaque no seu perfil e nas avaliações.' },
] as const;

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
