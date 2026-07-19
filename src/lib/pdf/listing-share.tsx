import React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { ShareableListing } from "@/lib/listings/share"
import { formatListingPrice } from "@/lib/listings/share"

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0c0c0d",
    color: "#ffffff",
    fontFamily: "Helvetica",
  },
  heroWrap: {
    height: 320,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 320,
    objectFit: "cover",
  },
  heroFallback: {
    width: "100%",
    height: 320,
    backgroundColor: "#1a1a1c",
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 36,
    paddingBottom: 28,
    paddingTop: 80,
    backgroundColor: "rgba(12,12,13,0.55)",
  },
  brand: {
    position: "absolute",
    top: 24,
    left: 36,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "bold",
    color: "#ffffff",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    maxWidth: 480,
  },
  location: {
    fontSize: 11,
    color: "#d4d4d8",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 22,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  cell: {
    width: "48%",
    backgroundColor: "#17171a",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2a2a2e",
  },
  label: {
    fontSize: 8,
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 9,
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 6,
  },
  gallery: {
    marginBottom: 16,
  },
  galleryHeader: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 8,
  },
  galleryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  galleryCard: {
    width: "48%",
    height: 110,
    objectFit: "cover",
    borderRadius: 10,
  },
  agentCard: {
    marginTop: 8,
    backgroundColor: "#17171a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2a2a2e",
  },
  agentName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  agentMeta: {
    fontSize: 9,
    color: "#a1a1aa",
  },
  note: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.45,
    color: "#e4e4e7",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#71717a",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 8,
  },
})

export type ListingSharePdfProps = {
  listing: ShareableListing
  sharedBy: string
  sharedAt: string
  note?: string
}

export function ListingSharePdf({ listing, sharedBy, sharedAt, note }: ListingSharePdfProps) {
  const teaserImages = listing.images.slice(0, 5)
  const [headerImage, ...gridImages] = teaserImages
  const location = [listing.area, listing.subArea].filter(Boolean).join(" · ") || "Dubai"
  const beds =
    listing.bedrooms === 0 ? "Studio" : listing.bedrooms != null ? String(listing.bedrooms) : "—"
  const baths = listing.bathrooms != null ? String(listing.bathrooms) : "—"
  const size = listing.size != null ? `${listing.size.toLocaleString()} sqft` : "—"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.heroWrap}>
          <View style={styles.heroFallback} />
          <Text style={styles.brand}>ZAYLO</Text>
          <View style={styles.heroOverlay}>
            <View style={styles.badgeRow}>
              <Text style={styles.badge}>{listing.transactionType}</Text>
              <Text style={styles.badge}>{listing.type}</Text>
              <Text style={styles.badge}>{listing.status}</Text>
            </View>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.location}>{location}</Text>
            <Text style={styles.price}>
              {formatListingPrice(listing.price, listing.transactionType)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.grid}>
            <View style={styles.cell}>
              <Text style={styles.label}>Bedrooms</Text>
              <Text style={styles.value}>{beds}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Bathrooms</Text>
              <Text style={styles.value}>{baths}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Built-up</Text>
              <Text style={styles.value}>{size}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.label}>Listing agent</Text>
              <Text style={styles.value}>{listing.agentName || "Agent"}</Text>
            </View>
          </View>

          {listing.availability ? (
            <View>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={{ fontSize: 10, color: "#e4e4e7", marginBottom: 12 }}>
                {listing.availability}
              </Text>
            </View>
          ) : null}

          {teaserImages.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Property photos</Text>
              <View style={styles.gallery}>
                {headerImage ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={headerImage} style={styles.galleryHeader} />
                ) : null}
                {[0, 2].map((rowStart) => {
                  const row = gridImages.slice(rowStart, rowStart + 2)
                  if (!row.length) return null
                  return (
                    <View key={rowStart} style={styles.galleryRow}>
                      {row.map((src) => (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image key={src} src={src} style={styles.galleryCard} />
                      ))}
                    </View>
                  )
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.agentCard}>
            <Text style={styles.sectionTitle}>Presented by</Text>
            <Text style={styles.agentName}>{listing.agentName}</Text>
            <Text style={styles.agentMeta}>
              Shared via Zaylo by {sharedBy} · {sharedAt}
            </Text>
            {note ? <Text style={styles.note}>{note}</Text> : null}
          </View>
        </View>

        <Text style={styles.footer}>
          Zaylo listing flyer · Property facts only — owner contacts are not included
        </Text>
      </Page>
    </Document>
  )
}
