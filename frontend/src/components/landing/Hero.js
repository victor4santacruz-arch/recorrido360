import React from "react";
import { Star, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { CONTACT, KUULA } from "@/lib/brand";
import WhatsAppIcon from "@/components/landing/WhatsAppIcon";

export default function Hero() {
  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative pt-2 sm:pt-8 lg:pt-12 pb-20 lg:pb-28 overflow-hidden grain-bg"
    >
      {/* Decorative blurred color blobs */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute top-32 -right-24 w-[380px] h-[380px] rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="reveal">
            <h1
              data-testid="hero-title"
              className="font-heading text-[40px] leading-[1.05] sm:text-5xl lg:text-[64px] lg:leading-[1.02] font-extrabold tracking-tight text-slate-900"
            >
              Convierte visitas online en
              <span className="block">
                <span className="rainbow-underline pb-1">clientes reales.</span>
              </span>
              <span className="block text-slate-700 font-bold text-[32px] sm:text-4xl lg:text-[44px] mt-3">
                Aumenta tus ventas y reservas con Recorridos 360º.
              </span>
            </h1>

            <p
              data-testid="hero-subtitle"
              className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl"
            >
              La herramienta definitiva para{" "}
              <strong className="text-slate-900 font-semibold">Inmobiliarias, Hoteles, Clínicas y Retail</strong>.
              Muestra tu espacio 24/7, destaca en Google Maps y gana la
              confianza de tus clientes antes de que lleguen.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
              <a
                href={CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-whatsapp-cta"
                className="btn-accent"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Agendar Asesoría Gratuita
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#demo"
                data-testid="hero-demo-link"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 font-semibold text-sm sm:text-base text-blue-700 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-400 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              >
                Ver demostración interactiva
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>4.9/5 satisfacción de clientes B2B</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Certificados Google Street View</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Servicio en toda Argentina</span>
              </div>
            </div>
          </div>

          {/* Right: iframe shell */}
          <div className="reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              {/* Floating chip top */}
              <div className="absolute -top-4 left-6 z-10 bg-white border border-slate-200 shadow-md rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-700 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Demo 360º interactiva · arrastra para mirar
              </div>
              <div
                data-testid="hero-iframe-wrapper"
                className="iframe-shell aspect-[4/3] sm:aspect-[16/12] lg:aspect-[5/4] border border-slate-200"
              >
                <iframe
                  title="Demostración Recorrido 360 — Hero"
                  src={KUULA.hero}
                  height="100%"
                  allow="xr-spatial-tracking; gyroscope; accelerometer"
                  allowFullScreen
                  scrolling="no"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              {/* Floating stat chip bottom */}
              <div className="absolute -bottom-5 right-4 sm:right-6 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                <div className="text-2xl font-heading font-extrabold text-orange-400 leading-none">+31%</div>
                <div className="text-[11px] leading-tight text-slate-300 max-w-[120px]">
                  conversión vs. galerías de fotos tradicionales
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
