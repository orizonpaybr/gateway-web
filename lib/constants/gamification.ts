/**
 * Constantes de gamifica\u00e7\u00e3o
 *
 * Centraliza configura\u00e7\u00f5es, cores e mapeamentos
 * relacionados ao sistema de n\u00edveis
 *
 * @module lib/constants/gamification
 */

/**
 * Nomes dos n\u00edveis (normalizados para compara\u00e7\u00e3o)
 */
export const LEVEL_NAMES = {
  BRONZE: 'Bronze',
  PRATA: 'Prata',
  OURO: 'Ouro',
  SAFIRA: 'Safira',
  DIAMANTE: 'Diamante',
} as const

export type LevelName = (typeof LEVEL_NAMES)[keyof typeof LEVEL_NAMES]

/**
 * Cores Tailwind CSS para cada n\u00edvel
 *
 * Usadas para indicadores visuais (dots, badges, progress bars)
 */
export const LEVEL_COLORS = {
  [LEVEL_NAMES.BRONZE]: {
    bg: 'bg-amber-600',
    text: 'text-amber-600',
    border: 'border-amber-600',
    ring: 'ring-amber-600',
  },
  [LEVEL_NAMES.PRATA]: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    border: 'border-gray-400',
    ring: 'ring-gray-400',
  },
  [LEVEL_NAMES.OURO]: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    ring: 'ring-yellow-500',
  },
  [LEVEL_NAMES.SAFIRA]: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    ring: 'ring-blue-500',
  },
  [LEVEL_NAMES.DIAMANTE]: {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    ring: 'ring-purple-600',
  },
} as const

export const LEVEL_ICONS = {
  [LEVEL_NAMES.BRONZE]: '/icons8-medalha-de-terceiro-lugar-48.png',
  [LEVEL_NAMES.PRATA]: '/icons8-medalha-de-segundo-lugar-80.png',
  [LEVEL_NAMES.OURO]: '/icons8-medalha-de-primeiro-lugar-48.png',
  [LEVEL_NAMES.SAFIRA]: '/icons8-logotipo-safira-48.png',
  [LEVEL_NAMES.DIAMANTE]: '/icons8-diamante-64.png',
} as const

const DEFAULT_COLORS = {
  bg: 'bg-gray-400',
  text: 'text-gray-400',
  border: 'border-gray-400',
  ring: 'ring-gray-400',
}

/**
 * Obt\u00e9m as cores de um n\u00edvel de forma type-safe
 *
 * @param level - Nome do n\u00edvel (pode vir do backend com varia\u00e7\u00f5es)
 * @returns Objeto com classes Tailwind para diferentes variantes
 */
export function getLevelColors(level: string | null): typeof DEFAULT_COLORS {
  if (!level) return DEFAULT_COLORS

  const normalizedLevel = normalizeLevelName(level)

  return LEVEL_COLORS[normalizedLevel as LevelName] || DEFAULT_COLORS
}

/**
 * Obt\u00e9m apenas a classe de background de um n\u00edvel
 * \u00datil para componentes que s\u00f3 precisam da cor de fundo
 *
 * @param level - Nome do n\u00edvel
 * @returns Classe Tailwind de background
 */
export function getLevelColorClass(level: string | null): string {
  return getLevelColors(level).bg
}

/**
 * Obt\u00e9m o \u00edcone de um n\u00edvel
 *
 * @param level - Nome do n\u00edvel
 * @returns Path do \u00edcone ou null se n\u00e3o encontrado
 */
export function getLevelIcon(level: string | null): string | null {
  if (!level) return null

  const normalizedLevel = normalizeLevelName(level)
  return LEVEL_ICONS[normalizedLevel as LevelName] || null
}

/**
 * Normaliza o nome do n\u00edvel para compara\u00e7\u00e3o
 *
 * Exemplos:
 * - "Bronze 2.0" => "Bronze"
 * - "  Prata  " => "Prata"
 * - "ouro" => "Ouro"
 *
 * @param level - Nome do n\u00edvel (pode ter varia\u00e7\u00f5es)
 * @returns Nome normalizado
 */
export function normalizeLevelName(level: string): string {
  const trimmed = level.trim()

  // Pega apenas a primeira palavra (remove vers\u00f5es como "2.0")
  const firstWord = trimmed.split(/\s+/)[0]

  // Capitaliza primeira letra
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()
}

/**
 * Verifica se um n\u00edvel \u00e9 o Bronze (considerando varia\u00e7\u00f5es)
 *
 * @param levelName - Nome do n\u00edvel
 * @returns true se for Bronze (ou varia\u00e7\u00f5es), false caso contr\u00e1rio
 */
export function isBronzeLevel(levelName: string | null | undefined): boolean {
  if (!levelName) return false
  return normalizeLevelName(levelName) === LEVEL_NAMES.BRONZE
}

/**
 * TTL do cache de gamifica\u00e7\u00e3o (em segundos)
 */
export const GAMIFICATION_CACHE_TTL = {
  LEVELS: 3600,
  USER_DATA: 300,
  SIDEBAR: 180,
} as const
