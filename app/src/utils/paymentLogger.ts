type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const minLevel: LogLevel = (process.env.PAYMENT_LOG_LEVEL as LogLevel) || 'DEBUG';

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, step: string, message: string, data?: any): string {
  const dataStr = data !== undefined ? ` | ${JSON.stringify(data)}` : '';
  return `[PAYMENT:${level}] ${timestamp()} | ${step} | ${message}${dataStr}`;
}

export const paymentLog = {
  info(step: string, message: string, data?: any) {
    if (LEVEL_PRIORITY[minLevel] <= LEVEL_PRIORITY.INFO) {
      console.log(formatMessage('INFO', step, message, data));
    }
  },
  warn(step: string, message: string, data?: any) {
    if (LEVEL_PRIORITY[minLevel] <= LEVEL_PRIORITY.WARN) {
      console.warn(formatMessage('WARN', step, message, data));
    }
  },
  error(step: string, message: string, data?: any) {
    if (LEVEL_PRIORITY[minLevel] <= LEVEL_PRIORITY.ERROR) {
      console.error(formatMessage('ERROR', step, message, data));
    }
  },
  debug(step: string, message: string, data?: any) {
    if (LEVEL_PRIORITY[minLevel] <= LEVEL_PRIORITY.DEBUG) {
      console.log(formatMessage('DEBUG', step, message, data));
    }
  },
};

export function withTimer<T>(step: string, label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  paymentLog.debug(step, `${label} - START`);
  return fn().then(
    (result) => {
      paymentLog.debug(step, `${label} - DONE (${Date.now() - start}ms)`);
      return result;
    },
    (error) => {
      paymentLog.error(step, `${label} - FAILED (${Date.now() - start}ms)`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  );
}
