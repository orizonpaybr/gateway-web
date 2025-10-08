import React from 'react'

interface TermsSectionProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}

export const TermsSection: React.FC<TermsSectionProps> = ({
  id,
  title,
  children,
  className = '',
}) => {
  return (
    <section id={id} className={`mb-8 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </section>
  )
}
