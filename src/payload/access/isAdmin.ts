import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

/**
 * Returns true if the user is authenticated and has the role 'admin'.
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user as User).role === 'admin')
}

/**
 * Field-level access: returns true if the user has role 'admin'.
 */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && (user as User).role === 'admin')
}

/**
 * Access for User documents: admins can read/update all users,
 * students can only read/update their own document.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as User).role === 'admin') return true
  return {
    id: {
      equals: user.id,
    },
  }
}

/**
 * Field-level access: returns true if user is admin or is accessing their own document.
 */
export const isAdminOrSelfFieldLevel: FieldAccess = ({ req: { user }, id }) => {
  if (!user) return false
  if ((user as User).role === 'admin') return true
  return String(user.id) === String(id)
}

/**
 * Access for Enrollment documents: admins can view/manage all enrollments,
 * students can only view/create their own enrollment records.
 */
export const isAdminOrStudentOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as User).role === 'admin') return true
  return {
    student: {
      equals: user.id,
    },
  }
}

/**
 * Create access for Enrollment documents: students can only enroll themselves.
 */
export const canCreateEnrollment: Access = ({ req: { user }, data }) => {
  if (!user) return false
  if ((user as User).role === 'admin') return true
  const studentId = typeof data?.student === 'object' ? data?.student?.id : data?.student
  return Boolean(studentId && String(studentId) === String(user.id))
}
