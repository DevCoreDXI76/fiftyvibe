type GtagFunction = (...args: unknown[]) => void;

declare global {
  // eslint-disable-next-line no-var
  var gtag: GtagFunction | undefined;
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof globalThis.gtag !== "function") {
    return;
  }
  globalThis.gtag("event", name, params);
}
