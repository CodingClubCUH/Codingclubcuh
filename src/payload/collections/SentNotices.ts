import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const SentNotices: CollectionConfig = {
  slug: 'sent-notices',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'category', 'recipientsCount', 'status', 'sentAt'],
    group: 'Club Core',
    description: 'Broadcast email notice history and recipient dispatch logs.',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'recipientsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'recipients',
      type: 'json',
      admin: {
        description: 'List of recipient email addresses.',
      },
    },
    {
      name: 'unregisteredCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'registeredCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
    {
      name: 'sentBy',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'senderEmail',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'sent',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Partially Sent', value: 'partially_sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Simulated', value: 'simulated' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'failedCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'errors',
      type: 'json',
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
