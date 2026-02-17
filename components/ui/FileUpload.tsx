import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, File, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (value && value.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(value)
      setImagePreview(previewUrl)
      return () => URL.revokeObjectURL(previewUrl)
    }

    setImagePreview(null)
  }, [value])

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`)
      return
    }

    const onlyImages = accept.includes('image/') && !accept.includes('pdf')
    if (onlyImages && !file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
      toast.error(
        'Envie apenas fotos (JPG ou PNG). Documentos em PDF não são aceitos.',
      )
      return
    }

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    } else {
      setImagePreview(null)
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }

    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }
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
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Selecionar arquivo"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
            {imagePreview ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <File size={24} className="text-green-600" />
            )}
            <div className="text-left flex-1">
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
              {accept.includes('pdf') ? 'PNG, JPG ou PDF' : 'PNG ou JPG'} até{' '}
              {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500 -mt-1">{error}</span>}
    </div>
  )
}
