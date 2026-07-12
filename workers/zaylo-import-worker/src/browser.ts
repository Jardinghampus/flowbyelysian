import { chromium, type BrowserContext, type Page } from "playwright"
import { config } from "./config.js"

export async function createBrowserContext(): Promise<BrowserContext> {
  return chromium.launchPersistentContext(config.BROWSER_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    args: ["--start-maximized"],
  })
}

export async function openPage(context: BrowserContext): Promise<Page> {
  const existing = context.pages()[0]
  return existing ?? context.newPage()
}
