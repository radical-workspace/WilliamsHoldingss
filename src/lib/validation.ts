import { z } from 'zod'

export const depositSchema = z.object({
  asset: z.string().min(1),
  network: z.string().min(1),
  amount: z.coerce.number().positive(),
  sent_to_address: z.string().min(4),
  tx_proof: z.string().optional()
})

export const withdrawalSchema = z.object({
  asset: z.string().min(1),
  network: z.string().min(1),
  amount: z.coerce.number().positive(),
  destination_address: z.string().min(3)
}).superRefine((val, ctx) => {
  const isAch = val.asset === 'USD' && val.network === 'ACH'
  const isSwift = val.asset === 'USD' && val.network === 'SWIFT'
  if (isAch) {
    if (!/^ACH:\d{9}:\d{5,}:.+/.test(val.destination_address)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid ACH details', path: ['destination_address'] })
    }
    return
  }
  if (isSwift) {
    // Format: SWIFT:SWIFTBIC:IBAN_OR_ACCOUNT:NAME
    if (!/^SWIFT:[A-Z0-9]{8,11}:[A-Z0-9]{11,34}:.+/.test(val.destination_address)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid SWIFT/IBAN details', path: ['destination_address'] })
    }
    return
  }
  if (!/^(0x[a-fA-F0-9]{40}|bc1[a-zA-Z0-9]{25,48}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(val.destination_address)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid address format', path: ['destination_address'] })
  }
})
