import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
interface TermsHeaderProps {
  title: string
  lastUpdated?: string
  showBackButton?: boolean
  backHref?: string
}

export const TermsHeader: React.FC<TermsHeaderProps> = ({
  title,
  lastUpdated,
  showBackButton = true,
  backHref = '/',
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {showBackButton && (
            <Link
              href={backHref}
              className="flex items-center gap-2 text-[#101010] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar</span>
            </Link>
          )}

          <div className="flex items-center gap-3">
            <Image
              src={encodeURI('/Coratri - FINANCE - Site.png')}
              alt="Coratri Finance"
              width={200}
              height={56}
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {lastUpdated && (
              <p className="text-gray-600">Última atualização: {lastUpdated}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
