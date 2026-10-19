import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const Notices: GlobalConfig = {
  slug: 'notices',
  label: 'Student Notice Broadcast (Email All)',
  access: {
    read: authenticated,
    update: authenticated,
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
