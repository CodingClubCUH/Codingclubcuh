import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Notices: GlobalConfig = {
  slug: 'notices',
  label: 'Student Notice Broadcast (Email All)',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Club Core',
    description:
      'Mass email announcer to select all registered student email addresses and broadcast official notices, workshop schedules, and updates at once.',
  },
  fields: [
    {
      name: 'noticeBroadcastUI',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/payload-admin/NoticeBroadcast#default',
        },
      },
    },
  ],
}
