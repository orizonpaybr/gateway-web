export interface AffiliateLink {
  affiliate_code: string
  affiliate_link: string
  affiliates_count: number
  total_earned: number
  monthly_earned: number
  current_balance: number
}

export interface AffiliateStats {
  /** Saldo disponível de afiliados (para sacar) */
  current_balance: number
  /** Total de indicados (filhos cadastrados pelo link) */
  total_referrals: number
  /** Ganhos do mês (comissões pagas no mês atual) */
  monthly_earned: number
}
