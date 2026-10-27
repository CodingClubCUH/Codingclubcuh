import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user && (user as User).role === 'admin') {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
