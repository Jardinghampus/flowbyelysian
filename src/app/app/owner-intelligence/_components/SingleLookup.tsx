"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { OwnerContact } from "@/types/owner-intelligence"
import { detectPortal } from "../_lib/detectPortal"
import { PortalBadge } from "./PortalBadge"
import { LookupResult } from "./LookupResult"
import { cn } from "@/lib/utils"

type PipelineStep = "idle" | "parsing" | "finding_unit" | "resolving_owner" | "complete" | "error"

const steps: { key: PipelineStep; label: string }[] = [
  { key: "parsing", label: "Parsing URL" },
  { key: "finding_unit", label: "Finding Unit" },
  { key: "resolving_owner", label: "Resolving Owner" },
  { key: "complete", label: "Complete" },
]

export function SingleLookup() {
  const [url, setUrl] = useState("")
  const [step, setStep] = useState<PipelineStep>("idle")
  const [result, setResult] = useState<{ contact: OwnerContact; cached: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectedPortal = url.trim() ? detectPortal(url.trim()) : null

  const handleLookup = useCallback(async () => {
    const trimmed = url.trim()
    if (!trimmed) return

    if (!detectPortal(trimmed)) {
      setError("This URL is from an unsupported portal. We support Bayut, PropertyFinder, and Dubizzle.")
      return
    }

    setError(null)
    setResult(null)
    setStep("parsing")

    const stepTimer1 = setTimeout(() => setStep("finding_unit"), 1500)
    const stepTimer2 = setTimeout(() => setStep("resolving_owner"), 5000)

    try {
      const res = await fetch("/api/owner-intelligence/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyUrl: trimmed }),
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)

      const json = await res.json()

      if (!json.success || !json.data) {
        setStep("error")
        setError(json.error || "Lookup failed — please retry")
        return
      }

      setStep("complete")
      setResult({ contact: json.data, cached: json.cached })
      toast.success(json.cached ? "Loaded from cache" : "Owner found")
    } catch {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      setStep("error")
      setError("Lookup failed — please retry")
    }
  }, [url])

  const isLoading = step !== "idle" && step !== "complete" && step !== "error"

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
              if (step === "complete" || step === "error") setStep("idle")
            }}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleLookup()}
            placeholder="Paste Bayut, PropertyFinder, or Dubizzle URL..."
            className="pl-10 pr-4 h-12 text-sm"
            disabled={isLoading}
          />
          {detectedPortal && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <PortalBadge portal={detectedPortal} />
            </div>
          )}
        </div>

        <Button
          onClick={handleLookup}
          disabled={isLoading || !url.trim()}
          className="w-full h-11"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Looking up owner...
            </>
          ) : (
            "Find Owner"
          )}
        </Button>
      </div>

      {/* Loading Spinner Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="relative">
              <motion.div
                className="h-16 w-16 rounded-full border-[3px] border-muted"
                style={{ borderTopColor: "hsl(var(--primary))" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <Search className="absolute inset-0 m-auto h-5 w-5 text-primary/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                {step === "parsing" && "Parsing URL..."}
                {step === "finding_unit" && "Finding unit details..."}
                {step === "resolving_owner" && "Resolving owner info..."}
              </p>
              <p className="text-xs text-muted-foreground">This may take up to a minute</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline Visualizer */}
      <AnimatePresence>
        {step !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1 py-3">
              {steps.map((s, i) => {
                const stepIndex = steps.findIndex((x) => x.key === step)
                const thisIndex = i
                const isActive = s.key === step
                const isDone = thisIndex < stepIndex || step === "complete"
                const isError = step === "error" && thisIndex === stepIndex

                return (
                  <div key={s.key} className="flex items-center gap-1 flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={cn(
                          "h-7 w-7 rounded flex items-center justify-center text-xs flex-shrink-0 transition-colors",
                          isDone
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : isActive
                            ? "bg-primary/10 text-primary"
                            : isError
                            ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isActive && !isError ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isError ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wider hidden sm:inline",
                          isDone ? "text-emerald-600 dark:text-emerald-400" : isActive ? "text-foreground" : "text-muted-foreground/50"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <ArrowRight className={cn("h-3 w-3 flex-shrink-0 mx-1", isDone ? "text-emerald-400" : "text-muted-foreground/20")} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          {step === "error" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLookup}
              className="ml-auto text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 text-xs"
            >
              Retry
            </Button>
          )}
        </motion.div>
      )}

      {/* Result */}
      {result && <LookupResult contact={result.contact} cached={result.cached} />}
    </div>
  )
}
