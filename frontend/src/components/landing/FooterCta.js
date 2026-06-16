import React from "react";
import { Mail, MapPin, ArrowRight } from "lucide-react";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/brand";
import WhatsAppIcon from "@/components/landing/WhatsAppIcon";

export default function FooterCta() {
  return (
    <footer
      data-testid="footer-section"
      className="relative bg-slate-950 text-white overflow-hidden"
    >
      {/* Glow accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Big CTA */}
        <div className="pt-20 sm:pt-24 lg:pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-12 items-center">
            <div>
              <h2
                data-testid="footer-cta-title"
                className="font-heading text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight leading-[1.15] pb-2"
              >
                ¿Listo para modernizar
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 leading-[1.18] pb-2">
                  la imagen de tu negocio?
                </span>
              </h2>
              <p className="mt-5 text-lg text-slate-300 max-w-xl">
                Agendá una asesoría gratuita por WhatsApp. En 15 minutos te
                contamos cómo un Recorrido 360º puede transformar tus métricas.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-whatsapp-cta"
                  className="btn-accent !text-base sm:!text-lg !py-4 !px-7"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Hablemos por WhatsApp
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  data-testid="footer-email-cta"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 border border-white/20 text-white hover:bg-white/10 transition"
                >
                  <Mail className="w-4 h-4" />
                  Escribirnos un email
                </a>
              </div>
            </div>

            {/* Contact card */}
            <div className="lg:justify-self-end w-full lg:max-w-md">
              <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-7 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={BRAND.logoIcon}
                    alt="Recorrido 360"
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <div className="font-heading font-extrabold text-lg">
                      recorrido<span className="text-blue-400">360</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Recorridos virtuales que venden
                    </div>
                  </div>
                </div>

                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <WhatsAppIcon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wider">WhatsApp</div>
                      <a
                        href={CONTACT.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="footer-contact-whatsapp"
                        className="text-white font-medium hover:text-emerald-300"
                      >
                        {CONTACT.whatsappNumber}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300">
                      <Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wider">Email</div>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        data-testid="footer-contact-email"
                        className="text-white font-medium hover:text-blue-300"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/20 text-orange-300">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-slate-400 text-xs uppercase tracking-wider">Estudio</div>
                      <div
                        data-testid="footer-contact-address"
                        className="text-white font-medium"
                      >
                        {CONTACT.address}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider + bottom links */}
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src={BRAND.logoIcon}
              alt=""
              className="h-7 w-7 object-contain"
            />
            <span>
              © {new Date().getFullYear()} {BRAND.name}. Hecho por Auto-on Solutions Argentina.
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-testid={`footer-nav-${l.label.toLowerCase()}`}
                className="hover:text-white transition"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
