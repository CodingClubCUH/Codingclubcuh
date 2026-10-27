import type { CollectionConfig } from 'payload'
import { slugField } from '@/payload/fields/slug'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { revalidateEvent, revalidateEventDelete } from './Events/hooks/revalidateEvent'
import { getEffectiveEventStatus } from '../utilities/eventStatus'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'location', 'status', 'isRegistrationOpen'],
    group: 'Club Core',
  },
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateEventDelete],
    afterRead: [
      ({ doc }) => {
        if (doc && doc.date) {
          doc.status = getEffectiveEventStatus(doc);
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      required: true,
      admin: { position: 'sidebar' }
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Workshop', value: 'workshop' },
        { label: 'Hackathon', value: 'hackathon' },
        { label: 'Competition', value: 'competition' },
        { label: 'Seminar', value: 'seminar' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' }
    },
    {
      name: 'imageOrientation',
      type: 'select',
      defaultValue: 'landscape',
      options: [
        { label: 'Landscape (16:9 Banner)', value: 'landscape' },
        { label: 'Portrait (Flyer / Poster)', value: 'portrait' },
        { label: 'Square (1:1)', value: 'square' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Choose layout: Portrait for flyers/posters, Landscape for banners',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'startTime',
      type: 'text',
      admin: { description: 'E.g. 10:00 AM' }
    },
    {
      name: 'endTime',
      type: 'text',
      admin: { description: 'E.g. 05:00 PM' }
    },
    {
      name: 'location',
      type: 'text',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'fullDescription',
      type: 'richText',
    },
    {
      name: 'registrationLink',
      type: 'text',
      admin: { description: 'Google Form or other registration link' }
    },
    {
      name: 'isRegistrationOpen',
      type: 'checkbox',
      defaultValue: true,
      label: 'Registration Open (ON = Open, OFF = Closed)',
      admin: {
        description: 'Turn ON to enable "Register Now". Turn OFF when registrations are closed/full to show "Registrations Closed".',
      },
    },
    {
      name: 'registrationClosedMessage',
      type: 'text',
      label: 'Closed Notice / Reason',
      admin: {
        description: 'Optional message shown to users when registration is closed (e.g. "Registrations closed: capacity reached").',
        condition: (data) => data?.isRegistrationOpen === false,
      },
    },
    {
      name: 'speakers',
      type: 'text',
      admin: { description: 'E.g. John Doe, Jane Smith' }
    },
    {
      name: 'coverPhoto',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        }
      ]
    },
    {
      name: 'participants',
      type: 'text',
      admin: { description: 'E.g. "120+ Students"' }
    },
    ...slugField(),
  ],
}
