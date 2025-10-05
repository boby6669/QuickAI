// Alternative image download approach
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const downloadImageDirect = async (imageUrl, filename = null) => {
  try {
    console.log('Direct image download from:', imageUrl)
    
    // Use fetch API for better binary handling
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('Image blob:', blob)
    console.log('Blob size:', blob.size)
    console.log('Blob type:', blob.type)
    
    // Determine filename and extension
    const contentType = blob.type || response.headers.get('content-type') || 'image/jpeg'
    let extension = 'jpg'
    
    if (contentType.includes('png')) extension = 'png'
    else if (contentType.includes('gif')) extension = 'gif'
    else if (contentType.includes('webp')) extension = 'webp'
    
    const finalFilename = filename || 
      `image-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`
    
    // Create download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Image downloaded successfully!')
    return true
  } catch (error) {
    console.error('Direct image download error:', error)
    toast.error('Failed to download image: ' + error.message)
    return false
  }
}

export const downloadCreationAdvanced = async (item, getToken) => {
  try {
    console.log('Advanced download for item:', item)
    
    if (item.type === 'image') {
      // For images, download directly from the URL
      const timestamp = new Date(item.created_at).toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `generated-image-${timestamp}.jpg`
      return await downloadImageDirect(item.content, filename)
    } else {
      // For other content types, use the API
      const response = await axios.get(`/api/ai/download/${item.id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
        responseType: 'blob'
      })
      
      // Extract filename
      const contentDisposition = response.headers['content-disposition']
      let filename = `${item.type}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Create download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Downloaded successfully!')
      return true
    }
  } catch (error) {
    console.error('Advanced download error:', error)
    toast.error('Download failed: ' + error.message)
    return false
  }
}