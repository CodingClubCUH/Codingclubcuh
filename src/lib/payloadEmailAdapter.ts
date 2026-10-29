import type { EmailAdapter } from 'payload'
import nodemailer from 'nodemailer'

export const nodemailerEmailAdapter = (): EmailAdapter => {
  return ({ payload }) => {
    const smtpUser = process.env.SMTP_USER || 'codingclub@cuh.ac.in'
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').trim().replace(/\s+/g, '')
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)
    const defaultFrom = process.env.SMTP_FROM || `"Coding Club CUH" <${smtpUser}>`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      family: 4, // Force IPv4 to prevent ENETUNREACH on smtp.gmail.com IPv6
      auth: smtpPass
        ? {
            user: smtpUser,
            pass: smtpPass,
          }
        : undefined,
    } as any)

    return {
      name: 'nodemailer',
      defaultFromAddress: smtpUser,
      defaultFromName: 'Coding Club CUH',
      sendEmail: async (message) => {
        if (!smtpPass) {
          payload.logger.warn(`[EMAIL SIMULATED] No SMTP_PASS set. Would have sent: "${message.subject}" to ${message.to}`)
          return
        }
        try {
          const info = await transporter.sendMail({
            from: message.from || defaultFrom,
            to: message.to,
            subject: message.subject,
            html: message.html,
            text: message.text,
            replyTo: message.replyTo || smtpUser,
            headers: message.headers,
            attachments: message.attachments,
          })
          payload.logger.info(`[EMAIL SENT] MessageId: ${info.messageId} to ${message.to}`)
          return info
        } catch (error) {
          payload.logger.error(`[EMAIL ERROR] Failed to send email to ${message.to}: ${error}`)
          throw error
        }
      },
    }
  }
}
