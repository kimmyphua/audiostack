import { AxiosError } from 'axios'
import toast from 'react-hot-toast'

interface ValidationError {
  field: string
  message: string
}

interface ErrorResponse {
  error: string
  message: string
  details?: ValidationError[]
  field?: string
}

export function getErrorMessages(error: AxiosError<ErrorResponse>): Record<string, string> | null {
  if (!error) {
    return null
  }

  const { response, code, message } = error
  const status = response?.status
  const errorData = response?.data

  // Handle different error types
  switch (status) {
    case 400:
      return handleValidationErrors(errorData)
    
    case 401:
      return handleAuthenticationError(errorData)
    
    case 500:
      toast.error('Server error. Please try again later. 🤷‍♀️')
      return null
    
    default:
      return handleGenericError(errorData, code, message)
  }
}

function handleValidationErrors(errorData?: ErrorResponse): Record<string, string> | null {
  if (!errorData) return null

  // Handle field-specific validation errors
  if (errorData.details) {
    const fieldErrors: Record<string, string> = {}
    errorData.details.forEach((detail) => {
      fieldErrors[detail.field] = detail.message
    })
    toast.error('Please fix the validation errors 🙇‍♀️')
    return fieldErrors
  }

  // Handle single field error (e.g., username/email already exists)
  if (errorData.field && errorData.message) {
    toast.error(errorData.message)
    return { [errorData.field]: errorData.message }
  }

  // Handle general validation error
  if (errorData.message) {
    toast.error(errorData.message)
  }

  return null
}

function handleAuthenticationError(errorData?: ErrorResponse): Record<string, string> | null {
  const errorMessage = errorData?.message || 'Invalid credentials 🤷‍♀️'
   console.log({errorData});
   
  // For login, we typically want to show the error on both username and password fields
  // since we don't know which one is wrong
  toast.error('Check your credentials and try again 🫢')
  
  return {
    username: errorMessage,
    password: errorMessage
  }
}

function handleGenericError(
  errorData?: ErrorResponse, 
  code?: string, 
  message?: string
): Record<string, string> | null {
  // Handle network errors
  if (code === 'NETWORK_ERROR' || message?.includes('Network Error')) {
    toast.error('Network error. Please check your connection 👀')
    return null
  }

  // Handle other generic errors
  const errorMessage = errorData?.message || 'An unexpected error occurred. Come back later 💁‍♀️'
  toast.error(errorMessage)
  
  return null
}

export default getErrorMessages