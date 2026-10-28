/**
 * Roteiro do pitch (estilo Shark Tank, 5 minutos). Fonte única para os slides e o modo apresentador:
 * a ordem de PITCH_SCRIPT é a ordem dos slides (ids casam com SLIDE_VIEWS em slides.tsx).
 */

export type MemberId = "taylor" | "paulline" | "leo" | "bruno" | "gustavo";

export interface Member {
  id: MemberId;
  nome: string;
  sigla: string;
  papel: string;
  area: string;
  cor: string;
}

export const TEAM: Member[] = [
  { id: "taylor", nome: "Taylor", sigla: "CEO", papel: "CEO", area: "Negócios e parcerias", cor: "#FF6B35" },
  { id: "paulline", nome: "Paulline", sigla: "CMO", papel: "CMO", area: "Marca e comunidade", cor: "#E85D9A" },
  { id: "leo", nome: "Léo", sigla: "CPO", papel: "CPO", area: "Produto e experiência", cor: "#127475" },
  { id: "bruno", nome: "Bruno", sigla: "CFO", papel: "CFO", area: "Finanças e mercado", cor: "#5468D4" },
  { id: "gustavo", nome: "Gustavo", sigla: "CTO", papel: "CTO", area: "Tecnologia e qualidade", cor: "#2E9E5B" },
];

export const memberById = (id: MemberId) => TEAM.find((m) => m.id === id)!;

export type SlideId =
  | "capa"
  | "gancho"
  | "problema"
  | "solucao"
  | "produto"
  | "mercado"
  | "modelo"
  | "tracao"
  | "proposito"
  | "equipe"
  | "pedido"
  | "fechamento";

export interface ScriptEntry {
  id: SlideId;
  titulo: string;
  /** Quem fala na versão com 5 apresentadores. */
  quem: MemberId;
  segundos: number;
  /** Fala da versão com 5 apresentadores (e da versão solo, se não houver falaSolo). */
  fala: string;
  falaSolo?: string;
  /** Ação de palco: gestos, pausas, o que mostrar. */
  palco?: string;
  /** Frase de passagem para o próximo apresentador (só na versão com 5). */
  passagem?: string;
}

