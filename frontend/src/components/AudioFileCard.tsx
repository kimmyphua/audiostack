import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AudioFileCardProps {
  id: string
  originalName: string
  description?: string
  category: string
  fileSize: number
  createdAt: string
}

export default function AudioFileCard({ id, originalName, description, category, fileSize, createdAt }: AudioFileCardProps) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{originalName}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <Link to={`/player/${id}`} className="btn-primary flex items-center gap-1">
          <Play className="h-4 w-4" /> Play
        </Link>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{category}</span>
        <span>{(fileSize / 1024 / 1024).toFixed(2)} MB</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
} 