"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrainingModuleCard } from "./components/training-module-card"
import { CreateModuleDialog } from "./components/create-module-dialog"

export interface TrainingModule {
  id: string
  title: string
  description: string
  videoUrl?: string
  videoType?: "youtube" | "loom"
  documents: { name: string; url: string }[]
  createdAt: string
}

// Demo data - in production this would come from Supabase
const initialModules: TrainingModule[] = [
  {
    id: "1",
    title: "Getting Started with Flow",
    description: "Learn the basics of using Flow by Elysian. This module covers navigation, key features, and best practices.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    documents: [
      { name: "Quick Start Guide.pdf", url: "#" },
      { name: "Feature Overview.pdf", url: "#" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Advanced SEO Techniques",
    description: "Master the SEO Generator tool to create compelling property descriptions that rank well.",
    videoUrl: "https://www.loom.com/embed/1234567890",
    videoType: "loom",
    documents: [
      { name: "SEO Best Practices.pdf", url: "#" },
    ],
    createdAt: "2024-01-20",
  },
]

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>(initialModules)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAdmin] = useState(true) // In production, check user role

  const handleCreateModule = (module: Omit<TrainingModule, "id" | "createdAt">) => {
    const newModule: TrainingModule = {
      ...module,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setModules([newModule, ...modules])
    setIsCreateOpen(false)
  }

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Training</h1>
            <p className="text-muted-foreground">
              Access training materials, videos, and documentation
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <TrainingModuleCard
              key={module.id}
              module={module}
              isAdmin={isAdmin}
              onDelete={handleDeleteModule}
            />
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No training modules yet.</p>
            {isAdmin && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Module
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateModuleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateModule}
      />
    </>
  )
}
