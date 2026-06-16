import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { CONTACT } from "@/lib/brand";
import WhatsAppIcon from "@/components/landing/WhatsAppIcon";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const INDUSTRY_OPTIONS = [
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "hoteles", label: "Hoteles y Eventos" },
  { value: "clinicas", label: "Clínicas y Salud" },
  { value: "retail", label: "Comercios (Retail)" },
  { value: "otro", label: "Otro" },
];

const initialState = {
  name: "",
  email: "",
  phone: "",
  industry: "",
  message: "",
};

export default function LeadForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Ingresá tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email inválido.";
    if (form.phone.trim().length < 6)
      e.phone = "Teléfono inválido (incluí código de país).";
    if (!form.industry) e.industry = "Elegí tu industria.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Revisá los campos marcados.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/leads`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        industry: form.industry,
        message: form.message.trim(),
      });
      toast.success("¡Gracias! Te contactamos a la brevedad.");
      setSuccess(true);
      setForm(initialState);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "No pudimos enviar tu mensaje. Probá de nuevo en unos minutos.";
      toast.error(typeof msg === "string" ? msg : "Error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contacto"
      data-testid="lead-form-section"
      className="relative py-20 sm:py-24 lg:py-32 bg-white overflow-hidden"
    >
      <Toaster position="top-center" richColors closeButton />

      {/* Decorative shapes */}
      <div className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-72 h-72 rounded-full bg-orange-100/60 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
          {/* Left: copy */}
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Contacto directo
            </span>
            <h2 className="font-heading mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Dejanos tus datos y armamos
              <span className="block text-orange-500">tu propuesta 360º.</span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Respondemos en menos de 24 hs hábiles. También podés escribirnos
              directamente por WhatsApp si preferís una charla rápida.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 text-slate-700">
                <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-semibold text-slate-900">Sin compromiso</div>
                  <div className="text-sm text-slate-600">
                    La primera asesoría es gratuita y no implica contratación.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="lead-form-whatsapp-shortcut"
                  className="btn-primary !py-3 !px-5"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Prefiero WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)]">
            {success ? (
              <SuccessPanel onReset={() => setSuccess(false)} />
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                data-testid="lead-form"
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    id="lead-name"
                    label="Nombre completo"
                    placeholder="Ej. Victor Pérez"
                    value={form.name}
                    onChange={update("name")}
                    error={errors.name}
                    testid="lead-input-name"
                    autoComplete="name"
                  />
                  <Field
                    id="lead-email"
                    type="email"
                    label="Email corporativo"
                    placeholder="vos@empresa.com"
                    value={form.email}
                    onChange={update("email")}
                    error={errors.email}
                    testid="lead-input-email"
                    autoComplete="email"
                  />
                  <Field
                    id="lead-phone"
                    label="WhatsApp / Teléfono"
                    placeholder="+54 9 351 ..."
                    value={form.phone}
                    onChange={update("phone")}
                    error={errors.phone}
                    testid="lead-input-phone"
                    autoComplete="tel"
                  />
                  <div>
                    <label
                      htmlFor="lead-industry"
                      className="block text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Industria
                    </label>
                    <select
                      id="lead-industry"
                      data-testid="lead-input-industry"
                      value={form.industry}
                      onChange={update("industry")}
                      className={`w-full rounded-xl bg-white border px-4 py-3 text-slate-900 text-[15px] outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                        errors.industry ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="">Elegí una opción…</option>
                      {INDUSTRY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <p
                        data-testid="lead-error-industry"
                        className="mt-1.5 text-xs text-red-600"
                      >
                        {errors.industry}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lead-message"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    Contanos brevemente tu proyecto{" "}
                    <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    id="lead-message"
                    rows={4}
                    data-testid="lead-input-message"
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Tipo de espacio, ubicación, plazos, etc."
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-slate-900 text-[15px] outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="lead-submit-button"
                    className="btn-accent !py-3.5 !px-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar y agendar asesoría
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 sm:max-w-[240px]">
                    Tus datos son confidenciales y sólo se usan para contactarte.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ id, label, type = "text", value, onChange, placeholder, error, testid, autoComplete }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-testid={testid}
        className={`w-full rounded-xl bg-white border px-4 py-3 text-slate-900 text-[15px] outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />
      {error && (
        <p
          data-testid={`${testid}-error`}
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessPanel({ onReset }) {
  return (
    <div
      data-testid="lead-form-success"
      className="text-center py-10 px-4"
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
        ¡Recibido! Gracias por contactarnos.
      </h3>
      <p className="mt-3 text-slate-600 max-w-md mx-auto">
        Un especialista de Recorrido 360 te contactará en menos de 24 hs hábiles
        para coordinar tu asesoría.
      </p>
      <button
        onClick={onReset}
        data-testid="lead-form-reset"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 border border-slate-200 text-slate-800 hover:bg-slate-100 transition text-sm font-medium"
      >
        Enviar otro mensaje
      </button>
    </div>
  );
}
