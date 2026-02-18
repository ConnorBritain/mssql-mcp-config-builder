/**
 * Returns an HTML string with syntax-highlighted JSON.
 * Wraps keys, strings, numbers, booleans, and null in styled spans.
 */
export function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|\b(true|false)\b|\bnull\b|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
    (match, str: string | undefined, colon: string | undefined, bool: string | undefined, num: string | undefined) => {
      if (str) {
        if (colon) {
          return `<span class="json-key">${str}</span>:`;
        }
        return `<span class="json-string">${str}</span>`;
      }
      if (bool !== undefined) {
        return `<span class="json-boolean">${match}</span>`;
      }
      if (num !== undefined) {
        return `<span class="json-number">${match}</span>`;
      }
      // null
      return `<span class="json-null">${match}</span>`;
    }
  );
}
