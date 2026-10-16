import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const CertificateSettings: GlobalConfig = {
  slug: 'certificate-settings',
  label: 'Certificate Settings & Signatures',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: 'Club Core',
    description: 'Manage course batches, student rosters, 1-click certificate generation, and upload global signatures.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '🎓 Certificate Hub (Batches & Students)',
          fields: [
            {
              name: 'certificateHubUI',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/payload-admin/CertificateHub#default',
                },
              },
            },
          ],
        },
        {
          label: '✍️ Signatures & Email Settings',
          fields: [
            {
              type: 'collapsible',
              label: 'Official Signatures (One-Time Upload)',
              admin: {
                description: 'Upload official signatures here once. They will automatically be attached to all generated certificates.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'signatureInstructor',
                  label: 'Default Program Instructor Signature',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Program Instructor (PNG with transparent background recommended).',
                  },
                },
                {
                  name: 'signatureCoordinator',
                  label: 'Default Program Co-ordinator Signature',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Program Co-ordinator.',
                  },
                },
                {
                  name: 'signatureStudentCoordinator',
                  label: 'Default Student Co-ordinator Signature',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Student Co-ordinator.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Issuance & Email Server (SMTP) Settings',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'senderEmail',
                      label: 'Certificate Sender Email',
                      type: 'email',
                      defaultValue: 'codingclub@cuh.ac.in',
                      admin: {
                        description: 'Email address shown as sender for certificate notifications.',
                      },
                    },
                    {
                      name: 'autoSendEmailOnIssue',
                      label: 'Automatically email certificate link upon generation',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'smtpUser',
                      label: 'SMTP Username / Sender Account',
                      type: 'email',
                      defaultValue: 'codingclub@cuh.ac.in',
                      admin: {
                        description: 'Google account email (e.g. codingclub@cuh.ac.in). Can also be set as SMTP_USER in .env.',
                      },
                    },
                    {
                      name: 'smtpPass',
                      label: 'SMTP / Gmail App Password',
                      type: 'text',
                      access: {
                        read: ({ req }) => Boolean(req.user),
                      },
                      admin: {
                        description: '16-character Google App Password (e.g. abcd efgh ijkl mnop). Required to send real emails to students. Can also be set as SMTP_PASS in .env.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'smtpHost',
                      label: 'SMTP Server Host',
                      type: 'text',
                      defaultValue: 'smtp.gmail.com',
                    },
                    {
                      name: 'smtpPort',
                      label: 'SMTP Port',
                      type: 'number',
                      defaultValue: 465,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
