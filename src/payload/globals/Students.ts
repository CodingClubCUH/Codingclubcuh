import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Students: GlobalConfig = {
  slug: 'students',
  label: 'Students',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Club Core',
    description:
      'Comprehensive student directory to filter, search, and inspect registered students by batch, course, month, and year.',
  },
  fields: [
    {
      name: 'studentsHubUI',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/payload-admin/StudentsHub#default',
        },
      },
    },
  ],
}
