"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder,
  FolderOpen,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight,
  Home,
  Building,
  Building2,
  Map,
  MapPin,
  Landmark,
  Warehouse,
  Briefcase,
  Star,
  Heart,
  Bookmark,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { SmartCollection, COLLECTION_ICONS, COLLECTION_COLORS } from "../types"

const iconMap: Record<string, typeof Folder> = {
  folder: Folder,
  home: Home,
  building: Building,
  'building-2': Building2,
  map: Map,
  'map-pin': MapPin,
  landmark: Landmark,
  warehouse: Warehouse,
  briefcase: Briefcase,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
}

interface CollectionSidebarProps {
  collections: SmartCollection[]
  selectedCollection: string | null
  onSelectCollection: (id: string | null) => void
  onCreateCollection?: (data: { name: string; description: string; color: string; icon: string }) => void
  onEditCollection?: (id: string, data: { name: string; description: string; color: string; icon: string }) => void
  onDeleteCollection?: (id: string) => void
  totalDocuments: number
}

export function CollectionSidebar({
  collections,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  totalDocuments,
}: CollectionSidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<SmartCollection | null>(null)
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLLECTION_COLORS[0],
    icon: 'folder',
  })

  const handleCreate = () => {
    onCreateCollection?.(formData)
    setIsCreateOpen(false)
    setFormData({ name: '', description: '', color: COLLECTION_COLORS[0], icon: 'folder' })
  }

  const handleEdit = () => {
    if (editingCollection) {
      onEditCollection?.(editingCollection.id, formData)
      setEditingCollection(null)
      setFormData({ name: '', description: '', color: COLLECTION_COLORS[0], icon: 'folder' })
    }
  }

  const openEdit = (collection: SmartCollection) => {
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
      icon: collection.icon,
    })
    setEditingCollection(collection)
  }

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Collections</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* All Documents */}
        <button
          onClick={() => onSelectCollection(null)}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
            selectedCollection === null
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="flex-1 text-sm font-medium">All Documents</span>
          <Badge
            variant={selectedCollection === null ? "secondary" : "outline"}
            className="h-5 px-1.5 text-xs"
          >
            {totalDocuments}
          </Badge>
        </button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {collections.filter(c => !c.is_default).map((collection, index) => {
              const Icon = iconMap[collection.icon] || Folder
              const isSelected = selectedCollection === collection.id

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    onClick={() => onSelectCollection(collection.id)}
                  >
                    <div
                      className="p-1.5 rounded-md"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${collection.color}20`,
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: isSelected ? 'currentColor' : collection.color }}
                      />
                    </div>
                    <span className="flex-1 text-sm truncate">{collection.name}</span>
                    <Badge
                      variant={isSelected ? "secondary" : "outline"}
                      className="h-5 px-1.5 text-xs opacity-70"
                    >
                      {collection.document_count}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                            isSelected && "opacity-100"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(collection)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteCollectionId(collection.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Organize your documents into collections for easier management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Collection name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this collection for?"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_ICONS.map((icon) => {
                  const IconComponent = iconMap[icon] || Folder
                  return (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-colors",
                        formData.icon === icon
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name.trim()}>
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Collection name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this collection for?"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_ICONS.map((icon) => {
                  const IconComponent = iconMap[icon] || Folder
                  return (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-colors",
                        formData.icon === icon
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCollection(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Confirmation */}
      <AlertDialog open={!!deleteCollectionId} onOpenChange={() => setDeleteCollectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteCollectionId) onDeleteCollection?.(deleteCollectionId)
                setDeleteCollectionId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
