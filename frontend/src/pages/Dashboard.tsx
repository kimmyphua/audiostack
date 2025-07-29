import { Music, Upload, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  const quickActions = [
    {
      name: 'Upload Audio',
      description: 'Upload a new audio file',
      href: '/upload',
      icon: Upload,
      color: 'bg-blue-500',
    },
    {
      name: 'My Files',
      description: 'View and manage your audio files',
      href: '/files',
      icon: Music,
      color: 'bg-green-500',
    },
    {
      name: 'Profile',
      description: 'Manage your account settings',
      href: '/profile',
      icon: User,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your audio files and enjoy your music collection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${action.color} rounded-lg p-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-600">1</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <strong>Upload your first audio file</strong> - Click on "Upload Audio" to get started with your music collection.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-600">2</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <strong>Organize your files</strong> - Use categories and descriptions to keep your audio files organized.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-600">3</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <strong>Enjoy your music</strong> - Use the built-in audio player to listen to your uploaded files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 