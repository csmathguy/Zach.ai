type DebugArgs = unknown[];

interface DebugController {
  readonly enabled: boolean;
  setEnabled(enabled: boolean): void;
  log(...args: DebugArgs): void;
  info(...args: DebugArgs): void;
  warn(...args: DebugArgs): void;
  error(...args: DebugArgs): void;
}

let enabled = import.meta.env.DEV;

function createDebugger(): DebugController {
  const emit = (method: 'log' | 'info' | 'warn' | 'error', args: DebugArgs): void => {
    if (!enabled) {
      return;
    }

    // eslint-disable-next-line no-console
    console[method]('[APP]', ...args);
  };

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(value: boolean) {
      enabled = value;
    },
    log: (...args: DebugArgs) => emit('log', args),
    info: (...args: DebugArgs) => emit('info', args),
    warn: (...args: DebugArgs) => emit('warn', args),
    error: (...args: DebugArgs) => emit('error', args),
  };
}

export const DEBUGGER: DebugController = createDebugger();

// Expose a simple toggle in the browser console when needed.
//   window.APP_DEBUGGER.setEnabled(true)
//   window.APP_DEBUGGER.enabled
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).APP_DEBUGGER = DEBUGGER;
}
