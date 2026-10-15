import { TIMEZONE, WEEKDAYS } from './constants';

/** {"0": [["09:00","13:00"]], "1": [["08:00","12:00"],["13:30","19:00"]], ...} — 0 = domingo */
export type Horarios = Partial<Record<'0' | '1' | '2' | '3' | '4' | '5' | '6', [string, string][]>>;

export interface OpenStatus {
  aberto: boolean;
  /** Texto curto para exibir: "Aberto · fecha às 19:00", "Fechado · abre amanhã às 08:00", "Aberto 24h" */
  label: string;
}

function nowInTz(date = new Date()): { dia: number; minutos: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { dia, minutos: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function intervals(horarios: Horarios | null | undefined, dia: number): [string, string][] {
  return (horarios?.[String(dia) as keyof Horarios] ?? []) as [string, string][];
}

export function getOpenStatus(
  horarios: Horarios | null | undefined,
  aberto24h = false,
  date = new Date(),
): OpenStatus {
  if (aberto24h) return { aberto: true, label: 'Aberto 24h' };
  const { dia, minutos } = nowInTz(date);

  for (const [ini, fim] of intervals(horarios, dia)) {
    if (minutos >= toMin(ini) && minutos < toMin(fim)) {
      return { aberto: true, label: `Aberto · fecha às ${fim}` };
    }
  }
  // Próxima abertura (hoje ainda, ou nos próximos 7 dias)
  const hojeDepois = intervals(horarios, dia).find(([ini]) => toMin(ini) > minutos);
  if (hojeDepois) return { aberto: false, label: `Fechado · abre às ${hojeDepois[0]}` };
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    const first = intervals(horarios, d)[0];
    if (first) {
      const quando = i === 1 ? 'amanhã' : WEEKDAYS[d].toLowerCase();
      return { aberto: false, label: `Fechado · abre ${quando} às ${first[0]}` };
    }
  }
  return { aberto: false, label: 'Fechado' };
}

export function isOpenNow(horarios: Horarios | null | undefined, aberto24h = false): boolean {
  return getOpenStatus(horarios, aberto24h).aberto;
}

/** Linhas para tabela de horários: [{dia:"Segunda", texto:"08:00–12:00, 13:30–19:00", hoje:true}] */
export function formatWeek(horarios: Horarios | null | undefined, aberto24h = false) {
  const { dia: hoje } = nowInTz();
  // Começa na segunda
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    dia: WEEKDAYS[d],
    hoje: d === hoje,
    texto: aberto24h
      ? '24 horas'
      : intervals(horarios, d)
          .map(([a, b]) => `${a}–${b}`)
          .join(', ') || 'Fechado',
  }));
}
