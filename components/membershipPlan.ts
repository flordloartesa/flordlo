import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'membershipPlan',
  title: 'Membership Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título do Plano',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Preço Mensal/Anual',
      type: 'number',
    }),
    defineField({
      name: 'features',
      title: 'Benefícios',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'O ID do produto de subscrição no Stripe (ex: price_1TNeKi...)',
    }),
    defineField({
      name: 'paypalPlanId',
      title: 'PayPal Plan ID',
      type: 'string',
      description: 'O ID do plano de subscrição no PayPal (ex: P-5ML42...)',
    }),
    defineField({
      name: 'bankAccountIBAN',
      title: 'IBAN para Transferência',
      type: 'string',
      description: 'O teu IBAN completo (ex: PT50 0003...)',
    }),
    defineField({
      name: 'bankAccountHolder',
      title: 'Titular da Conta',
      type: 'string',
      description: 'Nome da empresa ou pessoa titular da conta',
    }),
    defineField({
      name: 'bankTransferInstructions',
      title: 'Instruções de Pagamento',
      type: 'text',
      description: 'Diz ao utilizador o que fazer (ex: "Envie o comprovativo para email@exemplo.com")',
    }),
  ],
})