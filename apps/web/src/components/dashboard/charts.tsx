"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/shared";

/** Par validado (CVD, contraste e croma) a partir dos tokens da marca. */
export const CHART = { a: "#E4541F", b: "#0A9396", c: "#7A5BC9", grid: "#EEE4DA", axis: "#6B6460" };

const axisProps = { tick: { fill: CHART.axis, fontSize: 12, fontWeight: 600 }, tickLine: false, axisLine: false } as const;

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm shadow-lift">
      <div className="mb-1 font-extrabold">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          {r.color && <span className="size-2.5 rounded-full" style={{ background: r.color }} />}
          <span className="text-muted">{r.label}</span>
          <b className="ml-auto pl-4 tabular-nums">{r.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className="h-2.5 w-4 rounded-full" style={{ background: i.color }} /> {i.label}
        </span>
      ))}
    </div>
  );
}

const fmtDay = (d: string) => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

export function ActivityChart({ data }: { data: { dia: string; views: number; contatos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.a} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CHART.a} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCont" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.b} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CHART.b} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="dia" tickFormatter={fmtDay} {...axisProps} minTickGap={24} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip
          cursor={{ stroke: CHART.axis, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox
                title={fmtDay(String(label))}
                rows={[
                  { label: "Visualizações", value: String(payload.find((p) => p.dataKey === "views")?.value ?? 0), color: CHART.a },
                  { label: "Contatos", value: String(payload.find((p) => p.dataKey === "contatos")?.value ?? 0), color: CHART.b },
                ]}
              />
            ) : null
          }
        />
        <Area type="monotone" dataKey="views" stroke={CHART.a} strokeWidth={2} fill="url(#gViews)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
        <Area type="monotone" dataKey="contatos" stroke={CHART.b} strokeWidth={2} fill="url(#gCont)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtMes = (m: string) => {
  const [y, mm] = m.split("-");
  return `${MESES[Number(mm) - 1]}/${y.slice(2)}`;
};
const fmtK = (c: number) => (c >= 100000 ? `R$ ${(c / 100000).toFixed(1).replace(".", ",")} mil` : `R$ ${Math.round(c / 100)}`);

export function RevenueChart({ data }: { data: { mes: string; lojas: number; premium: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 4, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="mes" tickFormatter={fmtMes} {...axisProps} />
        <YAxis tickFormatter={fmtK} {...axisProps} width={78} />
        <Tooltip
          cursor={{ fill: "rgba(30,27,24,.04)" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox
                title={fmtMes(String(label))}
                rows={[
                  { label: "Lojas", value: formatPrice(Number(payload.find((p) => p.dataKey === "lojas")?.value ?? 0)), color: CHART.a },
                  { label: "Premium", value: formatPrice(Number(payload.find((p) => p.dataKey === "premium")?.value ?? 0)), color: CHART.b },
                  { label: "Total", value: formatPrice(payload.reduce((s, p) => s + Number(p.value ?? 0), 0)) },
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="lojas" stackId="r" fill={CHART.a} stroke="#fff" strokeWidth={2} />
        <Bar dataKey="premium" stackId="r" fill={CHART.b} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Barras horizontais; cada barra com a cor da própria entidade (ex.: categoria). */
export function HBarChart({ data, unit = "" }: { data: { label: string; total: number; cor?: string }[]; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }} barCategoryGap={6}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={170} {...axisProps} tick={{ ...axisProps.tick, fill: "#1E1B18" }} />
        <Tooltip
          cursor={{ fill: "rgba(30,27,24,.04)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox title={String(payload[0].payload.label)} rows={[{ label: "Total", value: `${payload[0].value}${unit}`, color: payload[0].payload.cor ?? CHART.a }]} />
            ) : null
          }
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#6B6460", fontSize: 12, fontWeight: 700 }}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.cor ?? CHART.a} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
