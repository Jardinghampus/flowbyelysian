"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Languages,
  Wand2,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ToneStyle = "professional" | "luxury" | "casual" | "formal_arabic"
type Language = "en" | "ar" | "both"

const toneOptions: { value: ToneStyle; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Clean, authoritative" },
  { value: "luxury", label: "Luxury", desc: "Sotheby's style" },
  { value: "casual", label: "Casual", desc: "Instagram / social" },
  { value: "formal_arabic", label: "Formal Arabic", desc: "High-end Arabic market" },
]

const propertyTypes = ["Apartment", "Villa", "Penthouse", "Townhouse", "Duplex", "Studio", "Office", "Land"]

// Simulated AI-generated descriptions
const sampleDescriptions = {
  en: `Discover an exceptional 3-bedroom residence perched on the 42nd floor of one of Dubai Marina's most prestigious towers. Floor-to-ceiling windows frame panoramic views of the Arabian Gulf and Palm Jumeirah, while 2,400 sq ft of thoughtfully designed living space offers the perfect balance of luxury and comfort.

The open-plan kitchen features premium Miele appliances and Italian marble countertops. The master suite boasts a walk-in closet and spa-inspired bathroom with dual vanities. Two additional bedrooms offer generous proportions and built-in wardrobes.

Residents enjoy exclusive access to an infinity pool, state-of-the-art gymnasium, and private beach. Steps from Marina Walk's dining and retail, with Metro connectivity minutes away.`,
  ar: `اكتشف مقر إقامة استثنائي مكوّن من 3 غرف نوم في الطابق 42 من أحد أبرز أبراج دبي مارينا. تؤطر النوافذ الممتدة من الأرض إلى السقف مناظر بانورامية للخليج العربي ونخلة جميرا، بينما توفر مساحة المعيشة البالغة 2,400 قدم مربع التوازن المثالي بين الفخامة والراحة.

يضم المطبخ المفتوح أجهزة ميلي الفاخرة وأسطح رخام إيطالي. تتميز الجناح الرئيسي بخزانة ملابس ملحقة وحمام مستوحى من المنتجعات الصحية. توفر غرفتا النوم الإضافيتان مساحات واسعة وخزائن مدمجة.`,
}

export default function DescriptionWriterPage() {
  const [propertyType, setPropertyType] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [size, setSize] = useState("")
  const [area, setArea] = useState("")
  const [building, setBuilding] = useState("")
  const [features, setFeatures] = useState("")
  const [tone, setTone] = useState<ToneStyle>("professional")
  const [language, setLanguage] = useState<Language>("both")
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ en?: string; ar?: string } | null>(null)
  const [copied, setCopied] = useState<"en" | "ar" | null>(null)

  const handleGenerate = async () => {
    if (!propertyType || !area) {
      toast.error("Property type and area are required")
      return
    }

    setGenerating(true)
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 2500))

    setResult({
      en: language !== "ar" ? sampleDescriptions.en : undefined,
      ar: language !== "en" ? sampleDescriptions.ar : undefined,
    })
    setGenerating(false)
    toast.success("Description generated!")
  }

  const handleCopy = async (text: string, lang: "en" | "ar") => {
    await navigator.clipboard.writeText(text)
    setCopied(lang)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setGenerating(false)
    toast.success("Regenerated with new variation")
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          AI Description Writer
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate bilingual listing descriptions in your brand voice. English & Arabic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Left: Input form */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Property Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Property Type *</Label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-background text-sm"
                >
                  <option value="">Select type</option>
                  {propertyTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bedrooms</Label>
                <Input
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="3"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Size (sqft)</Label>
                <Input
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="2,400"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Area *</Label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Dubai Marina"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Building / Project</Label>
              <Input
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="Marina Gate Tower 2"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Key Features & Notes</Label>
              <Textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="High floor, sea view, upgraded kitchen, private pool, near Metro..."
                className="text-sm h-20 resize-none"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Style & Language</h3>

            {/* Tone */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tone</Label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg text-xs transition-colors border",
                      tone === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className={cn(
                      "text-[10px] mt-0.5",
                      tone === opt.value ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Languages className="h-3.5 w-3.5" />
                Language
              </Label>
              <div className="flex gap-2">
                {([
                  { value: "en", label: "English" },
                  { value: "ar", label: "Arabic" },
                  { value: "both", label: "Both" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border",
                      language === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !propertyType || !area}
            className="w-full h-11"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Description
              </>
            )}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          {!result && !generating && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Fill in the property details and click Generate.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                AI will craft a professional listing description in your chosen language and tone.
              </p>
            </div>
          )}

          {generating && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Crafting your description...</p>
            </div>
          )}

          {result && !generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {result.en && (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">EN</Badge>
                      <span className="text-xs text-muted-foreground">English</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRegenerate}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Regen
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.en!, "en")}
                        className="h-7 text-xs"
                      >
                        {copied === "en" ? (
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{result.en}</p>
                  </div>
                </div>
              )}

              {result.ar && (
                <div className="rounded-xl border bg-card overflow-hidden" dir="rtl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50" dir="ltr">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">AR</Badge>
                      <span className="text-xs text-muted-foreground">Arabic</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.ar!, "ar")}
                        className="h-7 text-xs"
                      >
                        {copied === "ar" ? (
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-line font-arabic">{result.ar}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
