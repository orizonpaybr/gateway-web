import { z } from 'zod'

export const nivelSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  cor: z.string().nullable(),
  icone: z.string().nullable().optional(),
  minimo: z.number().min(0, 'Valor mínimo deve ser maior ou igual a zero'),
  maximo: z.number().min(0, 'Valor máximo deve ser maior ou igual a zero'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const nivelFormSchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    minimo: z.string().regex(/^\d+$/, 'Valor mínimo inválido'),
    maximo: z.string().regex(/^\d+$/, 'Valor máximo inválido'),
  })
  .refine(
    (data) => {
      const minimo = parseFloat(data.minimo) / 100
      const maximo = parseFloat(data.maximo) / 100
      return maximo > minimo
    },
    {
      message: 'Valor máximo deve ser maior que o mínimo',
      path: ['maximo'],
    },
  )

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type Nivel = z.infer<typeof nivelSchema>
export type NivelFormData = z.infer<typeof nivelFormSchema>

/**
 * Helper para validar dados de nível de forma segura
 *
 * @param data - Dados a serem validados
 * @returns Objeto com sucesso e erros
 */
export function validateNivelForm(data: unknown): {
  success: boolean
  data?: NivelFormData
  errors?: Record<string, string>
} {
  const result = nivelFormSchema.safeParse(data)

  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })

  return {
    success: false,
    errors,
  }
}
