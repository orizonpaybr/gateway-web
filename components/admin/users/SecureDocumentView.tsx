'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export const SecureDocumentView = memo(
  ({
    url,
    alt,
    className,
    fill,
    ...rest
  }: {
    url: string | null
    alt: string
    className?: string
    fill?: boolean
  } & React.HTMLAttributes<HTMLDivElement>) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(!!url)
    const [error, setError] = useState(false)
    const [mime, setMime] = useState<string | null>(null)
    const blobUrlRef = useRef<string | null>(null)

    const isApiDocument =
      !!url && url.includes('/api/admin/users/') && url.includes('/documents/')

    useEffect(() => {
      if (!url) {
        setLoading(false)
        setBlobUrl(null)
        return
      }

      if (!isApiDocument) {
        setBlobUrl(url)
        setLoading(false)
        return
      }

      let revoked = false
      setLoading(true)
      setError(false)
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null

      fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Falha ao carregar')
          }
          setMime(res.headers.get('content-type') || null)
          return res.blob()
        })
        .then((blob) => {
          const created = URL.createObjectURL(blob)
          blobUrlRef.current = created
          if (!revoked) {
            setBlobUrl(created)
          }
        })
        .catch(() => {
          if (!revoked) {
            setError(true)
          }
        })
        .finally(() => {
          if (!revoked) {
            setLoading(false)
          }
        })

      return () => {
        revoked = true
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
      }
    }, [url, isApiDocument])

    if (!url) {
      return null
    }
    if (error) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className ?? ''}`}
          {...rest}
        >
          Erro ao carregar documento
        </div>
      )
    }
    if (loading) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 ${className ?? ''}`}
          {...rest}
        >
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      )
    }
    if (!blobUrl) {
      return null
    }

    const isPdf =
      mime?.includes('pdf') ?? blobUrl.toLowerCase().endsWith('.pdf')

    if (isPdf) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center p-4 ${className ?? ''}`}
          {...rest}
        >
          Documento em PDF. Visualização em implementação.
        </div>
      )
    }

    return (
      <Image
        src={blobUrl}
        alt={alt}
        fill={fill}
        className={className}
        unoptimized
        sizes={fill ? '(max-width: 768px) 100vw, 33vw' : '100vw'}
        style={fill ? { objectFit: 'cover' } : { objectFit: 'contain' }}
        width={fill ? undefined : 1200}
        height={fill ? undefined : 800}
      />
    )
  },
)

SecureDocumentView.displayName = 'SecureDocumentView'
