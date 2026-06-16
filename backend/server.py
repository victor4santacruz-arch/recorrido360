from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import csv
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator

from email_service import send_lead_notification


# ──────────────────────────────────────────────────────────────────────────────
# MongoDB
# ──────────────────────────────────────────────────────────────────────────────
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# ──────────────────────────────────────────────────────────────────────────────
# App + Router
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI()
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Auth helpers
# ──────────────────────────────────────────────────────────────────────────────
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_DAYS = 7

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRY_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="No autenticado")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ──────────────────────────────────────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────────────────────────────────────
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


ALLOWED_INDUSTRIES = {"inmobiliaria", "hoteles", "clinicas", "retail", "otro"}
ALLOWED_STATUSES = ("new", "contacted", "won", "lost", "archived")


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=40)
    industry: str = Field(..., min_length=1, max_length=40)
    message: Optional[str] = Field(default="", max_length=2000)

    @field_validator("industry")
    @classmethod
    def validate_industry(cls, v: str) -> str:
        v_norm = v.strip().lower()
        if v_norm not in ALLOWED_INDUSTRIES:
            raise ValueError(
                f"industry must be one of: {', '.join(sorted(ALLOWED_INDUSTRIES))}"
            )
        return v_norm

    @field_validator("name", "phone")
    @classmethod
    def strip_value(cls, v: str) -> str:
        return v.strip()


class LeadUpdate(BaseModel):
    """Admin-only fields that can be updated on an existing lead."""
    status: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=4000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is None:
            return v
        v_norm = str(v).strip().lower()
        if v_norm not in ALLOWED_STATUSES:
            raise ValueError(
                f"status must be one of: {', '.join(ALLOWED_STATUSES)}"
            )
        return v_norm


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    industry: str
    message: str = ""
    source: str = "landing"
    status: str = "new"
    notes: str = ""
    contacted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class AdminUser(BaseModel):
    id: str
    email: EmailStr
    name: str = "Admin"
    role: str = "admin"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = TOKEN_EXPIRY_DAYS * 24 * 3600
    user: AdminUser


# ──────────────────────────────────────────────────────────────────────────────
# Public Routes
# ──────────────────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    docs = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for d in docs:
        if isinstance(d.get('timestamp'), str):
            d['timestamp'] = datetime.fromisoformat(d['timestamp'])
    return docs


@api_router.post("/leads", response_model=Lead, status_code=201)
async def create_lead(payload: LeadCreate, background_tasks: BackgroundTasks):
    """Public endpoint — landing page form submission. Sends a Resend email notification in the background."""
    try:
        lead = Lead(**payload.model_dump())
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.leads.insert_one(doc)
        logger.info("Nuevo lead capturado: %s (%s)", lead.email, lead.industry)
        # Fire-and-forget email notification (never blocks the response, never raises).
        background_tasks.add_task(send_lead_notification, doc)
        return lead
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error guardando lead")
        raise HTTPException(status_code=500, detail="No se pudo guardar el contacto") from exc


# ──────────────────────────────────────────────────────────────────────────────
# Protected Admin Routes
# ──────────────────────────────────────────────────────────────────────────────
@api_router.get("/leads", response_model=List[Lead])
async def list_leads(
    limit: int = 200,
    admin: dict = Depends(get_current_admin),
):
    """Admin-only: lista de leads, más recientes primero."""
    limit = max(1, min(limit, 1000))
    docs = (
        await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    )
    for d in docs:
        for k in ("created_at", "updated_at", "contacted_at"):
            v = d.get(k)
            if isinstance(v, str):
                try:
                    d[k] = datetime.fromisoformat(v)
                except ValueError:
                    pass
        # Backfill defaults for legacy rows.
        d.setdefault("status", "new")
        d.setdefault("notes", "")
    return docs


@api_router.patch("/leads/{lead_id}", response_model=Lead)
async def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    admin: dict = Depends(get_current_admin),
):
    """Admin-only: actualizar status / notas de un lead (mini CRM)."""
    update_fields: dict = {}
    if payload.status is not None:
        update_fields["status"] = payload.status
        if payload.status == "contacted":
            update_fields["contacted_at"] = datetime.now(timezone.utc).isoformat()
    if payload.notes is not None:
        update_fields["notes"] = payload.notes

    if not update_fields:
        raise HTTPException(status_code=400, detail="Nada para actualizar.")

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.leads.update_one({"id": lead_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead no encontrado.")

    doc = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    for k in ("created_at", "updated_at", "contacted_at"):
        v = doc.get(k)
        if isinstance(v, str):
            try:
                doc[k] = datetime.fromisoformat(v)
            except ValueError:
                pass
    doc.setdefault("status", "new")
    doc.setdefault("notes", "")
    return doc


@api_router.get("/leads/export.csv")
async def export_leads_csv(admin: dict = Depends(get_current_admin)):
    """Admin-only: exporta todos los leads como CSV."""
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(10_000)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "created_at", "name", "email", "phone", "industry",
        "status", "contacted_at", "notes", "message", "source", "id",
    ])
    for d in docs:
        writer.writerow([
            d.get("created_at", ""),
            d.get("name", ""),
            d.get("email", ""),
            d.get("phone", ""),
            d.get("industry", ""),
            d.get("status", "new"),
            d.get("contacted_at", "") or "",
            (d.get("notes", "") or "").replace("\n", " ").replace("\r", " "),
            (d.get("message", "") or "").replace("\n", " ").replace("\r", " "),
            d.get("source", ""),
            d.get("id", ""),
        ])
    buffer.seek(0)
    filename = f"recorrido360-leads-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ──────────────────────────────────────────────────────────────────────────────
# Auth Routes
# ──────────────────────────────────────────────────────────────────────────────
@auth_router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    token = create_access_token(user["id"], user["email"])
    return LoginResponse(
        access_token=token,
        user=AdminUser(
            id=user["id"],
            email=user["email"],
            name=user.get("name", "Admin"),
            role=user.get("role", "admin"),
        ),
    )


@auth_router.get("/me", response_model=AdminUser)
async def me(admin: dict = Depends(get_current_admin)):
    return AdminUser(
        id=admin["id"],
        email=admin["email"],
        name=admin.get("name", "Admin"),
        role=admin.get("role", "admin"),
    )


# ──────────────────────────────────────────────────────────────────────────────
# Startup: indexes + admin seed (idempotent)
# ──────────────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.leads.create_index("created_at")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin1234")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Admin password updated for: %s", admin_email)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ──────────────────────────────────────────────────────────────────────────────
# Mount routers + CORS
# ──────────────────────────────────────────────────────────────────────────────
app.include_router(api_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
