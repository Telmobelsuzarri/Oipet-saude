import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Fallback to nodemailer for development
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailVerificationData {
  name: string
  verificationLink: string
}

interface PasswordResetData {
  name: string
  resetLink: string
}

interface NotificationData {
  name: string
  petName: string
  message: string
  actionUrl?: string
}

export class EmailService {
  static async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid in production
        const msg = {
          to: template.to,
          from: {
            email: process.env.FROM_EMAIL || 'noreply@oipet.com',
            name: 'OiPet Saúde'
          },
          subject: template.subject,
          html: template.html,
          text: template.text
        }

        await sgMail.send(msg)
      } else {
        // Use nodemailer in development
        await transporter.sendMail({
          from: `"OiPet Saúde" <${process.env.FROM_EMAIL || 'noreply@oipet.com'}>`,
          to: template.to,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      }

      console.log(`Email sent successfully to ${template.to}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static async sendEmailVerification(email: string, data: EmailVerificationData): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: '🐾 Confirme seu email - OiPet Saúde',
      html: this.getEmailVerificationTemplate(data),
      text: `Olá ${data.name}! Confirme seu email clicando no link: ${data.verificationLink}`
    }

    return this.sendEmail(template)
  }

  static async sendPasswordReset(email: string, data: PasswordResetData): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: '🔐 Redefinir senha - OiPet Saúde',
      html: this.getPasswordResetTemplate(data),
      text: `Olá ${data.name}! Redefina sua senha clicando no link: ${data.resetLink}`
    }

    return this.sendEmail(template)
  }

  static async sendNotification(email: string, data: NotificationData): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: `🐕 ${data.petName} - OiPet Saúde`,
      html: this.getNotificationTemplate(data),
      text: `Olá ${data.name}! ${data.message}`
    }

    return this.sendEmail(template)
  }

  private static getEmailVerificationTemplate(data: EmailVerificationData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu email - OiPet Saúde</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #E85A5A, #5AA3A3); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
            .content { padding: 40px 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #E85A5A, #5AA3A3); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐾 OiPet Saúde</div>
                <div class="subtitle">Cuidando da saúde do seu pet</div>
            </div>
            <div class="content">
                <h2>Olá, ${data.name}! 👋</h2>
                <p>Bem-vindo ao <strong>OiPet Saúde</strong>! Estamos muito felizes em tê-lo conosco.</p>
                <p>Para começar a usar nossa plataforma e monitorar a saúde do seu pet, você precisa confirmar seu endereço de email.</p>
                <div style="text-align: center;">
                    <a href="${data.verificationLink}" class="button">Confirmar Email</a>
                </div>
                <p><small>Este link expira em 24 horas por motivos de segurança.</small></p>
                <p>Se você não criou esta conta, pode ignorar este email com segurança.</p>
            </div>
            <div class="footer">
                <p>© 2025 OiPet Saúde. Todos os direitos reservados.</p>
                <p>🐕 Cuidando dos nossos melhores amigos</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  private static getPasswordResetTemplate(data: PasswordResetData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir senha - OiPet Saúde</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #E85A5A, #5AA3A3); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
            .content { padding: 40px 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #E85A5A, #5AA3A3); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .warning { background-color: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐾 OiPet Saúde</div>
                <div class="subtitle">Redefinir senha</div>
            </div>
            <div class="content">
                <h2>Olá, ${data.name}! 🔐</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>OiPet Saúde</strong>.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <div style="text-align: center;">
                    <a href="${data.resetLink}" class="button">Redefinir Senha</a>
                </div>
                <div class="warning">
                    <p><strong>⚠️ Importante:</strong></p>
                    <ul>
                        <li>Este link expira em 1 hora</li>
                        <li>Se você não solicitou esta alteração, ignore este email</li>
                        <li>Sua senha atual permanece válida até ser alterada</li>
                    </ul>
                </div>
                <p>Por segurança, não compartilhe este link com ninguém.</p>
            </div>
            <div class="footer">
                <p>© 2025 OiPet Saúde. Todos os direitos reservados.</p>
                <p>🛡️ Mantendo sua conta segura</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  private static getNotificationTemplate(data: NotificationData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.petName} - OiPet Saúde</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #E85A5A, #5AA3A3); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
            .content { padding: 40px 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #E85A5A, #5AA3A3); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .pet-card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #E85A5A; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐾 OiPet Saúde</div>
                <div class="subtitle">Notificação sobre ${data.petName}</div>
            </div>
            <div class="content">
                <h2>Olá, ${data.name}! 🐕</h2>
                <div class="pet-card">
                    <h3>📋 ${data.petName}</h3>
                    <p>${data.message}</p>
                </div>
                ${data.actionUrl ? `
                <div style="text-align: center;">
                    <a href="${data.actionUrl}" class="button">Ver no App</a>
                </div>
                ` : ''}
                <p>Continue cuidando bem do seu melhor amigo! 💚</p>
            </div>
            <div class="footer">
                <p>© 2025 OiPet Saúde. Todos os direitos reservados.</p>
                <p>🐾 Cuidando dos nossos melhores amigos</p>
            </div>
        </div>
    </body>
    </html>
    `
  }
}