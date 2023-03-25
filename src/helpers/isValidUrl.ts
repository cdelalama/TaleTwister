export function isValidUrl(url: string): boolean {
  try {
    if (url.startsWith("data:image/")) {
      return true;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
