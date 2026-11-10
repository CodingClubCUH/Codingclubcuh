import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { getAuthUser } from './getAuthUser'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const { user, token } = await getAuthUser()

  if (validUserRedirect && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && !user) {
    redirect(nullUserRedirect)
  }

  return {
    token: token || '',
    user: user!,
  }
}
