# Recorrido 360 — PRD

## Original Problem
Cliente reporta: el formulario de leads guarda correctamente los registros en el panel admin pero no llega ninguna notificación por email. Quiere recibir avisos en `vic_enne@yahoo.com`.

## Stack
- Backend: FastAPI + Motor (MongoDB) + JWT auth
- Frontend: React 19 (CRA + craco), Tailwind, Radix UI
- Email: Resend (resend python SDK)

## Architecture
- Public endpoint `POST /api/leads` recibe el formulario y persiste el lead.
- Tras insertar el lead se dispara `BackgroundTasks` con `send_lead_notification(doc)` que invoca Resend (`resend.Emails.send`) en `asyncio.to_thread` para no bloquear el response.
- Admin endpoints (`GET/PATCH /api/leads`, export CSV) protegidos por JWT.

## What's Implemented (Jan 2026)
- Sincronizado el código del zip `recorrido360-main` en `/app` (server.py, email_service.py, frontend completo).
- Instalado `resend>=2.0.0`.
- Configurado `/app/backend/.env` con:
  - `RESEND_API_KEY` (clave provista por el cliente)
  - `SENDER_EMAIL=hola@recorrido360.net`
  - `LEAD_NOTIFICATION_TO=vic_enne@yahoo.com`
  - `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Backend y frontend reiniciados y respondiendo correctamente.
- Verificación end-to-end: dos POST a `/api/leads` → ambos guardados y emails entregados a Resend (ids confirmados en logs).

## Personas
- Victor (Owner / Admin): recibe notificaciones de nuevos leads y gestiona el pipeline desde `/admin/leads`.
- Prospecto: completa el formulario de la landing.

## Backlog / Next
- Verificar dominio `recorrido360.net` en Resend (si aún no está) para mejorar deliverability y evitar caer en spam.
- (Opcional) Notificación adicional vía WhatsApp/Telegram al recibir un lead.
- (Opcional) Resumen diario por email con los leads del día.
