const SUSPICIOUS_PATTERN = /<|>|&lt;|&gt;|<\s*\/?\s*script\b|javascript:|on\w+\s*=|data:text\/html/i;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const hasSuspiciousContent = (value: string): boolean => SUSPICIOUS_PATTERN.test(value);

const inspectUnknown = (value: unknown, path: string, hits: string[]): void => {
  if (typeof value === 'string') {
    if (hasSuspiciousContent(value)) {
      hits.push(path);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectUnknown(item, `${path}[${index}]`, hits));
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nested]) => {
      inspectUnknown(nested, `${path}.${key}`, hits);
    });
  }
};

export const findSuspiciousInputPaths = (payload: unknown): string[] => {
  const hits: string[] = [];
  inspectUnknown(payload, 'body', hits);
  return [...new Set(hits)];
};
