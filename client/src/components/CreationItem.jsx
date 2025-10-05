// import React, { useState } from 'react'

// const CreationItem = ({ item }) => {

//   const [expanded, setExpanded] = useState(false)

//   return (
//     <div onClick={() => setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'>
//       <div className='flex justify-between items-center gap-4'>
//         <div>
//           <h2>{item.prompt}</h2>
//           <p className='text-gray-500'>{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
//         </div>
//         <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] 
//                px-4 py-1 rounded-full'>{item.type}</button>
//       </div>
//       {
//         expanded && (
//           <div className=''>
//             {item, type === 'image' ? (

//                 <div>
//                   <img src={item.content} alt="image" className='mt-3 w-full max-w-md' />
//                 </div>
//               ) : (
//                 <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700' >
//                   {item.content}
//                 </div>
//               )
//             }
//           </div>
//         )
//       }
//     </div>
//   )
// }

// export default CreationItem


import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Download } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { downloadCreationAdvanced } from '../utils/advancedDownload'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { getToken } = useAuth()

  const handleDownload = async (e) => {
    e.stopPropagation() // Prevent expanding/collapsing when clicking download
    
    try {
      setDownloading(true)
      const success = await downloadCreationAdvanced(item, getToken)
      if (!success) {
        toast.error('Download failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1 bg-[#00AD25] hover:bg-[#009922] text-white 
                     px-3 py-1 rounded-full text-xs transition-colors disabled:opacity-50"
            title="Download"
          >
            {downloading ? (
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={12} />
            )}
            {downloading ? 'Downloading...' : 'Download'}
          </button>
          <button
            className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] 
                 px-4 py-1 rounded-full"
          >
            {item.type}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3">
          {item.type === 'image' ? (
            <div>
              <img
                src={item.content}
                alt="Generated"
                className="w-full max-w-md rounded-lg"
              />
            </div>
          ) : (
            <div className="max-h-48 overflow-auto text-sm text-slate-700">
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
