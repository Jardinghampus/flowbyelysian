import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const defaultZayloRoot = "C:\\Users\\jardi\\OneDrive\\Documents\\Zaylo-socials"
const defaultPdfImportDir = "C:\\Users\\jardi\\OneDrive\\Documents\\New project\\pdf-import"

export const zayloRoot = process.env.ZAYLO_SOCIALS_DIR || defaultZayloRoot
export const zayloPdfImportDir = process.env.ZAYLO_PDF_IMPORT_DIR || defaultPdfImportDir

const runLogDir = path.join(process.cwd(), ".zaylo-runs")

type Area = {
  id: string
  community: string
  subArea: string
  city: string
  focus?: string[]
  weeklySlot?: string
}

type SourceLink = {
  id: string
  areaId: string
  kind: string
  label: string
  url: string
  active: boolean
  notes?: string
}

type Listing = {
  community?: string
  listing_number?: string
  permit_number?: string
  title?: string
  price?: number
  status?: string
  import_id?: string
  listing_url?: string
  last_seen?: string
}

type Snapshot = {
  id: string
  areaId: string
  generatedAt: string
  headline?: string
  transactionCount?: number
  confidence?: string
  dataMode?: string
  rentalMedian3Br?: number | null
  rentalMedian4Br?: number | null
  saleMedian3Br?: number | null
  saleMedian4Br?: number | null
  notes?: string[]
}

type ContentPost = {
  id: string
  areaId: string
  channel: string
  status: string
  title: string
  createdAt: string
  approvedAt?: string
}

type RunRecord = {
  id: string
  job: ZayloJob
  command: string
  startedAt: string
  status: "running" | "started"
  logPath: string
}

export type ZayloJob = "scrape-listings" | "generate-week" | "build-zaylo" | "import-pdfs"

type ZayloState = {
  root: string
  pdfImportDir: string
  connected: boolean
  generatedAt: string
  counts: {
    areas: number
    sourceLinks: number
    configuredSourceLinks: number
    listings: number
    activeListings: number
    newListings: number
    pdfFiles: number
    snapshots: number
    draftPosts: number
    approvedPosts: number
    reports: number
  }
  areas: Area[]
  sourceLinks: SourceLink[]
  latestSnapshots: Snapshot[]
  recentPosts: ContentPost[]
  recentReports: { file: string; modifiedAt: string }[]
  recentPdfFiles: { file: string; modifiedAt: string }[]
  warnings: string[]
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T
  } catch {
    return fallback
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function listFiles(dirPath: string, extension?: string) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .filter((entry) => !extension || entry.name.toLowerCase().endsWith(extension))
        .map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name)
          const info = await stat(fullPath)
          return { file: entry.name, modifiedAt: info.mtime.toISOString() }
        })
    )

    return files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  } catch {
    return []
  }
}

function latestByArea(snapshots: Snapshot[]): Snapshot[] {
  const byArea = new Map<string, Snapshot>()

  for (const snapshot of snapshots) {
    const current = byArea.get(snapshot.areaId)
    if (!current || snapshot.generatedAt > current.generatedAt) {
      byArea.set(snapshot.areaId, snapshot)
    }
  }

  return Array.from(byArea.values()).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
}

