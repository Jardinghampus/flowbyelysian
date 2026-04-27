import PDFKit
import UIKit

// Generates branded PDF reports using PDFKit + UIGraphicsPDFRenderer.
// Returns Data that can be shared via ShareLink / UIActivityViewController.

struct PDFGenerator {

    // MARK: - Landlord Report

    static func landlordReport(listings: [Listing], agentName: String) -> Data {
        let pageRect = CGRect(x: 0, y: 0, width: 595, height: 842)  // A4 points
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

        return renderer.pdfData { ctx in
            ctx.beginPage()
            let draw = PDFDraw(ctx: ctx, page: pageRect)

            // Header
            draw.header(title: "Landlord Portfolio Report",
                        subtitle: "Prepared by \(agentName)",
                        date: .now)

            var y: CGFloat = 140

            // Listings table
            draw.sectionTitle("Property Inventory", y: y); y += 32

            for listing in listings {
                if y > pageRect.height - 100 { ctx.beginPage(); y = 60 }
                y = draw.listingRow(listing: listing, y: y)
            }

            // Summary
            if y > pageRect.height - 160 { ctx.beginPage(); y = 60 }
            y += 20
            draw.sectionTitle("Summary", y: y); y += 32
            let liveCount = listings.filter { $0.status == "live" }.count
            let totalValue = listings.compactMap { $0.price }.reduce(0, +)
            draw.keyValue("Live listings:", "\(liveCount)", y: y); y += 24
            draw.keyValue("Total portfolio value:", formatCurrency(totalValue), y: y); y += 24
            draw.keyValue("Total properties:", "\(listings.count)", y: y)

            draw.footer(pageRect: pageRect)
        }
    }

    // MARK: - Inventory Report

    static func inventoryReport(listings: [Listing], agentName: String) -> Data {
        let pageRect = CGRect(x: 0, y: 0, width: 595, height: 842)
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

        return renderer.pdfData { ctx in
            ctx.beginPage()
            let draw = PDFDraw(ctx: ctx, page: pageRect)

            draw.header(title: "Inventory Report",
                        subtitle: "Derrick Signature Properties · \(agentName)",
                        date: .now)

            var y: CGFloat = 140

            // Group by type
            let grouped = Dictionary(grouping: listings) { $0.type ?? "Other" }
            for (type, items) in grouped.sorted(by: { $0.key < $1.key }) {
                if y > pageRect.height - 120 { ctx.beginPage(); y = 60 }
                draw.sectionTitle(type.capitalized, y: y); y += 28

                for listing in items {
                    if y > pageRect.height - 80 { ctx.beginPage(); y = 60 }
                    y = draw.inventoryRow(listing: listing, y: y)
                }
                y += 12
            }

            draw.footer(pageRect: pageRect)
        }
    }

    // MARK: - Performance Report

    static func performanceReport(listings: [Listing], requests: [ClientRequest], agentName: String) -> Data {
        let pageRect = CGRect(x: 0, y: 0, width: 595, height: 842)
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)

        return renderer.pdfData { ctx in
            ctx.beginPage()
            let draw = PDFDraw(ctx: ctx, page: pageRect)

            draw.header(title: "Agent Performance Report",
                        subtitle: agentName,
                        date: .now)

            var y: CGFloat = 140
            draw.sectionTitle("KPIs", y: y); y += 32

            let active   = requests.filter { $0.status == "active" }.count
            let matched  = requests.filter { $0.status == "matched" }.count
            let closed   = requests.filter { $0.status == "closed" }.count
            let convRate = requests.isEmpty ? 0.0 : Double(matched + closed) / Double(requests.count) * 100

            draw.keyValue("Total listings:",         "\(listings.count)",        y: y); y += 24
            draw.keyValue("Active client requests:", "\(active)",                y: y); y += 24
            draw.keyValue("Matched / Closed:",       "\(matched) / \(closed)",   y: y); y += 24
            draw.keyValue("Conversion rate:",        String(format: "%.0f%%", convRate), y: y)

            draw.footer(pageRect: pageRect)
        }
    }

    private static func formatCurrency(_ value: Double) -> String {
        value >= 1_000_000
            ? String(format: "AED %.2fM", value / 1_000_000)
            : String(format: "AED %.0f", value)
    }
}

