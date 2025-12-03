import React, { memo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
interface TablePaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export const TablePagination = memo(
  ({
    currentPage,
    lastPage,
    total,
    perPage,
    onPageChange,
  }: TablePaginationProps) => {
    const canPrev = currentPage > 1
    const canNext = currentPage < lastPage

    const handlePrev = useCallback(() => {
      if (canPrev) {
        onPageChange(currentPage - 1)
      }
    }, [canPrev, currentPage, onPageChange])

    const handleNext = useCallback(() => {
      if (canNext) {
        onPageChange(currentPage + 1)
      }
    }, [canNext, currentPage, onPageChange])

    return (
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Itens por página: <span className="font-medium">{perPage}</span> •
          Total: <span className="font-medium">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={handlePrev}
            className="min-w-[40px]"
          >
            {'<'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={handleNext}
            className="min-w-[40px]"
          >
            {'>'}
          </Button>
        </div>
      </div>
    )
  },
)
