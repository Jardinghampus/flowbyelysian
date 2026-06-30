import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// A4 dimensions in points (1 point = 1/72 inch)
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

// 2.5 cm = ~70.87 points (1 cm = 28.3465 points)
const SIDE_MARGIN = 70.87
const TOP_MARGIN = 70.87
const BOTTOM_MARGIN = 70.87

const LINE_HEIGHT = 16
const FONT_SIZE = 11
const HEADER_COMPANY_FONT_SIZE = 10
const HEADER_DETAIL_FONT_SIZE = 8

export interface DocumentHeaderSettings {
  header_logo_url: string | null
  company_name: string
  company_phone: string
  company_email: string
  company_website: string
  company_address: string
}

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

async function fetchImageBytes(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch {
    return null
  }
}

async function drawHeader(
  page: ReturnType<PDFDocument['addPage']>,
  pdfDoc: PDFDocument,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  boldFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
  headerSettings: DocumentHeaderSettings
): Promise<number> {
  const contentWidth = PAGE_WIDTH - SIDE_MARGIN * 2
  let headerBottomY = PAGE_HEIGHT - TOP_MARGIN

  // Try to embed logo if URL is provided
  let logoImage: Awaited<ReturnType<PDFDocument['embedPng']>> | null = null
  const logoMaxWidth = 120
  const logoMaxHeight = 60

  if (headerSettings.header_logo_url) {
    const imageBytes = await fetchImageBytes(headerSettings.header_logo_url)
    if (imageBytes) {
      try {
        // Try PNG first, then JPG
        if (headerSettings.header_logo_url.toLowerCase().includes('.png')) {
          logoImage = await pdfDoc.embedPng(imageBytes)
        } else {
          logoImage = await pdfDoc.embedJpg(imageBytes)
        }
      } catch {
        try {
          logoImage = await pdfDoc.embedJpg(imageBytes)
        } catch {
          try {
            logoImage = await pdfDoc.embedPng(imageBytes)
          } catch {
            // Could not embed image
          }
        }
      }
    }
  }

  // Calculate logo dimensions maintaining aspect ratio
  let logoWidth = 0
  let logoHeight = 0
  if (logoImage) {
    const aspect = logoImage.width / logoImage.height
    if (aspect > logoMaxWidth / logoMaxHeight) {
      logoWidth = logoMaxWidth
      logoHeight = logoMaxWidth / aspect
    } else {
      logoHeight = logoMaxHeight
      logoWidth = logoMaxHeight * aspect
    }
  }

  // Build company info lines
  const companyLines: string[] = []
  if (headerSettings.company_phone) companyLines.push(headerSettings.company_phone)
  if (headerSettings.company_email) companyLines.push(headerSettings.company_email)
  if (headerSettings.company_website) companyLines.push(headerSettings.company_website)

  // Calculate header height
  const companyNameHeight = headerSettings.company_name ? HEADER_COMPANY_FONT_SIZE + 4 : 0
  const detailLinesHeight = companyLines.length * (HEADER_DETAIL_FONT_SIZE + 3)
  const addressHeight = headerSettings.company_address ? HEADER_DETAIL_FONT_SIZE + 6 : 0
  const textBlockHeight = companyNameHeight + detailLinesHeight + addressHeight
  const headerContentHeight = Math.max(logoHeight, textBlockHeight, 50)

  const headerTopY = PAGE_HEIGHT - TOP_MARGIN

  // Draw logo on the left
  if (logoImage) {
    const logoY = headerTopY - (headerContentHeight / 2) - (logoHeight / 2)
    page.drawImage(logoImage, {
      x: SIDE_MARGIN,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
    })
  }

  // Draw company info on the right side
  const rightX = PAGE_WIDTH - SIDE_MARGIN
  let textY = headerTopY - 2

  // Company name (bold, dark blue)
  if (headerSettings.company_name) {
    const nameWidth = boldFont.widthOfTextAtSize(headerSettings.company_name, HEADER_COMPANY_FONT_SIZE)
    page.drawText(headerSettings.company_name, {
      x: rightX - nameWidth,
      y: textY,
      size: HEADER_COMPANY_FONT_SIZE,
      font: boldFont,
      color: rgb(0.1, 0.23, 0.36), // dark navy blue
    })
    textY -= HEADER_COMPANY_FONT_SIZE + 6
  }

  // Phone, email, website
  for (const line of companyLines) {
    const lineWidth = font.widthOfTextAtSize(line, HEADER_DETAIL_FONT_SIZE)
    page.drawText(line, {
      x: rightX - lineWidth,
      y: textY,
      size: HEADER_DETAIL_FONT_SIZE,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    textY -= HEADER_DETAIL_FONT_SIZE + 3
  }

  // Address (with a small gap)
  if (headerSettings.company_address) {
    textY -= 3
    const addrWidth = font.widthOfTextAtSize(headerSettings.company_address, HEADER_DETAIL_FONT_SIZE)
    page.drawText(headerSettings.company_address, {
      x: rightX - addrWidth,
      y: textY,
      size: HEADER_DETAIL_FONT_SIZE,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    textY -= HEADER_DETAIL_FONT_SIZE + 3
  }

  // Draw separator line below header
  const separatorY = headerTopY - headerContentHeight - 8
  page.drawLine({
    start: { x: SIDE_MARGIN, y: separatorY },
    end: { x: PAGE_WIDTH - SIDE_MARGIN, y: separatorY },
    thickness: 1.5,
    color: rgb(0.1, 0.23, 0.36), // dark navy blue
  })

  // Return the Y position where document content should start
  headerBottomY = separatorY - 20
  return headerBottomY
}

export async function generateDocumentPdf(
  templateContent: string,
  fields: Record<string, string>,
  signatureBase64?: string,
  headerSettings?: DocumentHeaderSettings | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const renderedContent = substituteVariables(templateContent, fields)
  const paragraphs = renderedContent.split('\n')

  const contentWidth = PAGE_WIDTH - SIDE_MARGIN * 2

  // First page with header
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y: number

  if (headerSettings) {
    y = await drawHeader(page, pdfDoc, font, boldFont, headerSettings)
  } else {
    y = PAGE_HEIGHT - TOP_MARGIN
  }

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      y -= LINE_HEIGHT
      if (y < BOTTOM_MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - TOP_MARGIN
      }
      continue
    }

    // Detect section headers (lines starting with a number and period)
    const isHeader = /^\d+\.\s/.test(paragraph.trim())
    const currentFont = isHeader ? boldFont : font
    const currentSize = isHeader ? FONT_SIZE + 1 : FONT_SIZE

    const lines = wrapText(paragraph.trim(), currentFont, currentSize, contentWidth)

    for (const line of lines) {
      if (y < BOTTOM_MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = PAGE_HEIGHT - TOP_MARGIN
      }

      page.drawText(line, {
        x: SIDE_MARGIN,
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
    const sigY = Math.max(BOTTOM_MARGIN, y - sigHeight - 20)

    lastPage.drawText('Signature:', {
      x: SIDE_MARGIN,
      y: sigY + sigHeight + 10,
      size: FONT_SIZE,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    lastPage.drawImage(signatureImage, {
      x: SIDE_MARGIN,
      y: sigY,
      width: sigWidth,
      height: sigHeight,
    })

    // Add signed date below signature
    lastPage.drawText(`Signed: ${new Date().toLocaleDateString('en-AE')}`, {
      x: SIDE_MARGIN,
      y: sigY - 15,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  return await pdfDoc.save()
}