export const PITCH_SCRIPT: ScriptEntry[] = [
  {
    id: "capa",
    titulo: "Capa",
    quem: "taylor",
    segundos: 15,
    fala: "Boa noite, tubarões! Nós somos o EasyPet. Eu sou Taylor, e comigo estão Paulline, Léo, Bruno e Gustavo. Em cinco minutos, vamos mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    falaSolo:
      "Boa noite, tubarões! Eu represento o EasyPet, um time de cinco pessoas: Taylor, Paulline, Léo, Bruno e Gustavo. Em cinco minutos, vou mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    palco: "O time entra junto e fica em linha. Quem abre dá um passo à frente. Sorriso e contato visual com a bancada.",
    passagem: "Paulline, conta pra eles como tudo começou.",
  },
  {
    id: "gancho",
    titulo: "Gancho: 22h07",
    quem: "paulline",
    segundos: 30,
    fala: "Sexta-feira, 22h07. A Luna começa a passar mal. Abro o Google: “veterinário perto de mim”. O primeiro está fechado. O segundo não atende. Mando mensagem no grupo do condomínio, entro no Instagram de três clínicas… Vinte minutos depois, eu ainda não sabia pra onde ir. E a Luna esperando.",
    palco: "História ilustrativa, contada em tom de conversa. Falar devagar. Pausa de 2 segundos depois de “E a Luna esperando”. Opcional: “Quem aqui tem pet?” e levantar a mão.",
  },
  {
    id: "problema",
    titulo: "O problema",
    quem: "paulline",
    segundos: 25,
    fala: "E o problema não é falta de serviço: Porto Alegre tem pet shop, veterinário e banho e tosa em todo bairro. O problema é que a informação está espalhada: Google, Instagram, grupo de WhatsApp, indicação de vizinho. E do outro lado está o pequeno lojista, que faz um trabalho incrível, mas é invisível pra quem mora a três quadras.",
    palco: "Apontar para os dois cartões: primeiro o do tutor, depois o do lojista.",
    passagem: "Léo, mostra pra eles o que a gente construiu.",
  },
  {
    id: "solucao",
    titulo: "A solução",
    quem: "leo",
    segundos: 30,
    fala: "Esse é o EasyPet: uma vitrine geolocalizada de tudo que é pet. Você abre o mapa, escolhe entre 15 categorias, do veterinário ao hotel, do adestrador à farmácia, e vê quem está perto e aberto agora. Gostou? Um toque e você fala no WhatsApp da loja. Outro toque e a rota está traçada. Com a Luna, teriam sido dois minutos. Não vinte.",
    palco: "Deixar a animação do mapa rodar enquanto fala: a busca digita sozinha e os pins caem.",
  },
  {
    id: "produto",
    titulo: "O produto",
    quem: "leo",
    segundos: 30,
    fala: "E vai além. Pro tutor: avaliações, favoritos, cupons e uma carteirinha digital com as vacinas do pet. Pro lojista: perfil completo, catálogo, cupons e estatísticas: quantas pessoas viram a loja, chamaram no WhatsApp ou pediram a rota. E tudo isso funciona hoje, no site e no app.",
    palco: "Opcional, se houver internet: erguer o celular com o app aberto. O botão “Ver ao vivo” abre o site em outra aba (voltar com Alt+Tab).",
    passagem: "Bruno, e quanto isso vale?",
  },
  {
    id: "mercado",
    titulo: "O mercado",
    quem: "bruno",
    segundos: 25,
    fala: "Vamos falar de dinheiro. O setor pet brasileiro faturou quase 78 bilhões de reais em 2025, segundo a Abinpet. São cerca de 160 milhões de animais de estimação no país. E mesmo num ano difícil para a economia, esse mercado continuou crescendo.",
    palco: "Esperar os números terminarem de contar antes de falar cada um.",
  },
  {
    id: "modelo",
    titulo: "Modelo de negócio",
    quem: "bruno",
    segundos: 30,
    fala: "Nosso modelo tem duas pontas. O tutor usa de graça, e pode assinar o Premium por R$ 9,90 por mês. O lojista paga um plano mensal, de R$ 49,90 a R$ 199,90. Uma conta simples: 100 lojas no plano Profissional e mil assinantes Premium já somam quase 20 mil reais de receita recorrente por mês. Só em Porto Alegre.",
    palco: "Ao falar “uma conta simples”, apontar para a faixa da simulação no rodapé.",
    passagem: "Gustavo, eles vão querer saber se isso é de verdade.",
  },
  {
    id: "tracao",
    titulo: "Onde estamos",
    quem: "gustavo",
    segundos: 30,
    fala: "E é de verdade. O EasyPet já funciona: site no ar, app Android, banco de dados com geolocalização, moderação de lojas e as regras de cada plano validadas no servidor. Documentamos nossa gestão da qualidade com base na ISO 9001. E, sendo transparente: os pagamentos ainda são simulados. O próximo passo é o piloto com lojistas reais.",
    palco: "Tom firme e honesto. A transparência sobre os pagamentos gera confiança: não pular essa frase.",
  },
  {
    id: "proposito",
    titulo: "Missão, visão e valores",
    quem: "gustavo",
    segundos: 20,
    fala: "E por trás da tecnologia tem um propósito. Nossa missão é aproximar cada pet do cuidado certo. Nossa visão é ser a plataforma que mais contribui para o bem-estar dos pets nas cidades onde atuamos. E o primeiro dos nossos valores é o bem-estar animal em primeiro lugar.",
    passagem: "Taylor, apresenta quem faz isso acontecer.",
  },
  {
    id: "equipe",
    titulo: "Equipe",
    quem: "taylor",
    segundos: 15,
    fala: "Somos cinco pessoas que se completam: negócios, marca, produto, finanças e tecnologia. Construímos esse MVP do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    falaSolo:
      "Somos cinco pessoas que se completam: Taylor em negócios, Paulline em marca, Léo em produto, Bruno em finanças e Gustavo em tecnologia. Construímos esse MVP do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    palco: "Cada integrante acena quando aparece o próprio cartão.",
  },
  {
    id: "pedido",
    titulo: "O pedido",
    quem: "taylor",
    segundos: 35,
    fala: "Então, aqui está a nossa proposta: buscamos 300 mil reais por 10% do EasyPet. E esse dinheiro tem destino certo: 40% para trazer lojistas, 25% em marketing para tutores, 25% em produto, com o app iOS e os pagamentos reais, e 10% em operação e LGPD. A meta: em 12 meses, 300 lojas pagantes e a expansão para a Grande Porto Alegre.",
    palco: "Valores fictícios para a dinâmica. Dizer o pedido olhando para a bancada e fazer uma pausa curta antes do “por 10%”.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    quem: "taylor",
    segundos: 15,
    fala: "Toda noite, em algum lugar de Porto Alegre, tem uma Luna esperando. Com o EasyPet, o cuidado certo está a um toque. Tubarões: quem vem com a gente?",
    palco: "O time inteiro à frente. O confete dispara ao entrar no slide. Agradecer e aguardar as perguntas.",
  },
];

export const TOTAL_SECONDS = PITCH_SCRIPT.reduce((sum, s) => sum + s.segundos, 0);

/** Perguntas prováveis da bancada, com a linha de resposta e quem responde. */
export const QA: { pergunta: string; resposta: string; quem: MemberId }[] = [
  {
    pergunta: "Como vocês chegaram em R$ 3 milhões de valuation?",
    resposta:
      "MVP completo (site, app e backend), modelo de receita recorrente nas duas pontas e um mercado de R$ 78 bi. O aporte banca 12 meses de piloto e expansão em Porto Alegre.",
    quem: "bruno",
  },
  {
    pergunta: "Por que o lojista pagaria, se o Google Maps é de graça?",
    resposta:
      "O Google mostra endereço; o EasyPet mostra catálogo, cupons, horários e o contato em um toque, só para quem procura serviço pet. E o lojista vê estatísticas de quem chamou no WhatsApp ou pediu a rota.",
    quem: "taylor",
  },
  {
    pergunta: "Como vão atrair os primeiros lojistas?",
    resposta:
      "Venda porta a porta por bairro, com o primeiro mês do plano Básico como degustação e um piloto de 50 lojas em Porto Alegre.",
    quem: "taylor",
  },
  {
    pergunta: "Quais são os riscos técnicos?",
    resposta:
      "Pagamentos reais (gateway) e app iOS publicado. O resto já roda: banco com geolocalização, regras de plano no servidor e segurança por linha (RLS).",
    quem: "gustavo",
  },
  {
    pergunta: "E se uma grande rede pet copiar?",
    resposta:
      "Grandes redes vendem o próprio estoque. Somos uma vitrine neutra para todo o comércio local, incluindo serviços que elas não oferecem, como adestrador, dog walker e hotel.",
    quem: "paulline",
  },
];
