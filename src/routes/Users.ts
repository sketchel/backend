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

UsersRouter.route('/').all(async (req, res) => {
  res.status(200).json({
    status: 200,
    route: '/users',
    message: 'Hello World!'
  })
})

UsersRouter.route('/:id').get(async (req, res) => {
  let user = await getUser(req)
  console.log(user)
})


export default UsersRouter