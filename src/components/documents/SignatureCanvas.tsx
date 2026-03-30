"use client"

import { useRef, useCallback } from "react"
import ReactSignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string | null) => void
}

export function SignatureCanvas({ onSignatureChange }: SignatureCanvasProps) {
  const sigCanvasRef = useRef<ReactSignatureCanvas>(null)

  const handleEnd = useCallback(() => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.toDataURL("image/png")
      onSignatureChange(dataUrl)
    }
  }, [onSignatureChange])

  const handleClear = useCallback(() => {
    sigCanvasRef.current?.clear()
    onSignatureChange(null)
  }, [onSignatureChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Signature</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>
      <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-white overflow-hidden">
        <ReactSignatureCanvas
          ref={sigCanvasRef}
          penColor="#000000"
          backgroundColor="rgb(255, 255, 255)"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: "200px" },
          }}
          onEnd={handleEnd}
        />
      </div>
      <p className="text-xs text-muted-foreground">Draw your signature above using your mouse or finger</p>
    </div>
  )
}
