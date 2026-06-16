import React from "react";
import { TrendingUp, CalendarCheck, Timer } from "lucide-react";

const STATS = [
  {
    id: "ventas",
    icon: TrendingUp,
    value: "31%",
    prefix: "",
    title: "Propiedades se venden 31% más rápido",
    desc: "Los recorridos 360 filtran curiosos y aceleran la toma de decisión del comprador.",
    accent: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
  },
  {
    id: "reservas",
    icon: CalendarCheck,
    value: "+15%",
    prefix: "",
    title: "+15% en reservas directas",
    desc: "Hoteles y eventos aumentan reservas al eliminar dudas sobre habitaciones y salones.",
    accent: "text-orange-500",
    bg: "bg-orange-50",
    ring: "ring-orange-100",
  },
  {
    id: "retencion",
    icon: Timer,
    value: "x3",
    prefix: "",
    title: "Multiplica x3 el tiempo de retención web",
    desc: "Las visitas inmersivas mantienen al usuario explorando tu espacio, no rebotando.",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
];

export default function RoiStats() {
  return (
    <section
      id="beneficios"
      data-testid="roi-section"
      className="py-20 sm:py-24 lg:py-28 bg-slate-50 border-y border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Resultados, no tecnología
          </span>
          <h2 className="font-heading mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            ROI medible desde la primera semana.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Datos reales de campañas B2B en 2026: lo que sucede cuando tu
            espacio se puede recorrer 24/7 sin fricción.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STATS.map((s, idx) => (
            <article
              key={s.id}
              data-testid={`roi-card-${s.id}`}
              className={`group relative rounded-3xl bg-white border border-slate-200 p-7 sm:p-8 ring-1 ${s.ring} shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:shadow-[0_24px_60px_-25px_rgba(15,23,42,0.25)] transition-all duration-300`}
              style={{ animation: `fadeUp 0.7s ${idx * 100}ms both` }}
            >
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-6`}>
                <s.icon className={`w-6 h-6 ${s.accent}`} strokeWidth={2} />
              </div>
              <div
                className={`font-heading text-5xl sm:text-6xl font-extrabold tracking-tighter ${s.accent} leading-none`}
              >
                {s.value}
              </div>
              <h3 className="font-heading mt-5 text-xl font-bold text-slate-900 leading-snug">
                {s.title}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
