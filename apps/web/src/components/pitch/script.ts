/**
 * Roteiro do pitch para tutores e lojistas (5 minutos). Fonte única para os slides e o modo apresentador:
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
  | "convite"
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
    fala: "Boa noite, pessoal! Nós somos o EasyPet. Eu sou Paulline, e comigo estão Taylor, Bruno, Gustavo e Léo. Em cinco minutos, vamos mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    falaSolo:
      "Boa noite, pessoal! Eu represento o EasyPet, um time de cinco pessoas: Paulline, Taylor, Bruno, Gustavo e Léo. Em cinco minutos, vou mostrar como levar cada pet até o cuidado certo, pertinho de casa.",
    palco: "O time entra junto e fica em linha. Quem abre dá um passo à frente. Sorriso e contato visual com o público.",
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
    fala: "E o problema não é falta de serviço: Porto Alegre tem pet shop, veterinário e banho e tosa em todo bairro. O problema é que a informação está espalhada: Google, Instagram, grupo de WhatsApp, indicação de vizinho. E do outro lado está o lojista, que faz um trabalho incrível, mas é invisível pra quem mora a três quadras.",
    palco: "Apontar para os dois cartões: primeiro o do tutor, depois o do lojista. Se houver lojistas na plateia, olhar para eles no segundo cartão.",
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
    passagem: "Gustavo, conta por que isso faz tanta diferença.",
  },
  {
    id: "mercado",
    titulo: "Por que agora",
    quem: "gustavo",
    segundos: 25,
    fala: "O Brasil tem cerca de 160 milhões de pets, e o setor pet faturou quase 78 bilhões de reais em 2025, segundo a Abinpet. E continua crescendo. Pro tutor, isso quer dizer muita opção. Pro lojista, quer dizer muita gente procurando pelo seu serviço agora. O que falta é se encontrarem.",
    palco: "Esperar os números terminarem de contar antes de falar cada um.",
  },
  {
    id: "modelo",
    titulo: "Planos",
    quem: "gustavo",
    segundos: 30,
    fala: "E como funciona? Pro tutor, usar é de graça: mapa, busca, WhatsApp, rota e até cinco favoritos. Quem quiser mais assina o Premium por R$ 9,90 por mês, com cupons exclusivos, favoritos ilimitados e a carteirinha do pet. Pro lojista, são três planos, de R$ 49,90 a R$ 199,90 por mês: do perfil com pin no mapa até aparecer no topo das buscas.",
    palco: "Apontar primeiro para o lado do tutor, depois para os planos do lojista.",
    passagem: "Taylor, conta onde a gente já chegou.",
  },
  {
    id: "tracao",
    titulo: "Onde estamos",
    quem: "taylor",
    segundos: 30,
    fala: "E isso não é promessa: o EasyPet já funciona de ponta a ponta. O tutor encontra e chama a loja em segundos, o lojista se cadastra e acompanha os resultados, e toda loja é aprovada antes de aparecer. E qualidade, pra nós, é método: temos uma gestão da qualidade documentada com base na ISO 9001, com processos, riscos e critérios de aceite definidos. Sendo transparente: o app de iPhone e o pagamento online ainda estão chegando, e entram antes do lançamento oficial.",
    palco: "Tom firme e honesto. Apontar para o cartão de qualidade ao falar da ISO 9001. A transparência sobre iPhone e pagamento online gera confiança: não pular essa frase.",
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
    fala: "Somos cinco pessoas que se completam: negócios, tecnologia, produto, finanças e marca. Construímos o EasyPet do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    falaSolo:
      "Somos cinco pessoas que se completam: Paulline em negócios, Taylor em tecnologia, Bruno em produto, Gustavo em finanças e Léo em marca. Construímos o EasyPet do zero e queremos levá-lo a cada bairro de Porto Alegre.",
    palco: "Cada integrante acena quando aparece o próprio cartão.",
  },
  {
    id: "convite",
    titulo: "Faça parte",
    quem: "paulline",
    segundos: 35,
    fala: "E agora é com vocês. Se você é tutor: entre no EasyPet, encontre as lojas do seu bairro e favorite as que você confia. Se você é lojista: cadastre a sua loja e seja encontrado por quem está pertinho. E vem muita coisa por aí: em três meses, o lançamento oficial, com app de iPhone e pagamento online. Em seis, 400 lojas em Porto Alegre. E em um ano, a Grande Porto Alegre.",
    palco: "Olhar para os tutores ao falar do primeiro cartão e para os lojistas no segundo. Os endereços na tela levam ao site; deixar o slide visível alguns segundos para fotos.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    quem: "paulline",
    segundos: 15,
    fala: "Toda noite, em algum lugar de Porto Alegre, tem uma Luna esperando. Com o EasyPet, o cuidado certo está a um toque. Obrigado, e vem com a gente!",
    palco: "O time inteiro à frente. O confete dispara ao entrar no slide. Agradecer e abrir para perguntas.",
  },
];

export const TOTAL_SECONDS = PITCH_SCRIPT.reduce((sum, s) => sum + s.segundos, 0);

/** Perguntas prováveis do público (tutores e lojistas), com a linha de resposta e quem responde. */
export const QA: { pergunta: string; resposta: string; quem: MemberId }[] = [
  {
    pergunta: "Para o tutor é de graça mesmo?",
    resposta:
      "Sim. Mapa, busca, WhatsApp, rota e até 5 favoritos não custam nada. O Premium, de R$ 9,90 por mês, é opcional: cupons exclusivos, favoritos ilimitados, filtros avançados e a carteirinha do pet.",
    quem: "gustavo",
  },
  {
    pergunta: "Como sei que a loja é confiável?",
    resposta:
      "Toda loja passa por aprovação antes de aparecer no mapa, e você vê as avaliações de outros tutores antes de escolher.",
    quem: "bruno",
  },
  {
    pergunta: "Por que o lojista pagaria, se o Google Maps é de graça?",
    resposta:
      "O Google mostra endereço; o EasyPet mostra catálogo, cupons, horários e o contato em um toque, só para quem procura serviço pet. E o lojista vê estatísticas de quem chamou no WhatsApp ou pediu a rota.",
    quem: "paulline",
  },
  {
    pergunta: "Posso cancelar o plano da minha loja?",
    resposta: "Sim, o plano é mensal e pode ser cancelado pelo painel do lojista.",
    quem: "gustavo",
  },
  {
    pergunta: "Tem app para iPhone? E o pagamento online?",
    resposta:
      "Os dois chegam no lançamento oficial, previsto para os próximos 3 meses. Até lá, o site funciona no navegador do celular e o app Android já está pronto.",
    quem: "taylor",
  },
  {
    pergunta: "Qual a diferença para um app de uma grande rede pet?",
    resposta:
      "Grandes redes mostram as próprias lojas. O EasyPet é uma vitrine de todo o comércio do bairro, incluindo serviços que elas não oferecem, como adestrador, dog walker e hotel.",
    quem: "leo",
  },
];
