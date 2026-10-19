import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const ContactHub: GlobalConfig = {
  slug: 'contact-hub',
  label: 'Contact Inquiries (How People Contact Us)',
  access: {
    read: authenticated,
    update: authenticated,
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
