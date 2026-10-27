import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'

export const CertificateSettings: GlobalConfig = {
  slug: 'certificate-settings',
  label: 'Certificate Settings & Signatures',
  access: {
    read: () => true,
    update: isAdmin,
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
          label: '✍️ Signatures, Live Preview & Adjustments',
          fields: [
            {
              name: 'signaturePreviewAndAdjusterUI',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/payload-admin/SignatureAdjusterPreview#default',
                },
              },
            },
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
                  label: 'Default Convener Signature (Dr. Sunil Kumar)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Convener (Dr. Sunil Kumar) (PNG with transparent background recommended).',
                  },
                },
                {
                  name: 'signatureCoordinator',
                  label: 'Default Co-convener Signature (Dr. Prithi Maratha)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Co-convener (Dr. Prithi Maratha).',
                  },
                },
                {
                  name: 'signatureStudentCoordinator',
                  label: 'Default Co-convener Signature (Dr. Nitin Goyal)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Digital signature image for Co-convener (Dr. Nitin Goyal).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Signature Size & Alignment Adjustments (Global & Individual)',
              admin: {
                description: 'Fine-tune signature sizes, scale percentages, and vertical/horizontal placement above the certificate underline.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'signatureScale',
                      label: 'Global Signature Scale (%)',
                      type: 'number',
                      defaultValue: 130,
                      min: 50,
                      max: 250,
                      admin: {
                        description: 'Default size multiplier for all signatures (130% = recommended large).',
                        width: '50%',
                      },
                    },
                    {
                      name: 'signatureBaseHeight',
                      label: 'Base Signature Box Height (px)',
                      type: 'number',
                      defaultValue: 95,
                      min: 50,
                      max: 160,
                      admin: {
                        description: 'Height in px of signature container box (default: 95px).',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'signatureInstructorScale',
                      label: 'Convener (Dr. Sunil Kumar) Scale (%)',
                      type: 'number',
                      defaultValue: 130,
                      min: 20,
                      max: 300,
                      admin: { width: '33.33%' },
                    },
                    {
                      name: 'signatureInstructorOffsetY',
                      label: 'Convener Vertical Offset (Y px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves down, negative moves up' },
                    },
                    {
                      name: 'signatureInstructorOffsetX',
                      label: 'Convener Horizontal Offset (X px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves right, negative moves left' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'signatureCoordinatorScale',
                      label: 'Co-convener (Dr. Prithi Maratha) Scale (%)',
                      type: 'number',
                      defaultValue: 130,
                      min: 20,
                      max: 300,
                      admin: { width: '33.33%' },
                    },
                    {
                      name: 'signatureCoordinatorOffsetY',
                      label: 'Co-convener (Dr. Prithi) Vertical Offset (Y px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves down, negative moves up' },
                    },
                    {
                      name: 'signatureCoordinatorOffsetX',
                      label: 'Co-convener (Dr. Prithi) Horizontal Offset (X px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves right, negative moves left' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'signatureStudentCoordinatorScale',
                      label: 'Co-convener (Dr. Nitin Goyal) Scale (%)',
                      type: 'number',
                      defaultValue: 130,
                      min: 20,
                      max: 300,
                      admin: { width: '33.33%' },
                    },
                    {
                      name: 'signatureStudentCoordinatorOffsetY',
                      label: 'Co-convener (Dr. Nitin) Vertical Offset (Y px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves down, negative moves up' },
                    },
                    {
                      name: 'signatureStudentCoordinatorOffsetX',
                      label: 'Co-convener (Dr. Nitin) Horizontal Offset (X px)',
                      type: 'number',
                      defaultValue: 0,
                      min: -200,
                      max: 200,
                      admin: { width: '33.33%', description: 'Positive moves right, negative moves left' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '📧 Issuance & SMTP Server Settings',
          fields: [
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
                      access: {
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
                      },
                      label: 'Certificate Sender Email',
                      type: 'email',
                      defaultValue: 'codingclub@cuh.ac.in',
                      admin: {
                        description: 'Email address shown as sender for certificate notifications.',
                      },
                    },
                    {
                      name: 'autoSendEmailOnIssue',
                      access: {
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
                      },
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
                      access: {
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
                      },
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
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
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
                      access: {
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
                      },
                      label: 'SMTP Server Host',
                      type: 'text',
                      defaultValue: 'smtp.gmail.com',
                    },
                    {
                      name: 'smtpPort',
                      access: {
                        read: isAdminFieldLevel,
                        update: isAdminFieldLevel,
                      },
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
