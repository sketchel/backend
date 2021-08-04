import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { authMiddleware } from '../middleware/UserMiddleware'

import Session from '../models/Session'

const UsersRouter = Router()
UsersRouter.use(bodyParser.json())
UsersRouter.use(authMiddleware)

async function getUser(req: express.Request) {
  let user = req.user
  return user
}

UsersRouter.route('/').all(async (req, res) => {
  res.status(200).json({
    status: 200,
    route: '/users',
    message: 'Hello World!'
  })
})

UsersRouter.route('/:id').get(async (req, res) => {
  let user = await getUser(req)
  return res.status(200).json({
    success: true,
    status: 200,
    message: 'done',
    user: user,
  })
})

UsersRouter.route('/logout').get(async (req, res) => {
  let sess = await Session.findOne({
    sessionString: req.get('Authorization')
  }).exec()
  await sess.remove()
  return res.status(200).json({
    status: 200,
    success: true,
    message: 'Authentication required',
    errors: [
      'Successfully removed your session',
    ],
  })
})

export default UsersRouter