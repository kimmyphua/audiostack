import { ArrowLeft, Pause, Play, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { useAudioPlayer } from '../../hooks'
import { audioAPI } from '../../lib/api'
import { AudioFile } from '../../types'
import { formatFileSize, formatTime, getStreamUrl } from '../../utils'
import styles from './AudioPlayer.module.scss'

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>()
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const {
    audioRef,
    state: { playing, currentTime, duration, volume },
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    handleEnded,
  } = useAudioPlayer(audioUrl)

  useEffect(() => {
    if (id) {
      loadAudioFile()
    }
    // Cleanup blob URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [id])

  const loadAudioFile = useCallback(async () => {
    try {
      const response = await audioAPI.getFile(id!)
      setAudioFile(response.data.audioFile)
      
      // Fetch the audio file as a blob
      const fileUrl = getStreamUrl(id!)
      
      const audioResponse = await fetch(fileUrl)
      if (!audioResponse.ok) {
        throw new Error(`HTTP error! status: ${audioResponse.status}`)
      }
      
      const audioBlob = await audioResponse.blob()
      const blobUrl = URL.createObjectURL(audioBlob)
      console.log('Blob URL created:', blobUrl)
      
      setAudioUrl(blobUrl)
      
    } catch (error: any) {
      toast.error(`Failed to load audio file: ${error.response?.data?.error}`)
      console.error('Load audio file error:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    handleSeek(time)
  }

  const handleVolumeChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    handleVolumeChange(newVolume)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  if (!audioFile) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>Audio file not found</h3>
        <p className={styles.errorDescription}>
          The audio file you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div>
          <Link to="/files" className={styles.backButton}>
            Back to Files
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/files" className={styles.backButton}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Audio Player</h1>
          <p className={styles.subtitle}>Now playing: {audioFile.originalName}</p>
        </div>
      </div>

      <div className={styles.playerCard}>
        <div className={styles.playerContent}>
          {/* Audio file info */}
          <div className={styles.fileInfo}>
            <h2 className={styles.fileName}>
              {audioFile.originalName}
            </h2>
            {audioFile.description && (
              <p className={styles.fileDescription}>{audioFile.description}</p>
            )}
            <div className={styles.fileMeta}>
              <span className={styles.category}>
                {audioFile.category}
              </span>
              <span className={styles.fileSize}>{formatFileSize(audioFile.fileSize)}</span>
              <span className={styles.uploadDate}>{new Date(audioFile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Audio player */}
          <div className={styles.audioPlayer}>
            <audio
              ref={audioRef}
              src={audioUrl || getStreamUrl(id!)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />
            
            <div className={styles.audioControls}>
              <button
                onClick={togglePlay}
                className={styles.playButton}
              >
                {playing ? <Pause className={styles.playIcon} /> : <Play className={styles.playIcon} />}
              </button>

              <div className={styles.progressSection}>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className={styles.progressBar}
                />
                <div className={styles.timeDisplay}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className={styles.volumeSection}>
                <Volume2 className={styles.volumeIcon} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChangeInput}
                  className={styles.volumeSlider}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 