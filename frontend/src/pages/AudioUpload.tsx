import { Music, Upload } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { audioAPI } from '../lib/api'
import styles from './AudioUpload.module.scss'

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upload Audio File</h1>
        <p className={styles.subtitle}>
          Upload your audio files and organize them with categories and descriptions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.uploadCard}>
          <div className={styles.uploadContent}>
            <div className={styles.fileUpload}>
              <label className={styles.label}>
                Audio File
              </label>
              <div className={styles.dropzone}>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className={styles.input}
                  id="audio-file"
                />
                <label htmlFor="audio-file" className={styles.label}>
                  {file ? (
                    <div className={styles.fileInfo}>
                      <Music className={styles.icon} />
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className={styles.removeButton}
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <Upload className={styles.icon} />
                      <p className={styles.title}>
                        Click to select audio file
                      </p>
                      <p className={styles.description}>
                        MP3, WAV, OGG, AAC, FLAC, MP4, WEBM up to 25MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
              >
                {AUDIO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Describe your audio file..."
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
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