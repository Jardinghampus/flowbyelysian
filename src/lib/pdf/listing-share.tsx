import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ShareableListing } from "@/lib/listings/share"
import { formatListingPrice } from "@/lib/listings/share"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  meta: {
    fontSize: 9,
    color: "#666666",
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#444444",
    marginBottom: 18,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  badge: {
    fontSize: 9,
    borderWidth: 1,
    borderColor: "#111111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  cell: {
    width: "50%",
    marginBottom: 12,
  },
  label: {
    fontSize: 8,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#888888",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>FLOW</Text>
          <View>
            <Text style={styles.meta}>Listing preview for colleagues</Text>
            <Text style={styles.meta}>{sharedAt}</Text>
          </View>
        </View>

        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.subtitle}>
          {[listing.area, listing.subArea].filter(Boolean).join(" · ")}
        </Text>

        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{listing.transactionType}</Text>
          <Text style={styles.badge}>{listing.type}</Text>
          <Text style={styles.badge}>{listing.status}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.label}>Price</Text>
            <Text style={styles.value}>
              {formatListingPrice(listing.price, listing.transactionType)}
            </Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>
              {listing.size != null ? `${listing.size.toLocaleString()} sqft` : "—"}
            </Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Beds / Baths</Text>
            <Text style={styles.value}>
              {listing.bedrooms ?? "—"} / {listing.bathrooms ?? "—"}
            </Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Listing agent</Text>
            <Text style={styles.value}>{listing.agentName}</Text>
          </View>
        </View>

        {(listing.propertyFinderUrl || listing.googleMapsUrl) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links</Text>
            {listing.propertyFinderUrl ? (
              <Text style={{ fontSize: 9, marginBottom: 4 }}>PF: {listing.propertyFinderUrl}</Text>
            ) : null}
            {listing.googleMapsUrl ? (
              <Text style={{ fontSize: 9 }}>Maps: {listing.googleMapsUrl}</Text>
            ) : null}
          </View>
        )}

        {note ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note from colleague</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{note}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Shared by {sharedBy} via Flow · Internal preview — not a public marketing brochure
        </Text>
      </Page>
    </Document>
  )
}
