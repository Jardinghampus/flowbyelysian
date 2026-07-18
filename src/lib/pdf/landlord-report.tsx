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
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportSubtitle: {
    fontSize: 11,
    color: "#444444",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Property details grid
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    width: "25%",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 8,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "bold",
    marginTop: 2,
  },
  // KPI cards
  kpiRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#000000",
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  // Table styles
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 9,
    color: "#333333",
  },
  // Timeline
  timelineItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000000",
    marginTop: 4,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 8,
    color: "#888888",
  },
  timelineText: {
    fontSize: 9,
    color: "#333333",
    marginTop: 2,
  },
  timelineStatus: {
    fontSize: 8,
    color: "#000000",
    fontWeight: "bold",
    marginTop: 1,
  },
  // Notes box
  notesBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#cccccc",
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 8,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.5,
  },
  // Lead source breakdown
  sourceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  sourceLabel: {
    fontSize: 9,
    color: "#333333",
  },
  sourceValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  // Footer
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
  // Confidential stamp
  confidential: {
    fontSize: 7,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 16,
  },
  // Bar chart simulation
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 8,
    color: "#666666",
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 8,
  },
  bar: {
    height: 12,
    backgroundColor: "#000000",
  },
  barValue: {
    fontSize: 8,
    color: "#000000",
    fontWeight: "bold",
    width: 24,
    textAlign: "right",
  },
})

export interface ViewingEntry {
  date: string
  viewerName: string
  status: string
  feedback: string
  rating: number | null
}

export interface LeadEntry {
  name: string
  source: string
  status: string
  date: string
  budget: number | null
}

export interface LandlordReportData {
  // Property info
  propertyTitle: string
  propertyType: string
  area: string
  bedrooms: number
  bathrooms: number
  size: number
  price: number
  transactionType: string
  availability: string
  listingStatus: string
  daysOnMarket: number
  // Agent info
  agentName: string
  agentPhone: string
  agentEmail: string
  // Report content
  reportDate: string
  reportTitle: string
  pricingNotes: string
  marketSummary: string
  agentNotes: string
  recommendations: string
  // Data
  leads: LeadEntry[]
  viewings: ViewingEntry[]
  // Aggregated stats
  totalLeads: number
  totalViewings: number
  totalInquiries: number
  avgInterestRating: number
  // Lead source breakdown
  leadSources: { source: string; count: number }[]
}

interface LandlordReportProps {
  data: LandlordReportData
}

export function LandlordReport({ data }: LandlordReportProps) {
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

  const maxSourceCount = Math.max(...data.leadSources.map((s) => s.count), 1)

  return (
    <Document>
      {/* PAGE 1: Property Overview & KPIs */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.confidential}>Confidential - Investor Brief</Text>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Zaylo</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Report Date</Text>
            <Text style={styles.headerValue}>{formatDate(data.reportDate)}</Text>
            <Text style={{ ...styles.headerLabel, marginTop: 6 }}>Prepared By</Text>
            <Text style={styles.headerValue}>{data.agentName}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.reportTitle}>
          {data.reportTitle || "Landlord Property Report"}
        </Text>
        <Text style={styles.reportSubtitle}>{data.propertyTitle}</Text>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{data.propertyType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Area</Text>
              <Text style={styles.detailValue}>{data.area}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bedrooms</Text>
              <Text style={styles.detailValue}>{data.bedrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bathrooms</Text>
              <Text style={styles.detailValue}>{data.bathrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{data.size.toLocaleString()} sqft</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Asking Price</Text>
              <Text style={styles.detailValue}>{formatCurrency(data.price)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Transaction</Text>
              <Text style={styles.detailValue}>{data.transactionType === "sale" ? "For Sale" : "For Rent"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Availability</Text>
              <Text style={styles.detailValue}>{data.availability || "Immediate"}</Text>
            </View>
          </View>
        </View>

        {/* KPI Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.totalLeads}</Text>
              <Text style={styles.kpiLabel}>Total Leads</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.totalViewings}</Text>
              <Text style={styles.kpiLabel}>Viewings</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.daysOnMarket}</Text>
              <Text style={styles.kpiLabel}>Days on Market</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>
                {data.avgInterestRating > 0 ? `${data.avgInterestRating.toFixed(1)}/5` : "N/A"}
              </Text>
              <Text style={styles.kpiLabel}>Avg Interest</Text>
            </View>
          </View>
        </View>

        {/* Lead Sources */}
        {data.leadSources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lead Sources</Text>
            {data.leadSources.map((source, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{source.source}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={{
                      ...styles.bar,
                      width: `${(source.count / maxSourceCount) * 100}%`,
                    }}
                  />
                </View>
                <Text style={styles.barValue}>{source.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing Notes */}
        {data.pricingNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Commentary</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{data.pricingNotes}</Text>
            </View>
          </View>
        )}

        {/* Market Summary */}
        {data.marketSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Summary</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{data.marketSummary}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Zaylo | {data.agentName} | {data.agentPhone}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* PAGE 2: Viewings Timeline & Leads */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Zaylo</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Property</Text>
            <Text style={styles.headerValue}>{data.propertyTitle}</Text>
          </View>
        </View>

        {/* Viewings Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viewings Timeline</Text>
          {data.viewings.length === 0 ? (
            <Text style={styles.notesText}>No viewings recorded yet.</Text>
          ) : (
            data.viewings.map((viewing, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDate(viewing.date)}</Text>
                  <Text style={styles.timelineText}>
                    {viewing.viewerName}
                    {viewing.rating ? ` — Interest: ${viewing.rating}/5` : ""}
                  </Text>
                  <Text style={styles.timelineStatus}>{viewing.status.toUpperCase()}</Text>
                  {viewing.feedback && (
                    <Text style={{ ...styles.notesText, marginTop: 2, fontStyle: "italic" }}>
                      &quot;{viewing.feedback}&quot;
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Leads Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leads Overview</Text>
          {data.leads.length === 0 ? (
            <Text style={styles.notesText}>No leads recorded yet.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Name</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Source</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Budget</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Date</Text>
              </View>
              {data.leads.map((lead, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "25%" }]}>{lead.name}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{lead.source}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{lead.status}</Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {lead.budget ? formatCurrency(lead.budget) : "—"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{formatDate(lead.date)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recommendations */}
        {data.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{data.recommendations}</Text>
            </View>
          </View>
        )}

        {/* Agent Notes */}
        {data.agentNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agent Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{data.agentNotes}</Text>
            </View>
          </View>
        )}

        {/* Agent Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Agent</Text>
          <View style={styles.detailsGrid}>
            <View style={{ ...styles.detailItem, width: "33%" }}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{data.agentName}</Text>
            </View>
            <View style={{ ...styles.detailItem, width: "33%" }}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{data.agentPhone || "—"}</Text>
            </View>
            <View style={{ ...styles.detailItem, width: "33%" }}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{data.agentEmail || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Zaylo | {data.agentName} | {data.agentPhone}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}

export type { LandlordReportData as LandlordReportDataType }
