"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrainingModuleCard } from "./components/training-module-card"
import { TrainingModuleView } from "./components/training-module-view"
import { CreateModuleDialog } from "./components/create-module-dialog"
import { useRole } from "@/contexts/role-context"

export interface TrainingModule {
  id: string
  title: string
  description: string
  content: string // Full training content/text
  videoUrl?: string
  videoType?: "youtube" | "loom"
  documents: { name: string; url: string }[]
  duration?: string // Estimated completion time
  createdAt: string
}

// Demo data - in production this would come from Supabase
const initialModules: TrainingModule[] = [
  {
    id: "1",
    title: "Getting Started with Flow",
    description: "Learn the basics of using Flow by Elysian. This module covers navigation, key features, and best practices.",
    content: `## Welcome to Flow by Elysian

This comprehensive training module will guide you through the essential features of our platform.

### What You'll Learn

1. **Dashboard Navigation** - Understanding the sidebar, quick actions, and key metrics
2. **Managing Listings** - How to add, edit, and track your property inventory
3. **SEO Generator** - Creating compelling property descriptions that rank well
4. **Performance Tracking** - Monitoring your sales and conversion metrics

### Getting Started

First, familiarize yourself with the dashboard layout. The sidebar on the left provides access to all main features:

- **Dashboard**: Your home base with key metrics
- **Inventory**: Manage your property listings
- **Performance**: Track your sales metrics
- **Training**: Access learning materials (you are here!)

### Best Practices

- Keep your inventory up to date daily
- Use the SEO generator for all new listings
- Review your performance metrics weekly
- Complete all training modules within your first week`,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    documents: [
      { name: "Quick Start Guide.pdf", url: "#" },
      { name: "Feature Overview.pdf", url: "#" },
    ],
    duration: "15 min",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Advanced SEO Techniques",
    description: "Master the SEO Generator tool to create compelling property descriptions that rank well.",
    content: `## Mastering Property SEO

Learn how to create property descriptions that attract buyers and rank well on search engines.

### Key Principles

1. **Keyword Research** - Understanding what buyers search for
2. **Compelling Headlines** - Writing titles that grab attention
3. **Feature Highlighting** - Showcasing unique selling points
4. **Call to Action** - Driving inquiries and viewings

### Using the SEO Generator

The Flow SEO Generator uses AI to optimize your property descriptions:

1. Enter basic property details
2. Select key features and amenities
3. Choose your target audience
4. Generate and refine your description

### Tips for Better Results

- Include specific measurements and numbers
- Mention nearby amenities and landmarks
- Use emotional language that helps buyers visualize
- Always proofread AI-generated content`,
    videoUrl: "https://www.loom.com/embed/1234567890",
    videoType: "loom",
    documents: [
      { name: "SEO Best Practices.pdf", url: "#" },
    ],
    duration: "20 min",
    createdAt: "2024-01-20",
  },
]

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>(initialModules)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const { isAdmin } = useRole()

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

  if (selectedModule) {
    return (
      <TrainingModuleView
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
      />
    )
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Training</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage training materials for your team"
                : "Access training materials, videos, and documentation"
              }
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
              onView={() => setSelectedModule(module)}
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
