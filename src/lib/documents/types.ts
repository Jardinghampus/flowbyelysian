export type TemplateType = 'marketing_leasing' | 'socials_only' | 'general' | 'property_marketing_auth'

export type DocumentStatus = 'draft' | 'sent' | 'signed' | 'expired'

export interface TemplateVariable {
  key: string
  label: string
  type: 'text' | 'date' | 'number' | 'email'
}

export interface Template {
  id: string
  name: string
  type: TemplateType
  content_json: string // rich text content with {{variable}} placeholders
  variables: TemplateVariable[]
  updated_by: string | null
  updated_at: string
}

export interface Document {
  id: string
  template_id: string
  agent_id: string
  agent_email: string
  agent_name: string
  status: DocumentStatus
  sign_token: string
  signer_email: string | null
  signer_name: string | null
  created_at: string
  sent_at: string | null
  signed_at: string | null
  pdf_url: string | null
}

export interface DocumentField {
  id: string
  document_id: string
  field_key: string
  field_value: string
}

export interface Signature {
  id: string
  document_id: string
  image_base64: string
  signed_at: string
  signer_ip: string | null
}

// Extended types for UI
export interface DocumentWithTemplate extends Document {
  template?: Template
  fields?: DocumentField[]
}

export interface SendSigningRequestParams {
  signerEmail: string
  signerName: string
  agentName: string
  documentName: string
  signToken: string
}

export interface SignDocumentParams {
  signatureBase64: string
  signerName: string
  signerIp?: string
}
