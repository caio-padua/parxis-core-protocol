#!/usr/bin/env python3
"""
Regressão visual (variante Python) — mesma checagem do script Node equivalente.

Garante que os painéis sobre o fundo fixo do notebook "PADCON" nunca
voltem a aplicar `backdrop-filter` ou `filter: blur(...)` em nenhum
breakpoint ou posição de scroll.

Uso:
    bun run dev          # em outro terminal
    python3 tests/visual-regression-padcon.py

Requer o pacote `playwright` do Python (já disponível no sandbox Lovable).
Sai com código != 0 quando encontra qualquer painel com blur.
"""

import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

BASE_URL = os.environ.get("PARXIS_URL", "http://localhost:8080")

VIEWPORTS = [
    ("mobile-sm", 360, 780),
    ("mobile", 375, 812),
    ("mobile-lg", 430, 900),
    ("tablet", 768, 1024),
    ("tablet-lg", 1024, 1366),
    ("desktop", 1440, 900),
    ("desktop-xl", 1920, 1080),
]

SELECTORS = [
    ".parxis-glass",
    ".parxis-glass-frame",
    ".parxis-card",
    ".parxis-fixed-bg",
    ".parxis-fixed-veil",
]

AUDIT_JS = """
(selectors) => {
  const bad = [];
  document.querySelectorAll(selectors.join(',')).forEach((el) => {
    const cs = getComputedStyle(el);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || '';
    const filter = cs.filter || '';
    const backdropBlur = bf !== '' && bf !== 'none';
    const filterBlur = /blur\\(/.test(filter);
    if (backdropBlur || filterBlur) {
      bad.push({
        cls: (el.className || '').toString().slice(0, 100),
        backdropFilter: bf,
        filter,
      });
    }
  });
  return bad;
}
"""


async def audit_viewport(browser, name, width, height):
    ctx = await browser.new_context(viewport={"width": width, "height": height})
    page = await ctx.new_page()
    await page.goto(BASE_URL, wait_until="networkidle")
    doc_h = await page.evaluate("document.body.scrollHeight")
    offenders = []
    for ratio in (0, 0.25, 0.5, 0.75, 0.95):
        y = int(doc_h * ratio)
        await page.evaluate(f"window.scrollTo(0,{y})")
        await page.wait_for_timeout(200)
        found = await page.evaluate(AUDIT_JS, SELECTORS)
        if found:
            offenders.append({"y": y, "found": found})
    await ctx.close()
    return offenders


async def main():
    failed = False
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for name, w, h in VIEWPORTS:
            offenders = await audit_viewport(browser, name, w, h)
            if not offenders:
                print(f"ok  [{name} {w}x{h}]")
            else:
                failed = True
                print(f"FAIL [{name} {w}x{h}] — blur detectado:")
                print(json.dumps(offenders, indent=2, ensure_ascii=False))
        await browser.close()
    if failed:
        print(
            "\nRegressão detectada: painéis não podem ter backdrop-filter nem filter: blur().",
            file=sys.stderr,
        )
        sys.exit(1)
    print("\nTodos os breakpoints passaram — fundo PADCON permanece nítido.")


asyncio.run(main())