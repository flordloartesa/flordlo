// src/lib/email-templates.ts

/**
 * Template para o Magic Link (Login sem senha)
 */
export function magicLinkHTML({ url }: { url: string }) {
  const brandColor = "#3D81F1";
  const textColor = "#1E293B";

  return `
    <div style="background-color: #f9fafb; padding: 50px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding-bottom: 30px;">
            <img src="https://64.media.tumblr.com/a61f9037de0a73e8161bb4b2ba661d9c/d03a5d8c83d77852-db/s500x750/d45cd2861c043e93c9b5c2839ec42909e2c06b36.pnj" alt="Meditt" width="90" style="display: block;">
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1 style="color: ${textColor}; font-size: 19px; font-weight: 900; margin-bottom: 10px; letter-spacing: -0.5px;">Acesso à sua conta</h1>
            <p style="color: #64748B; font-size: 12px; font-weight: 300; line-height: 1.6; margin-bottom: 20px;">
              Recebeu este e-mail para aceder à sua área pessoal em Meditt.<br>Clique no botão abaixo para entrar de forma segura.
            </p>
            <a href="${url}" style="background-color: ${brandColor}; color: #ffffff; padding: 10px 26px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Entrar na Meditt
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 40px; color: #94a3b8; font-size: 11px; font-weight: 300;">
            Se não solicitou este link, pode ignorar este e-mail.<br>
            © ${new Date().getFullYear()} Meditt - Mindfulness <i>Plus</i>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Template para Recuperação de Senha (Password Reset)
 */
export const passwordResetHTML = ({ userName, resetUrl }: { userName: string, resetUrl: string }) => `
  <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #37374B;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
      
      <div style="background-color: #105ee5; padding: 30px; text-align: center;">
        <img src="https://meditt.space/img/logos/meditt-fav-icon-w-transparent.png" alt="Meditt" style="width: 60px; height: auto;" />
      </div>

      <div style="padding: 40px 30px;">
        <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; text-align: center;">Recuperação de Senha</h1>
        
        <p style="font-size: 16px; color: #4b5563; margin-top: 20px;">
          Olá <strong>${userName}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          Recebemos um pedido para redefinir a senha da tua conta. Se não solicitaste esta alteração, podes ignorar este e-mail.
        </p>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="background-color: #105ee5; color: #ffffff; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
            Definir Nova Senha
          </a>
        </div>

        <div style="background-color: #f0f4ff; border-radius: 12px; padding: 15px; border: 1px dashed #105ee5;">
          <p style="font-size: 13px; color: #1e40af; margin: 0; text-align: center;">
            <strong>Atenção:</strong> Este link expira em 1 hora e só pode ser utilizado uma vez.
          </p>
        </div>
      </div>

      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} Meditt - Mindfulness & Bem-estar</p>
      </div>
    </div>
  </div>
`;

/**
 * NOVO: Template para o Cliente (Recibo + Inscrição)
 * Mostra o detalhe da compra e obriga ao preenchimento do formulário
 */
export const customerOrderConfirmationHTML = ({ 
  orderId, 
  userName, 
  retreatName, 
  price, 
  date 
}: { 
  orderId: string, 
  userName: string, 
  retreatName: string, 
  price: string, 
  date: string 
}) => `
  <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #37374B;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
      
      <div style="background-color: #105ee5; padding: 30px; text-align: center;">
        <img src="https://meditt.space/img/logos/meditt-fav-icon-w-transparent.png" alt="Meditt" style="width: 60px; height: auto;" />
      </div>

      <div style="padding: 40px 30px;">
        <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; text-align: center;">
          Reserva Recebida! 🎉<br>
          <span style="font-size: 18px; font-weight: normal; display: block; margin-top: 4px;">Booking Received! 🎉</span>
        </h1>
        
        <p style="font-size: 16px; color: #4b5563; margin-top: 20px;">
          Olá / Hello <strong>${userName}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          Obrigado! A tua reserva para o <strong>${retreatName}</strong> foi registada com sucesso.<br>
          <i style="font-size: 14px; color: #6b7280;">Thank you! Your booking for <strong>${retreatName}</strong> has been successfully registered.</i>
        </p>

        <div style="margin-top: 25px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <strong style="color: #1f2937;">Detalhes do Pedido / Order Details</strong><br>
                <span style="font-size: 13px; color: #6b7280;">ID: ${orderId} | ${date}</span>
            </div>
            <div style="padding: 15px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding-bottom: 10px; color: #4b5563;"><strong>1x ${retreatName}</strong></td>
                        <td style="padding-bottom: 10px; text-align: right; color: #1f2937;">${price}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 0 5px 0; border-top: 1px solid #f3f4f6; color: #6b7280;">Total:</td>
                        <td style="padding: 15px 0 5px 0; border-top: 1px solid #f3f4f6; text-align: right; font-weight: bold; font-size: 18px; color: #105ee5;">${price}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="margin-top: 35px; background-color: #f0f4ff; border-radius: 16px; padding: 25px; text-align: center; border: 1px solid #bfdbfe;">
          <h3 style="margin-top: 0; color: #1e40af; font-size: 16px; margin-bottom: 10px;">Último Passo Obrigatório / Last Mandatory Step</h3>
          
          <p style="font-size: 14px; line-height: 20px; color: #4b5563; margin-bottom: 25px;">
            Para finalizar a tua inscrição, precisamos que preenchas o formulário com os teus dados.<br>
            <i style="color: #6b7280; margin-top: 5px; display: block;">To finalize your registration, we need you to fill out the form with your details.</i>
          </p>

          <a href="https://meditt.space/inscricao" style="background-color: #105ee5; background-image: linear-gradient(90deg, #105ee5 0%, #00c6ff 100%); color: #ffffff; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(16, 94, 229, 0.3);">
            📝 Formulário de Inscrição <br>
            <span style="font-size: 11px; font-weight: normal; opacity: 0.9;">Registration Form</span>
          </a>
        </div>

      </div>

      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          &copy; ${new Date().getFullYear()} Meditt App — Built with Next.js & Sanity
        </p>
      </div>
    </div>
  </div>
`;