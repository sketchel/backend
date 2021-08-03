import express, { Router } from 'express'
import bodyParser from 'body-parser'
import { authMiddleware } from '../middleware/UserMiddleware'

const UsersRouter = Router()
UsersRouter.use(bodyParser.json())
UsersRouter.use(authMiddleware)

async function getUser(req: express.Request) {
  let user = req.user
  return user
}

UsersRouter.route('/').all((req, res) => {
  res.status(200).json({
    status: 200,
    route: '/users',
    message: 'Hello World!'
  })
})



export default UsersRouter