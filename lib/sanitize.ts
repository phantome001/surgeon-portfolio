import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML for rich text content (e.g., doctor's bio)
 * Only use this when HTML rendering is required
 * For all other user content, use plain text rendering (React escapes by default)
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [], // No attributes at all
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  }) as string
}

/**
 * Strip all HTML tags - returns plain text only
 * Use for user-generated content that should never render HTML
 */
export function stripHtml(dirty: string): string {
  const tempDiv = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
  return tempDiv.replace(/<[^>]*>/g, '').trim()
}
