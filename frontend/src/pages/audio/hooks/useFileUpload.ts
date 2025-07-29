import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { MAX_FILE_SIZE } from '../../../constants'
import { audioAPI } from '../../../lib/api'
import { validateFileSize } from '../../../utils'

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Music')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!validateFileSize(selectedFile, MAX_FILE_SIZE)) {
        toast.error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
        return
      }
      setFile(selectedFile)
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select an audio file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('audio', file, file.name)
    formData.append('description', description)
    formData.append('category', category)
    
    try {
      await audioAPI.upload(formData)
      toast.success('Audio file uploaded successfully!')
      navigate('/files')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [file, description, category, navigate])

  const resetForm = useCallback(() => {
    setFile(null)
    setDescription('')
    setCategory('Music')
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
  }, [])

  return {
    file,
    description,
    category,
    uploading,
    setDescription,
    setCategory,
    handleFileChange,
    handleSubmit,
    resetForm,
    removeFile,
  }
} 