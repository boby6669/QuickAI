import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const downloadCreation = async (creationId, getToken, type = 'creation') => {
  try {
    const response = await axios.get(`/api/ai/download/${creationId}`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
      responseType: 'blob'
    })

    // Extract filename from response headers
    const contentDisposition = response.headers['content-disposition']
    let filename = `${type}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    // Create blob with proper content type
    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    toast.success('Downloaded successfully!')
    return true
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download')
    return false
  }
}

// Download content directly (without creation ID)
export const downloadContent = (content, filename, type = 'text/plain') => {
  try {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    toast.success('Downloaded successfully!')
    return true
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download')
    return false
  }
}

// Download content with auto-format detection
export const downloadContentByType = (content, creationType, prompt = '', timestamp = null) => {
  const ts = timestamp || new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  
  switch (creationType) {
    case 'article':
    case 'blog-title':
      const markdownContent = `# ${creationType.charAt(0).toUpperCase() + creationType.slice(1).replace('-', ' ')}\n\n${prompt ? `**Prompt:** ${prompt}\n\n---\n\n` : ''}${content}`
      return downloadContent(markdownContent, `${creationType}-${ts}.md`, 'text/markdown')
    
    case 'resume-review':
      const reviewContent = `RESUME REVIEW REPORT\nGenerated on: ${new Date().toLocaleDateString()}\n${'='.repeat(50)}\n\n${prompt ? `Original Request: ${prompt}\n\n` : ''}REVIEW CONTENT:\n\n${content}`
      return downloadContent(reviewContent, `resume-review-${ts}.txt`, 'text/plain')
    
    default:
      return downloadContent(content, `${creationType}-${ts}.txt`, 'text/plain')
  }
}