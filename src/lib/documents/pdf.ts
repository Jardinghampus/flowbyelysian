import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_WIDTH = 595.28 // A4
const PAGE_HEIGHT = 841.89
const MARGIN = 50
const LINE_HEIGHT = 16
const FONT_SIZE = 11
const TITLE_FONT_SIZE = 16

export function substituteVariables(
  content: string,
  fields: Record<string, string>
): string {
  let result = content
  for (const [key, value] of Object.entries(fields)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export async function generateDocumentPdf(
  templateContent: string,
  fields: Record<string, string>,
  signatureBase64?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const renderedContent = substituteVariables(templateContent, fields)
  const paragraphs = renderedContent.split('\n')

  const maxWidth = PAGE_WIDTH - MARGIN * 2
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      y -= LINE_HEIGHT
      if (y < MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - MARGIN
      }
      continue
    }

    // Detect section headers (lines starting with a number and period)
    const isHeader = /^\d+\.\s/.test(paragraph.trim())
    const currentFont = isHeader ? boldFont : font
    const currentSize = isHeader ? FONT_SIZE + 1 : FONT_SIZE

    const lines = wrapText(paragraph.trim(), currentFont, currentSize, maxWidth)

    for (const line of lines) {
      if (y < MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - MARGIN
      }

      page.drawText(line, {
        x: MARGIN,
        y,
        size: currentSize,
        font: currentFont,
        color: rgb(0.1, 0.1, 0.1),
      })

      y -= LINE_HEIGHT
    }
  }

  // Stamp signature if provided
  if (signatureBase64) {
    const signatureImageData = signatureBase64.replace(/^data:image\/png;base64,/, '')
    const signatureBytes = Uint8Array.from(atob(signatureImageData), c => c.charCodeAt(0))
    const signatureImage = await pdfDoc.embedPng(signatureBytes)

    const sigWidth = 200
    const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth

    // Place signature at the bottom of the last page
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
    const sigY = Math.max(MARGIN, y - sigHeight - 20)

    lastPage.drawText('Signature:', {
      x: MARGIN,
      y: sigY + sigHeight + 10,
      size: FONT_SIZE,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    lastPage.drawImage(signatureImage, {
      x: MARGIN,
      y: sigY,
      width: sigWidth,
      height: sigHeight,
    })

    // Add signed date below signature
    lastPage.drawText(`Signed: ${new Date().toLocaleDateString('en-AE')}`, {
      x: MARGIN,
      y: sigY - 15,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  return await pdfDoc.save()
}
