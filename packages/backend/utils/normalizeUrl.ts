import _normalizeUrl from 'normalize-url';

export function normalizeUrl(url: string): string {
  return _normalizeUrl(url, {});
}
