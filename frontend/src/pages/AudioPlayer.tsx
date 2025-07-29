import { ArrowLeft, Pause, Play, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { audioAPI } from '../lib/api'

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!audioFile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Audio file not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The audio file you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="mt-6">
          <Link to="/files" className="btn-primary">
            Back to Files
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/files" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audio Player</h1>
          <p className="text-sm text-gray-500">Now playing: {audioFile.originalName}</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-6">
          {/* Audio file info */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {audioFile.originalName}
            </h2>
            {audioFile.description && (
              <p className="text-sm text-gray-600 mb-2">{audioFile.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {audioFile.category}
              </span>
              <span>{formatFileSize(audioFile.fileSize)}</span>
              <span>{new Date(audioFile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Audio player */}
          <div className="audio-player">
            <audio
              ref={audioRef}
              src={audioUrl || getStreamUrl(id!)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setPlaying(false)}
        
            />
            
            <div className="audio-controls">
              <button
                onClick={togglePlay}
                className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              <div className="flex-1 space-y-2">
                <div className="progress-bar">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 