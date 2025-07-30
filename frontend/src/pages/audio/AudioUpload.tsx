import { Music, Upload } from 'lucide-react'
import { AUDIO_CATEGORIES, MAX_FILE_SIZE_MB, SUPPORTED_AUDIO_FORMATS } from '../../constants'
import { useFileUpload } from './hooks/useFileUpload'
import { formatFileSize } from '../../utils'
import styles from './AudioUpload.module.scss'

export default function AudioUpload() {
  const {
    file,
    description,
    category,
    uploading,
    setDescription,
    setCategory,
    handleFileChange,
    handleSubmit,
    removeFile,
  } = useFileUpload()

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
                  accept={SUPPORTED_AUDIO_FORMATS.join(',')}
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
                        {formatFileSize(file.size)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          removeFile()
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
                        MP3, WAV, OGG, AAC, FLAC, MP4, WEBM up to {MAX_FILE_SIZE_MB}MB
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
            onClick={() => window.history.back()}
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