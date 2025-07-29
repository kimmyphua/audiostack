import { Music, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { audioAPI } from '../lib/api'
import styles from './AudioList.module.scss'

interface AudioFile {
  id: string
  originalName: string
  description?: string
  category: string
  fileSize: number
  mimeType: string
  createdAt: string
}

export default function AudioList() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadAudioFiles()
    loadCategories()
  }, [])

  const loadAudioFiles = async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (category) params.category = category
      
      const response = await audioAPI.getMyFiles(params)
      setAudioFiles(response.data.audioFiles)
    } catch (error: any) {
      toast.error('Failed to load audio files')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await audioAPI.getCategories()
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleRowClick = (fileId: string) => {
    navigate(`/player/${fileId}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent row click from triggering
    if (!confirm('Are you sure you want to delete this audio file?')) return

    try {
      await audioAPI.deleteFile(id)
      toast.success('Audio file deleted successfully')
      loadAudioFiles()
    } catch (error: any) {
      toast.error('Failed to delete audio file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Audio Files</h1>
          <p className={styles.subtitle}>
            Manage and play your uploaded audio files.
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          Upload New
        </Link>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchForm}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search audio files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <div className={styles.categorySelect}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadAudioFiles}
            className="btn-secondary"
          >
            Search
          </button>
        </div>

        {audioFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <Music className={styles.icon} />
            <h3 className={styles.title}>No audio files</h3>
            <p className={styles.description}>
              Get started by uploading your first audio file.
            </p>
            <div className={styles.action}>
              <Link to="/upload" className="btn-primary">
                Upload Audio
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>
                    File
                  </th>
                  <th className={styles.th}>
                    Category
                  </th>
                  <th className={styles.th}>
                    Size
                  </th>
                  <th className={styles.th}>
                    Uploaded
                  </th>
                  <th className={styles.th}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {audioFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className={styles.tr}
                    onClick={() => handleRowClick(file.id)}
                  >
                    <td className={styles.td}>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>
                          {file.originalName}
                        </div>
                        {file.description && (
                          <div className={styles.fileDescription}>
                            {file.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.category}>
                        {file.category}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.fileSize}`}>
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className={`${styles.td} ${styles.uploadDate}`}>
                      {formatDate(file.createdAt)}
                    </td>
                    <td className={`${styles.td} ${styles.actions}`}>
                      <div className={styles.actions}>
                        <button
                          onClick={(e) => handleDelete(e, file.id)}
                          className={`${styles.actionButton} ${styles.delete}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 