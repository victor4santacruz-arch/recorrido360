"""Resend email notifications for new leads."""
import os
import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional

import resend

logger = logging.getLogger(__name__)


def _from_email() -> str:
    return os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")


def _to_email() -> str:
    return os.environ.get("LEAD_NOTIFICATION_TO", "victor@recorrido360.net")


def _api_key() -> Optional[str]:
    return os.environ.get("RESEND_API_KEY")


INDUSTRY_LABELS = {
    "inmobiliaria": "Inmobiliaria",
    "hoteles": "Hoteles y Eventos",
    "clinicas": "Clínicas y Salud",
    "retail": "Comercios (Retail)",
    "otro": "Otro",
}


def _format_dt(dt: datetime) -> str:
    try:
        return dt.astimezone(timezone.utc).strftime("%d/%m/%Y · %H:%M UTC")
    except Exception:
        return str(dt)


def build_lead_email_html(lead: dict) -> str:
    """Branded HTML email body for a new lead. Inline styles only (email-safe)."""
    industry_label = INDUSTRY_LABELS.get(lead.get("industry", ""), lead.get("industry", ""))
    message = (lead.get("message") or "").strip() or "(sin mensaje adicional)"
    created_at = lead.get("created_at")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except Exception:
            created_at = datetime.now(timezone.utc)
    elif not isinstance(created_at, datetime):
        created_at = datetime.now(timezone.utc)

    phone_digits = "".join(ch for ch in lead.get("phone", "") if ch.isdigit())
    wa_link = f"https://wa.me/{phone_digits}" if phone_digits else ""

    return f"""\
<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="background:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px -20px rgba(15,23,42,0.25);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%);padding:28px 32px;color:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">Recorrido 360 · Notificación</div>
              <div style="font-size:24px;font-weight:800;margin-top:6px;">Nuevo lead capturado</div>
              <div style="font-size:13px;opacity:0.85;margin-top:6px;">{_format_dt(created_at)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <div style="font-size:18px;font-weight:700;color:#0f172a;">{lead.get('name','—')}</div>
              <div style="display:inline-block;margin-top:8px;padding:4px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;">{industry_label}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;border-top:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:14px 0;font-size:13px;color:#64748b;width:120px;">Email</td>
                  <td style="padding:14px 0;font-size:14px;color:#0f172a;font-weight:600;">
                    <a href="mailto:{lead.get('email','')}" style="color:#2563eb;text-decoration:none;">{lead.get('email','—')}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Teléfono</td>
                  <td style="padding:14px 0;font-size:14px;color:#0f172a;font-weight:600;border-top:1px solid #e2e8f0;">
                    {lead.get('phone','—')}
                    {f' &nbsp;·&nbsp; <a href="{wa_link}" style="color:#16a34a;text-decoration:none;font-weight:600;">WhatsApp »</a>' if wa_link else ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;vertical-align:top;">Mensaje</td>
                  <td style="padding:14px 0;font-size:14px;color:#0f172a;border-top:1px solid #e2e8f0;line-height:1.55;">
                    {message}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Origen</td>
                  <td style="padding:14px 0;font-size:14px;color:#0f172a;border-top:1px solid #e2e8f0;">{lead.get('source','landing')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px 32px;">
              <a href="https://immersive-sales-hub.preview.emergentagent.com/admin/leads"
                 style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;font-size:14px;">
                Ver en el panel admin
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;color:#94a3b8;padding:18px 32px;font-size:12px;">
              Recibís este email porque sos el contacto del formulario público de
              <strong style="color:#ffffff;">Recorrido 360</strong>.
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:#94a3b8;margin-top:14px;">© Recorrido 360 · Auto-on Solutions Argentina</div>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def send_lead_notification(lead: dict) -> None:
    """Send a Resend email notifying that a new lead was captured.
    
    Safe to call from FastAPI BackgroundTasks: never raises, only logs.
    """
    api_key = _api_key()
    if not api_key:
        logger.warning("RESEND_API_KEY no configurada — se omite el envío de email.")
        return

    resend.api_key = api_key
    subject = f"Nuevo lead 360 — {lead.get('name','sin nombre')} ({INDUSTRY_LABELS.get(lead.get('industry',''), lead.get('industry',''))})"
    params = {
        "from": f"Recorrido 360 <{_from_email()}>",
        "to": [_to_email()],
        "reply_to": lead.get("email") or None,
        "subject": subject,
        "html": build_lead_email_html(lead),
    }
    # Drop None values (reply_to optional)
    params = {k: v for k, v in params.items() if v is not None}

    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info("Email Resend enviado a %s (id=%s)", _to_email(), email_id)
    except Exception as exc:
        # Never break the lead creation — just log.
        logger.exception("Fallo al enviar email Resend: %s", exc)
