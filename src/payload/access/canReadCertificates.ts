import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

/**
 * Access control for Certificates collection.
 * - Administrators have unrestricted access to read all certificates (including drafts).
 * - Non-admins (public verifiers and students) can only read issued certificates.
 */
export const canReadCertificates: Access = ({ req: { user } }) => {
  if (user && (user as User).role === 'admin') {
    return true
  }

  return {
    isIssued: {
      equals: true,
    },
  }
}

/**
 * Field-level access for student relationship field on Certificates.
 * Protects student account linkage and internal IDs from public exposure.
 * - Admins can read the linked student user.
 * - The linked student themselves can read their own account relationship.
 * - Public viewers and third parties cannot read the student user relationship.
 */
export const canReadCertificateStudent: FieldAccess = ({ req: { user }, doc }) => {
  if (user && (user as User).role === 'admin') {
    return true
  }

  if (user && doc?.student) {
    const studentId =
      typeof doc.student === 'object' && doc.student !== null
        ? (doc.student as { id?: string | number }).id
        : doc.student
    return Boolean(studentId && String(studentId) === String(user.id))
  }

  return false
}
