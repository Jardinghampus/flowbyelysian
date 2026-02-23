import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#0DC1FD",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0DC1FD",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1a1a1a",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fafafa",
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333333",
  },
  tableCell: {
    fontSize: 9,
    color: "#666666",
  },
  summaryBox: {
    backgroundColor: "#f0f9ff",
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  highlightBox: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 10,
    color: "#166534",
  },
  warningText: {
    fontSize: 10,
    color: "#92400e",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#999999",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  gridItem: {
    width: "50%",
    paddingRight: 10,
    marginBottom: 10,
  },
  kpiCard: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  kpiChange: {
    fontSize: 9,
    marginTop: 2,
  },
  positive: {
    color: "#22c55e",
  },
  negative: {
    color: "#ef4444",
  },
})

interface AgentPerformance {
  name: string
  role: string
  deals: number
  revenue: number
  commission: number
  listings: number
  viewings: number
  conversionRate: number
}

interface MonthlyReportData {
  month: string
  year: number
  companyName: string
  totalRevenue: number
  totalCommission: number
  totalDeals: number
  totalListings: number
  totalViewings: number
  avgConversionRate: number
  revenueChange: number
  dealsChange: number
  agents: AgentPerformance[]
  topPerformer: {
    name: string
    deals: number
    revenue: number
  }
  insights: string[]
  areasForImprovement: string[]
}

interface MonthlyReportProps {
  data: MonthlyReportData
}

export function MonthlyReport({ data }: MonthlyReportProps) {
  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ZFLOW</Text>
          <Text style={styles.subtitle}>by Zaylo</Text>
        </View>

        {/* Report Title */}
        <Text style={styles.title}>
          Monthly Performance Report - {data.month} {data.year}
        </Text>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Total Revenue</Text>
                  <Text style={styles.kpiValue}>{formatCurrency(data.totalRevenue)}</Text>
                  <Text style={[styles.kpiChange, data.revenueChange >= 0 ? styles.positive : styles.negative]}>
                    {formatPercentage(data.revenueChange)} vs last month
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Total Commission</Text>
                  <Text style={styles.kpiValue}>{formatCurrency(data.totalCommission)}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Deals Closed</Text>
                  <Text style={styles.kpiValue}>{data.totalDeals}</Text>
                  <Text style={[styles.kpiChange, data.dealsChange >= 0 ? styles.positive : styles.negative]}>
                    {formatPercentage(data.dealsChange)} vs last month
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Avg Conversion Rate</Text>
                  <Text style={styles.kpiValue}>{data.avgConversionRate.toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performer Highlight */}
        <View style={styles.section}>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              Top Performer: {data.topPerformer.name} - {data.topPerformer.deals} deals, {formatCurrency(data.topPerformer.revenue)} revenue
            </Text>
          </View>
        </View>

        {/* Agent Performance Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Performance Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Agent</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>Deals</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Revenue</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Commission</Text>
              <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Listings</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Conv. Rate</Text>
            </View>
            {data.agents.map((agent, index) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { width: "20%" }]}>{agent.name}</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>{agent.deals}</Text>
                <Text style={[styles.tableCell, { width: "18%" }]}>{formatCurrency(agent.revenue)}</Text>
                <Text style={[styles.tableCell, { width: "18%" }]}>{formatCurrency(agent.commission)}</Text>
                <Text style={[styles.tableCell, { width: "14%" }]}>{agent.listings}</Text>
                <Text style={[styles.tableCell, { width: "18%" }]}>{agent.conversionRate.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by ZFlow by Zaylo - {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 2 - Insights and Recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>ZFLOW</Text>
          <Text style={styles.subtitle}>by Zaylo</Text>
        </View>

        <Text style={styles.title}>Insights & Recommendations</Text>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {data.insights.map((insight, index) => (
            <View key={index} style={styles.highlightBox}>
              <Text style={styles.highlightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Areas for Improvement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          {data.areasForImprovement.map((area, index) => (
            <View key={index} style={styles.warningBox}>
              <Text style={styles.warningText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Listings Created</Text>
              <Text style={styles.summaryValue}>{data.totalListings}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Viewings Conducted</Text>
              <Text style={styles.summaryValue}>{data.totalViewings}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Agents</Text>
              <Text style={styles.summaryValue}>{data.agents.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Revenue per Agent</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(Math.round(data.totalRevenue / data.agents.length))}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by ZFlow by Zaylo - {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}

// Export type for use in API
export type { MonthlyReportData, AgentPerformance }
