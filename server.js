require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(express.json())

app.use(cors({
  origin: process.env.FRONTEND_URL
}))

const BACKEND_URL = process.env.BACKEND_URL
const BACKEND_API_KEY = process.env.BACKEND_API_KEY

app.all('/*splat', async (req, res) => {
  try {
    const {
      host,
      origin,
      referer,
      'content-length': contentLength,
      ...safeHeaders
    } = req.headers
    const path = req.params.splat
    const url = `${BACKEND_URL}/${path.join('/')}`
    
    const response = await axios({
      method: req.method,
      url,
      params: req.query,
      headers: {
        ...safeHeaders,
        'Authorization': `${BACKEND_API_KEY}`,
        'Content-Type': 'application/json'
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