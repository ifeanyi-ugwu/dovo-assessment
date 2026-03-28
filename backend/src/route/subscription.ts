import { Router } from 'express'
import type { Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const subscriptionRouter: Router = Router()

subscriptionRouter.get(
  '/subscription-status',
  requireAuth,
  (req: Request, res: Response): void => {
    const { user } = req as AuthenticatedRequest
    res.json({
      status: 'active',
      plan: {
        id: 'glp1_monthly',
        name: 'GLP-1 Therapeutic Plan',
        interval: 'monthly',
        amount: 45000, // kobo — Paystack's unit for NGN (1 NGN = 100 kobo)
        currency: 'NGN',
      },
      subscription: {
        id: 'SUB_mock_8f3a2b1c',
        // Derived from the authed user's UUID so the mock feels real
        customer_code: `CUS_${user.id.slice(0, 8)}`,
        status: 'active',
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    })
  },
)
