// Debug helper to test image download
export const testImageDownload = async (imageUrl) => {
  try {
    console.log('Testing image download from:', imageUrl)
    
    // Test direct fetch
    const response = await fetch(imageUrl)
    console.log('Direct fetch response:', response)
    console.log('Content-Type:', response.headers.get('content-type'))
    
    const blob = await response.blob()
    console.log('Blob size:', blob.size)
    console.log('Blob type:', blob.type)
    
    // Test download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test-image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Test download error:', error)
    return false
  }
}

// Test if the server is returning the correct data
export const testServerImageDownload = async (creationId, getToken) => {
  try {
    console.log('Testing server image download for ID:', creationId)
    
    const response = await axios.get(`/api/ai/download/${creationId}`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
      responseType: 'blob'
    })
    
    console.log('Server response headers:', response.headers)
    console.log('Server response data:', response.data)
    console.log('Response data type:', typeof response.data)
    console.log('Response data constructor:', response.data.constructor.name)
    
    return response
  } catch (error) {
    console.error('Server test error:', error)
    return null
  }
}