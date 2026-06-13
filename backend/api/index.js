import app from '../server.js'

// Vercel will call this function for each serverless request.
// We simply forward the Node request/response to the Express app.
export default function handler(req, res) {
  return app(req, res)
}
