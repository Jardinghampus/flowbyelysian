"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Calculator, TrendingDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MortgageCalculatorProps {
  isOpen: boolean
  onClose: () => void
  defaultPrice?: number
}

export function MortgageCalculator({
  isOpen,
  onClose,
  defaultPrice = 5000000,
}: MortgageCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice.toString())
  const [downPaymentPercent, setDownPaymentPercent] = useState("20")
  const [interestRate, setInterestRate] = useState("4.99")
  const [termYears, setTermYears] = useState("25")

  const result = useMemo(() => {
    const p = parseFloat(price) || 0
    const dp = (parseFloat(downPaymentPercent) || 0) / 100
    const rate = (parseFloat(interestRate) || 0) / 100 / 12
    const n = (parseInt(termYears) || 25) * 12

    const loanAmount = p * (1 - dp)
    const downPayment = p * dp

    if (rate === 0 || n === 0 || loanAmount === 0) {
      return { monthly: 0, total: 0, totalInterest: 0, loanAmount, downPayment }
    }

    const monthly = (loanAmount * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
    const total = monthly * n
    const totalInterest = total - loanAmount

    // DLD transfer fee (4%)
    const transferFee = p * 0.04
    // Agent commission (2%)
    const agentFee = p * 0.02

    return {
      monthly: Math.round(monthly),
      total: Math.round(total),
      totalInterest: Math.round(totalInterest),
      loanAmount: Math.round(loanAmount),
      downPayment: Math.round(downPayment),
      transferFee: Math.round(transferFee),
      agentFee: Math.round(agentFee),
      totalUpfront: Math.round(downPayment + transferFee + agentFee),
    }
  }, [price, downPaymentPercent, interestRate, termYears])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Mortgage Calculator</h3>
                    <p className="text-[11px] text-muted-foreground">UAE mortgage estimation</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                    Property Price (AED)
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                      Down Payment %
                    </label>
                    <Input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                      Interest Rate %
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                      Term (years)
                    </label>
                    <Input
                      type="number"
                      value={termYears}
                      onChange={(e) => setTermYears(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex gap-1.5">
                  {[15, 20, 25].map((dp) => (
                    <button
                      key={dp}
                      onClick={() => setDownPaymentPercent(dp.toString())}
                      className={cn(
                        "text-[10px] px-3 py-1 rounded-full border transition-colors",
                        downPaymentPercent === dp.toString()
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-gray-500 dark:text-neutral-400 hover:bg-secondary"
                      )}
                    >
                      {dp}% Down
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="px-4 pb-4 space-y-3">
                {/* Monthly payment highlight */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    AED {result.monthly.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                    for {termYears} years
                  </p>
                </div>

                {/* Breakdown grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <p className="text-gray-500 dark:text-neutral-400 text-[10px]">Loan Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">AED {result.loanAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <p className="text-gray-500 dark:text-neutral-400 text-[10px]">Total Interest</p>
                    <p className="font-semibold text-gray-900 dark:text-white">AED {result.totalInterest.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <p className="text-gray-500 dark:text-neutral-400 text-[10px]">DLD Transfer Fee (4%)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">AED {(result.transferFee ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <p className="text-gray-500 dark:text-neutral-400 text-[10px]">Agent Fee (2%)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">AED {(result.agentFee ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Total upfront */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Total Upfront Cost</span>
                    </div>
                    <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      AED {(result.totalUpfront ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                    Down payment + transfer fee + agent commission
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
