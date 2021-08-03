import { Request, Response, NextFunction } from 'express'
import Session from '../models/Session'
import User from '../models/User'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    let sessionToken: string | undefined
    if (req.get('Authorization')) sessionToken = req.get('Authorization')
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
    let sess = await Session.findOne({
      sessionString: sessionToken
    }).exec()
    let user = await User.findOne({
      _id: sess.userId
    }).exec()
    req.user = user
    req.loggedIn = true
    return next()
}