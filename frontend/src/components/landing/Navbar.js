import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND, CONTACT, NAV_LINKS } from "@/lib/brand";
import WhatsAppIcon from "@/components/landing/WhatsAppIcon";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-navbar"
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_30px_-15px_rgba(15,23,42,0.15)]"
          : "bg-white/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a
            href="#top"
            data-testid="nav-logo"
            className="flex items-center gap-3 group"
            aria-label="Recorrido 360 — Inicio"
          >
            <img
              src={BRAND.logoIcon}
              alt="Recorrido 360"
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
              loading="eager"
            />
            <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
              recorrido<span className="text-blue-600">360</span>
            </span>
          </a>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className="text-[15px] font-medium text-slate-700 hover:text-blue-600 transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-whatsapp-cta"
              className="btn-primary text-[14px] sm:text-[15px] !py-2.5 !px-4 sm:!px-5"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Hablemos por WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              data-testid="nav-mobile-toggle"
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50 transition"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            data-testid="nav-mobile-menu"
            className="lg:hidden pb-5 pt-2 flex flex-col gap-1 border-t border-slate-100"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                className="px-3 py-3 rounded-xl text-slate-800 font-medium hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
