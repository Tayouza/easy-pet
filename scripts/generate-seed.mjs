// Gera supabase/seed.sql com dados de demonstração de Porto Alegre.
// Uso: node scripts/generate-seed.mjs
//
// Determinístico: RNG com semente fixa → mesmo seed.sql a cada execução.
// Datas são relativas a now()/current_date no SQL, então o seed continua
// coerente (assinaturas ativas, vacinas vencendo, eventos dos últimos 30 dias)
// em qualquer dia em que o `supabase db reset` rodar.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'supabase/seed.sql');

// ---------------------------------------------------------------------
// RNG determinístico (mulberry32)
// ---------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261014);
const rint = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const sample = (arr, n) => shuffle(arr).slice(0, n);
function weighted(pairs) {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) < 0) return v;
  }
  return pairs[pairs.length - 1][0];
}
function uuid() {
  const h = Array.from({ length: 32 }, () => Math.floor(rand() * 16).toString(16));
  h[12] = '4';
  h[16] = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  const s = h.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

// ---------------------------------------------------------------------
// Helpers SQL
// ---------------------------------------------------------------------
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (xs) => (xs.length ? `array[${xs.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const json = (o) => `${q(JSON.stringify(o))}::jsonb`;
/** timestamp N dias (fracionário) atrás, relativo ao momento do reset */
const ago = (days) => {
  const mins = Math.round(days * 24 * 60);
  return `now() - interval '${mins} minutes'`;
};
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'e')
    .replace(/[^a-z0-9]+/g, '');
const fone9 = () => `(51) 9${rint(8100, 9999)}-${rint(1000, 9999)}`;
const fone3 = () => `(51) 3${rint(200, 399)}-${rint(1000, 9999)}`;

// ---------------------------------------------------------------------
// Imagens (todas verificadas com curl → HTTP 200 e conferidas visualmente)
// ---------------------------------------------------------------------
const U = (id) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;
const IMG = {
  caes: [
    '1548199973-03cce0bbc87b', '1587300003388-59208cc962cb', '1543466835-00a7907e9de1',
    '1450778869180-41d0601e046e', '1517849845537-4d257902454a', '1583337130417-3346a1be7dee',
    '1576201836106-db1758fd1c97', '1558788353-f76d92427f16', '1530281700549-e82e7bf110d6',
    '1537151625747-768eb6cf92b2', '1561037404-61cd46aa615b', '1477884213360-7e9d7dcc1e48',
    '1522276498395-f4f68f7f8454', '1504595403659-9088ce801e29', '1507146426996-ef05306b995a',
    '1588943211346-0908a1fb0b01', '1544568100-847a948585b9', '1518717758536-85ae29035b6d',
    '1503256207526-0d5d80fa2f47', '1535930891776-0c2dfb7fda1a',
  ],
  gatos: [
    '1514888286974-6c03e2ca1dba', '1574158622682-e40e69881006', '1592194996308-7b43878e84a6',
    '1573865526739-10659fec78a5', '1495360010541-f48722b34f7d', '1571566882372-1598d88abd90',
    '1526336024174-e58f5cdd8e13', '1494256997604-768d1f608cac', '1472491235688-bdc81a63246e',
    '1511044568932-338cba0ad803', '1535268647677-300dbf3d78d1',
  ],
  vet: ['1628009368231-7bb7cfcb0def', '1599443015574-be5fe8a05783', '1415369629372-26f2fe60c467', '1606425271394-c3ca9aa1fc06'],
  banho: ['1516734212186-a967f81ad0d7', '1534361960057-19889db9621e', '1596492784531-6e6eb5ea9993', '1546527868-ccb7ee7dfa6a'],
  petshop: ['1589924691995-400dc9ecc119', '1425082661705-1834bfd09dca', '1548767797-d8c844163c4c', '1583512603805-3cc6b41f3edb'],
  grupo: ['1525253086316-d0c936c814f8', '1444212477490-ca407925329e', '1548199973-03cce0bbc87b', '1623387641168-d9803ddd3f35'],
  passeio: ['1477884213360-7e9d7dcc1e48', '1530281700549-e82e7bf110d6', '1576201836106-db1758fd1c97', '1524511751214-b0a384dd9afe', '1544568100-847a948585b9'],
  adestra: ['1552053831-71594a27632d', '1503256207526-0d5d80fa2f47', '1535930891776-0c2dfb7fda1a', '1537151625747-768eb6cf92b2'],
  retrato: ['1517849845537-4d257902454a', '1583337130417-3346a1be7dee', '1598133894008-61f7fdb8cc3a', '1583512603805-3cc6b41f3edb', '1530041539828-114de669390e', '1505628346881-b72b27e84530', '1533738363-b7f9aef128ce'],
  adocao: ['1601758228041-f3b2795255f1', '1525253086316-d0c936c814f8', '1444212477490-ca407925329e', '1507146426996-ef05306b995a'],
  campo: ['1587300003388-59208cc962cb', '1544568100-847a948585b9', '1524511751214-b0a384dd9afe', '1588943211346-0908a1fb0b01'],
  memorial: ['1524511751214-b0a384dd9afe', '1494256997604-768d1f608cac', '1560807707-8cc77767d783'],
  petisco: ['1589924691995-400dc9ecc119', '1518717758536-85ae29035b6d', '1561037404-61cd46aa615b'],
};
const IMG_BY_CAT = {
  'pet-shop': [...IMG.petshop, ...IMG.caes.slice(0, 8), ...IMG.gatos.slice(0, 4)],
  agropecuaria: IMG.campo,
  veterinario: [...IMG.vet, ...IMG.gatos.slice(4, 7)],
  clinica: IMG.vet,
  'banho-tosa': IMG.banho,
  'hotel-creche': IMG.grupo,
  adestrador: IMG.adestra,
  'dog-walker': IMG.passeio,
  farmacia: IMG.vet,
  laboratorio: IMG.vet,
  aquarismo: [], // nenhuma foto de aquário verificada → fallback dos apps
  petiscaria: IMG.petisco,
  fotografo: IMG.retrato,
  'ong-adocao': IMG.adocao,
  funeraria: IMG.memorial,
};

// ---------------------------------------------------------------------
// Catálogo (SPEC §1)
// ---------------------------------------------------------------------
const CATEGORIES = [
  ['pet-shop', 'Pet Shop', 'storefront', '#FF6B35'],
  ['agropecuaria', 'Agropecuária', 'leaf', '#7A9E3B'],
  ['veterinario', 'Veterinário', 'medkit', '#2B7FFF'],
  ['clinica', 'Clínica e Hospital Vet', 'medical', '#D64545'],
  ['banho-tosa', 'Banho e Tosa', 'water', '#3BB3C4'],
  ['hotel-creche', 'Hotel e Creche', 'bed', '#8E5CD9'],
  ['adestrador', 'Adestrador', 'ribbon', '#E0A100'],
  ['dog-walker', 'Dog Walker e Pet Sitter', 'walk', '#2E9E5B'],
  ['farmacia', 'Farmácia Veterinária', 'bandage', '#E85D9A'],
  ['laboratorio', 'Laboratório e Exames', 'flask', '#5468D4'],
  ['aquarismo', 'Aquarismo', 'fish', '#1E88C7'],
  ['petiscaria', 'Petiscaria Artesanal', 'nutrition', '#B5651D'],
  ['fotografo', 'Fotógrafo Pet', 'camera', '#6D6875'],
  ['ong-adocao', 'ONG e Adoção', 'heart', '#F25C78'],
  ['funeraria', 'Crematório e Memorial', 'flower', '#4A4E69'],
];

const PLANS = [
  {
    id: 'basico', nome: 'Básico', preco: 4990, max: 10, cupons: false, stats: false, destaque: false,
    beneficios: ['Perfil da loja com fotos e horários', 'Pin no mapa do EasyPet', 'Botões de WhatsApp, rota e telefone', 'Até 10 produtos ou serviços'],
  },
  {
    id: 'profissional', nome: 'Profissional', preco: 9990, max: null, cupons: true, stats: true, destaque: false,
    beneficios: ['Tudo do Básico', 'Produtos e serviços ilimitados', 'Cupons de desconto para clientes', 'Estatísticas de visitas e contatos'],
  },
  {
    id: 'destaque', nome: 'Destaque', preco: 19990, max: null, cupons: true, stats: true, destaque: true,
    beneficios: ['Tudo do Profissional', 'Topo dos resultados de busca', 'Pin destacado no mapa', 'Selo "Patrocinado" para clientes free'],
  },
];
const PLAN = Object.fromEntries(PLANS.map((p) => [p.id, p]));

// ---------------------------------------------------------------------
// Bairros (coordenadas em terra). `shore` = Guaíba a oeste/sul → jitter só
// para leste/norte, nunca em direção à água.
// ---------------------------------------------------------------------
const BAIRROS = {
  'Centro Histórico': { lat: -30.0318, lng: -51.2258, j: 0.0014, shore: true, cep: '90010', ruas: ['Rua dos Andradas', 'Av. Borges de Medeiros', 'Rua Riachuelo', 'Rua Duque de Caxias', 'Av. Salgado Filho', 'Rua General Câmara'] },
  'Cidade Baixa': { lat: -30.0405, lng: -51.2238, j: 0.0018, shore: true, cep: '90050', ruas: ['Rua da República', 'Rua João Alfredo', 'Rua Lima e Silva', 'Av. Venâncio Aires', 'Rua Sarmento Leite'] },
  'Bom Fim': { lat: -30.0328, lng: -51.2112, j: 0.0015, cep: '90035', ruas: ['Av. Osvaldo Aranha', 'Rua Fernandes Vieira', 'Rua Felipe Camarão', 'Rua Henrique Dias'] },
  'Moinhos de Vento': { lat: -30.0262, lng: -51.2025, j: 0.0016, cep: '90570', ruas: ['Rua Padre Chagas', 'Rua Dinarte Ribeiro', 'Rua Fernando Gomes', 'Av. Goethe', 'Rua Quintino Bocaiúva', 'Rua Mostardeiro'] },
  Petrópolis: { lat: -30.0425, lng: -51.1830, j: 0.0025, cep: '90460', ruas: ['Av. Protásio Alves', 'Rua Lucas de Oliveira', 'Rua Carlos Trein Filho', 'Av. Lageado'] },
  'Menino Deus': { lat: -30.0515, lng: -51.2205, j: 0.0018, shore: true, cep: '90150', ruas: ['Av. Getúlio Vargas', 'Rua José de Alencar', 'Rua Botafogo', 'Rua Barão do Gravataí'] },
  Floresta: { lat: -30.0218, lng: -51.2140, j: 0.0016, cep: '90560', ruas: ['Av. Cristóvão Colombo', 'Rua Comendador Coruja', 'Rua Gonçalo de Carvalho', 'Av. Farrapos'] },
  Higienópolis: { lat: -30.0165, lng: -51.1870, j: 0.0012, cep: '90540', ruas: ['Av. Plínio Brasil Milano', 'Rua Dom Pedro II'] },
  'Três Figueiras': { lat: -30.0345, lng: -51.1695, j: 0.0018, cep: '91330', ruas: ['Av. Nilo Peçanha', 'Rua Carlos Huber', 'Av. Carlos Gomes'] },
  'Bela Vista': { lat: -30.0372, lng: -51.1895, j: 0.0014, cep: '90450', ruas: ['Rua Anita Garibaldi', 'Rua Dr. Vale', 'Av. Carlos Gomes'] },
  "Mont'Serrat": { lat: -30.0287, lng: -51.1900, j: 0.0010, cep: '90440', ruas: ['Rua Tito Lívio Zambecari', 'Rua Pedro Ivo'] },
  Auxiliadora: { lat: -30.0205, lng: -51.1925, j: 0.0012, cep: '90520', ruas: ['Rua Coronel Bordini', 'Av. Plínio Brasil Milano', 'Rua Marquês do Pombal'] },
  'Rio Branco': { lat: -30.0335, lng: -51.2005, j: 0.0013, cep: '90420', ruas: ['Rua Mariante', 'Rua Casemiro de Abreu', 'Rua Vasco da Gama'] },
  Santana: { lat: -30.0478, lng: -51.2065, j: 0.0015, cep: '90040', ruas: ['Av. Princesa Isabel', 'Rua Jacinto Gomes', 'Av. Ipiranga', 'Rua Santana'] },
  Azenha: { lat: -30.0508, lng: -51.2150, j: 0.0012, cep: '90160', ruas: ['Av. da Azenha', 'Av. Ipiranga', 'Rua Silveiro'] },
  Partenon: { lat: -30.0615, lng: -51.1745, j: 0.0012, cep: '90620', ruas: ['Av. Bento Gonçalves', 'Av. Coronel Aparício Borges'] },
  'Jardim Botânico': { lat: -30.0515, lng: -51.1775, j: 0.0015, cep: '90690', ruas: ['Av. Ipiranga', 'Rua Dr. Salvador França'] },
  Tristeza: { lat: -30.1098, lng: -51.2492, j: 0.0018, shore: true, cep: '91920', ruas: ['Av. Wenceslau Escobar', 'Av. Otto Niemeyer', 'Rua Dr. Pereira Neto'] },
  Ipanema: { lat: -30.1378, lng: -51.2215, j: 0.0015, shore: true, cep: '91760', ruas: ['Av. Coronel Marcos', 'Rua Déa Coufal'] },
  Cavalhada: { lat: -30.1012, lng: -51.2282, j: 0.0018, cep: '91740', ruas: ['Av. Cavalhada', 'Av. Otto Niemeyer'] },
  Cristal: { lat: -30.0925, lng: -51.2380, j: 0.0010, shore: true, cep: '90820', ruas: ['Av. Icaraí', 'Rua Dr. Campos Velho'] },
  'Teresópolis': { lat: -30.0865, lng: -51.2030, j: 0.0018, cep: '91720', ruas: ['Av. Teresópolis', 'Av. Nonoai'] },
  Sarandi: { lat: -29.9925, lng: -51.1320, j: 0.0025, cep: '91140', ruas: ['Av. Assis Brasil', 'Rua Dr. Caio Brandão de Mello'] },
  "Passo d'Areia": { lat: -30.0100, lng: -51.1700, j: 0.0010, cep: '91030', ruas: ['Av. Assis Brasil', 'Rua Tupi'] },
  'São João': { lat: -30.0052, lng: -51.1862, j: 0.0015, cep: '91010', ruas: ['Av. Benjamin Constant', 'Av. Brasil'] },
  'Cristo Redentor': { lat: -30.0110, lng: -51.1560, j: 0.0010, cep: '91040', ruas: ['Av. Assis Brasil'] },
  'Chácara das Pedras': { lat: -30.0345, lng: -51.1630, j: 0.0012, cep: '91330', ruas: ['Rua João Berrutti', 'Rua Dr. Jorge Fayet'] },
  'Belém Novo': { lat: -30.1985, lng: -51.1700, j: 0.0020, shore: true, cep: '91780', ruas: ['Av. Heitor Vieira', 'Av. Juca Batista'] },
  Lami: { lat: -30.2250, lng: -51.0900, j: 0.0020, shore: true, cep: '91790', ruas: ['Estrada do Lami', 'Estrada Otaviano José Pinto'] },
  Restinga: { lat: -30.1490, lng: -51.1290, j: 0.0025, cep: '91790', ruas: ['Av. João Antônio da Silveira', 'Rua Economista Nilo Wulff'] },
  'Lomba do Pinheiro': { lat: -30.1130, lng: -51.1180, j: 0.0025, cep: '91550', ruas: ['Estrada João de Oliveira Remião', 'Estrada Afonso Lourenço Mariante'] },
};

function locate(bairro, rua) {
  const b = BAIRROS[bairro];
  if (!b) throw new Error(`bairro desconhecido: ${bairro}`);
  const sul = bairro === 'Belém Novo' || bairro === 'Lami'; // água a oeste e ao sul
  const dLat = sul ? rand() * b.j : (rand() * 2 - 1) * b.j; // lat cresce → norte
  const dLng = b.shore ? rand() * b.j : (rand() * 2 - 1) * b.j; // lng cresce → leste
  return {
    lat: +(b.lat + dLat).toFixed(6),
    lng: +(b.lng + dLng).toFixed(6),
    endereco: `${rua ?? pick(b.ruas)}, ${rint(40, 2400)}`,
    cep: `${b.cep}-${String(rint(0, 999)).padStart(3, '0')}`,
  };
}

// ---------------------------------------------------------------------
// Horários
// ---------------------------------------------------------------------
const H = (spec) => {
  // spec: { dias: [1,2,3,4,5], faixas: [["09:00","19:00"]] }[]
  const out = {};
  for (const { dias, faixas } of spec) for (const d of dias) out[String(d)] = faixas;
  return out;
};
const SEG_SEX = [1, 2, 3, 4, 5];
const SEG_SAB = [1, 2, 3, 4, 5, 6];
const TODOS = [0, 1, 2, 3, 4, 5, 6];
const HORARIOS = {
  comercial: H([{ dias: SEG_SEX, faixas: [['09:00', '19:00']] }, { dias: [6], faixas: [['09:00', '13:00']] }]),
  almoco: H([{ dias: SEG_SEX, faixas: [['08:30', '12:00'], ['13:30', '19:00']] }, { dias: [6], faixas: [['08:30', '12:30']] }]),
  estendido: H([{ dias: SEG_SAB, faixas: [['08:00', '20:00']] }, { dias: [0], faixas: [['09:00', '13:00']] }]),
  loja: H([{ dias: SEG_SEX, faixas: [['09:00', '19:30']] }, { dias: [6], faixas: [['09:00', '17:00']] }]),
  vet: H([{ dias: SEG_SEX, faixas: [['08:00', '12:00'], ['14:00', '19:00']] }, { dias: [6], faixas: [['09:00', '12:00']] }]),
  clinica: H([{ dias: SEG_SEX, faixas: [['08:00', '20:00']] }, { dias: [6], faixas: [['08:00', '14:00']] }]),
  h24: H([{ dias: TODOS, faixas: [['00:00', '23:59']] }]),
  banho: H([{ dias: [2, 3, 4, 5, 6], faixas: [['08:00', '18:00']] }]),
  banho2: H([{ dias: SEG_SAB, faixas: [['08:30', '18:30']] }]),
  hotel: H([{ dias: TODOS, faixas: [['07:00', '20:00']] }]),
  creche: H([{ dias: SEG_SEX, faixas: [['07:00', '19:30']] }, { dias: [6], faixas: [['08:00', '12:00']] }]),
  agro: H([{ dias: SEG_SEX, faixas: [['07:30', '12:00'], ['13:30', '18:00']] }, { dias: [6], faixas: [['07:30', '12:00']] }]),
  agendamento: H([{ dias: SEG_SEX, faixas: [['08:00', '18:00']] }, { dias: [6], faixas: [['08:00', '12:00']] }]),
  walker: H([{ dias: SEG_SEX, faixas: [['06:30', '20:00']] }, { dias: [6], faixas: [['08:00', '16:00']] }, { dias: [0], faixas: [['08:00', '12:00']] }]),
  farmacia: H([{ dias: SEG_SAB, faixas: [['08:00', '21:00']] }, { dias: [0], faixas: [['09:00', '13:00']] }]),
  lab: H([{ dias: SEG_SEX, faixas: [['07:30', '18:00']] }, { dias: [6], faixas: [['08:00', '12:00']] }]),
  aquario: H([{ dias: [2, 3, 4, 5, 6], faixas: [['10:00', '19:00']] }]),
  doceria: H([{ dias: SEG_SEX, faixas: [['10:00', '18:00']] }, { dias: [6], faixas: [['10:00', '14:00']] }]),
  estudio: H([{ dias: [2, 3, 4, 5, 6], faixas: [['09:00', '18:00']] }]),
  ong: H([{ dias: [3], faixas: [['14:00', '18:00']] }, { dias: [6], faixas: [['10:00', '16:00']] }]),
};
const HORARIOS_BY_CAT = {
  'pet-shop': ['comercial', 'almoco', 'estendido', 'loja'],
  agropecuaria: ['agro'],
  veterinario: ['vet', 'comercial', 'almoco'],
  clinica: ['clinica'],
  'banho-tosa': ['banho', 'banho2'],
  'hotel-creche': ['hotel', 'creche'],
  adestrador: ['agendamento'],
  'dog-walker': ['walker'],
  farmacia: ['farmacia', 'comercial'],
  laboratorio: ['lab'],
  aquarismo: ['aquario', 'loja'],
  petiscaria: ['doceria'],
  fotografo: ['estudio'],
  'ong-adocao': ['ong'],
  funeraria: ['h24'],
};

// ---------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------
const TAGS_BY_CAT = {
  'pet-shop': ['Delivery', 'Retirada na loja', 'Atende gatos'],
  agropecuaria: ['Estacionamento', 'Entrega na região', 'Grandes animais'],
  veterinario: ['Agendamento online', 'Vacinação', 'Atende gatos'],
  clinica: ['Internação', 'Cirurgias', 'Exames no local'],
  'banho-tosa': ['Leva e traz', 'Agendamento online', 'Produtos hipoalergênicos'],
  'hotel-creche': ['Monitoramento por câmera', 'Área verde', 'Leva e traz'],
  adestrador: ['Reforço positivo', 'Atendimento domiciliar', 'Agendamento online'],
  'dog-walker': ['Atendimento domiciliar', 'Relatório com fotos', 'Pet sitter'],
  farmacia: ['Delivery', 'Manipulação', 'Aceita receita digital'],
  laboratorio: ['Coleta domiciliar', 'Resultado online', 'Agendamento online'],
  aquarismo: ['Montagem de aquários', 'Peixes de água doce', 'Delivery'],
  petiscaria: ['Natural e sem conservantes', 'Delivery', 'Encomendas'],
  fotografo: ['Ensaio em estúdio', 'Ensaio externo', 'Agendamento online'],
  'ong-adocao': ['Adoção responsável', 'Aceita doações', 'Voluntariado'],
  funeraria: ['Atendimento 24h', 'Remoção', 'Cerimônia de despedida'],
};
const TAGS_EXTRA = ['Aceita Pix', 'Cartão de crédito', 'Estacionamento', 'Pet friendly', 'Acessível', 'Wi-Fi', 'Parcelamento'];

// ---------------------------------------------------------------------
// Itens por categoria: [tipo, nome, descricao, min, max, aPartir]
// (preço em centavos; null = sem preço)
// ---------------------------------------------------------------------
const P = 'produto';
const S = 'servico';
const ITEMS = {
  'pet-shop': [
    [P, 'Ração Super Premium Cães Adultos 15kg', 'Frango e arroz, sem corantes artificiais.', 18990, 24990],
    [P, 'Ração Gatos Castrados 10kg', 'Controle de peso e saúde urinária.', 16990, 21990],
    [P, 'Areia Higiênica Biodegradável 4kg', 'Grãos de mandioca, aglomera e não faz pó.', 2990, 4590],
    [P, 'Cama Nuvem Antiestresse M', 'Pelúcia macia, lavável na máquina.', 11990, 16990],
    [P, 'Arranhador Torre 3 Andares', 'Sisal natural com toca e bolinha.', 8990, 14990],
    [P, 'Mordedor Resistente de Borracha', 'Para cães que adoram destruir brinquedos.', 2490, 4990],
    [P, 'Coleira Peitoral Refletiva', 'Ajustável, tamanhos P ao GG.', 4990, 7990],
    [S, 'Banho Porte Pequeno', 'Inclui secagem, perfume e laço.', 4500, 6000],
    [P, 'Tapete Higiênico 30 unidades', 'Gel superabsorvente com atrativo.', 3990, 5990],
    [P, 'Bifinho Natural 500g', 'Petisco de carne desidratada.', 2990, 3990],
    [P, 'Comedouro Inox Duplo', 'Base antiderrapante.', 3990, 5990],
  ],
  agropecuaria: [
    [P, 'Ração Cães Adultos 25kg', 'Saco econômico para sítios e canis.', 15990, 21990],
    [P, 'Ração Equina 40kg', 'Para cavalos em manutenção.', 11990, 14990],
    [P, 'Milho em Grão 50kg', 'Para aves e suínos.', 8990, 11990],
    [P, 'Ração Postura para Galinhas 25kg', 'Mais ovos e casca resistente.', 8990, 10990],
    [P, 'Sal Mineral Bovino 30kg', 'Suplemento para gado de corte e leite.', 9990, 13990],
    [P, 'Fardo de Feno 15kg', 'Feno de tifton, ótimo para coelhos e equinos.', 2990, 4590],
    [P, 'Coleira Antipulgas para Cães', 'Proteção de até 8 meses.', 8990, 15990],
    [P, 'Sementes de Pastagem 5kg', 'Azevém para o inverno gaúcho.', 5990, 8990],
  ],
  veterinario: [
    [S, 'Consulta Clínica Geral', 'Avaliação completa com orientação nutricional.', 15000, 22000],
    [S, 'Vacina V10', 'Polivalente para cães, com carteirinha.', 9000, 12000],
    [S, 'Vacina Antirrábica', 'Dose anual obrigatória.', 6000, 8500],
    [S, 'Vacina Quádrupla Felina (V4)', 'Proteção completa para gatos.', 9500, 12500],
    [S, 'Consulta Domiciliar', 'Atendimento no conforto da sua casa.', 22000, 30000],
    [S, 'Castração Felina', 'Inclui anestesia inalatória e retorno.', 40000, 60000, true],
    [S, 'Microchipagem', 'Identificação permanente com registro.', 9000, 14000],
    [S, 'Check-up Geriátrico', 'Consulta + exames para pets idosos.', 35000, 48000],
  ],
  clinica: [
    [S, 'Consulta de Emergência 24h', 'Atendimento imediato a qualquer hora.', 25000, 35000],
    [S, 'Internação (diária)', 'Monitoramento veterinário contínuo.', 30000, 50000, true],
    [S, 'Castração de Cães', 'Cirurgia com anestesia inalatória.', 60000, 120000, true],
    [S, 'Raio-X Digital', 'Laudo no mesmo dia.', 18000, 26000],
    [S, 'Ultrassonografia Abdominal', 'Com médico veterinário especialista.', 20000, 28000],
    [S, 'Hemograma Completo', 'Resultado em até 2 horas.', 6000, 9000],
    [S, 'Consulta com Cardiologista', 'Inclui eletrocardiograma.', 28000, 35000],
    [S, 'Limpeza de Tártaro', 'Profilaxia dentária com ultrassom.', 45000, 70000, true],
  ],
  'banho-tosa': [
    [S, 'Banho Porte P', 'Até 10kg. Secagem e perfume inclusos.', 4500, 6000],
    [S, 'Banho Porte M', 'De 10 a 25kg.', 6000, 8000],
    [S, 'Banho Porte G', 'Acima de 25kg.', 8000, 11000],
    [S, 'Banho e Tosa Higiênica', 'Patas, barriga e região íntima.', 7000, 9500, true],
    [S, 'Tosa na Tesoura', 'Acabamento artesanal por raça.', 9000, 14000, true],
    [S, 'Hidratação de Pelagem', 'Máscara nutritiva com óleos naturais.', 3000, 4500],
    [S, 'Corte de Unhas', 'Rápido e sem estresse.', 1500, 2500],
    [S, 'Leva e Traz', 'Buscamos e entregamos seu pet.', 1500, 3000],
    [S, 'Pacote 4 Banhos Mensal', 'Um banho por semana com desconto.', 20000, 28000, true],
  ],
  'hotel-creche': [
    [S, 'Hospedagem (diária)', 'Quarto individual com caminha e câmera.', 8000, 12000],
    [S, 'Creche Meio Período', 'Recreação monitorada por 4 horas.', 5000, 7000],
    [S, 'Creche Período Integral', 'Das 7h às 19h com lanche.', 7000, 9500],
    [S, 'Pacote Creche 10 Diárias', 'Válido por 60 dias.', 60000, 85000],
    [S, 'Day Use com Piscina', 'Diversão no verão porto-alegrense.', 6000, 8000],
    [S, 'Transporte Leva e Traz', 'Van climatizada.', 2500, 4000],
  ],
  adestrador: [
    [S, 'Avaliação Comportamental', 'Primeira visita para entender a rotina do pet.', 12000, 18000],
    [S, 'Pacote Adestramento Básico (8 aulas)', 'Senta, fica, deita, junto e chamado.', 90000, 140000],
    [S, 'Aula Avulsa', '1 hora de treino em casa ou no parque.', 15000, 20000],
    [S, 'Socialização de Filhotes (4 aulas)', 'Para filhotes de 3 a 6 meses.', 45000, 60000],
    [S, 'Correção de Comportamento', 'Puxar guia, latidos e ansiedade de separação.', 18000, 25000, true],
    [S, 'Adestramento Avançado (12 aulas)', 'Comandos à distância e sem guia.', 150000, 220000],
  ],
  'dog-walker': [
    [S, 'Passeio 30 minutos', 'Individual, com fotos no WhatsApp.', 3000, 4000],
    [S, 'Passeio 1 hora', 'Gasto de energia garantido.', 4500, 6000],
    [S, 'Pacote 10 Passeios', 'Use em até 30 dias.', 30000, 45000],
    [S, 'Pet Sitter (visita de 1h)', 'Comida, água, brincadeira e carinho.', 6000, 8000],
    [S, 'Pet Sitter Pernoite', 'Companhia para o seu pet durante a noite.', 15000, 22000],
    [S, 'Passeio em Grupo no Parque', 'Até 4 cães sociáveis.', 2500, 3500],
  ],
  farmacia: [
    [P, 'Antipulgas e Carrapatos (comprimido)', 'Proteção de 30 dias.', 8990, 16990],
    [P, 'Vermífugo para Cães (4 comprimidos)', 'Amplo espectro.', 2990, 4990],
    [P, 'Anti-inflamatório Veterinário', 'Venda mediante receita.', 3990, 6990],
    [P, 'Shampoo Dermatológico', 'Para peles sensíveis e dermatites.', 5990, 8990],
    [P, 'Suplemento Articular', 'Condroitina e glucosamina.', 8990, 14990],
    [S, 'Manipulação de Medicamentos', 'Doses sob medida e sabores palatáveis.', 3500, 6000, true],
    [P, 'Colírio Veterinário', 'Lubrificante ocular.', 2990, 4590],
    [P, 'Coleira Repelente Leishmaniose', 'Proteção contra o mosquito-palha.', 12990, 17990],
  ],
  laboratorio: [
    [S, 'Hemograma Completo', 'Resultado no mesmo dia.', 5500, 8500],
    [S, 'Perfil Renal e Hepático', 'Ureia, creatinina, ALT, FA e mais.', 12000, 18000],
    [S, 'Ultrassonografia Abdominal', 'Laudo com imagens.', 18000, 26000],
    [S, 'Raio-X Digital (2 posições)', 'Sem necessidade de sedação na maioria dos casos.', 16000, 24000],
    [S, 'Ecocardiograma', 'Avaliação cardíaca completa.', 32000, 42000],
    [S, 'Exame de Urina (EAS)', 'Coleta orientada.', 5000, 7500],
    [S, 'Coleta Domiciliar', 'Coletamos na sua casa.', 5000, 8000],
    [S, 'Teste Rápido Cinomose/Parvovirose', 'Resultado em 15 minutos.', 9000, 13000],
  ],
  aquarismo: [
    [P, 'Aquário 60L Completo', 'Com filtro, iluminação LED e termostato.', 39990, 59990],
    [P, 'Peixe Betta', 'Diversas cores, criação nacional.', 2990, 4990],
    [P, 'Cardume de Neon (10 un.)', 'Ideal para aquários plantados.', 6990, 8990],
    [P, 'Filtro Hang-on 400L/h', 'Silencioso e econômico.', 11990, 15990],
    [P, 'Ração para Peixes Tropicais', 'Flocos com espirulina.', 1990, 3490],
    [P, 'Planta Aquática Natural', 'Anúbias, cabombas e musgos.', 1500, 3000],
    [S, 'Manutenção de Aquário a Domicílio', 'Limpeza, testes de água e poda.', 12000, 18000, true],
    [P, 'Substrato Fértil 5kg', 'Para aquários plantados.', 8990, 12990],
  ],
  petiscaria: [
    [P, 'Biscoito de Banana e Aveia 200g', 'Sem açúcar e sem conservantes.', 2490, 3290],
    [P, 'Bifinho Natural de Frango 150g', 'Só frango, desidratado lentamente.', 2990, 3990],
    [P, 'Bolo de Aniversário Pet', 'Encomende com 48h de antecedência.', 8990, 12990],
    [P, 'Cookie de Abóbora e Cenoura', 'Crocante e cheiroso.', 2290, 2990],
    [P, 'Petisco Desidratado de Fígado', 'Rico em ferro, ótimo para treino.', 3490, 4490],
    [P, 'Kit Festa Pet', 'Bolo, cupcakes e bandana.', 15990, 22990],
    [P, 'Picolé Pet de Iogurte e Banana', 'Refrescante para os dias quentes.', 1490, 1990],
    [P, 'Petisco de Peixe para Gatos', 'Tilápia desidratada.', 2490, 3290],
  ],
  fotografo: [
    [S, 'Ensaio em Estúdio', '1 hora, 15 fotos tratadas.', 35000, 48000],
    [S, 'Ensaio ao Ar Livre', 'Na Redenção, Parcão ou orla do Guaíba.', 42000, 55000],
    [S, 'Mesversário do Filhote', 'Cenário temático e 10 fotos.', 25000, 32000],
    [S, 'Ensaio Família + Pet', 'Para eternizar a família completa.', 55000, 72000],
    [P, 'Álbum Impresso 20 páginas', 'Capa dura personalizada.', 22000, 30000],
    [P, 'Quadro Canvas 40x60', 'Impressão fine art.', 18000, 25000],
  ],
  'ong-adocao': [
    [S, 'Adoção Responsável', 'Cães e gatos castrados, vacinados e vermifugados. Gratuita.', null, null],
    [S, 'Feira de Adoção aos Sábados', 'Venha conhecer nossos resgatados.', null, null],
    [S, 'Apadrinhamento Mensal', 'Ajude a custear ração e veterinário de um resgatado.', 3000, 5000, true],
    [S, 'Castração Solidária', 'Valor social para tutores de baixa renda.', 9000, 15000, true],
    [S, 'Cadastro de Lar Temporário', 'Acolha um pet até ele encontrar uma família.', null, null],
    [S, 'Ponto de Coleta de Doações', 'Ração, cobertores e produtos de limpeza.', null, null],
  ],
  funeraria: [
    [S, 'Cremação Individual', 'Com devolução das cinzas em urna.', 65000, 90000, true],
    [S, 'Cremação Coletiva', 'Opção acessível e respeitosa.', 30000, 45000, true],
    [P, 'Urna Personalizada', 'Madeira ou cerâmica com nome gravado.', 18000, 35000, true],
    [S, 'Plano Memorial Preventivo (mensal)', 'Tranquilidade para o momento da despedida.', 3990, 5990],
    [S, 'Remoção 24h', 'Buscamos com cuidado em qualquer horário.', 15000, 25000],
    [P, 'Pingente com Pegada', 'Joia em prata com a patinha do seu pet.', 12000, 18000],
  ],
};

// ---------------------------------------------------------------------
// Cupons por categoria: [sufixo, titulo, descricao, desconto]
// ---------------------------------------------------------------------
const COUPONS = {
  _generic: [
    ['10', '10% OFF em todo o site', 'Válido para compras e serviços na loja.', '10% OFF'],
    ['15', '15% OFF na primeira visita', 'Apresente o código no caixa ou no WhatsApp.', '15% OFF'],
  ],
  'pet-shop': [['FRETE', 'Frete grátis', 'Entregas acima de R$ 150 em Porto Alegre.', 'Frete grátis'], ['RACAO', 'R$ 20 OFF em rações', 'Em sacos acima de 10kg.', 'R$ 20 OFF']],
  agropecuaria: [['AGRO', '5% OFF à vista', 'Pagamento no Pix ou dinheiro.', '5% OFF']],
  veterinario: [['VET30', 'R$ 30 OFF na consulta', 'Válido para primeira consulta.', 'R$ 30 OFF'], ['VACINA', 'Vacina com 15% OFF', 'V10, V4 e antirrábica.', '15% OFF']],
  clinica: [['CHECKUP', 'Check-up com 20% OFF', 'Consulta + hemograma + bioquímico.', '20% OFF']],
  'banho-tosa': [['HIDRA', 'Hidratação grátis', 'Na compra de qualquer banho.', 'Brinde'], ['BANHO', 'R$ 10 OFF no banho', 'Válido de terça a quinta.', 'R$ 10 OFF']],
  'hotel-creche': [['DIARIA', '1 diária grátis', 'No pacote de 5 diárias de hospedagem.', '1 diária grátis']],
  adestrador: [['AVALIA', 'Avaliação gratuita', 'Na contratação de qualquer pacote.', 'Grátis']],
  'dog-walker': [['PASSEIO', '2 passeios grátis', 'No primeiro pacote de 10 passeios.', '2 passeios grátis']],
  farmacia: [['PULGA', '12% OFF em antipulgas', 'Todas as marcas.', '12% OFF']],
  laboratorio: [['EXAME', '15% OFF em exames', 'Exceto ecocardiograma.', '15% OFF']],
  aquarismo: [['PEIXE', 'R$ 25 OFF em aquários', 'Aquários completos acima de 40L.', 'R$ 25 OFF']],
  petiscaria: [['DOCE', 'Leve 3 pague 2', 'Em biscoitos e cookies.', 'Leve 3 pague 2']],
  fotografo: [['FOTO', '10 fotos extras', 'No ensaio em estúdio.', 'Brinde']],
  'ong-adocao': [['AJUDE', 'Kit adoção grátis', 'Coleira e guia para quem adotar.', 'Brinde']],
  funeraria: [['PINGENTE', 'Pingente com 20% OFF', 'Na contratação da cremação individual.', '20% OFF']],
};

// ---------------------------------------------------------------------
// Avaliações
// ---------------------------------------------------------------------
const REVIEW_POS = [
  'Atendimento impecável, voltarei com certeza!',
  'Equipe muito atenciosa e carinhosa com os animais.',
  'Meu cachorro sai de lá sempre feliz. Recomendo demais!',
  'Lugar limpo, organizado e com preço justo.',
  'Fui muito bem recebida, explicaram tudo com paciência.',
  'Melhor do bairro, sem dúvida.',
  'Profissionais que realmente amam o que fazem.',
  'Atendimento rápido e muito educado.',
  'Super indico! Minha gata é medrosa e foi tratada com muito cuidado.',
  'Ótima experiência do início ao fim.',
  'Respondem rápido no WhatsApp, isso faz toda a diferença.',
  'Já virou o lugar oficial aqui de casa 🐾',
  'Excelente! Encontrei tudo o que precisava.',
  'Preço bom e atendimento nota 10.',
  'Estacionar é tranquilo e o pessoal é um amor.',
  'Muito profissionais, recomendo de olhos fechados.',
  'Adorei a experiência, meu dog também!',
];
const REVIEW_POS_CAT = {
  'pet-shop': ['Variedade enorme de rações e brinquedos, e entregaram no mesmo dia.', 'Sempre tem a ração do meu gato, e a entrega é super rápida.', 'Os atendentes conhecem bem os produtos e não empurram nada.'],
  agropecuaria: ['Preço de ração bem melhor que no centro, vale a viagem.', 'Atendimento de interior, daqueles que dá gosto. Entregaram no sítio.', 'Tem de tudo para as galinhas e os cachorros do sítio.'],
  veterinario: ['A veterinária foi atenciosa e explicou cada detalhe do tratamento.', 'Vacinas em dia e carteirinha organizada. Ótimo atendimento!', 'Consultório tranquilo, meu gato nem estressou.'],
  clinica: ['Me atenderam de madrugada numa emergência e salvaram meu cachorro. Gratidão eterna!', 'Estrutura completa, fizeram exames na hora.', 'Equipe excelente na internação, mandavam notícias o tempo todo.'],
  'banho-tosa': ['A tosa ficou perfeita e ele voltou cheirosinho!', 'Cuidado enorme com meu poodle idoso. Recomendo!', 'O leva e traz é pontual e o banho ficou impecável.'],
  'hotel-creche': ['Deixei minha cachorra no feriado e recebi fotos todos os dias.', 'Meu labrador volta da creche cansado e feliz!', 'Espaço amplo, limpo e cheio de brincadeiras.'],
  adestrador: ['Em 4 aulas meu cachorro parou de puxar a guia. Incrível!', 'Método com reforço positivo, sem gritos. Amei.', 'Paciência infinita com o meu vira-lata agitado.'],
  'dog-walker': ['Passeio pontual e sempre mandam fotos. Confio de olhos fechados.', 'Meu cachorro fica esperando na porta a hora do passeio!', 'Cuidaram dos meus gatos durante a viagem com todo carinho.'],
  farmacia: ['Fizeram a manipulação do remédio em sabor frango, meu gato aceitou!', 'Tinham o antipulgas que ninguém tinha. Entrega rápida.', 'Farmacêutico atencioso, tirou todas as dúvidas.'],
  laboratorio: ['Resultado saiu no mesmo dia, ajudou muito no diagnóstico.', 'Coleta em casa sem estresse para a minha gata.', 'Ultrassom feito com muita calma e laudo bem explicado.'],
  aquarismo: ['Me ajudaram a montar o primeiro aquário plantado. Ficou lindo!', 'Peixes saudáveis e ótima orientação sobre a água.', 'Loja apaixonante, dá vontade de levar tudo.'],
  petiscaria: ['Encomendei o bolo de aniversário da Luna e foi um sucesso!', 'Petiscos naturais que meu cachorro alérgico pode comer.', 'Os biscoitos de banana são os favoritos aqui de casa.'],
  fotografo: ['As fotos ficaram maravilhosas, já emoldurei!', 'Muita paciência para fazer meu gato posar. Resultado lindo.', 'O ensaio na Redenção ficou um sonho.'],
  'ong-adocao': ['Adotei o Bento aqui e o processo foi sério e acolhedor.', 'Trabalho lindo, fazem tudo com muito amor.', 'Equipe de voluntários incrível. Ajudem essa ONG!'],
  funeraria: ['Num momento muito difícil fomos tratados com respeito e delicadeza.', 'Atendimento humano e cerimônia muito bonita. Obrigada.', 'Vieram buscar de madrugada, com muito cuidado.'],
};
const REVIEW_MID = [
  'Bom atendimento, mas o preço podia ser melhor.',
  'Gostei, mas demorou um pouco mais que o combinado.',
  'Serviço ok. O espaço é pequeno e fica cheio no sábado.',
  'Atendimento cordial, mas faltavam alguns produtos.',
  'Razoável. Esperava um pouco mais pelo valor cobrado.',
  'Bom, mas o estacionamento é complicado.',
];
const REVIEW_NEG = [
  'Demoraram muito para atender e ninguém deu satisfação.',
  'Achei caro e o atendimento foi frio.',
  'Marcaram horário e mesmo assim esperei mais de uma hora.',
  'Não gostei, não responderam minhas mensagens depois.',
];

// ---------------------------------------------------------------------
// Pessoas
// ---------------------------------------------------------------------
const DEMO = [
  { key: 'admin', email: 'admin@easypet.com', nome: 'Admin EasyPet', role: 'cliente', final: 'admin' },
  { key: 'lojista', email: 'lojista@easypet.com', nome: 'Ricardo Menezes', role: 'lojista' },
  { key: 'cliente', email: 'cliente@easypet.com', nome: 'Juliana Martins', role: 'cliente' },
  { key: 'premium', email: 'premium@easypet.com', nome: 'Fernanda Albuquerque', role: 'cliente' },
];
const LOJISTAS = [
  'Marcelo Bittencourt', 'Patrícia Schneider', 'Eduardo Kuhn', 'Camila Fagundes', 'Rodrigo Pacheco',
  'Luciana Weber', 'Gustavo Dornelles', 'Aline Brum', 'Fábio Lopes', 'Renata Lemos', 'Tiago Becker', 'Vanessa Moraes',
];
const CLIENTES = [
  'Ana Souza', 'Bruno Oliveira', 'Carla Ribeiro', 'Diego Ferreira', 'Elisa Gomes', 'Felipe Rocha',
  'Gabriela Costa', 'Henrique Alves', 'Isabela Pereira', 'João Pedro Silva', 'Larissa Cardoso', 'Lucas Machado',
  'Mariana Teixeira', 'Matheus Barbosa', 'Natália Pinto', 'Otávio Mendes', 'Paula Nunes', 'Rafael Carvalho',
  'Sabrina Dias', 'Thiago Moreira', 'Úrsula Campos', 'Vinícius Araújo', 'Yasmin Correia', 'Leonardo Vieira',
  'Bianca Freitas', 'Caio Monteiro', 'Débora Rezende', 'Gabriel Sant’Anna', 'Helena Duarte', 'Igor Farias',
];
const emailOf = (nome) =>
  `${nome
    .normalize('NFD')
    .replace(/[̀-ͯ’']/g, '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .join('.')}@example.com`;

const users = [];
for (const d of DEMO) users.push({ ...d, id: uuid(), criado: rint(230, 260) });
for (const nome of LOJISTAS) users.push({ key: `loj:${nome}`, email: emailOf(nome), nome, role: 'lojista', id: uuid(), criado: rint(185, 240) });
for (const nome of CLIENTES) users.push({ key: `cli:${nome}`, email: emailOf(nome), nome, role: 'cliente', id: uuid(), criado: rint(10, 220) });
for (const u of users) u.telefone = fone9();
const U_BY = Object.fromEntries(users.map((u) => [u.key, u]));
const lojistas = users.filter((u) => u.key.startsWith('loj:'));
const clientes = users.filter((u) => u.role === 'cliente' && u.key !== 'admin');

// Premium: premium@ + 9 clientes
const premiumUsers = [U_BY.premium, ...sample(clientes.filter((c) => c.key.startsWith('cli:')), 9)];
for (const u of premiumUsers) {
  u.premiumDias = u.key === 'premium' ? 128 : rint(12, 170);
  u.criado = Math.max(u.criado, u.premiumDias + rint(3, 30));
}

// ---------------------------------------------------------------------
// Lojas: [nome, categoria, bairro, rua, plano(B/P/D|null), descricao, opts]
// ---------------------------------------------------------------------
const STORES_ATIVAS = [
  ['Patas & Cia Pet Shop', 'pet-shop', 'Moinhos de Vento', 'Rua Padre Chagas', 'P',
    'O pet shop mais querido do Moinhos! Rações super premium, acessórios selecionados, farmacinha e um espaço de banho e tosa com hora marcada. Entregamos em toda Porto Alegre em até 3 horas e seu pet é sempre bem-vindo para um petisco no balcão.',
    { owner: 'lojista', tags: ['Delivery', 'Banho e tosa', 'Atende gatos', 'Aceita Pix', 'Estacionamento', 'Pet friendly'], horario: 'loja' }],
  ['Bicho Mimado', 'pet-shop', 'Centro Histórico', 'Rua dos Andradas', 'D',
    'Pertinho da Praça da Matriz, o Bicho Mimado tem tudo para cães, gatos e pequenos roedores: rações, areias, roupinhas e brinquedos. Atendimento de quem conhece cada cliente pelo nome — e cada pet também.'],
  ['Pet Center Matriz', 'pet-shop', 'Centro Histórico', 'Rua Duque de Caxias', 'B',
    'Loja de bairro tradicional no Centro, com rações a granel, preços honestos e entrega de bicicleta no Centro Histórico e na Cidade Baixa.'],
  ['Focinho Feliz Pet Shop', 'pet-shop', 'Cidade Baixa', 'Rua da República', 'D',
    'Pet shop descolado da Cidade Baixa, com marcas naturais, petiscos artesanais e uma seção inteira de produtos sustentáveis. Aos sábados tem feira de adoção em parceria com ONGs.'],
  ['Casa do Bigode', 'pet-shop', 'Bom Fim', 'Av. Osvaldo Aranha', 'P',
    'Pet shop especializado em gatos, em frente à Redenção. Arranhadores, fontes, areias de todos os tipos e consultoria de enriquecimento ambiental para felinos de apartamento.'],
  ['Rabo Abanando', 'pet-shop', 'Petrópolis', 'Av. Protásio Alves', 'D',
    'Megaloja pet com estacionamento próprio, mais de 3 mil itens, banho e tosa e consultório veterinário anexo. Compre pelo WhatsApp e retire no drive-thru.'],
  ['Mundo Pet Menino Deus', 'pet-shop', 'Menino Deus', 'Av. Getúlio Vargas', 'P',
    'Tudo para seu pet a poucos passos do Parque Marinha. Rações, acessórios, aquarismo básico e entregas no bairro sem taxa acima de R$ 99.'],
  ['Latido & Miado', 'pet-shop', 'Floresta', 'Av. Cristóvão Colombo', 'B',
    'Pet shop familiar desde 2009 na Cristóvão. Atendimento próximo, ração fresquinha e aquela conversa boa sobre os bichos da família.'],
  ['Pet Point Tristeza', 'pet-shop', 'Tristeza', 'Av. Wenceslau Escobar', 'P',
    'O ponto pet da Zona Sul: rações, acessórios, aves e roedores. Entregamos na Tristeza, Vila Assunção, Camaquã e Ipanema.'],
  ['Bichos do Sarandi', 'pet-shop', 'Sarandi', 'Av. Assis Brasil', 'B',
    'Preço baixo de verdade na Zona Norte. Rações de todas as linhas, produtos de limpeza e acessórios para cães e gatos.'],

  ['Vet Amigo Moinhos', 'veterinario', 'Moinhos de Vento', 'Rua Dinarte Ribeiro', 'D',
    'Consultório veterinário com atendimento acolhedor, sala exclusiva para gatos (cat friendly) e agenda online. Clínica geral, vacinação, dermatologia e acompanhamento de filhotes.'],
  ['Dra. Helena Prates – Medicina Felina', 'veterinario', 'Rio Branco', 'Rua Casemiro de Abreu', 'P',
    'Consultório 100% dedicado a gatos, sem latidos e sem cheiro de cachorro. Consultas sem pressa, manejo gentil e orientação comportamental.'],
  ['VetCare Cidade Baixa', 'veterinario', 'Cidade Baixa', 'Rua Lima e Silva', 'P',
    'Clínica veterinária de bairro com preços acessíveis, vacinação, castração e exames básicos. Atendemos também coelhos e porquinhos-da-índia.'],
  ['Pata Saudável Veterinária', 'veterinario', 'Santana', 'Av. Princesa Isabel', 'B',
    'Atendimento clínico, vacinas e microchipagem com hora marcada. Equipe jovem, atenciosa e apaixonada por bichos.'],
  ['Consultório Vet Três Figueiras', 'veterinario', 'Três Figueiras', 'Av. Nilo Peçanha', 'B',
    'Consultório tranquilo, com estacionamento, para consultas de rotina, check-up geriátrico e acompanhamento nutricional.'],
  ['Vet em Casa POA', 'veterinario', 'Auxiliadora', 'Rua Coronel Bordini', 'P',
    'Veterinários que vão até você! Consultas, vacinas e coletas de exame em domicílio, ideal para pets idosos, gatos estressados e tutores sem carro.',
    { tags: ['Atendimento domiciliar', 'Vacinação', 'Atende gatos', 'Agendamento online', 'Aceita Pix'] }],
  ['Doutor Bicho Cavalhada', 'veterinario', 'Cavalhada', 'Av. Cavalhada', 'B',
    'Clínica geral veterinária na Zona Sul com mais de 15 anos de história. Vacinas, consultas e pequenas cirurgias.'],

  ['Hospital Veterinário Pampa 24h', 'clinica', 'Azenha', 'Av. da Azenha', 'D',
    'Hospital veterinário completo, aberto 24 horas, com UTI, centro cirúrgico, raio-X, ultrassom e laboratório próprio. Plantão de emergência todos os dias, inclusive feriados.',
    { h24: true, tags: ['Emergência 24h', 'Internação', 'Cirurgias', 'Exames no local', 'Estacionamento', 'Aceita Pix'] }],
  ['Clínica Vet Santa Clara', 'clinica', 'Bela Vista', 'Rua Anita Garibaldi', 'P',
    'Clínica com especialistas em ortopedia, cardiologia e oftalmologia veterinária. Internação diurna e exames de imagem no local.'],
  ['ProntoVet Hospital 24h', 'clinica', 'Partenon', 'Av. Bento Gonçalves', 'P',
    'Pronto atendimento veterinário 24h na Bento Gonçalves. Emergências, internação e cirurgias com equipe de plantão sempre presente.',
    { h24: true, tags: ['Emergência 24h', 'Internação', 'Cirurgias', 'Aceita Pix'] }],
  ["Clínica Veterinária Mont'Serrat", 'clinica', "Mont'Serrat", 'Rua Pedro Ivo', 'B',
    'Clínica de pequeno porte com centro cirúrgico, internação e atendimento humanizado. Agendamento pelo WhatsApp.'],
  ['Centro Veterinário Zona Sul 24h', 'clinica', 'Tristeza', 'Av. Otto Niemeyer', 'D',
    'Referência em emergência veterinária na Zona Sul. Plantão 24h, UTI, tomografia em parceria e equipe de anestesistas.',
    { h24: true, tags: ['Emergência 24h', 'Internação', 'Cirurgias', 'Exames no local', 'Estacionamento'] }],

  ['Espuma & Patas', 'banho-tosa', 'Moinhos de Vento', 'Rua Fernando Gomes', 'D',
    'Pet spa boutique com banhos de ozônio, hidratação com óleos naturais e tosas de raça feitas por groomers premiados. Ambiente climatizado e sem gaiolas.'],
  ['Banho de Cheiro Pet Spa', 'banho-tosa', 'Centro Histórico', 'Rua Riachuelo', 'P',
    'Banho e tosa com hora marcada no coração do Centro. Produtos hipoalergênicos, secagem silenciosa e leva e traz no Centro e Bom Fim.'],
  ['Tosa Fina Studio', 'banho-tosa', 'Higienópolis', 'Av. Plínio Brasil Milano', 'P',
    'Studio de estética animal especializado em tosa na tesoura, spitz, poodles e shih-tzus. Atendimento individual: um pet por vez.'],
  ['Bolha Pet', 'banho-tosa', 'Cidade Baixa', 'Rua João Alfredo', 'B',
    'Banho rápido, bem feito e com preço camarada. Ideal para quem precisa de praticidade no dia a dia.'],
  ['Cãopricho Banho e Tosa', 'banho-tosa', 'Jardim Botânico', 'Av. Ipiranga', 'B',
    'Banho e tosa com carinho e paciência, inclusive para pets idosos e medrosos. Leva e traz grátis no bairro.'],
  ['Spa do Totó', 'banho-tosa', 'Ipanema', 'Av. Coronel Marcos', 'B',
    'Banho, tosa e hidratação a duas quadras da orla de Ipanema. Seu pet sai cheiroso para o passeio do fim de tarde.'],

  ['Cãomodidade Hotel & Creche', 'hotel-creche', 'Chácara das Pedras', 'Rua Dr. Jorge Fayet', 'D',
    'Hotel e creche com 1.200 m² de área verde, piscina, quartinhos individuais climatizados e câmeras ao vivo pelo app. Monitores treinados 24h por dia.'],
  ['Recreio dos Peludos', 'hotel-creche', 'Floresta', 'Rua Comendador Coruja', 'P',
    'Creche canina no 4º Distrito, com recreação dirigida, soneca e relatório diário com fotos. Planos mensais com transporte.'],
  ['Hotelzinho Patudos', 'hotel-creche', 'Teresópolis', 'Av. Teresópolis', 'B',
    'Hospedagem familiar em casa com pátio, poucos hóspedes por vez e muito colo. Ideal para cães que não gostam de canil.'],
  ['Vila Canina Daycare', 'hotel-creche', "Passo d'Areia", 'Av. Assis Brasil', 'P',
    'Daycare moderno na Zona Norte, com piso emborrachado, agility e turmas separadas por porte e energia.'],

  ['Agropecuária Belém Novo', 'agropecuaria', 'Belém Novo', 'Av. Heitor Vieira', 'D',
    'Tudo para o campo e para a cidade: rações para cães, gatos, aves e equinos, sementes, ferramentas e produtos veterinários. Entrega em sítios e chácaras da Zona Sul.'],
  ['Casa Rural Lami', 'agropecuaria', 'Lami', 'Estrada do Lami', 'B',
    'Agropecuária de família no Lami, com ração a granel, feno, milho e atendimento de quem vive o interior dentro da capital.'],
  ['Agro Restinga', 'agropecuaria', 'Restinga', 'Av. João Antônio da Silveira', 'B',
    'Rações, medicamentos veterinários, artigos de jardinagem e pequenos animais. Preço justo e entrega no bairro.'],
  ['Agropecuária Lomba Verde', 'agropecuaria', 'Lomba do Pinheiro', 'Estrada João de Oliveira Remião', 'P',
    'Agropecuária completa na Lomba do Pinheiro: sal mineral, rações para gado, aves e cães, selaria e produtos para horta.'],

  ['Senta & Fica Adestramento', 'adestrador', 'Petrópolis', 'Rua Lucas de Oliveira', 'P',
    'Adestramento com reforço positivo, sem punição. Aulas em casa ou no parque, para filhotes e adultos, com acompanhamento pelo WhatsApp.'],
  ['Escola Canina Bom Garoto', 'adestrador', 'Cristo Redentor', 'Av. Assis Brasil', 'B',
    'Escola canina com turmas de obediência básica, socialização de filhotes e preparação para o convívio em apartamento.'],
  ['Adestra Pet Positivo', 'adestrador', 'Menino Deus', 'Rua José de Alencar', 'B',
    'Adestradora comportamentalista especializada em ansiedade de separação, reatividade e cães resgatados.'],

  ['Passeio Feliz Dog Walker', 'dog-walker', 'Bom Fim', 'Rua Fernandes Vieira', 'P',
    'Passeios individuais e em grupo pela Redenção e Bom Fim, com GPS e fotos em tempo real. Também fazemos pet sitter para gatos.'],
  ['Lar Doce Pet Sitter', 'dog-walker', 'Rio Branco', 'Rua Mariante', 'B',
    'Pet sitter de confiança para quando você viaja: visitas diárias, pernoite e muito carinho. Referências de dezenas de famílias.'],
  ['Caminhada Canina Parcão', 'dog-walker', 'Moinhos de Vento', 'Rua Mostardeiro', 'B',
    'Dog walker no Parcão e arredores, com passeios de 30 ou 60 minutos e relatório com fotos ao final.'],

  ['Farmavet Central', 'farmacia', 'Centro Histórico', 'Av. Borges de Medeiros', 'D',
    'Farmácia veterinária com manipulação própria, antipulgas de todas as marcas e farmacêutico de plantão para tirar dúvidas. Delivery em até 2 horas.'],
  ['Drogavet Petrópolis', 'farmacia', 'Petrópolis', 'Av. Protásio Alves', 'P',
    'Medicamentos veterinários, suplementos e dermocosméticos pet. Aceitamos receita digital e entregamos na região.'],
  ['Farmácia Vet Zona Norte', 'farmacia', 'São João', 'Av. Benjamin Constant', 'B',
    'Farmácia veterinária com preço de distribuidora. Vermífugos, antipulgas, rações terapêuticas e acessórios.'],

  ['LabVet Diagnósticos', 'laboratorio', 'Rio Branco', 'Rua Casemiro de Abreu', 'P',
    'Laboratório veterinário com resultados online no mesmo dia. Hematologia, bioquímica, urinálise e coleta domiciliar.'],
  ['Imagem Pet Exames', 'laboratorio', 'Floresta', 'Av. Cristóvão Colombo', 'P',
    'Centro de diagnóstico por imagem: raio-X digital, ultrassom e ecocardiograma com laudo de especialistas.'],

  ['Recife Azul Aquarismo', 'aquarismo', 'Santana', 'Rua Jacinto Gomes', 'P',
    'Aquarismo de água doce e plantados: peixes, plantas, iluminação e montagem de aquários sob medida. Manutenção a domicílio.'],
  ['Mundo Submerso', 'aquarismo', 'Partenon', 'Av. Coronel Aparício Borges', 'B',
    'Peixes ornamentais, tartarugas e tudo para aquários. Venha conhecer nossos aquários de exposição.'],

  ['Biscoitaria Au Au', 'petiscaria', 'Bom Fim', 'Rua Felipe Camarão', 'D',
    'Confeitaria pet artesanal: biscoitos, bolos de aniversário e petiscos naturais feitos todo dia, sem açúcar, sal ou conservantes.'],
  ['Petisco Gourmet da Vila', 'petiscaria', 'Cristal', 'Av. Icaraí', 'B',
    'Petiscos desidratados de carne, frango e peixe feitos em pequenos lotes. Encomendas para festas e kits presente.'],

  ['Clique Pet Estúdio', 'fotografo', "Mont'Serrat", 'Rua Tito Lívio Zambecari', 'P',
    'Estúdio de fotografia pet com cenários temáticos, ensaios de mesversário e retratos para eternizar seu melhor amigo.'],
  ['Lente & Focinho Fotografia', 'fotografo', 'Cidade Baixa', 'Av. Venâncio Aires', 'B',
    'Ensaios externos em parques de Porto Alegre, com luz natural e muita paciência para pets agitados.'],

  ['Abrigo Quatro Patas', 'ong-adocao', 'Cavalhada', 'Av. Otto Niemeyer', 'B',
    'ONG que resgata, trata e encaminha para adoção cães e gatos em situação de abandono na Zona Sul. Todos castrados e vacinados.'],
  ['Adote um Amigo POA', 'ong-adocao', 'Centro Histórico', 'Av. Salgado Filho', 'P',
    'Coletivo de protetores independentes com feiras de adoção mensais, campanhas de castração e lar temporário.'],

  ['Memorial Jardim das Patas', 'funeraria', 'Cristal', 'Rua Dr. Campos Velho', 'P',
    'Crematório pet com sala de despedida, cerimônia personalizada e urnas artesanais. Atendimento e remoção 24 horas com todo o respeito que esse momento pede.',
    { h24: true, tags: ['Atendimento 24h', 'Remoção', 'Cerimônia de despedida', 'Aceita Pix'] }],
];

const STORES_PENDENTES = [
  ['Pet Mania Auxiliadora', 'pet-shop', 'Auxiliadora', 'Rua Marquês do Pombal',
    'Novo pet shop na Auxiliadora com rações, acessórios e banho e tosa. Inauguração em breve!'],
  ['Gato Mestre Clínica Felina', 'veterinario', 'Higienópolis', 'Rua Dom Pedro II',
    'Clínica exclusiva para gatos com internação separada e veterinárias especialistas em medicina felina.'],
  ['AuQMia Banho e Tosa', 'banho-tosa', 'Cristo Redentor', 'Av. Assis Brasil',
    'Banho e tosa com leva e traz na Zona Norte, preços promocionais de inauguração.'],
  ['Peixe Dourado Aquários', 'aquarismo', 'Cidade Baixa', 'Rua Sarmento Leite',
    'Loja de aquarismo com peixes marinhos e de água doce, corais e montagem de aquários.'],
];
const STORE_SUSPENSA = ['Ração Express Delivery', 'pet-shop', 'Sarandi', 'Av. Assis Brasil',
  'Delivery de rações com entrega expressa na Zona Norte.',
  'Suspensa após reclamações de entregas não realizadas. Aguardando regularização.'];

// ---------------------------------------------------------------------
// Monta as lojas
// ---------------------------------------------------------------------
const PLAN_CODE = { B: 'basico', P: 'profissional', D: 'destaque' };
const stores = [];
let ownerIdx = 0;
const nextOwner = () => lojistas[ownerIdx++ % lojistas.length];

function buildStore([nome, cat, bairro, rua, planCode, descricao, opts = {}], status) {
  const loc = locate(bairro, rua);
  const fotosPool = IMG_BY_CAT[cat];
  const fotos = fotosPool.length ? sample(fotosPool, Math.min(3, fotosPool.length)) : [];
  const handle = slug(nome).slice(0, 22);
  const h24 = !!opts.h24;
  const whatsapp = fone9();
  const s = {
    id: uuid(),
    nome,
    cat,
    bairro,
    ...loc,
    descricao,
    owner: opts.owner ? U_BY[opts.owner] : nextOwner(),
    plan: planCode ? PLAN_CODE[planCode] : null,
    status,
    h24,
    horarios: h24 ? HORARIOS.h24 : HORARIOS[opts.horario ?? pick(HORARIOS_BY_CAT[cat])],
    tags: opts.tags ?? [...new Set([...sample(TAGS_BY_CAT[cat], 2), ...sample(TAGS_EXTRA, rint(1, 3))])],
    telefone: chance(0.55) ? fone3() : whatsapp,
    whatsapp,
    instagram: `@${handle}${chance(0.5) ? '.poa' : ''}`,
    capa: fotos[0] ? U(fotos[0]) : null,
    fotos: fotos.map(U),
  };
  if (h24 && !s.tags.includes('Emergência 24h') && cat === 'clinica') s.tags.unshift('Emergência 24h');
  return s;
}

for (const row of STORES_ATIVAS) stores.push(buildStore(row, 'ativa'));
for (const [nome, cat, bairro, rua, desc] of STORES_PENDENTES) stores.push(buildStore([nome, cat, bairro, rua, null, desc], 'pendente'));
{
  const [nome, cat, bairro, rua, desc, motivo] = STORE_SUSPENSA;
  const s = buildStore([nome, cat, bairro, rua, null, desc], 'suspensa');
  s.motivo = motivo;
  stores.push(s);
}
const ativas = stores.filter((s) => s.status === 'ativa');
const patas = stores[0];

// Datas: assinatura começou há `subDias`; loja criada alguns dias antes.
for (const s of stores) {
  if (s.status === 'ativa') {
    s.subDias = s === patas ? 172 : rint(6, 178);
    // ~30% dos Profissional/Destaque começaram no Básico e fizeram upgrade
    if (s === patas) s.upgradeDias = 104;
    else if (s.plan !== 'basico' && s.subDias > 60 && chance(0.3)) s.upgradeDias = rint(15, s.subDias - 35);
    s.criadaDias = s.subDias + rint(1, 4) + rand();
    s.aprovadaDias = s.subDias + rand() * 0.8;
  } else if (s.status === 'pendente') {
    s.criadaDias = rint(1, 6) + rand();
  } else {
    s.subDias = 150;
    s.fimDias = 40;
    s.criadaDias = 155;
    s.aprovadaDias = 152;
  }
}

// ---------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------
const out = [];
const emit = (s = '') => out.push(s);

emit('-- =====================================================================');
emit('-- EasyPet — seed de demonstração (Porto Alegre)');
emit('-- GERADO por scripts/generate-seed.mjs — não edite à mão.');
emit('-- =====================================================================');
emit('');
emit('select setseed(0.20261014);');
emit('');

// Catálogo ------------------------------------------------------------
emit('-- Catálogo -------------------------------------------------------------');
emit('insert into public.categories (id, nome, icone, cor, ordem) values');
emit(CATEGORIES.map(([id, nome, icone, cor], i) => `  (${q(id)}, ${q(nome)}, ${q(icone)}, ${q(cor)}, ${i + 1})`).join(',\n') + ';');
emit('');
emit('insert into public.store_plans (id, nome, preco_centavos, max_itens, permite_cupons, estatisticas, destaque, beneficios, ordem) values');
emit(
  PLANS.map(
    (p, i) => `  (${q(p.id)}, ${q(p.nome)}, ${p.preco}, ${p.max ?? 'null'}, ${p.cupons}, ${p.stats}, ${p.destaque}, ${arr(p.beneficios)}, ${i + 1})`,
  ).join(',\n') + ';',
);
emit('');

// Usuários ------------------------------------------------------------
emit('-- Usuários (auth.users + auth.identities; o trigger cria o profile) -----');
emit('insert into auth.users (');
emit('  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,');
emit('  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, last_sign_in_at,');
emit('  confirmation_token, recovery_token, email_change_token_new, email_change,');
emit('  email_change_token_current, phone_change, phone_change_token, reauthentication_token');
emit(') values');
emit(
  users
    .map(
      (u) =>
        `  ('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', ${q(u.email)}, ` +
        `extensions.crypt('easypet123', extensions.gen_salt('bf')), ${ago(u.criado)}, ` +
        `'{"provider":"email","providers":["email"]}'::jsonb, ${json({ nome: u.nome, role: u.role, telefone: u.telefone })}, ` +
        `${ago(u.criado)}, ${ago(u.criado)}, ${ago(rand() * 5)}, '', '', '', '', '', '', '', '')`,
    )
    .join(',\n') + ';',
);
emit('');
emit('insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)');
emit('select gen_random_uuid(), u.id, u.id::text, \'email\',');
emit("  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),");
emit('  u.last_sign_in_at, u.created_at, u.created_at');
emit('from auth.users u');
emit(`where u.id in (${users.map((u) => q(u.id)).join(', ')});`);
emit('');
emit('-- Perfis: datas, admin e Premium');
emit('update public.profiles p set created_at = u.created_at from auth.users u where u.id = p.id;');
emit(`update public.profiles set role = 'admin' where email = 'admin@easypet.com';`);
for (const u of premiumUsers) {
  emit(`update public.profiles set plano = 'premium', premium_desde = ${ago(u.premiumDias)} where id = ${q(u.id)};`);
}
emit('');

// Lojas ---------------------------------------------------------------
emit('-- Lojas ----------------------------------------------------------------');
emit('insert into public.stores (');
emit('  id, owner_id, categoria_id, nome, descricao, endereco, bairro, cep, lat, lng, telefone, whatsapp, instagram,');
emit('  aberto_24h, horarios, tags, capa_url, fotos, status, destaque, motivo_status, aprovada_em, created_at');
emit(') values');
emit(
  stores
    .map(
      (s) =>
        `  (${q(s.id)}, ${q(s.owner.id)}, ${q(s.cat)}, ${q(s.nome)}, ${q(s.descricao)}, ${q(s.endereco)}, ${q(s.bairro)}, ${q(s.cep)}, ` +
        `${s.lat}, ${s.lng}, ${q(s.telefone)}, ${q(s.whatsapp)}, ${q(s.instagram)}, ${s.h24}, ${json(s.horarios)}, ${arr(s.tags)}, ` +
        `${q(s.capa)}, ${arr(s.fotos)}, ${q(s.status)}, ${s.plan === 'destaque'}, ${q(s.motivo ?? null)}, ` +
        `${s.aprovadaDias !== undefined ? ago(s.aprovadaDias) : 'null'}, ${ago(s.criadaDias)})`,
    )
    .join(',\n') + ';',
);
emit('');

// Itens ---------------------------------------------------------------
emit('-- Produtos e serviços -------------------------------------------------');
const itemRows = [];
for (const s of ativas) {
  const pool = ITEMS[s.cat];
  const n = s === patas ? pool.length : Math.min(pool.length, rint(3, s.plan === 'basico' ? 6 : 8));
  const chosen = s === patas ? pool : sample(pool, n);
  chosen.forEach(([tipo, nome, desc, min, max, aPartir], i) => {
    let preco = null;
    if (min !== null) {
      preco = min + Math.round((rand() * (max - min)) / 100) * 100;
      if (tipo === 'produto') preco = Math.max(min, preco - 10); // R$ xx,90
    }
    const img = s === patas && nome.startsWith('Ração Super') ? U('1589924691995-400dc9ecc119') : null;
    itemRows.push(
      `  (${q(s.id)}, ${q(tipo)}, ${q(nome)}, ${q(desc)}, ${preco ?? 'null'}, ${!!aPartir}, ${q(img)}, ${ago(s.subDias - 1 - i * 0.01)})`,
    );
  });
}
emit('insert into public.store_items (store_id, tipo, nome, descricao, preco_centavos, preco_a_partir, imagem_url, created_at) values');
emit(itemRows.join(',\n') + ';');
emit('');

// Cupons --------------------------------------------------------------
emit('-- Cupons (Profissional e Destaque) ------------------------------------');
const couponRows = [];
const couponCodes = new Set();
const STOP = ['PET', 'DOS', 'DAS', 'CIA', 'DRA', 'VET', 'CLINICA', 'HOSPITAL', 'VETERINARIO', 'VETERINARIA', 'CENTRO',
  'CASA', 'ESCOLA', 'AGROPECUARIA', 'AGRO', 'FARMACIA', 'CONSULTORIO', 'MUNDO', 'ZONA', 'CANINA', 'BANHO'];
const PREFIX = {
  'Farmavet Central': 'FARMAVET', 'Drogavet Petrópolis': 'DROGAVET', 'ProntoVet Hospital 24h': 'PRONTO',
  'Biscoitaria Au Au': 'AUAU', 'Memorial Jardim das Patas': 'JARDIM', 'Cãomodidade Hotel & Creche': 'CAOMOD',
  'Vet em Casa POA': 'VETCASA', 'Centro Veterinário Zona Sul 24h': 'ZONASUL', 'Mundo Pet Menino Deus': 'MUNDOPET',
  'Pet Point Tristeza': 'PETPOINT', 'Clínica Vet Santa Clara': 'STACLARA',
};
const prefixOf = (nome) => {
  if (PREFIX[nome]) return PREFIX[nome];
  const words = slug(nome.replace(/&/g, ' ').replace(/[–-]/g, ' ')).toUpperCase();
  const first = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter((w) => w.length > 2 && !STOP.includes(w))[0];
  return (first ?? words).slice(0, 7);
};
for (const s of ativas) {
  if (!PLAN[s.plan].cupons) continue;
  let list;
  if (s === patas) {
    list = [
      ['PATAS15', '15% OFF na primeira compra', 'Válido para rações, acessórios e farmácia. Não cumulativo.', '15% OFF', 60],
      ['PATASBANHO', 'R$ 10 OFF no banho', 'Banhos porte P e M de terça a quinta.', 'R$ 10 OFF', 30],
      ['PATASFRETE', 'Frete grátis', 'Em pedidos acima de R$ 150 em Porto Alegre.', 'Frete grátis', null],
    ];
  } else {
    const pool = [...COUPONS[s.cat], ...COUPONS._generic];
    const n = s.plan === 'destaque' ? 2 : rint(1, 2);
    list = sample(pool, n).map(([suf, t, d, desc]) => {
      return [prefixOf(s.nome) + suf, t, d, desc, chance(0.25) ? null : rint(10, 90)];
    });
  }
  for (const [codigo0, titulo, desc, desconto, validade] of list) {
    let codigo = codigo0;
    for (let k = 2; couponCodes.has(codigo); k++) codigo = codigo0 + k;
    couponCodes.add(codigo);
    couponRows.push(
      `  (${q(s.id)}, ${q(codigo)}, ${q(titulo)}, ${q(desc)}, ${q(desconto)}, ${validade === null ? 'null' : `current_date + ${validade}`}, ${ago(Math.max(0.3, (s.upgradeDias ?? s.subDias) - 1 - rand() * 10))})`,
    );
  }
}
emit('insert into public.coupons (store_id, codigo, titulo, descricao, desconto, validade, created_at) values');
emit(couponRows.join(',\n') + ';');
emit('');

// Assinaturas ---------------------------------------------------------
emit('-- Assinaturas ----------------------------------------------------------');
const subRows = [];
for (const s of stores) {
  if (s.status === 'ativa') {
    if (s.upgradeDias !== undefined) {
      subRows.push(`  (${q(s.id)}, 'basico', 'cancelada', ${PLAN.basico.preco}, ${ago(s.subDias)}, ${ago(s.upgradeDias)})`);
      subRows.push(`  (${q(s.id)}, ${q(s.plan)}, 'ativa', ${PLAN[s.plan].preco}, ${ago(s.upgradeDias)}, null)`);
    } else {
      subRows.push(`  (${q(s.id)}, ${q(s.plan)}, 'ativa', ${PLAN[s.plan].preco}, ${ago(s.subDias)}, null)`);
    }
  } else if (s.status === 'suspensa') {
    subRows.push(`  (${q(s.id)}, 'basico', 'cancelada', ${PLAN.basico.preco}, ${ago(s.subDias)}, ${ago(s.fimDias)})`);
  }
}
emit('insert into public.subscriptions (store_id, plan_id, status, valor_centavos, inicio, fim) values');
emit(subRows.join(',\n') + ';');
emit('update public.subscriptions set created_at = inicio;');
emit('');

// Pagamentos ----------------------------------------------------------
emit('-- Pagamentos mensais (lojas e Premium) --------------------------------');
emit('-- Uma cobrança por mês desde o início. A cobrança do mês corrente que cairia');
emit('-- depois de hoje é antecipada para hoje → o gráfico não "despenca" no mês atual.');
emit(`create temporary table _cobrancas as
select s.store_id, st.owner_id as user_id, s.plan_id, s.valor_centavos,
  case
    when s.inicio + k * interval '1 month' > now() then now() - random() * interval '6 hours'
    else s.inicio + k * interval '1 month'
  end as quando
from public.subscriptions s
join public.stores st on st.id = s.store_id
cross join lateral generate_series(0, 12) k
where s.inicio + k * interval '1 month' < coalesce(s.fim, now())
   or (s.fim is null and date_trunc('month', s.inicio + k * interval '1 month') = date_trunc('month', now()));

insert into public.payments (user_id, store_id, tipo, plan_id, metodo, valor_centavos, created_at)
select user_id, store_id, 'assinatura_loja', plan_id,
  (array['pix','pix','pix','cartao','cartao','boleto'])[1 + floor(random() * 6)::int]::public.payment_method,
  valor_centavos, quando
from _cobrancas
order by quando;

insert into public.payments (user_id, tipo, plan_id, metodo, valor_centavos, created_at)
select p.id, 'premium_cliente', 'premium',
  (array['pix','pix','cartao','cartao','cartao'])[1 + floor(random() * 5)::int]::public.payment_method,
  990,
  case
    when p.premium_desde + k * interval '1 month' > now() then now() - random() * interval '6 hours'
    else p.premium_desde + k * interval '1 month'
  end
from public.profiles p
cross join lateral generate_series(0, 12) k
where p.plano = 'premium'
  and (p.premium_desde + k * interval '1 month' <= now()
       or date_trunc('month', p.premium_desde + k * interval '1 month') = date_trunc('month', now()))
order by 6;

-- Premium válido por 30 dias após a última cobrança
update public.profiles p set premium_ate = x.ultimo + interval '30 days'
from (select user_id, max(created_at) ultimo from public.payments where tipo = 'premium_cliente' group by 1) x
where x.user_id = p.id;

drop table _cobrancas;`);
emit('');

// Avaliações ----------------------------------------------------------
emit('-- Avaliações (o trigger preenche autor_nome e recalcula nota_media) ----');
const reviewers = clientes; // inclui cliente@ e premium@
const reviewRows = [];
const usedComments = new Map();
function commentFor(s, nota) {
  let pool;
  if (nota >= 4) pool = chance(0.55) ? REVIEW_POS_CAT[s.cat] : REVIEW_POS;
  else if (nota === 3) pool = REVIEW_MID;
  else pool = REVIEW_NEG;
  const used = usedComments.get(s.id) ?? new Set();
  usedComments.set(s.id, used);
  const free = pool.filter((c) => !used.has(c));
  const fallback = REVIEW_POS.filter((c) => !used.has(c));
  const c = free.length ? pick(free) : nota >= 4 && fallback.length ? pick(fallback) : '';
  used.add(c);
  return c;
}
const reviewCount = (s) => {
  if (s === patas) return 15;
  if (s.plan === 'destaque') return rint(3, 5);
  if (s.plan === 'profissional') return rint(2, 3);
  return rint(1, 2);
};
for (const s of ativas) {
  const n = reviewCount(s);
  const quem = sample(reviewers, n);
  const viés = s === patas ? 0.85 : rand() * 0.35; // lojas melhores puxam para 5
  quem.forEach((u, i) => {
    let nota;
    if (s === patas) nota = i < 12 ? 5 : 4;
    else
      nota = weighted([
        [5, 48 + viés * 40],
        [4, 32],
        [3, 11],
        [2, 5],
        [1, 3],
      ]);
    const comentario = chance(0.08) && nota >= 4 ? '' : commentFor(s, nota);
    const dias = Math.max(0.5, rand() * Math.min(s.subDias - 1, 120));
    reviewRows.push(`  (${q(s.id)}, ${q(u.id)}, ${nota}, ${q(comentario)}, ${ago(dias)})`);
  });
}
emit('insert into public.reviews (store_id, user_id, nota, comentario, created_at) values');
emit(reviewRows.join(',\n') + ';');
emit('');

// Favoritos -----------------------------------------------------------
emit('-- Favoritos -------------------------------------------------------------');
const byName = (n) => stores.find((s) => s.nome === n);
const favRows = [];
const favSet = new Set();
const addFav = (u, s, dias) => {
  const k = `${u.id}:${s.id}`;
  if (favSet.has(k)) return;
  favSet.add(k);
  favRows.push(`  (${q(u.id)}, ${q(s.id)}, ${ago(dias)})`);
};
// cliente@: exatamente 4 (free permite 5 → dá pra demonstrar o limite no 6º)
for (const n of ['Patas & Cia Pet Shop', 'Vet Amigo Moinhos', 'Espuma & Patas', 'Biscoitaria Au Au']) addFav(U_BY.cliente, byName(n), rint(2, 60));
// premium@: 8
for (const n of [
  'Patas & Cia Pet Shop', 'Hospital Veterinário Pampa 24h', 'Casa do Bigode', 'Dra. Helena Prates – Medicina Felina',
  'Cãomodidade Hotel & Creche', 'Tosa Fina Studio', 'Farmavet Central', 'Passeio Feliz Dog Walker',
]) addFav(U_BY.premium, byName(n), rint(2, 100));
for (const u of clientes) {
  if (u === U_BY.cliente || u === U_BY.premium) continue;
  const isPrem = premiumUsers.includes(u);
  const n = isPrem ? rint(2, 7) : rint(0, 4);
  const pool = chance(0.6) ? [patas, ...sample(ativas, n)] : sample(ativas, n);
  for (const s of pool.slice(0, isPrem ? 7 : 5)) addFav(u, s, rint(1, 90));
}
emit('insert into public.favorites (user_id, store_id, created_at) values');
emit(favRows.join(',\n') + ';');
emit('');

// Pets ----------------------------------------------------------------
emit('-- Carteirinha do pet (premium@) -----------------------------------------');
const thor = uuid();
const mia = uuid();
const premiumId = U_BY.premium.id;
emit('insert into public.pets (id, owner_id, nome, especie, raca, nascimento, peso_kg, foto_url, created_at) values');
emit(
  [
    `  (${q(thor)}, ${q(premiumId)}, 'Thor', 'Cachorro', 'Golden Retriever', current_date - 1680, 31.5, ${q(U('1552053831-71594a27632d'))}, ${ago(120)})`,
    `  (${q(mia)}, ${q(premiumId)}, 'Mia', 'Gato', 'SRD (sem raça definida)', current_date - 790, 4.2, ${q(U('1574158622682-e40e69881006'))}, ${ago(118)})`,
  ].join(',\n') + ';',
);
emit('insert into public.pet_vaccines (pet_id, nome, aplicada_em, proxima_dose) values');
emit(
  [
    // Thor — V10 vence em 6 dias (lembrete "vencendo em breve")
    `  (${q(thor)}, 'V10 (polivalente)', current_date - 724, current_date - 359)`,
    `  (${q(thor)}, 'V10 (polivalente)', current_date - 359, current_date + 6)`,
    `  (${q(thor)}, 'Antirrábica', current_date - 200, current_date + 165)`,
    `  (${q(thor)}, 'Gripe canina (tosse dos canis)', current_date - 118, current_date + 247)`,
    `  (${q(thor)}, 'Giárdia', current_date - 300, current_date + 65)`,
    `  (${q(mia)}, 'Quádrupla felina (V4)', current_date - 92, current_date + 273)`,
    `  (${q(mia)}, 'Antirrábica', current_date - 151, current_date + 214)`,
    `  (${q(mia)}, 'FeLV (leucemia felina)', current_date - 330, current_date + 35)`,
  ].join(',\n') + ';',
);
emit('');

// Eventos -------------------------------------------------------------
emit('-- Eventos dos últimos 30 dias (views e contatos) ------------------------');
emit(`with base as (
  select s.id, s.id = ${q(patas.id)} as patas,
    case sp.id when 'destaque' then 34 when 'profissional' then 13 else 5 end as b,
    0.5 + random() as fator
  from public.stores s
  join public.subscriptions sub on sub.store_id = s.id and sub.status = 'ativa'
  join public.store_plans sp on sp.id = sub.plan_id
  where s.status = 'ativa'
),
dias as (
  select b.*, i, (current_date - i) as dia
  from base b cross join generate_series(0, 29) i
),
qtd as (
  select id, dia,
    greatest(0, round(
      case
        when patas then 16 + (29 - i) * 1.05                      -- crescimento constante
             + case when extract(dow from dia) in (0, 6) then 9 else 0 end  -- fim de semana
             + 6 * sin(i / 2.2) + random() * 5                  -- ondulação suave
        else b * fator * (0.75 + (29 - i) / 70.0) * (0.6 + random() * 0.8)
             * case when extract(dow from dia) in (0, 6) then 1.25 else 1 end
      end
    ))::int as views
  from dias
)
insert into public.store_events (store_id, tipo, created_at)
select id, 'view',
  least(now(), dia + time '11:00' + random() * interval '12 hours')
from qtd cross join lateral generate_series(1, views)
union all
select id,
  (array['whatsapp','whatsapp','whatsapp','whatsapp','rota','rota','rota','telefone'])[1 + floor(random() * 8)::int]::public.event_kind,
  least(now(), dia + time '11:00' + random() * interval '12 hours')
from qtd cross join lateral generate_series(1, round(views * (0.12 + random() * 0.1))::int);`);
emit('');

writeFileSync(OUT, out.join('\n') + '\n');

// Resumo
const plansCount = ativas.reduce((acc, s) => ((acc[s.plan] = (acc[s.plan] ?? 0) + 1), acc), {});
console.log(`seed.sql → ${OUT}`);
console.log(
  `usuários: ${users.length} (lojistas ${lojistas.length + 1}, clientes ${clientes.length}, premium ${premiumUsers.length}) · ` +
    `lojas: ${stores.length} (ativas ${ativas.length}, pendentes ${STORES_PENDENTES.length}, suspensa 1) · ` +
    `planos ${JSON.stringify(plansCount)} · itens ${itemRows.length} · cupons ${couponRows.length} · ` +
    `avaliações ${reviewRows.length} · favoritos ${favRows.length}`,
);