// MARK: - Drawing helper

private struct PDFDraw {
    let ctx: UIGraphicsPDFRendererContext
    let page: CGRect

    private let brand = UIColor(red: 0.40, green: 0.34, blue: 0.96, alpha: 1)
    private let margin: CGFloat = 48

    func header(title: String, subtitle: String, date: Date) {
        // Background bar
        brand.setFill()
        UIRectFill(CGRect(x: 0, y: 0, width: page.width, height: 100))

        draw(title,
             font: .boldSystemFont(ofSize: 22),
             color: .white,
             rect: CGRect(x: margin, y: 20, width: page.width - margin * 2, height: 32))

        let formatter = DateFormatter()
        formatter.dateStyle = .long
        draw("\(subtitle) · \(formatter.string(from: date))",
             font: .systemFont(ofSize: 12),
             color: UIColor.white.withAlphaComponent(0.8),
             rect: CGRect(x: margin, y: 56, width: page.width - margin * 2, height: 20))
    }

    func sectionTitle(_ text: String, y: CGFloat) {
        brand.setFill()
        UIRectFill(CGRect(x: margin, y: y + 4, width: 3, height: 18))
        draw(text,
             font: .boldSystemFont(ofSize: 14),
             color: brand,
             rect: CGRect(x: margin + 10, y: y, width: page.width - margin * 2, height: 24))
    }

    func keyValue(_ key: String, _ value: String, y: CGFloat) {
        draw(key,
             font: .systemFont(ofSize: 11),
             color: .gray,
             rect: CGRect(x: margin, y: y, width: 200, height: 20))
        draw(value,
             font: .boldSystemFont(ofSize: 11),
             color: .black,
             rect: CGRect(x: margin + 200, y: y, width: 200, height: 20))
    }

    @discardableResult
    func listingRow(listing: Listing, y: CGFloat) -> CGFloat {
        let rowH: CGFloat = 44
        UIColor(white: 0.97, alpha: 1).setFill()
        UIRectFill(CGRect(x: margin, y: y, width: page.width - margin * 2, height: rowH - 4))

        draw(listing.title,
             font: .boldSystemFont(ofSize: 11),
             color: .black,
             rect: CGRect(x: margin + 6, y: y + 6, width: 220, height: 16))

        draw(listing.priceFormatted,
             font: .systemFont(ofSize: 11),
             color: UIColor(red: 0.40, green: 0.34, blue: 0.96, alpha: 1),
             rect: CGRect(x: margin + 230, y: y + 6, width: 120, height: 16))

        draw(listing.status?.capitalized ?? "",
             font: .systemFont(ofSize: 10),
             color: .gray,
             rect: CGRect(x: margin + 360, y: y + 6, width: 80, height: 16))

        draw("\(listing.bedrooms ?? 0) bd · \(Int(listing.size ?? 0)) sqft",
             font: .systemFont(ofSize: 10),
             color: .gray,
             rect: CGRect(x: margin + 6, y: y + 24, width: 300, height: 14))

        return y + rowH
    }

    @discardableResult
    func inventoryRow(listing: Listing, y: CGFloat) -> CGFloat {
        draw("• \(listing.title)",
             font: .systemFont(ofSize: 11),
             color: .black,
             rect: CGRect(x: margin + 10, y: y, width: 280, height: 16))
        draw(listing.priceFormatted,
             font: .systemFont(ofSize: 11),
             color: UIColor(red: 0.40, green: 0.34, blue: 0.96, alpha: 1),
             rect: CGRect(x: margin + 300, y: y, width: 160, height: 16))
        return y + 22
    }

    func footer(pageRect: CGRect) {
        let y = pageRect.height - 30
        UIColor.lightGray.setFill()
        UIRectFill(CGRect(x: margin, y: y, width: pageRect.width - margin * 2, height: 0.5))
        draw("Derrick Signature Properties · Confidential",
             font: .systemFont(ofSize: 9),
             color: .lightGray,
             rect: CGRect(x: margin, y: y + 6, width: 300, height: 16))
    }

    private func draw(_ text: String, font: UIFont, color: UIColor, rect: CGRect) {
        let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: color]
        text.draw(in: rect, withAttributes: attrs)
    }
}
