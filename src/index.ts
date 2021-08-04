import { 
    RootRouter,
    AccountRouter,
    UsersRouter,   
    ApiRouter
} from './routes'
import express from 'express'
import cors from 'cors'
import db from './database'
import 'dotenv/config'

const app = express()
app.use(cors())
new db()

app.use('/', RootRouter)
app.use('/api', ApiRouter)
app.use('/account', AccountRouter)
app.use('/users', UsersRouter)

app.listen(process.env.SERVER_PORT, () => console.log('Listening on port', process.env.SERVER_PORT))