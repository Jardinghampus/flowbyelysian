import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 2,
  },
  headerRight: {
    textAlign: "right",
  },
  headerLabel: {
    fontSize: 8,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerValue: {
    fontSize: 10,
    color: "#000000",
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: "#444444",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000000",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 3,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
    minHeight: 28,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
    minHeight: 28,
    backgroundColor: "#fafafa",
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 8,
    color: "#333333",
    paddingHorizontal: 4,
  },
  tableCellBold: {
    fontSize: 8,
    color: "#000000",
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#999999",
  },
  pageNumber: {
    fontSize: 7,
    color: "#999999",
  },
  disclaimer: {
    fontSize: 7,
    color: "#888888",
    textAlign: "center",
    marginBottom: 16,
  },
  propertyCard: {
    borderWidth: 1,
    borderColor: "#dddddd",
    marginBottom: 12,
    padding: 12,
  },
  propertyTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 6,
  },
  propertyDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  propertyDetail: {
    width: "24%",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 7,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 9,
    color: "#000000",
    fontWeight: "bold",
    marginTop: 1,
  },
  badge: {
    fontSize: 7,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
})

export interface ClientListingItem {
  title: string
  area: string
  type: string
  size: number
  price: number
  transactionType: string
  bedrooms?: number
  bathrooms?: number
  availability?: string
}

export interface ClientInventoryReportData {
  listings: ClientListingItem[]
  reportDate: string
  filterSummary?: string
}

interface ClientInventoryReportProps {
  data: ClientInventoryReportData
}

const LISTINGS_PER_TABLE_PAGE = 12
const LISTINGS_PER_CARD_PAGE = 5

