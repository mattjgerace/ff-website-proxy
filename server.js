require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(express.json())

// Only allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL
}))

const BACKEND_URL = process.env.BACKEND_URL
const BACKEND_API_KEY = process.env.BACKEND_API_KEY

// Proxy route example
app.all('/api/*', async (req, res) => {
  try {
    const url = `${BACKEND_URL}${req.path.replace(/^\/api/, '')}`
    
    const response = await axios({
      method: req.method,
      url,
      headers: {
        ...req.headers,
        'Authorization': `Bearer ${BACKEND_API_KEY}`
      },
      data: req.body
    })

    res.status(response.status).json(response.data)
  } catch (err) {
    console.error(err)
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Proxy error' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`))