// FileUpload.js
import { useState } from 'react'

function FileUpload() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(null)

  const [data, setData] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  //   converting csv into json
  const handleFileUploadConversion = async () => {
    const formData = new FormData()
    formData.append('csvFile', file)
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3001/upload/csv_conversion',
        {
          method: 'POST',
          mode: 'cors',
          body: formData,
        }
      )

      if (response.ok) {
        const responseData = await response.json()
        console.log('Processing result:', responseData)
        console.log(responseData.jsonData)
        // You can handle the processed data here
        setIsLoading(false)
        setData(responseData.jsonData)
      } else {
        setIsLoading(false)
        console.error('Upload failed')
        setIsError('Upload failed')
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error during file upload:', error)
      setIsError('Error during file upload:', error)
    }
  }

  //   download csv converted into json
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3001/download', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'data.json'
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.log(response)
        console.error('Download failed')
      }
    } catch (error) {
      console.error('Error during download:', error)
    }
  }

  const handleFileUploadProcessing = async () => {
    const formData = new FormData()
    formData.append('csvFile', file)
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3001/upload/csv_processing',
        {
          method: 'POST',
          mode: 'cors',
          body: formData,
        }
      )

      if (response.ok) {
        const responseData = await response.json()
        console.log('Processing result:', responseData)

        // You can handle the processed data here
        setIsLoading(false)
      } else {
        setIsLoading(false)
        console.error('Upload failed')
        setIsError('Upload failed')
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error during file upload:', error)
      setIsError('Error during file upload:', error)
    }
  }

  return (
    <div>
      <div>
        <input type='file' accept='.csv' onChange={handleFileChange} />
        <button onClick={handleFileUploadConversion}>
          Convert CSV to JSON
        </button>
        <button onClick={handleFileUploadProcessing}>Process CSV data</button>
      </div>
      {isError && <span>{isError}</span>}
      {data && (
        <button onClick={handleDownload}>Download Processed Data</button>
      )}
      {data && (
        <div>
          {data.map((item, i) => (
            <div key={i}>
              <span>{item['ID del canal']}</span>
              <span>{item['Título del canal']}</span>
              <span>{item['URL del canal']}</span>
              <span>{item['ID de vídeo']}</span>
            </div>
          ))}
        </div>
      )}
      {isLoading && <span>Loading...</span>}
    </div>
  )
}

export default FileUpload
