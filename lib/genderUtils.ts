// Utilitários para identificação de gênero por nome

// Nomes femininos comuns no Brasil - usando Set para performance O(1)
const FEMALE_NAMES = new Set([
  'ana',
  'maria',
  'joana',
  'carla',
  'patricia',
  'fernanda',
  'juliana',
  'camila',
  'bruna',
  'lucia',
  'beatriz',
  'carolina',
  'amanda',
  'rafaela',
  'daniela',
  'adriana',
  'cristina',
  'monica',
  'sandra',
  'vanessa',
  'alessandra',
  'tatiana',
  'renata',
  'fabiana',
  'marcela',
  'andrea',
  'silvia',
  'eliane',
  'rosana',
  'gabriela',
  'natalia',
  'leticia',
  'mariana',
  'isabela',
  'larissa',
  'viviane',
  'denise',
  'eliana',
  'regina',
  'claudia',
  'rosangela',
  'valeria',
  'simone',
  'luciana',
  'janaina',
  'debora',
  'aline',
  'priscila',
  'jessica',
  'thais',
  'bianca',
  'flavia',
  'roberta',
  'cintia',
  'paula',
  'vera',
  'marcia',
  'elizabete',
  'rosemary',
  'margarida',
  'helena',
  'rita',
  'cecilia',
  'diana',
  'lilian',
  'sueli',
])

// Nomes masculinos comuns no Brasil - usando Set para performance O(1)
const MALE_NAMES = new Set([
  'joão',
  'josé',
  'antonio',
  'francisco',
  'carlos',
  'paulo',
  'pedro',
  'lucas',
  'rafael',
  'gabriel',
  'daniel',
  'marcelo',
  'bruno',
  'eduardo',
  'felipe',
  'rodrigo',
  'manuel',
  'ricardo',
  'fernando',
  'roberto',
  'alberto',
  'sergio',
  'marcos',
  'andre',
  'luis',
  'alexandre',
  'diego',
  'thiago',
  'vinicius',
  'leonardo',
  'matheus',
  'guilherme',
  'arthur',
  'henrique',
  'samuel',
  'bernardo',
  'enzo',
  'murilo',
  'benjamin',
  'ryan',
  'caio',
  'davi',
  'lorenzo',
  'theo',
  'miguel',
  'gustavo',
  'nicolas',
  'kaique',
  'breno',
])

/**
 * Identifica o gênero baseado no primeiro nome
 * @param fullName Nome completo do usuário
 * @returns 'male' | 'female' | 'unknown'
 */
export function detectGenderByName(
  fullName: string,
): 'male' | 'female' | 'unknown' {
  // Validação rápida
  if (!fullName || typeof fullName !== 'string') {
    return 'unknown'
  }

  // Pega o primeiro nome e converte para minúsculo
  const firstName = fullName.trim().split(' ')[0].toLowerCase()

  // Verificação O(1) usando Set
  if (MALE_NAMES.has(firstName)) {
    return 'male'
  }

  if (FEMALE_NAMES.has(firstName)) {
    return 'female'
  }

  return 'unknown'
}

/**
 * Gera um número aleatório baseado no nome para manter consistência
 * @param name Nome do usuário
 * @param max Número máximo (exclusivo)
 * @returns Número aleatório consistente
 */
export function getConsistentRandom(name: string, max: number): number {
  if (!name || max <= 0) return 0

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash + char) & 0xffffffff // Força 32-bit
  }

  return Math.abs(hash) % max
}
