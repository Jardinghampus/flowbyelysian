// Smart App - Document Intelligence Platform Types

export type DocumentType = 'floor_plan' | 'site_plan' | 'plot_map' | 'brochure' | 'spec_sheet' | 'contract' | 'legal' | 'other'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface SmartCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  icon: string
  is_default: boolean
  document_count: number
  created_at: string
  updated_at: string
}

export interface RoomDimension {
  name: string
  width: number
  length: number
  area: number
}

export interface SmartDocument {
  id: string
  user_id: string
  collection_id: string | null
  name: string
  description: string | null
  document_type: DocumentType
  file_url: string
  file_name: string
  file_size: number | null
  file_type: string | null
  thumbnail_url: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  area_name: string | null
  property_name: string | null
  developer: string | null
  project_name: string | null
  analysis_status: AnalysisStatus
  created_at: string
  updated_at: string
  // Joined data
  collection?: SmartCollection
  analysis?: SmartDocumentAnalysis
}

export interface SmartDocumentAnalysis {
  id: string
  document_id: string
  plot_size: number | null
  built_up_area: number | null
  bedroom_count: number | null
  bathroom_count: number | null
  floor_count: number | null
  parking_spaces: number | null
  room_dimensions: RoomDimension[]
  balcony_area: number | null
  terrace_area: number | null
  garden_area: number | null
  pool_size: string | null
  features: string[]
  extracted_text: string | null
  summary: string | null
  extraction_confidence: number
  processed_at: string | null
  processing_time_ms: number | null
  model_used: string | null
}

export interface SmartChatMessage {
  id: string
  user_id: string
  collection_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  document_ids: string[]
  model_used: string | null
  tokens_used: number | null
  created_at: string
}

export interface SmartComparison {
  id: string
  user_id: string
  name: string | null
  document_ids: string[]
  comparison_summary: string | null
  comparison_data: Record<string, unknown> | null
  created_at: string
}

// UI State types
export interface DocumentFilter {
  collection_id?: string
  document_type?: DocumentType
  search?: string
  analysis_status?: AnalysisStatus
}

export interface ChatContext {
  collection_id: string | null
  selected_documents: string[]
}

// Document type configuration for UI
export const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'floor_plan', label: 'Floor Plan', icon: 'layout' },
  { value: 'site_plan', label: 'Site Plan', icon: 'map' },
  { value: 'plot_map', label: 'Plot Map', icon: 'map-pin' },
  { value: 'brochure', label: 'Brochure', icon: 'file-image' },
  { value: 'spec_sheet', label: 'Spec Sheet', icon: 'file-text' },
  { value: 'contract', label: 'Contract', icon: 'file-signature' },
  { value: 'legal', label: 'Legal Document', icon: 'scale' },
  { value: 'other', label: 'Other', icon: 'file' },
]

// Collection icon options
export const COLLECTION_ICONS = [
  'folder',
  'home',
  'building',
  'building-2',
  'map',
  'map-pin',
  'landmark',
  'warehouse',
  'briefcase',
  'star',
  'heart',
  'bookmark',
]

// Collection color options
export const COLLECTION_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
]
