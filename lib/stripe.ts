import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Tax rates by location (can be expanded with more regions)
export const TAX_RATES: Record<string, { rate: number; name: string }> = {
  // US States
  US_AL: { rate: 0.04, name: 'Alabama Sales Tax' },
  US_AK: { rate: 0.00, name: 'Alaska Sales Tax' },
  US_AZ: { rate: 0.056, name: 'Arizona Sales Tax' },
  US_AR: { rate: 0.065, name: 'Arkansas Sales Tax' },
  US_CA: { rate: 0.0725, name: 'California Sales Tax' },
  US_CO: { rate: 0.029, name: 'Colorado Sales Tax' },
  US_CT: { rate: 0.0635, name: 'Connecticut Sales Tax' },
  US_DE: { rate: 0.00, name: 'Delaware Sales Tax' },
  US_FL: { rate: 0.06, name: 'Florida Sales Tax' },
  US_GA: { rate: 0.04, name: 'Georgia Sales Tax' },
  US_HI: { rate: 0.04, name: 'Hawaii General Excise Tax' },
  US_ID: { rate: 0.06, name: 'Idaho Sales Tax' },
  US_IL: { rate: 0.0625, name: 'Illinois Sales Tax' },
  US_IN: { rate: 0.07, name: 'Indiana Sales Tax' },
  US_IA: { rate: 0.06, name: 'Iowa Sales Tax' },
  US_KS: { rate: 0.065, name: 'Kansas Sales Tax' },
  US_KY: { rate: 0.06, name: 'Kentucky Sales Tax' },
  US_LA: { rate: 0.0445, name: 'Louisiana Sales Tax' },
  US_ME: { rate: 0.055, name: 'Maine Sales Tax' },
  US_MD: { rate: 0.06, name: 'Maryland Sales Tax' },
  US_MA: { rate: 0.0625, name: 'Massachusetts Sales Tax' },
  US_MI: { rate: 0.06, name: 'Michigan Sales Tax' },
  US_MN: { rate: 0.0688, name: 'Minnesota Sales Tax' },
  US_MS: { rate: 0.07, name: 'Mississippi Sales Tax' },
  US_MO: { rate: 0.04225, name: 'Missouri Sales Tax' },
  US_MT: { rate: 0.00, name: 'Montana Sales Tax' },
  US_NE: { rate: 0.055, name: 'Nebraska Sales Tax' },
  US_NV: { rate: 0.0685, name: 'Nevada Sales Tax' },
  US_NH: { rate: 0.00, name: 'New Hampshire Sales Tax' },
  US_NJ: { rate: 0.06625, name: 'New Jersey Sales Tax' },
  US_NM: { rate: 0.05125, name: 'New Mexico Sales Tax' },
  US_NY: { rate: 0.04, name: 'New York Sales Tax' },
  US_NC: { rate: 0.0475, name: 'North Carolina Sales Tax' },
  US_ND: { rate: 0.05, name: 'North Dakota Sales Tax' },
  US_OH: { rate: 0.0575, name: 'Ohio Sales Tax' },
  US_OK: { rate: 0.045, name: 'Oklahoma Sales Tax' },
  US_OR: { rate: 0.00, name: 'Oregon Sales Tax' },
  US_PA: { rate: 0.06, name: 'Pennsylvania Sales Tax' },
  US_RI: { rate: 0.07, name: 'Rhode Island Sales Tax' },
  US_SC: { rate: 0.06, name: 'South Carolina Sales Tax' },
  US_SD: { rate: 0.045, name: 'South Dakota Sales Tax' },
  US_TN: { rate: 0.07, name: 'Tennessee Sales Tax' },
  US_TX: { rate: 0.0625, name: 'Texas Sales Tax' },
  US_UT: { rate: 0.0485, name: 'Utah Sales Tax' },
  US_VT: { rate: 0.06, name: 'Vermont Sales Tax' },
  US_VA: { rate: 0.053, name: 'Virginia Sales Tax' },
  US_WA: { rate: 0.065, name: 'Washington Sales Tax' },
  US_WV: { rate: 0.06, name: 'West Virginia Sales Tax' },
  US_WI: { rate: 0.05, name: 'Wisconsin Sales Tax' },
  US_WY: { rate: 0.04, name: 'Wyoming Sales Tax' },
  US_DC: { rate: 0.06, name: 'D.C. Sales Tax' },

  // Canada Provinces
  CA_AB: { rate: 0.05, name: 'Alberta GST' },
  CA_BC: { rate: 0.12, name: 'British Columbia GST+PST' },
  CA_MB: { rate: 0.12, name: 'Manitoba GST+PST' },
  CA_NB: { rate: 0.15, name: 'New Brunswick HST' },
  CA_NL: { rate: 0.15, name: 'Newfoundland HST' },
  CA_NT: { rate: 0.05, name: 'Northwest Territories GST' },
  CA_NS: { rate: 0.15, name: 'Nova Scotia HST' },
  CA_NU: { rate: 0.05, name: 'Nunavut GST' },
  CA_ON: { rate: 0.13, name: 'Ontario HST' },
  CA_PE: { rate: 0.15, name: 'Prince Edward Island HST' },
  CA_QC: { rate: 0.14975, name: 'Quebec GST+QST' },
  CA_SK: { rate: 0.11, name: 'Saskatchewan GST+PST' },
  CA_YT: { rate: 0.05, name: 'Yukon GST' },

  // EU Countries (VAT)
  EU_AT: { rate: 0.20, name: 'Austria VAT' },
  EU_BE: { rate: 0.21, name: 'Belgium VAT' },
  EU_BG: { rate: 0.20, name: 'Bulgaria VAT' },
  EU_HR: { rate: 0.25, name: 'Croatia VAT' },
  EU_CY: { rate: 0.19, name: 'Cyprus VAT' },
  EU_CZ: { rate: 0.21, name: 'Czech Republic VAT' },
  EU_DK: { rate: 0.25, name: 'Denmark VAT' },
  EU_EE: { rate: 0.20, name: 'Estonia VAT' },
  EU_FI: { rate: 0.24, name: 'Finland VAT' },
  EU_FR: { rate: 0.20, name: 'France VAT' },
  EU_DE: { rate: 0.19, name: 'Germany VAT' },
  EU_GR: { rate: 0.24, name: 'Greece VAT' },
  EU_HU: { rate: 0.27, name: 'Hungary VAT' },
  EU_IE: { rate: 0.23, name: 'Ireland VAT' },
  EU_IT: { rate: 0.22, name: 'Italy VAT' },
  EU_LV: { rate: 0.21, name: 'Latvia VAT' },
  EU_LT: { rate: 0.21, name: 'Lithuania VAT' },
  EU_LU: { rate: 0.17, name: 'Luxembourg VAT' },
  EU_MT: { rate: 0.18, name: 'Malta VAT' },
  EU_NL: { rate: 0.21, name: 'Netherlands VAT' },
  EU_PL: { rate: 0.23, name: 'Poland VAT' },
  EU_PT: { rate: 0.23, name: 'Portugal VAT' },
  EU_RO: { rate: 0.19, name: 'Romania VAT' },
  EU_SK: { rate: 0.20, name: 'Slovakia VAT' },
  EU_SI: { rate: 0.22, name: 'Slovenia VAT' },
  EU_ES: { rate: 0.21, name: 'Spain VAT' },
  EU_SE: { rate: 0.25, name: 'Sweden VAT' },

  // UK
  GB: { rate: 0.20, name: 'UK VAT' },

  // Australia
  AU: { rate: 0.10, name: 'Australia GST' },

  // New Zealand
  NZ: { rate: 0.15, name: 'New Zealand GST' },

  // Default (no tax)
  DEFAULT: { rate: 0.00, name: 'No Tax' },
}

export function calculateTax(amount: number, taxCode: string): { tax: number; total: number; taxName: string; taxRate: number } {
  const taxInfo = TAX_RATES[taxCode] || TAX_RATES.DEFAULT
  const tax = amount * taxInfo.rate
  const total = amount + tax

  return {
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    taxName: taxInfo.name,
    taxRate: taxInfo.rate,
  }
}
