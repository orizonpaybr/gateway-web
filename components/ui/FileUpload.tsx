import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Upload, File, X } from 'lucide-react'

interface FileUploadProps {
  label: string
  accept: string
  maxSize?: number
  error?: string
  onChange: (file: File | null) => void
  value?: File | null
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSize = 5,
  error,
  onChange,
  value,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`)
      return
    }

    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const removeFile = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
        {label}
      </label>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-500',
          value && 'border-green-500 bg-green-50',
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center justify-center gap-3">
            <File size={24} className="text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{value.name}</p>
              <p className="text-xs text-gray-500">{getFileSize(value.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X size={16} className="text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-gray-400" />
            <p className="text-sm text-gray-600">Clique para enviar</p>
            <p className="text-xs text-gray-500">
              {accept.includes('image/') ? 'PNG, JPG' : 'PNG, JPG ou PDF'} até{' '}
              {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
    </div>
  )
}
