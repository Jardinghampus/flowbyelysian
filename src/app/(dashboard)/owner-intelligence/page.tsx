"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Upload, Users, Database } from "lucide-react"
import { SingleLookup } from "./_components/SingleLookup"
import { BulkURLUpload } from "./_components/BulkURLUpload"
import { OwnersListUpload } from "./_components/OwnersListUpload"
import { ContactsTable } from "./_components/ContactsTable"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "single", label: "Single Lookup", icon: Search },
  { id: "bulk-url", label: "Bulk URLs", icon: Upload },
  { id: "owners", label: "Owners List", icon: Users },
  { id: "contacts", label: "Contacts", icon: Database },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function OwnerIntelligencePage() {
  const [activeTab, setActiveTab] = useState<TabId>("single")

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Owner Intelligence
        </h1>
        <p className="text-sm text-white/35 font-mono">
          Find property owners directly. Paste a URL, upload a list, or search your contacts.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex gap-0 border-b border-white/[0.07]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors",
                  isActive ? "text-[#C8922A]" : "text-white/25 hover:text-white/45"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8922A]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl">
          {activeTab === "single" && <SingleLookup />}
          {activeTab === "bulk-url" && (
            <BulkURLUpload onComplete={() => setActiveTab("contacts")} />
          )}
          {activeTab === "owners" && (
            <OwnersListUpload onComplete={() => setActiveTab("contacts")} />
          )}
          {activeTab === "contacts" && <ContactsTable />}
        </div>
      </div>
    </div>
  )
}
