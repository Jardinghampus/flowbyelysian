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
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Owner Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Find property owners directly. Paste a URL, upload a list, or search your contacts.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
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
  )
}
