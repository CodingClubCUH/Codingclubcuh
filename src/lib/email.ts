import nodemailer from 'nodemailer'

interface SendCertificateEmailParams {
  to: string
  studentName: string
  courseTitle: string
  certificateId: string
  issueDate?: string
  serverUrl?: string
}

export async function sendCertificateEmail({
  to,
  studentName,
  courseTitle,
  certificateId,
  issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL && !process.env.NEXT_PUBLIC_SERVER_URL.includes('localhost'))
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : 'https://codingclubcuh.online',
}: SendCertificateEmailParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  let fromEmail = process.env.SMTP_FROM || '"Coding Club CUH" <codingclub@cuh.ac.in>'
  let smtpUser = process.env.SMTP_USER || 'codingclub@cuh.ac.in'
  let smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || ''
  let smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  let smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)

  // If SMTP password not in env, attempt to load from CertificateSettings global in CMS
  if (!smtpPass) {
    try {
      const { getPayload } = await import('payload')
      const configPromise = (await import('@payload-config')).default
      const payload = await getPayload({ config: configPromise })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settings: any = await payload.findGlobal({ slug: 'certificate-settings' })
      if (settings) {
        if (settings.smtpPass) smtpPass = settings.smtpPass
        if (settings.smtpUser) {
          smtpUser = settings.smtpUser
          fromEmail = settings.senderEmail ? `"Coding Club CUH" <${settings.senderEmail}>` : `"Coding Club CUH" <${smtpUser}>`
        }
        if (settings.smtpHost) smtpHost = settings.smtpHost
        if (settings.smtpPort) smtpPort = parseInt(settings.smtpPort, 10)
      }
    } catch {
      // Fallback if global lookup is unavailable
    }
  }

  // Ensure production domain is used for links if configured or running in production
  const effectiveBaseUrl = (serverUrl && !serverUrl.includes('localhost'))
    ? serverUrl
    : 'https://codingclubcuh.online'

  const certUrl = `${effectiveBaseUrl}/certificate/${certificateId}`
  const verifyUrl = `${effectiveBaseUrl}/verify/${certificateId}`
  const studentDashboardUrl = `${effectiveBaseUrl}/student`

  const subject = `🎓 Congratulations ${studentName}! Your Certificate for ${courseTitle} is Ready - Coding Club CUH`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0c10;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #12141c;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #0d503c 0%, #137558 50%, #1e9673 100%);
      padding: 36px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 8px 0 0;
      color: #a7f3d0;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .content {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 24px;
    }
    .cert-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .cert-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 14px;
    }
    .cert-row:last-child {
      border-bottom: none;
    }
    .cert-label {
      color: #64748b;
      font-weight: 500;
    }
    .cert-value {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .cert-id {
      font-family: 'Courier New', monospace;
      color: #38bdf8;
      font-weight: 700;
    }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
    }
    .button-wrap {
      text-align: center;
      margin: 32px 0 24px;
    }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #137558 0%, #1e9673 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 8px 20px rgba(19, 117, 88, 0.4);
    }
    .verify-link {
      text-align: center;
      font-size: 13px;
      color: #64748b;
      margin-top: 14px;
    }
    .verify-link a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 500;
      word-break: break-all;
    }
    .footer {
      background-color: #0a0b10;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #94a3b8;
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 30px 10px;">
    <tr>
      <td align="center">
        <div class="wrapper" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #12141c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); text-align: left;">
          
          <!-- Header Banner -->
          <div class="header" style="background: linear-gradient(135deg, #0d503c 0%, #137558 50%, #1e9673 100%); padding: 36px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">CODING CLUB CUH</h1>
            <p style="margin: 8px 0 0; color: #a7f3d0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">Central University of Haryana</p>
          </div>

          <!-- Body Content -->
          <div class="content" style="padding: 32px 30px;">
            <h2 class="greeting" style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px;">Congratulations, ${studentName}! 🎉</h2>
            
            <p class="body-text" style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px;">
              We are thrilled to announce that you have successfully completed the <strong>${courseTitle}</strong> course and have been awarded an official Certificate of Completion by the Coding Club, Central University of Haryana.
            </p>

            <!-- Certificate Details Table Card -->
            <div class="cert-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 14px; font-weight: 500;">Student Name:</td>
                  <td align="right" style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9; font-size: 14px; font-weight: 700;">${studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 14px; font-weight: 500;">Programme / Course:</td>
                  <td align="right" style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9; font-size: 14px; font-weight: 700;">${courseTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 14px; font-weight: 500;">Certificate ID:</td>
                  <td align="right" style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #38bdf8; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700;">${certificateId}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 14px; font-weight: 500;">Awarded On:</td>
                  <td align="right" style="padding: 9px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9; font-size: 14px; font-weight: 600;">${issueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; color: #64748b; font-size: 14px; font-weight: 500;">Authenticity:</td>
                  <td align="right" style="padding: 9px 0;">
                    <span class="badge" style="display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">✓ Cryptographically Verified</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div class="button-wrap" style="text-align: center; margin: 32px 0 20px;">
              <a href="${certUrl}" target="_blank" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, #137558 0%, #1e9673 100%); background-color: #137558; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 20px rgba(19, 117, 88, 0.4);">
                🎓 View & Download Certificate
              </a>
            </div>

            <!-- Direct Verification Link -->
            <div class="verify-link" style="text-align: center; font-size: 13px; color: #64748b; margin-top: 14px;">
              Direct Verifier Link: <a href="${verifyUrl}" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 500;">${verifyUrl}</a>
            </div>

            <p class="body-text" style="font-size: 13px; margin-top: 24px; text-align: center; color: #94a3b8; line-height: 1.6;">
              You can also view and track all your earned certificates anytime by logging into your student account at <a href="${studentDashboardUrl}" style="color: #60a5fa; text-decoration: none;">${studentDashboardUrl}</a>.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer" style="background-color: #0a0b10; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0 0 6px;">Sent by <strong>Coding Club CUH</strong> &bull; Central University of Haryana, Mahendergarh, Haryana &bull; 123031</p>
            <p style="margin: 0 0 6px;">Official Club Email: <a href="mailto:${smtpUser}" style="color: #94a3b8; text-decoration: none;">${smtpUser}</a></p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Coding Club CUH. All rights reserved.</p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`

  // Check if SMTP password is provided
  if (!smtpPass || !smtpPass.trim()) {
    console.warn('\n======================================================')
    console.warn('[EMAIL SERVICE - CONFIGURATION REQUIRED]')
    console.warn(`Target Student: ${to}`)
    console.warn(`Certificate ID: ${certificateId}`)
    console.warn(`Status: Email could not be delivered because SMTP password is not configured.`)
    console.warn(`Action: Set SMTP_PASS in .env or configure in Payload Admin: Certificate Settings > Signatures & Email Settings`)
    console.warn('======================================================\n')
    return {
      success: false,
      simulated: true,
      error: 'SMTP password not configured. Please set SMTP_PASS in .env or configure in Admin > Certificate Settings to send real emails to students.',
    }
  }

  try {
    const cleanedPass = smtpPass.trim().replace(/\s+/g, '')
    const isGmail = smtpHost.includes('gmail.com') || smtpUser.includes('@gmail.com') || smtpUser.endsWith('@cuh.ac.in')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transportConfig: any = isGmail
      ? {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanedPass,
        },
      }
      : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: cleanedPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }

    const transporter = nodemailer.createTransport(transportConfig)

    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: smtpUser,
      to,
      subject,
      html,
    })

    console.log(`[EMAIL SERVICE] Certificate email successfully sent to ${to} (Message ID: ${info.messageId})`)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[EMAIL SERVICE ERROR] Failed to send certificate email to ${to}:`, errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export interface SendNoticeEmailParams {
  to: string
  studentName?: string
  subject: string
  noticeContent: string
  category?: string
  serverUrl?: string
  ctaText?: string
  ctaUrl?: string
  isUnregistered?: boolean
}

export async function sendNoticeEmail({
  to,
  studentName = 'Student',
  subject,
  noticeContent,
  category = 'Club Announcement',
  serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL && !process.env.NEXT_PUBLIC_SERVER_URL.includes('localhost'))
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : 'https://codingclubcuh.online',
  ctaText,
  ctaUrl,
  isUnregistered = false,
}: SendNoticeEmailParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  let fromEmail = process.env.SMTP_FROM || '"Coding Club CUH" <codingclub@cuh.ac.in>'
  let smtpUser = process.env.SMTP_USER || 'codingclub@cuh.ac.in'
  let smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || ''
  let smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  let smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)

  if (!smtpPass) {
    try {
      const { getPayload } = await import('payload')
      const configPromise = (await import('@payload-config')).default
      const payload = await getPayload({ config: configPromise })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settings: any = await payload.findGlobal({ slug: 'certificate-settings' })
      if (settings) {
        if (settings.smtpPass) smtpPass = settings.smtpPass
        if (settings.smtpUser) {
          smtpUser = settings.smtpUser
          fromEmail = settings.senderEmail ? `"Coding Club CUH" <${settings.senderEmail}>` : `"Coding Club CUH" <${smtpUser}>`
        }
        if (settings.smtpHost) smtpHost = settings.smtpHost
        if (settings.smtpPort) smtpPort = parseInt(settings.smtpPort, 10)
      }
    } catch {
      // Fallback
    }
  }

  const effectiveBaseUrl = (serverUrl && !serverUrl.includes('localhost'))
    ? serverUrl
    : 'https://codingclubcuh.online'

  const defaultCtaUrl = isUnregistered
    ? `${effectiveBaseUrl}/auth/signup`
    : `${effectiveBaseUrl}/student`

  const defaultCtaText = isUnregistered
    ? 'Register & Join Coding Club CUH →'
    : 'Go to Student Portal →'

  const effectiveCtaUrl = ctaUrl?.trim() ? (ctaUrl.trim().startsWith('http') || ctaUrl.trim().startsWith('/') ? (ctaUrl.trim().startsWith('/') ? `${effectiveBaseUrl}${ctaUrl.trim()}` : ctaUrl.trim()) : `https://${ctaUrl.trim()}`) : defaultCtaUrl
  const effectiveCtaText = ctaText?.trim() || defaultCtaText
  const showUnregisteredBanner = Boolean(isUnregistered || effectiveCtaUrl.includes('/auth/signup'))

  // Format paragraphs from plain text or markdown-style text
  const formattedContent = noticeContent
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin: 0 0 16px; line-height: 1.7; font-size: 15px; color: #cbd5e1;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0c10; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c10; padding: 20px 0;">
    <tr>
      <td align="center">
        <div style="max-width: 600px; margin: 0 auto; background-color: #12141c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; text-align: left;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%); padding: 32px 28px; text-align: center;">
            <img src="${effectiveBaseUrl}/ccc_logo.png" width="52" height="52" alt="Coding Club CUH" style="display: block; margin: 0 auto 12px; border-radius: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));" />
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">
              ${category}
            </div>
            <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.3;">
              Coding Club CUH
            </h1>
            <p style="margin: 4px 0 0; color: rgba(255, 255, 255, 0.85); font-size: 13px;">
              Central University of Haryana &bull; Official Student Notice
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 28px 20px;">
            <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <h2 style="margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #f8fafc;">
                ${subject}
              </h2>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Published on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #f1f5f9;">
              Dear ${studentName},
            </p>

            ${formattedContent}

            ${showUnregisteredBanner ? `
            <div style="margin: 22px 0; padding: 14px 16px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); font-size: 13px; color: #93c5fd; line-height: 1.5;">
              <strong style="color: #60a5fa;">💡 Note for Non-Registered Students:</strong> You have received this invitation as an official student of Central University of Haryana. Registering gives you full access to upcoming workshops, hackathons, and cryptographic certificates.
            </div>
            ` : ''}

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0 20px;">
              <a href="${effectiveCtaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                ${effectiveCtaText}
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px; text-align: center; line-height: 1.5;">
              If you have any questions regarding this notice, reply directly to this email or reach us through the website contact desk.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #0a0b10; padding: 20px 28px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0 0 4px;">Sent by <strong>Coding Club CUH</strong> &bull; Central University of Haryana, Mahendergarh, Haryana &bull; 123031</p>
            <p style="margin: 0;">Official Contact: <a href="mailto:${smtpUser}" style="color: #94a3b8; text-decoration: none;">${smtpUser}</a></p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`

  if (!smtpPass || !smtpPass.trim()) {
    console.warn(`[NOTICE EMAIL SIMULATED] To: ${to} | Subject: ${subject} (No SMTP password set)`)
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    }
  }

  try {
    const cleanedPass = smtpPass.trim().replace(/\s+/g, '')
    const isGmail = smtpHost.includes('gmail.com') || smtpUser.includes('@gmail.com') || smtpUser.endsWith('@cuh.ac.in')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transportConfig: any = isGmail
      ? {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanedPass,
        },
      }
      : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: cleanedPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }

    const transporter = nodemailer.createTransport(transportConfig)

    const cleanSubject = subject.trim()
    const finalSubject = /^[^\w\s]/.test(cleanSubject)
      ? `${cleanSubject} - Coding Club CUH`
      : `📢 ${cleanSubject} - Coding Club CUH`

    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: smtpUser,
      to,
      subject: finalSubject,
      html,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[NOTICE EMAIL ERROR] Failed to send notice to ${to}:`, errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export interface SendContactReplyEmailParams {
  to: string
  recipientName: string
  originalSubject: string
  replyMessage: string
  originalMessage: string
}

export async function sendContactReplyEmail({
  to,
  recipientName,
  originalSubject,
  replyMessage,
  originalMessage,
}: SendContactReplyEmailParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const fromEmail = process.env.SMTP_FROM || '"Coding Club CUH" <codingclub@cuh.ac.in>'
  let smtpUser = process.env.SMTP_USER || 'codingclub@cuh.ac.in'
  let smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || ''
  let smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  let smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)

  if (!smtpPass) {
    try {
      const { getPayload } = await import('payload')
      const configPromise = (await import('@payload-config')).default
      const payload = await getPayload({ config: configPromise })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settings: any = await payload.findGlobal({ slug: 'certificate-settings' })
      if (settings?.smtpPass) {
        smtpPass = settings.smtpPass
        if (settings.smtpUser) smtpUser = settings.smtpUser
        if (settings.smtpHost) smtpHost = settings.smtpHost
        if (settings.smtpPort) smtpPort = parseInt(settings.smtpPort, 10)
      }
    } catch {
      // Fallback
    }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL && !process.env.NEXT_PUBLIC_SERVER_URL.includes('localhost'))
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : 'https://codingclubcuh.online'

  const subject = `Re: ${originalSubject} - Coding Club CUH Support`

  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0c10; color: #e2e8f0; padding: 24px;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #12141c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 28px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <img src="${baseUrl}/ccc_logo.png" width="40" height="40" alt="Coding Club CUH" style="border-radius: 10px;" />
      <div>
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 800;">Coding Club CUH Support</h2>
        <p style="margin: 2px 0 0; color: #94a3b8; font-size: 12px;">Official Desk Reply &bull; Central University of Haryana</p>
      </div>
    </div>
    <p>Dear ${recipientName},</p>
    <div style="margin: 18px 0; padding: 16px; background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 6px; font-size: 15px; color: #f8fafc; line-height: 1.6;">
      ${replyMessage.replace(/\n/g, '<br />')}
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #94a3b8;">
      <p style="margin: 0 0 6px;"><strong>Your Original Message:</strong></p>
      <blockquote style="margin: 0; padding: 8px 12px; background: rgba(255, 255, 255, 0.03); border-radius: 4px; font-style: italic; color: #64748b;">
        ${originalMessage.replace(/\n/g, '<br />')}
      </blockquote>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
      Coding Club CUH &bull; Central University of Haryana &bull; <a href="mailto:${smtpUser}" style="color: #38bdf8;">${smtpUser}</a>
    </p>
  </div>
</body>
</html>
`

  if (!smtpPass || !smtpPass.trim()) {
    console.warn(`[REPLY EMAIL SIMULATED] To: ${to} | Subject: ${subject}`)
    return { success: true, simulated: true, messageId: `simulated-reply-${Date.now()}` }
  }

  try {
    const isGmail = smtpHost.includes('gmail.com') || smtpUser.includes('@gmail.com') || smtpUser.endsWith('@cuh.ac.in')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transportConfig: any = isGmail
      ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass.trim().replace(/\s+/g, '') } }
      : { host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass.trim().replace(/\s+/g, '') } }

    const transporter = nodemailer.createTransport(transportConfig)
    const info = await transporter.sendMail({
      from: fromEmail,
      replyTo: smtpUser,
      to,
      subject,
      html,
    })
    return { success: true, messageId: info.messageId }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

