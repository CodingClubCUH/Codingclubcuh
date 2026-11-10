import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    group: 'Club Core',
    description: 'Inquiries and questions submitted via website contact form and external channels.',
  },
  access: {
    create: anyone, // Allow public submissions from /contact
    read: isAdmin,   // Strict access: only admins can inspect student inquiries
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
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
      name: 'channel',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website Form', value: 'website' },
        { label: 'Direct Email', value: 'email' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'unread',
      options: [
        { label: 'Unread', value: 'unread' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal admin notes for this inquiry.',
      },
    },
    {
      name: 'replyMessage',
      type: 'textarea',
      admin: {
        description: 'Sent email reply content.',
      },
    },
    {
      name: 'repliedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