export function ClientInventoryReport({ data }: ClientInventoryReportProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`
    return `AED ${amount.toLocaleString()}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const totalListings = data.listings.length
  const saleListings = data.listings.filter((l) => l.transactionType === "sale")
  const rentListings = data.listings.filter((l) => l.transactionType === "rent")

  const avgPrice = totalListings > 0
    ? data.listings.reduce((sum, l) => sum + l.price, 0) / totalListings
    : 0

  const tablePages: ClientListingItem[][] = []
  for (let i = 0; i < data.listings.length; i += LISTINGS_PER_TABLE_PAGE) {
    tablePages.push(data.listings.slice(i, i + LISTINGS_PER_TABLE_PAGE))
  }

  const cardPages: ClientListingItem[][] = []
  for (let i = 0; i < data.listings.length; i += LISTINGS_PER_CARD_PAGE) {
    cardPages.push(data.listings.slice(i, i + LISTINGS_PER_CARD_PAGE))
  }

  return (
    <Document>
      {/* PAGE 1: Overview + Table */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.disclaimer}>Prepared for Client Use Only</Text>

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Zaylo</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Report Date</Text>
            <Text style={styles.headerValue}>{formatDate(data.reportDate)}</Text>
          </View>
        </View>

        <Text style={styles.title}>Available Properties</Text>
        {data.filterSummary && (
          <Text style={styles.subtitle}>{data.filterSummary}</Text>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalListings}</Text>
            <Text style={styles.summaryLabel}>Properties</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{saleListings.length}</Text>
            <Text style={styles.summaryLabel}>For Sale</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{rentListings.length}</Text>
            <Text style={styles.summaryLabel}>For Rent</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatCurrency(avgPrice)}</Text>
            <Text style={styles.summaryLabel}>Avg Price</Text>
          </View>
        </View>

        {/* Listings Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Property</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Area</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%" }]}>Type</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "right" }]}>Size</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { width: "8%" }]}>BR</Text>
            <Text style={[styles.tableHeaderCell, { width: "8%" }]}>BA</Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>For</Text>
          </View>
          {(tablePages[0] || []).map((listing, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCellBold, { width: "25%" }]}>
                {listing.title}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {listing.area}
              </Text>
              <Text style={[styles.tableCell, { width: "10%", textTransform: "capitalize" }]}>
                {listing.type}
              </Text>
              <Text style={[styles.tableCell, { width: "10%", textAlign: "right" }]}>
                {listing.size.toLocaleString()}
              </Text>
              <Text style={[styles.tableCellBold, { width: "15%", textAlign: "right" }]}>
                {formatCurrency(listing.price)}
              </Text>
              <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
                {listing.bedrooms ?? "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
                {listing.bathrooms ?? "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "9%", textTransform: "capitalize" }]}>
                {listing.transactionType}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Zaylo</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* Additional table pages if needed */}
      {tablePages.slice(1).map((pageListings, pageIdx) => (
        <Page key={`table-${pageIdx}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>Zaylo</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerLabel}>Available Properties</Text>
              <Text style={styles.headerValue}>Continued</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Property</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Area</Text>
              <Text style={[styles.tableHeaderCell, { width: "10%" }]}>Type</Text>
              <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "right" }]}>Size</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Price</Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>BR</Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>BA</Text>
              <Text style={[styles.tableHeaderCell, { width: "9%" }]}>For</Text>
            </View>
            {pageListings.map((listing, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCellBold, { width: "25%" }]}>
                  {listing.title}
                </Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {listing.area}
                </Text>
                <Text style={[styles.tableCell, { width: "10%", textTransform: "capitalize" }]}>
                  {listing.type}
                </Text>
                <Text style={[styles.tableCell, { width: "10%", textAlign: "right" }]}>
                  {listing.size.toLocaleString()}
                </Text>
                <Text style={[styles.tableCellBold, { width: "15%", textAlign: "right" }]}>
                  {formatCurrency(listing.price)}
                </Text>
                <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
                  {listing.bedrooms ?? "—"}
                </Text>
                <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
                  {listing.bathrooms ?? "—"}
                </Text>
                <Text style={[styles.tableCell, { width: "9%", textTransform: "capitalize" }]}>
                  {listing.transactionType}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Generated by Zaylo</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            />
          </View>
        </Page>
      ))}

      {/* DETAIL PAGES: Property Cards */}
      {cardPages.map((pageListings, pageIdx) => (
        <Page key={`cards-${pageIdx}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>Zaylo</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerLabel}>Property Details</Text>
              <Text style={styles.headerValue}>
                {pageIdx * LISTINGS_PER_CARD_PAGE + 1}–{Math.min((pageIdx + 1) * LISTINGS_PER_CARD_PAGE, totalListings)} of {totalListings}
              </Text>
            </View>
          </View>

          {pageListings.map((listing, i) => (
            <View key={i} style={styles.propertyCard}>
              <Text style={styles.propertyTitle}>{listing.title}</Text>
              <View style={styles.propertyDetails}>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Area</Text>
                  <Text style={styles.detailValue}>{listing.area}</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={{ ...styles.detailValue, textTransform: "capitalize" }}>{listing.type}</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Size</Text>
                  <Text style={styles.detailValue}>{listing.size.toLocaleString()} sqft</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(listing.price)}
                    {listing.transactionType === "rent" ? "/yr" : ""}
                  </Text>
                </View>
                {listing.bedrooms != null && (
                  <View style={styles.propertyDetail}>
                    <Text style={styles.detailLabel}>Bedrooms</Text>
                    <Text style={styles.detailValue}>{listing.bedrooms}</Text>
                  </View>
                )}
                {listing.bathrooms != null && (
                  <View style={styles.propertyDetail}>
                    <Text style={styles.detailLabel}>Bathrooms</Text>
                    <Text style={styles.detailValue}>{listing.bathrooms}</Text>
                  </View>
                )}
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Transaction</Text>
                  <Text style={styles.detailValue}>
                    {listing.transactionType === "sale" ? "For Sale" : "For Rent"}
                  </Text>
                </View>
                {listing.availability && (
                  <View style={styles.propertyDetail}>
                    <Text style={styles.detailLabel}>Availability</Text>
                    <Text style={styles.detailValue}>{listing.availability}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Generated by Zaylo</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            />
          </View>
        </Page>
      ))}
    </Document>
  )
}
