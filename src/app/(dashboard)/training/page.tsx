"use client"

import { useState, useEffect } from "react"
import { Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainingModuleCard } from "./components/training-module-card"
import { TrainingModuleView } from "./components/training-module-view"
import { CreateModuleDialog } from "./components/create-module-dialog"
import { useRole } from "@/contexts/role-context"

export type TrainingCategory = "rera" | "tips" | "way-of-work"

export interface TrainingModule {
  id: string
  title: string
  description: string
  category: TrainingCategory
  content: string // Full training content/text
  videoUrl?: string
  videoType?: "youtube" | "loom"
  documents: { name: string; url: string }[]
  duration?: string // Estimated completion time
  createdAt: string
}

// Demo data - in production this would come from Supabase
const initialModules: TrainingModule[] = [
  // RERA Modules
  {
    id: "1",
    title: "RERA Registration Process",
    description: "Complete guide to RERA registration requirements and procedures for real estate agents in Dubai.",
    category: "rera",
    content: `## RERA Registration Guide

This module covers everything you need to know about RERA registration in Dubai.

### What is RERA?

The Real Estate Regulatory Agency (RERA) is the regulatory arm of Dubai Land Department, responsible for regulating and licensing the real estate sector in Dubai.

### Registration Requirements

1. **Educational Qualification** - Minimum high school diploma
2. **Training Course** - Complete DREI certified training
3. **Documentation** - Valid passport, visa, Emirates ID
4. **Background Check** - Clean criminal record
5. **Sponsorship** - Must be sponsored by a licensed brokerage

### Registration Steps

1. Gather all required documents
2. Complete DREI training course
3. Pass the RERA examination
4. Submit application through DLD portal
5. Pay registration fees
6. Receive broker card

### Annual Renewal

- Renew license before expiry
- Complete required CPD hours
- Update any changed information
- Pay renewal fees`,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    documents: [
      { name: "RERA Registration Checklist.pdf", url: "#" },
      { name: "Required Documents List.pdf", url: "#" },
    ],
    duration: "25 min",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "RERA Compliance & Regulations",
    description: "Understanding RERA rules, compliance requirements, and avoiding common violations.",
    category: "rera",
    content: `## RERA Compliance Guide

Stay compliant with RERA regulations to maintain your license and reputation.

### Key Regulations

1. **Advertising Rules** - All ads must include RERA permit number
2. **Contract Requirements** - Use DLD-approved forms
3. **Commission Rules** - Standard commission structures
4. **Client Funds** - Escrow account requirements

### Common Violations to Avoid

- Advertising without permit numbers
- Misrepresenting property details
- Operating without valid license
- Not disclosing material facts

### Penalties

- Fines ranging from AED 5,000 to AED 1,000,000
- License suspension or revocation
- Blacklisting from the industry`,
    documents: [
      { name: "RERA Compliance Handbook.pdf", url: "#" },
    ],
    duration: "20 min",
    createdAt: "2024-01-20",
  },
  // Tips Modules
  {
    id: "3",
    title: "Closing Techniques for High-Value Properties",
    description: "Master the art of closing deals on luxury and high-value properties in Dubai.",
    category: "tips",
    content: `## Closing High-Value Properties

Learn proven techniques for closing luxury property deals.

### Understanding Luxury Buyers

- They value time over everything
- Privacy and discretion are paramount
- They expect white-glove service
- Decision-making can be quick or extended

### Key Closing Techniques

1. **Build Rapport First** - Establish trust before selling
2. **Know Your Product** - Be an expert on every detail
3. **Handle Objections** - Anticipate and address concerns
4. **Create Urgency** - Without being pushy
5. **Negotiate Win-Win** - Focus on value, not price

### Follow-Up Strategy

- Same-day thank you message
- Weekly market updates
- Exclusive previews of new listings
- Remember personal details and preferences`,
    videoUrl: "https://www.loom.com/embed/1234567890",
    videoType: "loom",
    documents: [
      { name: "Luxury Sales Scripts.pdf", url: "#" },
      { name: "Objection Handling Guide.pdf", url: "#" },
    ],
    duration: "30 min",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "Building Your Personal Brand",
    description: "How to establish yourself as a trusted real estate expert in Dubai.",
    category: "tips",
    content: `## Personal Branding for Agents

Stand out in a competitive market with strong personal branding.

### Why Personal Branding Matters

- Differentiates you from competitors
- Builds trust before first meeting
- Generates referrals and repeat business
- Commands premium positioning

### Building Your Brand

1. **Define Your Niche** - Specialize in an area or property type
2. **Consistent Presence** - Same message across all channels
3. **Content Creation** - Share valuable market insights
4. **Social Proof** - Testimonials and success stories
5. **Professional Image** - Photography, materials, presentation

### Social Media Strategy

- LinkedIn for professional networking
- Instagram for lifestyle and properties
- YouTube for virtual tours and market updates`,
    documents: [
      { name: "Brand Guidelines Template.pdf", url: "#" },
    ],
    duration: "15 min",
    createdAt: "2024-02-05",
  },
  // Way of Work Modules
  {
    id: "5",
    title: "Getting Started with Flow",
    description: "Learn the basics of using Flow by Elysian. This module covers navigation, key features, and best practices.",
    category: "way-of-work",
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
    createdAt: "2024-01-10",
  },
  {
    id: "6",
    title: "Daily Workflow & Routines",
    description: "Establish productive daily routines and workflows for maximum efficiency.",
    category: "way-of-work",
    content: `## Optimal Daily Workflow

Structure your day for maximum productivity and results.

### Morning Routine (8:00 - 10:00)

1. Review overnight inquiries and respond
2. Check and update inventory status
3. Plan viewings for the day
4. Team standup meeting

### Midday Activities (10:00 - 14:00)

1. Client viewings and meetings
2. Property inspections
3. Networking and relationship building

### Afternoon Tasks (14:00 - 17:00)

1. Follow-up calls and emails
2. Documentation and paperwork
3. New listing acquisitions
4. Content creation for social media

### End of Day (17:00 - 18:00)

1. Update CRM with day's activities
2. Log all viewings in Flow
3. Plan tomorrow's schedule
4. Review performance metrics`,
    documents: [
      { name: "Daily Checklist.pdf", url: "#" },
      { name: "Weekly Planner Template.pdf", url: "#" },
    ],
    duration: "10 min",
    createdAt: "2024-01-12",
  },
]

