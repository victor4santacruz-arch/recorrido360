import React, { useState } from "react";
import { Building2, Hotel, Stethoscope, ShoppingBag, Check } from "lucide-react";

const INDUSTRIES = [
  {
    id: "inmobiliaria",
    label: "Inmobiliaria",
    icon: Building2,
    color: "blue",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    title: "Filtra curiosos. Cierra ventas más rápido.",
    body: "Muestra propiedades completas en 360º para que sólo te visiten los compradores realmente decididos.",
    bullets: [
      "Visitas online 24/7 desde cualquier dispositivo",
      "Menos visitas físicas innecesarias",
      "Mayor velocidad de cierre y menor tiempo en mercado",
    ],
  },
  {
    id: "hoteles",
    label: "Hoteles y Eventos",
    icon: Hotel,
    color: "orange",
    image:
      "https://images.pexels.com/photos/29870245/pexels-photo-29870245.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    title: "Aumenta tus reservas directas.",
    body: "Eliminá las dudas sobre habitaciones y salones: cuando el huésped ve, reserva sin intermediarios.",
    bullets: [
      "Hasta +15% en reservas directas",
      "Menos dependencia de OTAs y comisiones",
      "Storytelling visual de salones para eventos",
    ],
  },
  {
    id: "clinicas",
    label: "Clínicas y Salud",
    icon: Stethoscope,
    color: "emerald",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    title: "Reduce la ansiedad del paciente.",
    body: "Un entorno limpio, profesional y humano antes de la primera consulta genera confianza y ocupación.",
    bullets: [
      "Mayor confianza en pacientes nuevos",
      "Menos cancelaciones de primera consulta",
      "Diferenciación frente a competidores",
    ],
  },
  {
    id: "retail",
    label: "Comercios (Retail)",
    icon: ShoppingBag,
    color: "fuchsia",
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
    title: "Destaca en búsquedas locales.",
    body: "Integramos tu recorrido en Google Street View para que tu local aparezca primero y atraiga clientes.",
    bullets: [
      "Mejor ranking en Google Maps",
      "Más visitas físicas calificadas",
      "Imagen profesional frente a competidores",
    ],
  },
];

const COLOR_CLASSES = {
  blue: {
    pill: "bg-blue-50 text-blue-700 ring-blue-200",
    tabActive: "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
    chip: "bg-blue-600",
    check: "text-blue-600",
  },
  orange: {
    pill: "bg-orange-50 text-orange-700 ring-orange-200",
    tabActive: "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
    chip: "bg-orange-500",
    check: "text-orange-500",
  },
  emerald: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    tabActive: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
    chip: "bg-emerald-600",
    check: "text-emerald-600",
  },
  fuchsia: {
    pill: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
    tabActive: "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30",
    chip: "bg-fuchsia-600",
    check: "text-fuchsia-600",
  },
};

export default function Industries() {
  const [active, setActive] = useState(INDUSTRIES[0].id);
  const current = INDUSTRIES.find((i) => i.id === active);
  const colors = COLOR_CLASSES[current.color];

  return (
    <section
      id="industrias"
      data-testid="industries-section"
      className="py-20 sm:py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 lg:mb-14">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-orange-500">
            Beneficios por industria
          </span>
          <h2 className="font-heading mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Diseñado para cada vertical B2B.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Cada industria tiene un cuello de botella distinto. Elegí el tuyo y
            descubrí cómo un Recorrido 360º lo resuelve.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
          {INDUSTRIES.map((ind) => {
            const isActive = ind.id === active;
            const c = COLOR_CLASSES[ind.color];
            return (
              <button
                key={ind.id}
                onClick={() => setActive(ind.id)}
                data-testid={`industry-tab-${ind.id}`}
                className={`shrink-0 inline-flex items-center gap-2.5 rounded-full px-5 py-3 font-semibold text-sm sm:text-[15px] transition-all ${
                  isActive
                    ? c.tabActive
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ind.icon className="w-4 h-4" />
                {ind.label}
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div
          key={current.id}
          className="reveal mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch"
        >
          {/* Image */}
          <div className="industry-card aspect-[5/4] lg:aspect-auto lg:min-h-[460px] order-2 lg:order-1">
            <img
              src={current.image}
              alt={current.label}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="text-white">
                <span
                  className={`inline-flex items-center gap-2 ${colors.chip} text-white rounded-full px-3 py-1 text-xs font-semibold mb-3`}
                >
                  <current.icon className="w-3.5 h-3.5" />
                  {current.label}
                </span>
                <div className="font-heading text-2xl sm:text-3xl font-bold leading-tight max-w-md">
                  {current.title}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ${colors.pill}`}
            >
              <current.icon className="w-3.5 h-3.5" />
              {current.label}
            </span>
            <h3 className="font-heading mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {current.title}
            </h3>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {current.body}
            </p>
            <ul className="mt-6 space-y-3">
              {current.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-slate-700"
                  data-testid={`industry-bullet-${current.id}`}
                >
                  <span
                    className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 ${colors.check}`}
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] sm:text-base">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
