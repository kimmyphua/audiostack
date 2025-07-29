import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { audioAPI } from '../../../lib/api'
import { AudioFile, AudioFilters } from '../../../types'

export const useAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  const loadAudioFiles = useCallback(async (filters?: AudioFilters) => {
    try {
      const params: any = {}
      if (filters?.search) params.search = filters.search
      if (filters?.category) params.category = filters.category
      
      const response = await audioAPI.getMyFiles(params)
      setAudioFiles(response.data.audioFiles)
    } catch (error: any) {
      toast.error('Failed to load audio files')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const response = await audioAPI.getCategories()
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }, [])

  const deleteAudioFile = useCallback(async (id: string) => {
    try {
      await audioAPI.deleteFile(id)
      toast.success('Audio file deleted successfully')
      // Reload the list after deletion
      loadAudioFiles()
      return true
    } catch (error: any) {
      toast.error('Failed to delete audio file')
      return false
    }
  }, [loadAudioFiles])

  useEffect(() => {
    loadAudioFiles()
    loadCategories()
  }, [loadAudioFiles, loadCategories])

  return {
    audioFiles,
    loading,
    categories,
    loadAudioFiles,
    loadCategories,
    deleteAudioFile,
  }
} 