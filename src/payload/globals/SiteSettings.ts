import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings & Maintenance',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'Administration',
    description: 'Global site configuration, student maintenance mode toggle, and club announcements.',
  },
  fields: [
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      label: 'Enable Maintenance Mode (Blocks student logins)',
      defaultValue: false,
      admin: {
        description:
          'When enabled, students cannot log in or view student dashboard. Admins can still access the admin portal. A maintenance notice will be shown on the home page.',
      },
    },
    {
      name: 'maintenanceMessage',
      type: 'textarea',
      label: 'Maintenance Notice Message',
      defaultValue:
        'The student portal is currently undergoing scheduled maintenance. Student login is temporarily disabled. Please check back later!',
      admin: {
        description: 'This message will be shown on the home page and login screen when maintenance mode is active.',
        condition: (data) => Boolean(data?.maintenanceMode),
      },
    },
    {
      name: 'allowAdminBypass',
      type: 'checkbox',
      label: 'Allow Admins to Log In during Maintenance',
      defaultValue: true,
      admin: {
        description: 'Admins will always be able to log in to /admin and manage club records.',
      },
    },
  ],
}
