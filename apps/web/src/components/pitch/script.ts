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
  { id: "paulline", nome: "Paulline", sigla: "CEO", papel: "CEO", area: "Negócios e parcerias", cor: "#E85D9A" },
  { id: "taylor", nome: "Taylor", sigla: "CTO", papel: "CTO", area: "Tecnologia e qualidade", cor: "#FF6B35" },
  { id: "bruno", nome: "Bruno", sigla: "CPO", papel: "CPO", area: "Produto e experiência", cor: "#5468D4" },
  { id: "gustavo", nome: "Gustavo", sigla: "CFO", papel: "CFO", area: "Finanças e mercado", cor: "#2E9E5B" },
  { id: "leo", nome: "Léo", sigla: "CMO", papel: "CMO", area: "Marca e comunidade", cor: "#127475" },
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
    quem: "paulline",
    segundos: 15,
    fala: "Boa noite, tubarões! Nós somos o EasyPet. Eu sou Paulline, e comigo estão Taylor, Bruno, Gustavo e Léo. Em cinco minutos, vamos mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    falaSolo:
      "Boa noite, tubarões! Eu represento o EasyPet, um time de cinco pessoas: Paulline, Taylor, Bruno, Gustavo e Léo. Em cinco minutos, vou mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    palco: "O time entra junto e fica em linha. Quem abre dá um passo à frente. Sorriso e contato visual com a bancada.",
    passagem: "Léo, conta pra eles como tudo começou.",
  },
  {
    id: "gancho",
    titulo: "Gancho: 22h07",
    quem: "leo",
    segundos: 30,
    fala: "Sexta-feira, 22h07. A Luna começa a passar mal. Abro o Google: “veterinário perto de mim”. O primeiro está fechado. O segundo não atende. Mando mensagem no grupo do condomínio, entro no Instagram de três clínicas… Vinte minutos depois, eu ainda não sabia pra onde ir. E a Luna esperando.",
    palco: "História ilustrativa, contada em tom de conversa. Falar devagar. Pausa de 2 segundos depois de “E a Luna esperando”. Opcional: “Quem aqui tem pet?” e levantar a mão.",
  },
  {
    id: "problema",
    titulo: "O problema",
    quem: "leo",
    segundos: 25,
    fala: "E o problema não é falta de serviço: Porto Alegre tem pet shop, veterinário e banho e tosa em todo bairro. O problema é que a informação está espalhada: Google, Instagram, grupo de WhatsApp, indicação de vizinho. E do outro lado está o pequeno lojista, que faz um trabalho incrível, mas é invisível pra quem mora a três quadras.",
    palco: "Apontar para os dois cartões: primeiro o do tutor, depois o do lojista.",
    passagem: "Bruno, mostra pra eles o que a gente construiu.",
  },
  {
    id: "solucao",
    titulo: "A solução",
    quem: "bruno",
    segundos: 30,
    fala: "Esse é o EasyPet: uma vitrine geolocalizada de tudo que é pet. Você abre o mapa, escolhe entre 15 categorias, do veterinário ao hotel, do adestrador à farmácia, e vê quem está perto e aberto agora. Gostou? Um toque e você fala no WhatsApp da loja. Outro toque e a rota está traçada. Com a Luna, teriam sido dois minutos. Não vinte.",
    palco: "Deixar a animação do mapa rodar enquanto fala: a busca digita sozinha e os pins caem.",
  },
  {
    id: "produto",
    titulo: "O produto",
    quem: "bruno",
    segundos: 30,
    fala: "E vai além. Pro tutor: avaliações, favoritos, cupons e uma carteirinha digital com as vacinas do pet. Pro lojista: perfil completo, catálogo, cupons e estatísticas: quantas pessoas viram a loja, chamaram no WhatsApp ou pediram a rota. E tudo isso funciona hoje, no site e no app.",
    palco: "Opcional, se houver internet: erguer o celular com o app aberto. O botão “Ver ao vivo” abre o site em outra aba (voltar com Alt+Tab).",
    passagem: "Gustavo, e quanto isso vale?",
  },
  {
    id: "mercado",
    titulo: "O mercado",
    quem: "gustavo",
    segundos: 25,
    fala: "Vamos falar de dinheiro. O setor pet brasileiro faturou quase 78 bilhões de reais em 2025, segundo a Abinpet. São cerca de 160 milhões de animais de estimação no país. E mesmo num ano difícil para a economia, esse mercado continuou crescendo.",
    palco: "Esperar os números terminarem de contar antes de falar cada um.",
  },
  {
    id: "modelo",
    titulo: "Modelo de negócio",
    quem: "gustavo",
    segundos: 30,
    fala: "Nosso modelo tem duas pontas. O tutor usa de graça, e pode assinar o Premium por R$ 9,90 por mês. O lojista paga um plano mensal, de R$ 49,90 a R$ 199,90. E a gente começa pelo lojista, que é quem paga primeiro. Uma conta simples: 400 lojas, distribuídas entre os três planos, e só 300 assinantes Premium já somam quase 38 mil reais de receita recorrente por mês. Só em Porto Alegre.",
    palco: "Ao falar “uma conta simples”, apontar para a faixa da simulação no rodapé.",
    passagem: "Taylor, eles vão querer saber se isso é de verdade.",
  },
  {
    id: "tracao",
    titulo: "Onde estamos",
    quem: "taylor",
    segundos: 30,
    fala: "E é de verdade. O EasyPet já funciona de ponta a ponta: o tutor encontra e chama a loja em segundos, o lojista se cadastra e acompanha os resultados, e toda loja é aprovada antes de aparecer. E qualidade, pra nós, é método: temos uma gestão da qualidade documentada com base na ISO 9001, com processos, riscos e critérios de aceite definidos. Sendo transparente: os pagamentos ainda são simulados e o app iOS está em desenvolvimento. Os dois chegam antes do lançamento.",
    palco: "Tom firme e honesto. Apontar para o cartão de qualidade ao falar da ISO 9001. A transparência sobre pagamentos e iOS gera confiança: não pular essa frase.",
  },
  {
    id: "proposito",
    titulo: "Missão, visão e valores",
    quem: "taylor",
    segundos: 20,
    fala: "E por trás da tecnologia tem um propósito. Nossa missão é aproximar cada pet do cuidado certo. Nossa visão é ser a plataforma que mais contribui para o bem-estar dos pets nas cidades onde atuamos. E o primeiro dos nossos valores é o bem-estar animal em primeiro lugar.",
    passagem: "Paulline, apresenta quem faz isso acontecer.",
  },
  {
    id: "equipe",
    titulo: "Equipe",
    quem: "paulline",
    segundos: 15,
    fala: "Somos cinco pessoas que se completam: negócios, tecnologia, produto, finanças e marca. Construímos esse MVP do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    falaSolo:
      "Somos cinco pessoas que se completam: Paulline em negócios, Taylor em tecnologia, Bruno em produto, Gustavo em finanças e Léo em marca. Construímos esse MVP do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    palco: "Cada integrante acena quando aparece o próprio cartão.",
  },
  {
    id: "pedido",
    titulo: "O pedido",
    quem: "paulline",
    segundos: 35,
    fala: "Então, aqui está a nossa proposta: buscamos 300 mil reais por 10% do EasyPet. A maior parte vai para trazer lojistas e para o produto: app iOS e pagamentos reais. As metas: em 3 meses, lançamento oficial com 100 lojas parceiras. Em 6 meses, 400 lojas pagantes. E em 12 meses, mil lojas e um milhão de reais por ano em receita recorrente.",
    palco: "Valores e metas fictícios para a dinâmica. Dizer o pedido olhando para a bancada e fazer uma pausa curta antes do “por 10%”. Apontar para cada meta ao citá-la.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    quem: "paulline",
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
      "MVP completo (site, app e backend), modelo de receita recorrente nas duas pontas e um mercado de R$ 78 bi. O aporte banca o lançamento e 12 meses de crescimento até R$ 1 mi/ano de receita recorrente.",
    quem: "gustavo",
  },
  {
    pergunta: "Por que o lojista pagaria, se o Google Maps é de graça?",
    resposta:
      "O Google mostra endereço; o EasyPet mostra catálogo, cupons, horários e o contato em um toque, só para quem procura serviço pet. E o lojista vê estatísticas de quem chamou no WhatsApp ou pediu a rota.",
    quem: "paulline",
  },
  {
    pergunta: "Como vão atrair os primeiros lojistas?",
    resposta:
      "Venda porta a porta por bairro, com o primeiro mês do plano Básico como degustação, para chegar a 100 lojas parceiras no lançamento.",
    quem: "paulline",
  },
  {
    pergunta: "Quais são os riscos técnicos?",
    resposta:
      "Pagamentos reais e a publicação do app iOS, previstos para os 3 primeiros meses. O resto já roda: geolocalização, regras de plano no servidor e controle de acesso aos dados, dentro do nosso processo de qualidade.",
    quem: "taylor",
  },
  {
    pergunta: "E se uma grande rede pet copiar?",
    resposta:
      "Grandes redes vendem o próprio estoque. Somos uma vitrine neutra para todo o comércio local, incluindo serviços que elas não oferecem, como adestrador, dog walker e hotel.",
    quem: "leo",
  },
];
