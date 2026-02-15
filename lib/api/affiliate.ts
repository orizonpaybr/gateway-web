import { apiRequest } from '../api'
import type { AffiliateLink } from '@/types/affiliate'

export const affiliateAPI = {
  /**
   * Obtém o link, código de afiliado e totais (indicados, total ganho, ganhos do mês).
   * Se o link não existir, o backend gera automaticamente.
   */
  getLink: async (): Promise<{
    success: boolean
    data: AffiliateLink
  }> => {
    return apiRequest('/user/affiliate-link')
  },
}
