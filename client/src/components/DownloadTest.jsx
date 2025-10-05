import React from 'react'
import { downloadImageDirect, downloadCreationAdvanced } from '../utils/advancedDownload'

const DownloadTest = () => {
  const testImageUrl = "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg" // Replace with actual URL

  const testDirectDownload = async () => {
    console.log('Testing direct image download...')
    await downloadImageDirect(testImageUrl, 'test-image.jpg')
  }

  const testFetch = async () => {
    try {
      const response = await fetch(testImageUrl)
      console.log('Fetch response:', response)
      console.log('Content-Type:', response.headers.get('content-type'))
      
      const blob = await response.blob()
      console.log('Blob:', blob)
      console.log('Blob size:', blob.size)
      console.log('Blob type:', blob.type)
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  return (
    <div className="p-4 bg-white border rounded">
      <h3>Download Test</h3>
      <div className="flex gap-2 mt-2">
        <button 
          onClick={testDirectDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Direct Download
        </button>
        <button 
          onClick={testFetch}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Fetch
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Check console for logs. Replace testImageUrl with actual Cloudinary URL.
      </p>
    </div>
  )
}

export default DownloadTest