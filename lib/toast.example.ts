/**
 * Exemplos de uso do Sonner Toast
 *
 * Importe o toast do 'sonner' em qualquer componente cliente:
 * import { toast } from 'sonner'
 *
 * EXEMPLOS DE USO:
 */

// ===== Toast Simples =====
// toast('Mensagem básica')

// ===== Toast de Sucesso =====
// toast.success('Operação realizada com sucesso!')

// ===== Toast de Erro =====
// toast.error('Erro ao processar a solicitação')

// ===== Toast de Aviso =====
// toast.warning('Atenção: verifique os dados')

// ===== Toast de Informação =====
// toast.info('Esta é uma informação importante')

// ===== Toast com Descrição =====
// toast.success('Pagamento aprovado', {
//   description: 'O pagamento de R$ 100,00 foi processado com sucesso',
// })

// ===== Toast com Ação =====
// toast('Arquivo deletado', {
//   action: {
//     label: 'Desfazer',
//     onClick: () => console.log('Desfazer ação'),
//   },
// })

// ===== Toast com Duração Personalizada =====
// toast('Esta mensagem ficará visível por 10 segundos', {
//   duration: 10000,
// })

// ===== Toast com ID (para atualizar depois) =====
// const toastId = toast.loading('Processando...')
// setTimeout(() => {
//   toast.success('Concluído!', { id: toastId })
// }, 2000)

// ===== Toast Promessa (para operações assíncronas) =====
// const myPromise = fetch('/api/data')
// toast.promise(myPromise, {
//   loading: 'Carregando dados...',
//   success: 'Dados carregados com sucesso!',
//   error: 'Erro ao carregar dados',
// })

// ===== Toast Rico (com estilo customizado) =====
// toast('Transação PIX', {
//   description: 'Você recebeu R$ 500,00',
//   duration: 5000,
//   action: {
//     label: 'Ver Detalhes',
//     onClick: () => window.location.href = '/dashboard/extrato',
//   },
// })

/**
 * CORES DA ORIZON APLICADAS:
 * - Primary: #007BC7 (Azul Orizon)
 * - Secondary: #009EE0 (Azul Secundário)
 * - Accent: #FF8A00 (Laranja Destaque)
 * - Dark: #0C243B (Azul Escuro para textos)
 * - Background: #FFFFFF (Branco)
 * - Gray Light: #F3F3F3 (Cinza Suave)
 */