export async function getZayloState(): Promise<ZayloState> {
  const connected = await fileExists(path.join(zayloRoot, "package.json"))
  const warnings: string[] = []

  if (!connected) {
    warnings.push(`Legacy local Zaylo workspace is not connected: ${zayloRoot}. CRM-native Market Studio remains available.`)
  }

  const areas = await readJson<Area[]>(path.join(zayloRoot, "data", "sources", "areas.json"), [])
  const sourceLinks = await readJson<SourceLink[]>(path.join(zayloRoot, "data", "sources", "source-links.json"), [])
  const snapshots = await readJson<Snapshot[]>(path.join(zayloRoot, "data", "snapshots", "market-snapshots.json"), [])
  const posts = await readJson<ContentPost[]>(path.join(zayloRoot, "data", "queue", "content-posts.json"), [])
  const listingStore = await readJson<{ listings?: Listing[] }>(path.join(zayloRoot, "data", "listings.json"), { listings: [] })
  const listings = listingStore.listings ?? []
  const pdfFiles = await listFiles(zayloPdfImportDir, ".pdf")
  const reports = await listFiles(path.join(zayloRoot, "data", "reports"), ".md")

  const configuredSourceLinks = sourceLinks.filter((link) => link.active && link.url.trim()).length
  if (sourceLinks.length > 0 && configuredSourceLinks === 0) {
    warnings.push("No Bayut Transactions or DXB Interact source links are configured yet.")
  }

  const demoSnapshots = snapshots.filter((snapshot) => snapshot.dataMode === "demo" || snapshot.notes?.some((note) => /sample/i.test(note)))
  if (demoSnapshots.length > 0) {
    warnings.push("Some market snapshots are demo/sample data. Treat them as planning only.")
  }

  return {
    root: zayloRoot,
    pdfImportDir: zayloPdfImportDir,
    connected,
    generatedAt: new Date().toISOString(),
    counts: {
      areas: areas.length,
      sourceLinks: sourceLinks.length,
      configuredSourceLinks,
      listings: listings.length,
      activeListings: listings.filter((listing) => listing.status === "active").length,
      newListings: listings.filter((listing) => listing.status === "new").length,
      pdfFiles: pdfFiles.length,
      snapshots: snapshots.length,
      draftPosts: posts.filter((post) => post.status === "draft").length,
      approvedPosts: posts.filter((post) => post.status === "approved").length,
      reports: reports.length,
    },
    areas,
    sourceLinks,
    latestSnapshots: latestByArea(snapshots).slice(0, 8),
    recentPosts: posts
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8),
    recentReports: reports.slice(0, 8),
    recentPdfFiles: pdfFiles.slice(0, 8),
    warnings,
  }
}

function commandForJob(job: ZayloJob): { command: string; args: string[]; cwd: string } {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"

  switch (job) {
    case "scrape-listings":
      return { command: npmCommand, args: ["run", "scrape"], cwd: zayloRoot }
    case "generate-week":
      return { command: npmCommand, args: ["run", "content:week"], cwd: zayloRoot }
    case "build-zaylo":
      return { command: npmCommand, args: ["run", "build"], cwd: zayloRoot }
    case "import-pdfs":
      return {
        command: npmCommand,
        args: ["run", "pdf:import"],
        cwd: "C:\\Users\\jardi\\OneDrive\\Documents\\New project",
      }
  }
}

export async function startZayloJob(job: ZayloJob): Promise<RunRecord> {
  const selected = commandForJob(job)
  await mkdir(runLogDir, { recursive: true })

  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`
  const logPath = path.join(runLogDir, `${id}.log`)
  const startedAt = new Date().toISOString()
  const commandLine = `${selected.command} ${selected.args.join(" ")}`
  const header = [`job=${job}`, `cwd=${selected.cwd}`, `command=${commandLine}`, `startedAt=${startedAt}`, ""].join("\n")
  await writeFile(logPath, header, "utf8")

  const child = spawn(selected.command, selected.args, {
    cwd: selected.cwd,
    detached: true,
    windowsHide: false,
    stdio: ["ignore", "pipe", "pipe"],
  })

  child.stdout?.on("data", async (chunk: Buffer) => {
    await writeFile(logPath, chunk, { flag: "a" }).catch(() => undefined)
  })
  child.stderr?.on("data", async (chunk: Buffer) => {
    await writeFile(logPath, chunk, { flag: "a" }).catch(() => undefined)
  })
  child.on("close", async (code) => {
    await writeFile(logPath, `\nfinishedAt=${new Date().toISOString()}\nexitCode=${code}\n`, { flag: "a" }).catch(() => undefined)
  })
  child.unref()

  return {
    id,
    job,
    command: commandLine,
    startedAt,
    status: "started",
    logPath,
  }
}
