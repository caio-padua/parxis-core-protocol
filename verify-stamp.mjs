import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const out = "/tmp/parxis-edit/screenshots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await context.newPage();

// Homepage
await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/home-desktop.png`, fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/home-mobile.png`, fullPage: false });

// Login page
await page.setViewportSize({ width: 1280, height: 1800 });
await page.goto("http://localhost:8080/login", { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/login-desktop.png`, fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:8080/login", { waitUntil: "networkidle" });
await page.screenshot({ path: `${out}/login-mobile.png`, fullPage: false });

await browser.close();
console.log("Screenshots saved to", out);
