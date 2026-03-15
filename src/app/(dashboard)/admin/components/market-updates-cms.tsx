"use client"

import { useState, useSyncExternalStore } from "react"
import { marketUpdatesStore, type MarketUpdate } from "@/lib/market-updates-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Eye, Calendar, FileText, Send } from "lucide-react"
import { toast } from "sonner"

type PostStatus = MarketUpdate["status"]

const statusColors: Record<PostStatus, string> = {
  published: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
}

interface PostForm {
  title: string
  body: string
  excerpt: string
  imageUrl: string
  tags: string
  status: PostStatus
  scheduledAt: string
}

const emptyForm: PostForm = {
  title: "",
  body: "",
  excerpt: "",
  imageUrl: "",
  tags: "",
  status: "draft",
  scheduledAt: "",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function MarketUpdatesCms() {
  const updates = useSyncExternalStore(
    marketUpdatesStore.subscribe,
    () => marketUpdatesStore.getAll(),
    () => marketUpdatesStore.getAll()
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (update: MarketUpdate) => {
    setEditingId(update.id)
    setForm({
      title: update.title,
      body: update.body,
      excerpt: update.excerpt,
      imageUrl: update.imageUrl || "",
      tags: update.tags.join(", "),
      status: update.status,
      scheduledAt: update.scheduledAt ? update.scheduledAt.slice(0, 16) : "",
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required")
      return
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const now = new Date().toISOString()

    if (editingId) {
      marketUpdatesStore.update(editingId, {
        title: form.title,
        body: form.body,
        excerpt: form.excerpt || form.body.slice(0, 150) + "...",
        imageUrl: form.imageUrl || null,
        tags,
        status: form.status,
        publishedAt: form.status === "published" ? now : null,
        scheduledAt: form.status === "scheduled" && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      })
      toast.success("Post updated")
    } else {
      marketUpdatesStore.create({
        title: form.title,
        body: form.body,
        excerpt: form.excerpt || form.body.slice(0, 150) + "...",
        imageUrl: form.imageUrl || null,
        tags,
        status: form.status,
        publishedAt: form.status === "published" ? now : null,
        scheduledAt: form.status === "scheduled" && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        author: "Zaylo Research",
      })
      toast.success("Post created")
    }

    setDialogOpen(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    marketUpdatesStore.delete(id)
    toast.success("Post deleted")
  }

  const handlePublish = (id: string) => {
    marketUpdatesStore.update(id, {
      status: "published",
      publishedAt: new Date().toISOString(),
    })
    toast.success("Post published")
  }

  const publishedCount = updates.filter((u) => u.status === "published").length
  const draftCount = updates.filter((u) => u.status === "draft").length
  const scheduledCount = updates.filter((u) => u.status === "scheduled").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Market Updates</CardTitle>
              <CardDescription>Manage posts visible to customers in the Market Updates feed</CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No posts yet. Create your first market update.
                    </TableCell>
                  </TableRow>
                ) : (
                  updates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium text-sm truncate">{update.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{update.excerpt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] border-0 ${statusColors[update.status]}`}>
                          {update.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {update.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                          {update.tags.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{update.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {update.publishedAt
                          ? formatDate(update.publishedAt)
                          : update.scheduledAt
                          ? `Scheduled: ${formatDate(update.scheduledAt)}`
                          : formatDate(update.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {update.status !== "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handlePublish(update.id)}
                              title="Publish now"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(update)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{update.title}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(update.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the market update post details below."
                : "Create a new market update that will be visible to customers."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="post-title">Title *</Label>
              <Input
                id="post-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Dubai Marina Rental Yields Hit Record High"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Input
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary shown in the feed preview"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-body">Body *</Label>
              <Textarea
                id="post-body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Full post content. Supports basic markdown-style formatting."
                rows={10}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-image">Image URL (optional)</Label>
              <Input
                id="post-image"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-tags">Tags (comma-separated)</Label>
              <Input
                id="post-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Investment, Dubai Marina, Rental Yields"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="post-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: PostStatus) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.status === "scheduled" && (
                <div className="grid gap-2">
                  <Label htmlFor="post-scheduled">Publish Date</Label>
                  <Input
                    id="post-scheduled"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Update Post" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
