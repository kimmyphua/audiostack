import { ArrowLeft, Pause, Play, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { audioAPI } from '../lib/api'
import styles from './AudioPlayer.module.scss'

// Get API base URL for streaming
const getStreamUrl = (id: string) => {
  const token = localStorage.getItem('token')
  const baseUrl = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `/api/audio/${id}/file`
    : `http://localhost:5001/api/audio/${id}/file`
  
  return `${baseUrl}?token=${token}`
}

interface AudioFile {
  id: string
  originalName: string
  description?: string
  category: string
  fileSize: number
  mimeType: string
  createdAt: string
}

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>()
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

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
      // console.log('Audio file loaded:', response.data.audioFile)
      
      // Fetch the audio file as a blob
      const fileUrl = getStreamUrl(id!)
      // console.log('Fetching audio file as blob from:', fileUrl)
      
      const audioResponse = await fetch(fileUrl)
      if (!audioResponse.ok) {
        throw new Error(`HTTP error! status: ${audioResponse.status}`)
      }
      
      const audioBlob = await audioResponse.blob()
      const blobUrl = URL.createObjectURL(audioBlob)
      console.log('Blob URL created:', blobUrl)
      
      setAudioUrl(blobUrl)
      
    } catch (error: any) {
      toast.error(`Failed to load audio file: ${error.response.data.error}`)
      console.error('Load audio file error:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Audio play error:', error)
          toast.error(`Failed to play audio: ${error.response.data.error}`)
        })
      }
      setPlaying(!playing)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
              onEnded={() => setPlaying(false)}
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
                  onChange={handleSeek}
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
                  onChange={handleVolumeChange}
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