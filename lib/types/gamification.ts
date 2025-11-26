/**
 * Tipos TypeScript para Sistema de Gamificação
 *
 * Centraliza todas as interfaces e types relacionados
 * ao sistema de níveis e progressão do usuário
 *
 * @module lib/types/gamification
 */

/**
 * Dados de um nível individual na trilha de conquistas
 */
export interface AchievementTrailLevel {
  id: number
  name: string
  amount: string
  status: 'Bloqueado' | 'Em progresso' | 'Concluído'
  color: string
  bgColor: string
  progress: number
  minimo: number
  maximo: number
  cor: string | null
  icone: string | null
}

export interface NextLevelData {
  name: string
  minimo: number
  maximo: number
}

export interface AchievementMessage {
  level: string
  message: string
  icon: string
}

export interface SummaryCards {
  total_deposited: string
  current_level: string | null
  next_goal: string
}

export interface GamificationJourneyData {
  current_level: string | null
  total_deposited: number
  current_progress: number
  next_level: NextLevelData | null
  achievement_trail: AchievementTrailLevel[]
  achievement_messages: AchievementMessage[]
  summary_cards: SummaryCards
}

export interface GamificationJourneyResponse {
  success: boolean
  data: GamificationJourneyData
}

export interface SidebarGamificationData {
  currentLevel: string | null
  totalDeposited: number
  currentLevelMin: number
  currentLevelMax: number
  nextLevelData: NextLevelData | null
  isLoading: boolean
  error: Error | null
  refreshData: () => void
}

export interface ProgressData {
  progress: number
  remainingAmount: number
  nextLevelName: string
  formattedMin: string
  formattedTarget: string
  formattedRemaining: string
}

export interface SidebarProgressProps {
  currentLevel: string | null
  totalDeposited: number
  currentLevelMin: number
  currentLevelMax: number
  nextLevelData: NextLevelData | null
  isLoading?: boolean
}

export interface GamificationLevel {
  id: number
  nome: string
  cor: string | null
  icone: string | null
  minimo: number
  maximo: number
  created_at?: string
  updated_at?: string
  // Campos calculados (opcional, vem do Resource do backend)
  intervalo_formatado?: string
  amplitude?: number
}

export type UpdateLevelData = {
  nome?: string
  minimo?: number
  maximo?: number
}

export interface LevelsResponse {
  success: boolean
  data: {
    niveis: GamificationLevel[]
    niveis_ativo: boolean
  }
}
