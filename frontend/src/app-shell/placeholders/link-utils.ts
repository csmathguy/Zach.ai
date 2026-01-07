const isExternalHref = (href: string): boolean =>
  href.startsWith('http://') || href.startsWith('https://');

export const relForHref = (href: string): string | undefined =>
  isExternalHref(href) ? 'noopener' : undefined;
