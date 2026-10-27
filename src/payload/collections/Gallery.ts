import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Gallery: CollectionConfig<'gallery'> = {
  slug: 'gallery',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'category', 'showOnWebsite', 'updatedAt'],
    description: 'Manage Club Gallery photos shown on the website.',
    group: 'Content & Media',
  },
  hooks: {
    afterChange: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
        } catch (e) {
          payload.logger.warn(`Revalidate gallery error: ${e}`)
        }
      },
    ],
    afterDelete: [
      ({ req: { payload } }) => {
        try {
          revalidatePath('/')
        } catch (e) {
          payload.logger.warn(`Revalidate gallery delete error: ${e}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Brief description/title of the photo' },
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: { description: 'Upload image from Media library' },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Direct Image URL (Optional)',
      admin: { description: 'Direct Cloudinary or hosted image URL if not selecting from Media' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'events',
      options: [
        { label: 'Events', value: 'events' },
        { label: 'Workshops', value: 'workshops' },
        { label: 'Interaction Programs', value: 'interaction' },
        { label: 'Coding Classes', value: 'classes' },
        { label: 'Team Photos', value: 'team' },
        { label: 'Activities', value: 'activities' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'showOnWebsite',
      type: 'checkbox',
      label: 'Show in Website Gallery (Tick mark to display)',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Tick to display this photo in the Club Gallery on the website',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: {
        position: 'sidebar',
        description: 'Display order (1 = first, 2 = second, etc.)',
      },
    },
  ],
}
