/** Safe message for UI; avoids rendering raw objects as React children. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err !== 'object' || err === null) return fallback;
  const res = (err as { response?: { data?: unknown } }).response;
  const data = res?.data;
  if (data == null) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return fallback;
}
