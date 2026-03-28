import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { subscriptionRouter } from './route/subscription.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 86400,
}))
app.use(express.json())

app.use('/api', subscriptionRouter)

// Express 5 requires the 4-param signature to recognise error middleware
app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`)
})
