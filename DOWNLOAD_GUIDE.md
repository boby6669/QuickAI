# Quick Guide: Adding Download Functionality to Generation Pages

## For any generation page (BlogeTitles, GenerateImages, etc.)

### 1. Import the utility function
```jsx
import { downloadContentByType } from '../utils/downloadUtils'
import { Download } from 'lucide-react'
```

### 2. Add download handler function
```jsx
const handleDownload = () => {
  if (!content) {
    toast.error('No content to download')
    return
  }
  
  // For text content
  downloadContentByType(content, 'blog-title', prompt)
  
  // For images (if content is image URL)
  // The downloadCreation function will handle this via database
}
```

### 3. Add download button to UI
```jsx
{content && (
  <button
    onClick={handleDownload}
    className='flex items-center gap-2 bg-[#00AD25] hover:bg-[#009922] text-white px-3 py-1 rounded-lg text-sm transition-colors'
    title='Download'
  >
    <Download size={14} />
    Download
  </button>
)}
```

## Content Types and File Formats

| Content Type | File Format | Extension | Description |
|-------------|-------------|-----------|-------------|
| `article` | Markdown | `.md` | Formatted with headers and metadata |
| `blog-title` | Markdown | `.md` | Formatted with headers |
| `resume-review` | Text | `.txt` | Professional report format |
| `image` | Image | `.png/.jpg/.gif` | Original format preserved |

## Example Implementation for BlogeTitles.jsx

```jsx
// Add to imports
import { downloadContentByType } from '../utils/downloadUtils'
import { Download } from 'lucide-react'

// Add download handler
const handleDownload = () => {
  if (!content) {
    toast.error('No content to download')
    return
  }
  
  downloadContentByType(content, 'blog-title', `Generate blog titles for: ${input}`)
}

// Add button in the UI where content is displayed
{content && (
  <div className="flex justify-between items-center mb-3">
    <div className='flex items-center gap-3'>
      <BookOpen className='w-5 h-5 text-[#4A7AFF]' />
      <h1 className='text-xl font-semibold'>Generated Titles</h1>
    </div>
    <button
      onClick={handleDownload}
      className='flex items-center gap-2 bg-[#00AD25] hover:bg-[#009922] text-white px-3 py-1 rounded-lg text-sm transition-colors'
    >
      <Download size={14} />
      Download
    </button>
  </div>
)}
```

This will automatically:
- Create properly formatted files
- Use appropriate file extensions
- Include prompts and metadata
- Handle different content types correctly