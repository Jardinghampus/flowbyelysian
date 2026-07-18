/**
 * Run all market phases sequentially: listings → enrich → transactions.
 * Run: pnpm --dir workers/zaylo-import-worker run:all-phases
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const workerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function run(cmd: string, args: string[], env: Record<string, string> = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: workerRoot,
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env },
    })
    child.on("error", reject)
    child.on("close", (code) => resolve(code ?? 1))
  })
}

async function main() {
  console.log("=== Full market phases started ===")

  const steps: Array<{ label: string; args: string[]; env?: Record<string, string> }> = [
    {
      label: "import-market (all CSV areas, rent + sale)",
      args: ["src/index.ts", "--job", "import-market"],
      env: {
        FULL_MARKET_SCRAPE: "true",
        USE_CSV_SOURCES: "true",
        PREFER_CURATED_URLS: "true",
        SKIP_DETAIL_ENRICH: "true",
      },
    },
    {
      label: "enrich-listings (permits + agencies)",
      args: ["src/index.ts", "--job", "enrich-listings"],
      env: { ENRICH_LIMIT: "500" },
    },
    {
      label: "import-transactions (sale)",
      args: ["src/index.ts", "--job", "import-transactions"],
      env: { TX_KIND: "sale" },
    },
    {
      label: "import-transactions (rent)",
      args: ["src/index.ts", "--job", "import-transactions"],
      env: { TX_KIND: "rent" },
    },
  ]

  for (const step of steps) {
    console.log(`\n--- ${step.label} ---`)
    const code = await run("tsx", step.args, step.env)
    if (code !== 0) {
      console.error(`Step failed (${step.label}) exit=${code}`)
      process.exitCode = code
      return
    }
  }

  console.log("\n=== All phases complete ===")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
