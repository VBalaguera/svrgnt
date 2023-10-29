// app.js
const express = require('express')
const multer = require('multer')
const csv_to_json = require('csvtojson')
const csv_parser = require('csv-parser')
const cors = require('cors')
const fs = require('fs')

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173',
}

app.use(cors(corsOptions))
const port = 3001

// Set up a storage engine for Multer to store uploaded files
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// route for csv conversion
app.post(
  '/upload/csv_conversion',
  upload.single('csvFile'),
  async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      const fileBuffer = req.file.buffer
      const jsonData = await csv_to_json().fromString(fileBuffer.toString())

      // Process the JSON data (e.g., save it to a file)
      fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2))

      res.json({
        message: 'CSV file processed and converted to JSON',
        jsonData,
      })
    } catch (error) {
      console.error('Error processing CSV:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// route for download the converted csv file into a json file
app.post('/download', (req, res) => {
  // Create a downloadable file (e.g., JSON file)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  const jsonData = req.body

  // Store the JSON data in a file
  fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Error writing JSON file:', err)
      res.status(500).json({ message: 'Error storing data' })
    } else {
      res.json({ message: 'JSON data received and stored' })
    }
  })
})

// route for csv processing
app.post('/upload/csv_processing', upload.single('csvFile'), (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const fileBuffer = req.file.buffer
  const results = []

  // Process the CSV data
  fs.createReadStream(fileBuffer)
    .pipe(csv_parser())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Now `results` contains the parsed CSV data as an array of objects
      // You can process or save this data as needed
      res.json({ message: 'CSV file uploaded and processed', data: results })
    })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
