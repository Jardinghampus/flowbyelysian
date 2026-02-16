"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  Scale,
  MessageSquare,
  FileText,
  ChevronDown,
  X,
  Sparkles,
  Map,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { SmartDocument, SmartCollection, SmartChatMessage, DocumentType, DOCUMENT_TYPES } from "./types"
import { demoDocuments, demoCollections, demoChatMessages } from "./data"
import { DocumentCard } from "./components/document-card"
import { DocumentUpload } from "./components/document-upload"
import { DocumentDetail } from "./components/document-detail"
import { ChatPanel } from "./components/chat-panel"
import { CollectionSidebar } from "./components/collection-sidebar"
import { ComparisonView } from "./components/comparison-view"

type ViewMode = 'grid' | 'list'

export default function SmartPage() {
  // State
  const [documents, setDocuments] = useState<SmartDocument[]>(demoDocuments)
  const [collections, setCollections] = useState<SmartCollection[]>(demoCollections)
  const [messages, setMessages] = useState<SmartChatMessage[]>(demoChatMessages)

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [detailDocument, setDetailDocument] = useState<SmartDocument | null>(null)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Collection filter
      if (selectedCollection && doc.collection_id !== selectedCollection) {
        return false
      }
      // Type filter
      if (filterType !== 'all' && doc.document_type !== filterType) {
        return false
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.property_name?.toLowerCase().includes(query) ||
          doc.area_name?.toLowerCase().includes(query) ||
          doc.developer?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [documents, selectedCollection, filterType, searchQuery])

  // Selected documents array
  const selectedDocumentsArray = useMemo(() => {
    return documents.filter((doc) => selectedDocuments.has(doc.id))
  }, [documents, selectedDocuments])

  // Get current collection
  const currentCollection = useMemo(() => {
    if (!selectedCollection) return null
    return collections.find((c) => c.id === selectedCollection) || null
  }, [collections, selectedCollection])

  // Chat messages filtered by collection
  const collectionMessages = useMemo(() => {
    if (!selectedCollection) return messages
    return messages.filter((m) => m.collection_id === selectedCollection)
  }, [messages, selectedCollection])

  // Handlers
  const handleSelectDocument = useCallback((id: string, selected: boolean) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map((d) => d.id)))
    }
  }, [filteredDocuments, selectedDocuments.size])

  const handleSendMessage = useCallback(async (content: string, documentIds: string[]) => {
    // Add user message
    const userMessage: SmartChatMessage = {
      id: `msg-${Date.now()}`,
      user_id: 'demo-user-001',
      collection_id: selectedCollection,
      role: 'user',
      content,
      document_ids: documentIds,
      model_used: null,
      tokens_used: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsChatLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Get context from selected documents
    const contextDocs = documents.filter((d) => documentIds.includes(d.id))
    let response = "I've analyzed your documents. "

    if (content.toLowerCase().includes('compare')) {
      response = generateComparisonResponse(contextDocs)
    } else if (content.toLowerCase().includes('size') || content.toLowerCase().includes('area')) {
      response = generateSizeResponse(contextDocs)
    } else if (content.toLowerCase().includes('feature')) {
      response = generateFeatureResponse(contextDocs)
    } else {
      response = generateGeneralResponse(contextDocs)
    }

    const assistantMessage: SmartChatMessage = {
      id: `msg-${Date.now() + 1}`,
      user_id: 'demo-user-001',
      collection_id: selectedCollection,
      role: 'assistant',
      content: response,
      document_ids: documentIds,
      model_used: 'gpt-4',
      tokens_used: Math.floor(Math.random() * 500) + 100,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsChatLoading(false)
  }, [documents, selectedCollection])

  const handleClearChat = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.collection_id !== selectedCollection))
  }, [selectedCollection])

  const handleCreateCollection = useCallback((data: {
    name: string
    description: string
    color: string
    icon: string
  }) => {
    const newCollection: SmartCollection = {
      id: `col-${Date.now()}`,
      user_id: 'demo-user-001',
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      is_default: false,
      document_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCollections((prev) => [...prev, newCollection])
  }, [])

  const handleDeleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    setSelectedDocuments((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleChatWithDocument = useCallback((document: SmartDocument) => {
    setSelectedDocuments(new Set([document.id]))
    setIsChatExpanded(true)
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Collection Sidebar */}
      <CollectionSidebar
        collections={collections}
        selectedCollection={selectedCollection}
        onSelectCollection={setSelectedCollection}
        onCreateCollection={handleCreateCollection}
        totalDocuments={documents.length}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Smart</h1>
                <p className="text-sm text-muted-foreground">
                  Document Intelligence Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedDocuments.size >= 2 && (
                <Button variant="outline" onClick={() => setIsCompareOpen(true)}>
                  <Scale className="mr-2 h-4 w-4" />
                  Compare ({selectedDocuments.size})
                </Button>
              )}
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={(v) => setFilterType(v as DocumentType | 'all')}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-2">
                  <Grid3X3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Select All */}
            {filteredDocuments.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedDocuments.size === filteredDocuments.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Documents Grid/List */}
          <div className="flex-1 overflow-auto p-6">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No documents found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Upload your first document to get started'}
                </p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </div>
            ) : (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid'
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isSelected={selectedDocuments.has(doc.id)}
                      onSelect={handleSelectDocument}
                      onView={setDetailDocument}
                      onDelete={handleDeleteDocument}
                      onChat={handleChatWithDocument}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className={cn(
            "border-l bg-background transition-all duration-300",
            isChatExpanded ? "w-[500px]" : "w-80"
          )}>
            <ChatPanel
              collection={currentCollection}
              documents={filteredDocuments}
              selectedDocuments={selectedDocumentsArray}
              messages={collectionMessages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isExpanded={isChatExpanded}
              onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
              isLoading={isChatLoading}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentUpload
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        collections={collections}
        onUploadComplete={(files) => {
          // In real app, would add uploaded docs to state
          console.log('Uploaded:', files)
        }}
      />

      <DocumentDetail
        document={detailDocument}
        open={!!detailDocument}
        onOpenChange={(open) => !open && setDetailDocument(null)}
        onChat={handleChatWithDocument}
      />

      <ComparisonView
        documents={selectedDocumentsArray}
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
      />
    </div>
  )
}

// Helper functions for generating AI responses
function generateComparisonResponse(docs: SmartDocument[]): string {
  if (docs.length < 2) return "Please select at least 2 documents to compare."

  const doc1 = docs[0]
  const doc2 = docs[1]
  const area1 = doc1.analysis?.built_up_area || doc1.analysis?.plot_size || 0
  const area2 = doc2.analysis?.built_up_area || doc2.analysis?.plot_size || 0

  return `**Comparison: ${doc1.name} vs ${doc2.name}**

**Size:**
- ${doc1.name}: ${area1.toLocaleString()} sqft
- ${doc2.name}: ${area2.toLocaleString()} sqft
- Difference: ${Math.abs(area1 - area2).toLocaleString()} sqft (${Math.round((Math.abs(area1 - area2) / Math.min(area1, area2)) * 100)}%)

**Bedrooms:**
- ${doc1.name}: ${doc1.analysis?.bedroom_count || 'N/A'}
- ${doc2.name}: ${doc2.analysis?.bedroom_count || 'N/A'}

**Key Differences:**
${area1 > area2 ? `- ${doc1.name} is larger` : `- ${doc2.name} is larger`}
- Different feature sets and amenities
- Different locations and developers`
}

function generateSizeResponse(docs: SmartDocument[]): string {
  const totalArea = docs.reduce((sum, d) => sum + (d.analysis?.built_up_area || d.analysis?.plot_size || 0), 0)
  const avgArea = totalArea / docs.length

  return `**Size Analysis:**

Total analyzed: ${docs.length} document(s)
Combined area: ${totalArea.toLocaleString()} sqft
Average size: ${Math.round(avgArea).toLocaleString()} sqft

**Breakdown:**
${docs.map((d) => {
  const area = d.analysis?.built_up_area || d.analysis?.plot_size || 0
  return `- ${d.name}: ${area.toLocaleString()} sqft`
}).join('\n')}`
}

function generateFeatureResponse(docs: SmartDocument[]): string {
  const allFeatures: Record<string, number> = {}
  docs.forEach((d) => {
    d.analysis?.features?.forEach((f) => {
      allFeatures[f] = (allFeatures[f] || 0) + 1
    })
  })

  const sortedFeatures = Object.entries(allFeatures).sort((a, b) => b[1] - a[1])

  return `**Feature Analysis:**

**Most Common Features:**
${sortedFeatures.slice(0, 5).map(([f, count]) => `- ${f.replace(/_/g, ' ')}: Found in ${count} document(s)`).join('\n')}

**Unique Features by Document:**
${docs.map((d) => `- ${d.name}: ${d.analysis?.features?.slice(0, 3).join(', ') || 'No features detected'}`).join('\n')}`
}

function generateGeneralResponse(docs: SmartDocument[]): string {
  return `I've analyzed ${docs.length} document(s) in your selection.

**Summary:**
${docs.map((d) => `- **${d.name}**: ${d.analysis?.summary?.slice(0, 100) || 'No summary available'}...`).join('\n\n')}

Would you like me to:
1. Compare specific metrics?
2. Analyze features in detail?
3. Calculate total areas?

Just ask a specific question!`
}
