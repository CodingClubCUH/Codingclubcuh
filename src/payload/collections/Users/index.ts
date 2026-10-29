import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

import { isAdminOrSelf } from '../../access/isAdmin'

const isAdmin = ({ req }: { req: { user?: User | null } }): boolean => {
  const user = req?.user;
  return user?.role === 'admin';
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: isAdmin,
    create: () => true, // Allow public signups
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'username', 'course', 'semester', 'department', 'role'],
    useAsTitle: 'name',
    group: 'Administration',
  },
  hooks: {
    afterChange: [
      async ({ doc, req: { payload }, previousDoc, operation }) => {
        // If course, semester, department, or name changed, sync all linked certificates
        if (
          operation === 'update' &&
          (doc.course !== previousDoc?.course ||
            doc.semester !== previousDoc?.semester ||
            doc.department !== previousDoc?.department ||
            doc.name !== previousDoc?.name)
        ) {
          try {
            const certs = await payload.find({
              collection: 'certificates',
              where: {
                student: {
                  equals: doc.id,
                },
              },
              limit: 200,
            })

            for (const cert of certs.docs) {
              // Preserve immutability of already issued certificates
              if (cert.isIssued) continue;
              await payload.update({
                collection: 'certificates',
                id: cert.id,
                data: {
                  ...(doc.course ? { course: doc.course } : {}),
                  ...(doc.semester ? { semester: doc.semester } : {}),
                  ...(doc.department ? { department: doc.department } : {}),
                  ...(doc.name ? { studentName: doc.name } : {}),
                },
              })
            }
          } catch (err) {
            payload.logger.error(`Failed to sync certificates after user update: ${err}`)
          }
        }
      },
    ],
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: false,
    },
    forgotPassword: {
      expiration: 3600000, // 1 hour expiration
      generateEmailHTML: async (args) => {
        const token = args?.token
        const user = args?.user
        const rawServerURL =
          process.env.SITE_URL ||
          process.env.NEXT_PUBLIC_SERVER_URL ||
          process.env.URL ||
          'https://codingclubcuh.online'
        const serverURL = (rawServerURL && !rawServerURL.includes('localhost'))
          ? rawServerURL.replace(/\/+$/, '')
          : 'https://codingclubcuh.online'
        const resetURL = `${serverURL}/auth/reset-password?token=${token}`

        return `
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .header { text-align: center; margin-bottom: 24px; }
                .title { font-size: 22px; font-weight: bold; color: #111827; margin: 0 0 8px 0; }
                .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-weight: 600; font-size: 15px; margin: 20px 0; }
                .footer { font-size: 13px; color: #6b7280; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="title">Coding Club CUH</h1>
                  <p style="color: #4b5563; margin: 0;">Password Reset Request</p>
                </div>
                <p>Hello ${user?.name || 'Student'},</p>
                <p>We received a request to reset the password for your student account (<strong>${user?.email || user?.username}</strong>).</p>
                <div style="text-align: center;">
                  <a href="${resetURL}" class="btn" target="_blank">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #4b5563;">If the button above does not work, copy and paste this URL into your browser:</p>
                <p style="font-size: 13px; word-break: break-all; color: #3b82f6;"><a href="${resetURL}">${resetURL}</a></p>
                <div class="footer">
                  <p>If you did not make this request, you can safely ignore this email — your password will remain unchanged.</p>
                  <p>This reset link will expire in 1 hour.</p>
                </div>
              </div>
            </body>
          </html>
        `
      },
      generateEmailSubject: () => 'Reset Your Password - Coding Club CUH',
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Student', value: 'student' },
      ],
      defaultValue: 'student',
      required: true,
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'username',
      type: 'text',
      label: 'Roll Number / Username',
      unique: true,
      admin: {
        description: 'Optional roll number for student login without email.',
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      admin: {
        description: 'Official academic department at Central University of Haryana.',
        components: {
          Field: '@/components/payload-admin/AcademicFields/DepartmentSelectField#default',
        },
      },
    },
    {
      name: 'course',
      type: 'text',
      label: 'Course / Degree',
      admin: {
        description: 'Official degree program or course. Automatically filtered by department.',
        components: {
          Field: '@/components/payload-admin/AcademicFields/CourseSelectField#default',
        },
      },
    },
    {
      name: 'semester',
      type: 'text',
      label: 'Semester / Year',
      admin: {
        description: 'Academic semester standing.',
        components: {
          Field: '@/components/payload-admin/AcademicFields/SemesterSelectField#default',
        },
      },
    },
  ],
  timestamps: true,
}
