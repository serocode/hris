import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { API_PORT } from './constants/env'
import { auth } from './lib/auth'

const app = new Hono()

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .get('/', (c) => {
    return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: API_PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
