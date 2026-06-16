import React from "react";
import { Camera, Wand2, Globe2, ArrowRight } from "lucide-react";
import { CONTACT } from "@/lib/brand";
import WhatsAppIcon from "@/components/landing/WhatsAppIcon";

const STEPS = [
  {
    n: "01",
    icon: Camera,
    title: "Relevamiento rápido",
    body: "Visitamos tu local con equipo profesional sin interrumpir tus operaciones. Una sesión, todas las escenas.",
    accent: "text-blue-600",
    bar: "bg-blue-600",
  },
  {
    n: "02",
    icon: Wand2,
    title: "Edición inmersiva interactiva",
    body: "Construimos el recorrido con hotspots, planos, info contextual y branding. Listo para destacar.",
    accent: "text-orange-500",
    bar: "bg-orange-500",
  },
  {
    n: "03",
    icon: Globe2,
    title: "Integración en tu Web y Google Maps",
    body: "Te lo entregamos embebido en tu sitio + publicado en Google Street View para SEO local.",
    accent: "text-emerald-600",
    bar: "bg-emerald-600",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="proceso"
      data-testid="how-it-works-section"
      className="py-20 sm:py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Cómo funciona
            </span>
            <h2 className="font-heading mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              De tu espacio a Google Maps en 3 pasos.
            </h2>
          </div>
          <p className="text-slate-600 text-lg max-w-md">
            Un proceso simple, profesional y sin fricción. Vos seguís
            atendiendo a tus clientes, nosotros hacemos el resto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((s, idx) => (
            <div
              key={s.n}
              data-testid={`step-${s.n}`}
              className="relative bg-slate-50 border border-slate-200 rounded-3xl p-7 sm:p-8 hover:bg-white hover:shadow-[0_24px_60px_-25px_rgba(15,23,42,0.2)] transition-all duration-300"
              style={{ animation: `fadeUp 0.7s ${idx * 100}ms both` }}
            >
              <div className={`h-1.5 w-12 rounded-full ${s.bar} mb-6`} />
              <div className="flex items-start justify-between">
                <span
                  className={`font-heading text-5xl sm:text-6xl font-extrabold tracking-tighter ${s.accent} leading-none`}
                >
                  {s.n}
                </span>
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 ${s.accent}`}>
                  <s.icon className="w-5 h-5" strokeWidth={2} />
                </span>
              </div>
              <h3 className="font-heading mt-6 text-xl sm:text-2xl font-bold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="process-whatsapp-cta"
            className="btn-accent"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Empezar mi proyecto 360º
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-slate-500 text-sm">
            Asesoría inicial sin costo · respuesta en menos de 24 hs.
          </p>
        </div>
      </div>
    </section>
  );
}
