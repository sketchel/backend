import { Request, Response, NextFunction } from 'express'
import Session from '../models/Session'
import User from '../models/User'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    let sessionToken: string | undefined
    if (req.headers.authorization) sessionToken = req.headers.authorization
    if (req.query && req.query.auth) sessionToken = req.query.auth as string
    if (req.body && req.body.auth) sessionToken = req.body.auth
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [
          'We could not find a session request in your request, please recheck your status and try again.',
        ],
      })
    }
    if (!sessionToken.startsWith('Bearer ')) {
      return res.status(401).json({
          success: false,
          message: 'Authentication required',
          errors: [
              'Not a valid session token.',
          ],
      })
    }
    

    
}