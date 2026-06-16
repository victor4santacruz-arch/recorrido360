import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Download,
  Search,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Hotel,
  Stethoscope,
  ShoppingBag,
  Tag,
  Inbox,
  ExternalLink,
  CheckCircle2,
  Circle,
  Archive,
  Trophy,
  XCircle,
  StickyNote,
  X,
  Save,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { api, API_BASE, TOKEN_KEY, formatApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND } from "@/lib/brand";

const INDUSTRY_META = {
  inmobiliaria: { label: "Inmobiliaria", icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  hoteles: { label: "Hoteles", icon: Hotel, color: "bg-orange-50 text-orange-700 border-orange-200" },
  clinicas: { label: "Clínicas", icon: Stethoscope, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  retail: { label: "Retail", icon: ShoppingBag, color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  otro: { label: "Otro", icon: Tag, color: "bg-slate-50 text-slate-700 border-slate-200" },
};

const STATUS_META = {
  new: { label: "Nuevo", icon: Circle, color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  contacted: { label: "Contactado", icon: CheckCircle2, color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  won: { label: "Ganado", icon: Trophy, color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  lost: { label: "Perdido", icon: XCircle, color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  archived: { label: "Archivado", icon: Archive, color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};
const STATUS_ORDER = ["new", "contacted", "won", "lost", "archived"];

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminLeads() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [exporting, setExporting] = useState(false);
  const [notesEditor, setNotesEditor] = useState(null); // { leadId, draft }
  const [savingId, setSavingId] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/leads?limit=500");
      setLeads(data);
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || "No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const onLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      const status = l.status || "new";
      if (industry !== "todas" && l.industry !== industry) return false;
      if (statusFilter !== "todos" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        (l.name || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.message || "").toLowerCase().includes(q) ||
        (l.notes || "").toLowerCase().includes(q)
      );
    });
  }, [leads, query, industry, statusFilter]);

  const industryCounts = useMemo(() => {
    const c = { total: leads.length };
    for (const k of Object.keys(INDUSTRY_META)) c[k] = 0;
    leads.forEach((l) => { if (c[l.industry] !== undefined) c[l.industry] += 1; });
    return c;
  }, [leads]);

  const statusCounts = useMemo(() => {
    const c = { todos: leads.length };
    for (const k of STATUS_ORDER) c[k] = 0;
    leads.forEach((l) => {
      const s = l.status || "new";
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [leads]);

  const onExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_BASE}/leads/export.csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recorrido360-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV descargado.");
    } catch {
      toast.error("No se pudo exportar. Probá de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const updateLead = async (leadId, patch, successMsg) => {
    setSavingId(leadId);
    try {
      const { data } = await api.patch(`/api/leads/${leadId}`, patch);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...data } : l)));
      if (successMsg) toast.success(successMsg);
      return true;
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || "No se pudo actualizar.");
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const markContacted = (lead) =>
    updateLead(lead.id, { status: "contacted" }, `Marcado como contactado: ${lead.name}`);

  const setStatus = (lead, status) =>
    updateLead(lead.id, { status }, `Estado actualizado: ${STATUS_META[status].label}`);

  const saveNotes = async () => {
    if (!notesEditor) return;
    const ok = await updateLead(notesEditor.leadId, { notes: notesEditor.draft }, "Notas guardadas.");
    if (ok) setNotesEditor(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Toaster position="top-center" richColors closeButton />

      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-brand-link">
            <img src={BRAND.logoIcon} alt="" className="h-9 w-9 object-contain" />
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-slate-900 text-base">
                recorrido<span className="text-blue-600">360</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                Panel admin
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span
              data-testid="admin-current-user"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-slate-700"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              data-testid="admin-logout-button"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Leads capturados
            </h1>
            <p className="text-slate-600 mt-1">
              {industryCounts.total} contacto{industryCounts.total === 1 ? "" : "s"} en total · {statusCounts.new || 0} sin contactar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchLeads}
              data-testid="admin-refresh-button"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refrescar
            </button>
            <button
              onClick={onExport}
              disabled={exporting || industryCounts.total === 0}
              data-testid="admin-export-button"
              className="btn-primary !py-2.5 !px-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Status pipeline (CRM) */}
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Pipeline</div>
          <div className="flex flex-wrap gap-2">
            <StatusPill
              label="Todos"
              count={statusCounts.todos}
              active={statusFilter === "todos"}
              onClick={() => setStatusFilter("todos")}
              testid="admin-status-filter-todos"
              dot="bg-slate-900"
            />
            {STATUS_ORDER.map((key) => (
              <StatusPill
                key={key}
                label={STATUS_META[key].label}
                count={statusCounts[key] || 0}
                active={statusFilter === key}
                onClick={() => setStatusFilter(key)}
                testid={`admin-status-filter-${key}`}
                dot={STATUS_META[key].dot}
              />
            ))}
          </div>
        </div>

        {/* Industry stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total"
            value={industryCounts.total}
            icon={Inbox}
            active={industry === "todas"}
            onClick={() => setIndustry("todas")}
            testid="admin-filter-todas"
          />
          {Object.entries(INDUSTRY_META).map(([key, meta]) => (
            <StatCard
              key={key}
              label={meta.label}
              value={industryCounts[key] || 0}
              icon={meta.icon}
              active={industry === key}
              onClick={() => setIndustry(key)}
              testid={`admin-filter-${key}`}
            />
          ))}
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="admin-search-input"
              placeholder="Buscar por nombre, email, teléfono, mensaje o notas…"
              className="w-full bg-transparent pl-11 pr-4 py-3.5 text-slate-900 text-[15px] outline-none rounded-2xl"
            />
          </div>
        </div>

        {/* Table */}
        <div
          data-testid="admin-leads-table"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mb-3" />
              Cargando leads…
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState total={industryCounts.total} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold">Fecha</th>
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold">Contacto</th>
                    <th className="px-5 py-3 font-semibold">Industria</th>
                    <th className="px-5 py-3 font-semibold">Mensaje</th>
                    <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((lead) => {
                    const meta = INDUSTRY_META[lead.industry] || INDUSTRY_META.otro;
                    const Icon = meta.icon;
                    const status = lead.status || "new";
                    const smeta = STATUS_META[status] || STATUS_META.new;
                    const StatusIcon = smeta.icon;
                    const isSaving = savingId === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        data-testid={`admin-lead-row-${lead.id}`}
                        className="hover:bg-slate-50/70 align-top"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusSelector
                            value={status}
                            onChange={(v) => setStatus(lead, v)}
                            disabled={isSaving}
                            testid={`admin-status-select-${lead.id}`}
                          />
                          {lead.contacted_at && (
                            <div className="text-[11px] text-slate-400 mt-1.5">
                              Contactado {formatDate(lead.contacted_at)}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {lead.name}
                        </td>
                        <td className="px-5 py-4 text-slate-700 min-w-[220px]">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-blue-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {lead.email}
                          </a>
                          <a
                            href={`https://wa.me/${(lead.phone || "").replace(/[^0-9]/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-emerald-600 mt-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {lead.phone}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${meta.color}`}>
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700 max-w-md">
                          {lead.message ? (
                            <span className="line-clamp-2 whitespace-pre-wrap">{lead.message}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {lead.notes && (
                            <div className="mt-2 text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 line-clamp-2 whitespace-pre-wrap">
                              <span className="font-semibold text-amber-700">Notas:</span> {lead.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {status === "new" && (
                              <button
                                onClick={() => markContacted(lead)}
                                disabled={isSaving}
                                data-testid={`admin-mark-contacted-${lead.id}`}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                              >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Marcar contactado
                              </button>
                            )}
                            <button
                              onClick={() => setNotesEditor({ leadId: lead.id, draft: lead.notes || "" })}
                              data-testid={`admin-edit-notes-${lead.id}`}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              <StickyNote className="w-3 h-3" />
                              Notas
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Mostrando {filtered.length} de {industryCounts.total} leads.
        </p>
      </main>

      {notesEditor && (
        <NotesModal
          draft={notesEditor.draft}
          onChange={(v) => setNotesEditor((n) => ({ ...n, draft: v }))}
          onClose={() => setNotesEditor(null)}
          onSave={saveNotes}
          saving={savingId === notesEditor.leadId}
        />
      )}
    </div>
  );
}

function StatusSelector({ value, onChange, disabled, testid }) {
  const meta = STATUS_META[value] || STATUS_META.new;
  const Icon = meta.icon;
  return (
    <div className="relative inline-flex">
      <Icon className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
        value === "new" ? "text-amber-600" :
        value === "contacted" ? "text-blue-600" :
        value === "won" ? "text-emerald-600" :
        value === "lost" ? "text-rose-600" : "text-slate-500"
      }`} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={testid}
        className={`appearance-none pl-8 pr-7 py-1.5 rounded-full text-xs font-semibold border ${meta.color} cursor-pointer disabled:opacity-60`}
      >
        {STATUS_ORDER.map((key) => (
          <option key={key} value={key}>{STATUS_META[key].label}</option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({ label, count, active, onClick, testid, dot }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
      <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{count}</span>
    </button>
  );
}

function StatCard({ label, value, icon: Icon, active, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`text-left rounded-2xl border p-4 transition-all ${
        active
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="font-heading text-2xl font-extrabold text-slate-900">{value}</div>
    </button>
  );
}

function EmptyState({ total }) {
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="font-heading text-xl font-bold text-slate-900 mb-1">
        {total === 0 ? "Todavía no hay leads" : "No hay coincidencias"}
      </h3>
      <p className="text-slate-500 text-sm max-w-sm">
        {total === 0
          ? "Cuando alguien complete el formulario de la landing aparecerá acá."
          : "Probá con otra búsqueda o cambiá los filtros."}
      </p>
    </div>
  );
}

function NotesModal({ draft, onChange, onClose, onSave, saving }) {
  return (
    <div
      data-testid="admin-notes-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-heading font-bold">
            <StickyNote className="w-4 h-4 text-amber-600" />
            Notas del seguimiento
          </div>
          <button
            onClick={onClose}
            data-testid="admin-notes-close"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            data-testid="admin-notes-textarea"
            rows={7}
            placeholder="Detalles de la conversación, próximo paso, fecha pactada, etc."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-[14px] outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            data-testid="admin-notes-save"
            className="btn-primary !py-2 !px-4 text-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar notas
          </button>
        </div>
      </div>
    </div>
  );
}
