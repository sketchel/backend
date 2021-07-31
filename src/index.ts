import { 
    RootRouter,    
} from './routes'
import express from 'express'
import db from './database'
import 'dotenv/config'

const app = express()
new db()

app.listen(process.env.SERVER_PORT, () => console.log('Listening on port', process.env.SERVER_PORT))