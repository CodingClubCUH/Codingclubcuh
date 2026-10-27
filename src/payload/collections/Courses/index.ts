import type { CollectionConfig } from 'payload'
import { slugField } from '@/payload/fields/slug'
import { anyone } from '../../access/anyone'
import { isAdmin } from '../../access/isAdmin'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'instructorName', 'status', 'startingDate', 'isEnrollmentOpen'],
    group: 'Club Core',
    description: 'Manage educational courses and workshops conducted by Coding Club CUH.',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField('title'),
    {
      name: 'status',
      type: 'select',
      defaultValue: 'upcoming',
      required: true,
      options: [
        { label: 'Upcoming (Enrollment Open)', value: 'upcoming' },
        { label: 'Active (In Progress)', value: 'active' },
        { label: 'Completed (Ready for Certificates)', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Set to "Completed" when the course concludes to issue certificates to selected students.',
      },
    },
    {
      name: 'isEnrollmentOpen',
      type: 'checkbox',
      label: 'Open for Student Enrollment',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Fee (₹)',
      defaultValue: 0,
      required: true,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Set 0 for free courses.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Course banner or thumbnail image',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Course Overview & Syllabus',
      admin: {
        description: 'Brief description of topics covered, prerequisites, and learning outcomes.',
      },
    },
    {
      name: 'instructorName',
      type: 'text',
      label: 'Lead Instructor Name',
      required: true,
    },
    {
      name: 'instructorEmail',
      type: 'email',
      label: 'Instructor Email',
    },
    {
      name: 'department',
      type: 'select',
      defaultValue: 'Computer Science and IT',
      options: [
        { label: 'Computer Science and IT', value: 'Computer Science and IT' },
        { label: 'Computer Science', value: 'Computer Science' },
        { label: 'Information Technology', value: 'Information Technology' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startingDate',
          type: 'date',
          label: 'Starting Date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
        {
          name: 'completionDate',
          type: 'date',
          label: 'Completion / End Date',
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
      ],
    },
  ],
}
