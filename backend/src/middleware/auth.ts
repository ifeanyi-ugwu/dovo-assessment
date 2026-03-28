import type { Request, Response, NextFunction } from 'express'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase.js'

export interface AuthenticatedRequest extends Request {
  user: User
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' })
    return
  }

  // slice(7) instead of split(' ')[1] — avoids noUncheckedIndexedAccess error on array index
  const token = authHeader.slice(7)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  ;(req as AuthenticatedRequest).user = data.user
  next()
}
