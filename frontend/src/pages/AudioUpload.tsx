import { Music, Upload } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { audioAPI } from '../lib/api'

const AUDIO_CATEGORIES = [
  'Music',
  'Podcast',
  'Audiobook',
  'Sound Effect',
  'Voice Recording',
  'Interview',
  'Lecture',
  'Other'
]

export default function AudioUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Music')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select an audio file')
      return
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB
      toast.error('File size must be less than 25MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('audio', file, file.name)
    formData.append('description', description)
    formData.append('category', category)
    
    // Log the actual data being sent
    console.log('File:', file.name, file.size, file.type)
    console.log('Description:', description)
    console.log('Category:', category)
    
    // Log FormData entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    try {
      await audioAPI.upload(formData)
      toast.success('Audio file uploaded successfully!')
      navigate('/files')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Audio File</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your audio files and organize them with categories and descriptions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-file"
                />
                <label htmlFor="audio-file" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <Music className="mx-auto h-12 w-12 text-primary-600" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        Click to select audio file
                      </p>
                      <p className="text-xs text-gray-500">
                        MP3, WAV, OGG, AAC, FLAC, MP4, WEBM up to 25MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input mt-1"
              >
                {AUDIO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input mt-1"
                placeholder="Describe your audio file..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/files')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || uploading}
            className="btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload Audio'}
          </button>
        </div>
      </form>
    </div>
  )
} 