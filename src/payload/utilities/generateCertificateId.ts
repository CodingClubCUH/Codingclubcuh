import crypto from 'crypto'

/**
 * Generates a collision-resistant, URL-safe certificate ID.
 * Standard format: CCCUH-{TYPE}-{YEAR}-{SUFFIX}
 * e.g. CCCUH-CRS-2026-A8F3B92C or CCCUH-INT-2026-F41D09A2
 * Uses cryptographically secure random bytes (32-bit / 4 bytes hex = 4,294,967,296 possibilities per prefix/year).
 */
export function generateCertificateId(
  type: 'CRS' | 'INT' = 'CRS',
  year: number = new Date().getFullYear()
): string {
  let randomSuffix: string

  if (typeof crypto !== 'undefined' && typeof crypto.randomBytes === 'function') {
    randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
  } else if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    const array = new Uint8Array(4)
    globalThis.crypto.getRandomValues(array)
    randomSuffix = Array.from(array, (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  } else {
    randomSuffix = (
      Date.now().toString(16).slice(-4) + Math.random().toString(16).slice(2, 6)
    ).toUpperCase()
  }

  return `CCCUH-${type}-${year}-${randomSuffix}`
}
