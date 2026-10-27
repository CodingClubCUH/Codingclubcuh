import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const ContactHub: GlobalConfig = {
  slug: 'contact-hub',
  label: 'Contact Inquiries (How People Contact Us)',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Club Core',
    description:
      'Inspect, filter, and reply to all student questions and inquiries submitted through our website contact form and online channels.',
  },
  fields: [
    {
      name: 'contactHubUI',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/payload-admin/ContactHub#default',
        },
      },
    },
  ],
}
