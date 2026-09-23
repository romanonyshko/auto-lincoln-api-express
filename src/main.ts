// env must be imported first: it loads .env before anything reads process.env.
import { env } from './config/env.js'
import { createApp } from './app.js'

createApp().listen(env.port, () => {
  console.log(`api-express listening on http://localhost:${env.port}`)
})
