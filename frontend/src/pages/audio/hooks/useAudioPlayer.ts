import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioPlayerState } from '../../../types'

export const useAudioPlayer = (audioUrl: string | null) => {
  const [state, setState] = useState<AudioPlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  })
  
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (state.playing) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Audio play error:', error)
        })
      }
      setState(prev => ({ ...prev, playing: !prev.playing }))
    }
  }, [state.playing])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }))
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({ ...prev, duration: audioRef.current!.duration }))
    }
  }, [])

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setState(prev => ({ ...prev, currentTime: time }))
    }
  }, [])

  const handleVolumeChange = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }))
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, playing: false }))
  }, [])

  // Reset state when audio URL changes
  useEffect(() => {
    setState({
      playing: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
    })
  }, [audioUrl])

  return {
    audioRef,
    state,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleVolumeChange,
    handleEnded,
  }
} 