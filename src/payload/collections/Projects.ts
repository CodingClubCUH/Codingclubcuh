import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'techStack', 'github'],
    group: 'Content & Media',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Web Dev', value: 'web' },
        { label: 'App Dev', value: 'app' },
        { label: 'AI/ML', value: 'ai' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' }
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'techStack',
      type: 'text',
      admin: { description: 'E.g. Next.js, Payload CMS, Tailwind CSS' },
      required: true,
    },
    {
      name: 'members',
      type: 'text',
      admin: { description: 'Names of the team members who built this' },
      required: true,
    },
    {
      name: 'github',
      type: 'text',
      admin: { description: 'GitHub Repository URL' },
    },
    {
      name: 'liveDemo',
      type: 'text',
      admin: { description: 'Live Demo URL' },
    },
    {
      name: 'screenshot',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
