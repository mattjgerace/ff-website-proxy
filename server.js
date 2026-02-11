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
      const path = req.params.splat
      const url = `${BACKEND_URL}/${path.join('/')}`

      const response = await axios({
      method: req.method,
      url,
      params: req.query,
      headers: {
        Authorization: BACKEND_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: req.body,
      timeout: 60000
  })

    res.status(response.status).json(response.data)
  } catch (err) {
    if (err.response) {
      // Server replied with a status code (4xx/5xx)
      console.error('HTTP error:', err.response.status);
      throw new Error('Upstream API error');
    }
    else if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused');
      res.status(503).json(err.response?.data || {error: 'Service is asleep'})
      throw new Error('API service is down');
    }
    else if (err.code === 'ETIMEDOUT') {
      console.error('Connection timed out');
      res.status(504).json(err.response?.data || {error: 'API request timed out'})
      throw new Error('API request timed out');
    }
    else {
      console.error('Unknown Axios error:', err.message);
      res.status(err.response?.status || 500).json(err.response?.data || {error: 'Proxy error'})
      throw err;
    }
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`))