const STORAGE_KEY = "flow-training-modules"

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAdmin } = useRole()

  // Load modules from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setModules(JSON.parse(saved))
        } catch {
          setModules(initialModules)
        }
      } else {
        setModules(initialModules)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save modules to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modules))
    }
  }, [modules, isLoaded])

  const handleCreateModule = (module: Omit<TrainingModule, "id" | "createdAt">) => {
    const newModule: TrainingModule = {
      ...module,
      title: module.title || "Untitled Module",
      description: module.description || "",
      content: module.content || "",
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setModules([newModule, ...modules])
    setIsCreateOpen(false)
    toast.success("Module Created", {
      description: "Training module has been saved.",
    })
  }

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
    toast.success("Module Deleted", {
      description: "Training module has been removed.",
    })
  }

  const handleUpdateModule = (updatedModule: TrainingModule) => {
    setModules(modules.map((m) => (m.id === updatedModule.id ? updatedModule : m)))
    toast.success("Module Updated", {
      description: "Training module has been saved.",
    })
  }

  if (selectedModule) {
    return (
      <TrainingModuleView
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
      />
    )
  }

  const [activeTab, setActiveTab] = useState<TrainingCategory | "all">("all")

  const filteredModules = activeTab === "all"
    ? modules
    : modules.filter(m => m.category === activeTab)

  const getCategoryCount = (category: TrainingCategory) =>
    modules.filter(m => m.category === category).length

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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TrainingCategory | "all")} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({modules.length})
            </TabsTrigger>
            <TabsTrigger value="rera">
              RERA ({getCategoryCount("rera")})
            </TabsTrigger>
            <TabsTrigger value="tips">
              Tips ({getCategoryCount("tips")})
            </TabsTrigger>
            <TabsTrigger value="way-of-work">
              Way of Work ({getCategoryCount("way-of-work")})
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => (
              <TrainingModuleCard
                key={module.id}
                module={module}
                isAdmin={isAdmin}
                onDelete={handleDeleteModule}
                onView={() => setSelectedModule(module)}
              />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No training modules in this category.</p>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Module
                </Button>
              )}
            </div>
          )}
        </Tabs>
      </div>

      <CreateModuleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateModule}
      />
    </>
  )
}
