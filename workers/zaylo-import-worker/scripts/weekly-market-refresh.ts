/**
 * Weekly Bayut market refresh — listings, permits/agencies, transactions.
 * Run: pnpm --dir workers/zaylo-import-worker weekly:refresh
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
  console.log("=== Weekly market refresh started ===")

  const steps: Array<{ label: string; args: string[]; env?: Record<string, string> }> = [
    { label: "import-market (all areas)", args: ["src/index.ts", "--job", "import-market"], env: { FULL_MARKET_SCRAPE: "true", PREFER_CURATED_URLS: "true", SKIP_DETAIL_ENRICH: "true" } },
    { label: "enrich-listings (permits + agencies)", args: ["src/index.ts", "--job", "enrich-listings"], env: { ENRICH_LIMIT: "300" } },
    { label: "import-transactions (sale)", args: ["src/index.ts", "--job", "import-transactions"], env: { TX_KIND: "sale" } },
    { label: "import-transactions (rent)", args: ["src/index.ts", "--job", "import-transactions"], env: { TX_KIND: "rent" } },
  ]

  for (const step of steps) {
    console.log(`\n--- ${step.label} ---`)
    const code = await run("tsx", step.args, step.env)
    if (code !== 0) {
      console.error(`Step failed (${step.label}) with exit code ${code}`)
      process.exitCode = code
      return
    }
  }

  console.log("\n=== Weekly market refresh complete ===")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
