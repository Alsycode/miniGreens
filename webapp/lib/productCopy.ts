// Display-only product copy transforms. The DB `name` (shared with the mobile
// app) keeps the internal form like "Green Vitality (Bag)"; the website shows a
// cleaner label. Nothing here is persisted.

/**
 * Strip a trailing parenthetical variant marker for display, e.g.
 * "Green Vitality (Bag)" → "Green Vitality". Names without one pass through.
 */
export function displayName(raw: string): string {
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim() || raw;
}
