import type { GlobalConfig } from 'payload'

import { link } from '@/payload/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'
import { isAdmin } from '../access/isAdmin'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    group: 'Site Globals',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/payload/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
