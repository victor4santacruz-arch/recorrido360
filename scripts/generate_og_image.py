"""One-shot script: generate the Open Graph card (1200x630) for Recorrido 360
using Gemini Nano Banana via emergentintegrations.
Run once with:  python /app/scripts/generate_og_image.py
"""
import asyncio
import base64
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUTPUT_PATH = Path("/app/frontend/public/og-image.png")

PROMPT = (
    "Create a wide 1200x630 Open Graph social-share card for a Latin American "
    "B2B brand called 'Recorrido 360' (virtual 360º tours for real estate, "
    "hotels, clinics and retail). "
    "Composition: cinematic horizontal banner, left half shows large bold "
    "white headline text 'Tours virtuales 360º que venden más' in a modern "
    "sans-serif (Outfit-style) font, a small subline 'recorrido360.net' below, "
    "and a vibrant orange (#F97316) pill-shaped accent. Right half: a stylish "
    "spherical 360-degree panoramic preview of a modern luxury interior "
    "(living room / hotel lobby hybrid) curving like a small planet, soft "
    "depth, subtle glow. Background: deep navy / slate gradient (#0F172A to "
    "#1E293B) with faint dotted grid texture. Premium, editorial, high "
    "contrast, no extra logos, no emojis, no watermark, no busy text. "
    "Output the image only."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY missing in /app/backend/.env")
        return 1

    chat = (
        LlmChat(
            api_key=api_key,
            session_id="recorrido360-og-card",
            system_message="You are a top-tier visual designer producing pixel-perfect social cards.",
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text snippet: {(text or '')[:120]}")
    if not images:
        print("ERROR: no images returned")
        return 2

    img = images[0]
    image_bytes = base64.b64decode(img["data"])
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_bytes(image_bytes)
    print(f"Saved OG image -> {OUTPUT_PATH} ({len(image_bytes)} bytes, {img.get('mime_type')})")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
