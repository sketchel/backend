import { Router } from 'express'
import bodyParser from 'body-parser'

const RootRouter = Router()
RootRouter.use(bodyParser.json())

RootRouter.route('/').all((req, res) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: 'Hello World!'
  })
})

export default RootRouter