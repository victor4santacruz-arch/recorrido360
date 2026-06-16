import React from "react";
import { Maximize2, MousePointer2, Smartphone } from "lucide-react";
import { KUULA } from "@/lib/brand";

export default function DemoSection() {
  return (
    <section
      id="demo"
      data-testid="demo-section"
      className="relative py-20 sm:py-24 lg:py-32 bg-slate-50 border-y border-slate-100 overflow-hidden"
    >
      {/* Decorative ring */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border-[40px] border-blue-100/60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full border-[40px] border-orange-100/60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-fuchsia-600">
            Experiencia inmersiva
          </span>
          <h2
            data-testid="demo-title"
            className="font-heading mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
          >
            Más que fotos: una experiencia inmersiva que{" "}
            <span className="text-blue-600">destaca tu negocio.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Arrastrá, hacé zoom y movete entre escenas. Así es como tus clientes
            podrán recorrer tu espacio antes de visitarlo.
          </p>
        </div>

        {/* Demo iframe full width */}
        <div className="mt-10 lg:mt-14">
          <div
            data-testid="demo-iframe-wrapper"
            className="iframe-shell border border-slate-200 h-[480px] sm:h-[560px] lg:h-[680px]"
          >
            <iframe
              title="Recorrido virtual completo — Recorrido 360"
              src={KUULA.demo}
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              scrolling="no"
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Tips */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Tip icon={MousePointer2} label="Arrastrá para mirar alrededor" />
            <Tip icon={Maximize2} label="Activá pantalla completa para inmersión total" />
            <Tip icon={Smartphone} label="Funciona perfecto en mobile y tablets" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Tip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white">
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
