// Simple utility function for testing
export function formatResponseTime(ms: number): string {
  if (ms < 1) {
    return '< 1ms';
  } else if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

export function formatMemory(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function isHealthy(status: string): boolean {
  return status === 'ok';
}
