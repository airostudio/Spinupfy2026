'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, DollarSign, Percent, Calendar, TrendingDown, Home, RefreshCw } from 'lucide-react'

interface LoanCalculatorProps {
  title?: string
  subtitle?: string
  defaultLoanAmount?: number
  defaultInterestRate?: number
  defaultLoanTerm?: number
  maxLoanAmount?: number
  showBreakdown?: boolean
  ctaText?: string
  ctaHref?: string
  theme?: 'light' | 'dark'
  variant?: 'standard' | 'compact' | 'detailed'
}

export function LoanCalculatorSection({
  title = 'Loan Calculator',
  subtitle = 'Calculate your monthly payments and see how much you could save',
  defaultLoanAmount = 350000,
  defaultInterestRate = 6.5,
  defaultLoanTerm = 30,
  maxLoanAmount = 2000000,
  showBreakdown = true,
  ctaText = 'Get Pre-Approved Today',
  ctaHref = '/contact',
  theme = 'dark',
  variant = 'standard',
}: LoanCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(defaultLoanAmount)
  const [interestRate, setInterestRate] = useState(defaultInterestRate)
  const [loanTerm, setLoanTerm] = useState(defaultLoanTerm)
  const [downPayment, setDownPayment] = useState(20)

  const calculations = useMemo(() => {
    const principal = loanAmount * (1 - downPayment / 100)
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyPayment = 0
    if (monthlyRate > 0) {
      monthlyPayment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    } else {
      monthlyPayment = principal / numberOfPayments
    }

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - principal

    return {
      principal,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPaymentAmount: loanAmount * (downPayment / 100),
    }
  }, [loanAmount, interestRate, loanTerm, downPayment])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white'
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const mutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const inputBgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
  const cardBgClass = theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 mb-6">
            <Calculator className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
            {title}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${mutedClass}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`rounded-2xl p-6 md:p-8 ${cardBgClass}`}
          >
            <h3 className={`text-xl font-semibold mb-6 ${textClass}`}>
              Loan Details
            </h3>

            {/* Loan Amount */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <Home className="w-4 h-4 inline mr-2" />
                Home Price
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedClass}`}>$</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.min(Number(e.target.value), maxLoanAmount))}
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
              <input
                type="range"
                min="50000"
                max={maxLoanAmount}
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full mt-2 accent-primary-500"
              />
              <div className={`flex justify-between text-xs mt-1 ${mutedClass}`}>
                <span>$50K</span>
                <span>${(maxLoanAmount / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <DollarSign className="w-4 h-4 inline mr-2" />
                Down Payment: {downPayment}% ({formatCurrency(calculations.downPaymentAmount)})
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className={`flex justify-between text-xs mt-1 ${mutedClass}`}>
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <Percent className="w-4 h-4 inline mr-2" />
                Interest Rate: {interestRate}%
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className={`flex justify-between text-xs mt-1 ${mutedClass}`}>
                <span>1%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                Loan Term
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTerm(term)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      loanTerm === term
                        ? 'bg-primary-500 text-white'
                        : `${inputBgClass} ${textClass} hover:bg-primary-500/20`
                    }`}
                  >
                    {term} Years
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setLoanAmount(defaultLoanAmount)
                setInterestRate(defaultInterestRate)
                setLoanTerm(defaultLoanTerm)
                setDownPayment(20)
              }}
              className={`flex items-center gap-2 text-sm ${mutedClass} hover:text-primary-500 transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
              Reset to defaults
            </button>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            {/* Monthly Payment Highlight */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-6">
              <p className="text-primary-100 text-sm font-medium mb-2">Estimated Monthly Payment</p>
              <p className="text-5xl font-bold mb-2">
                {formatCurrency(calculations.monthlyPayment)}
              </p>
              <p className="text-primary-200 text-sm">
                Principal + Interest only. Taxes and insurance not included.
              </p>
            </div>

            {/* Breakdown */}
            {showBreakdown && (
              <div className={`rounded-2xl p-6 ${cardBgClass} mb-6 flex-1`}>
                <h4 className={`text-lg font-semibold mb-4 ${textClass}`}>Loan Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={mutedClass}>Loan Amount</span>
                    <span className={`font-semibold ${textClass}`}>{formatCurrency(calculations.principal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={mutedClass}>Down Payment</span>
                    <span className={`font-semibold ${textClass}`}>{formatCurrency(calculations.downPaymentAmount)}</span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} my-2`} />
                  <div className="flex justify-between items-center">
                    <span className={mutedClass}>Total Interest</span>
                    <span className={`font-semibold text-orange-500`}>{formatCurrency(calculations.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={mutedClass}>Total of {loanTerm * 12} Payments</span>
                    <span className={`font-semibold ${textClass}`}>{formatCurrency(calculations.totalPayment)}</span>
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div className="mt-6">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500"
                      style={{ width: `${(calculations.principal / calculations.totalPayment) * 100}%` }}
                    />
                    <div
                      className="bg-orange-500"
                      style={{ width: `${(calculations.totalInterest / calculations.totalPayment) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className={mutedClass}>
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mr-1" />
                      Principal ({((calculations.principal / calculations.totalPayment) * 100).toFixed(0)}%)
                    </span>
                    <span className={mutedClass}>
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />
                      Interest ({((calculations.totalInterest / calculations.totalPayment) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <a
              href={ctaHref}
              className="block w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white text-center font-semibold rounded-xl transition-colors"
            >
              {ctaText}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default LoanCalculatorSection
