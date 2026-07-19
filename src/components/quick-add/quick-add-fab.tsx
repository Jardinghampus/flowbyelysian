"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TEAM_COLOR } from "@/lib/brand"
import {
  QUICK_ADD_PRESETS,
  QuickListingForm,
  presetIcon,
} from "@/components/quick-add/quick-listing-form"

export function QuickAddFab() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<(typeof QUICK_ADD_PRESETS)[number] | null>(null)

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close quick add"
          className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-6">
        {menuOpen ? (
          <div className="w-56 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick add
            </p>
            {QUICK_ADD_PRESETS.map((preset) => {
              const Icon = presetIcon(preset.id)
              return (
                <button
                  key={preset.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setActivePreset(preset)
                    setMenuOpen(false)
                  }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white shrink-0"
                    style={{ backgroundColor: TEAM_COLOR }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{preset.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{preset.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}

        <Button
          type="button"
          size="icon"
          aria-label={menuOpen ? "Close quick add menu" : "Quick add"}
          className={cn(
            "h-14 w-14 rounded-full shadow-xl text-white border-0 transition-transform hover:scale-105",
            menuOpen && "rotate-45"
          )}
          style={{ backgroundColor: TEAM_COLOR }}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {activePreset ? (
        <QuickListingForm
          preset={activePreset}
          open={Boolean(activePreset)}
          onOpenChange={(open) => {
            if (!open) setActivePreset(null)
          }}
        />
      ) : null}
    </>
  )
}
