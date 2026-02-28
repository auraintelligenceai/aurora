import { logWarn } from "../logger.js";

const SECRET_PATTERNS = [
  // API tokens and keys
  {
    name: 'API Key',
    pattern: /(?:api|access|secret|private)_?(?:key|token|secret|id)?\s*[=:]\s*['"]?([a-zA-Z0-9-_]{16,})['"]?/gi,
  },
  {
    name: 'Bearer Token',
    pattern: /bearer\s+([a-zA-Z0-9-_]{16,})/gi,
  },
  {
    name: 'GitHub Token',
    pattern: /gh[ops]_[0-9a-zA-Z]{36}/g,
  },
  {
    name: 'OpenAI Key',
    pattern: /sk-[a-zA-Z0-9_-]{20,}/g,
  },
  {
    name: 'Slack Token',
    pattern: /xox[bp]-\d+-[0-9a-zA-Z-]+/g,
  },
  {
    name: 'Telegram Token',
    pattern: /[0-9]{10}:[a-zA-Z0-9_-]{35}/g,
  },
  {
    name: 'Discord Token',
    pattern: /[MN][A-Za-z0-9_-]{23}\.[\w-]{6}\.[\w-]{27}/g,
  },
  {
    name: 'AWS Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
  },
  {
    name: 'Firebase Key',
    pattern: /AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140}/g,
  },
  // Add more patterns as needed
];

export class SecretRedactor {
  /**
   * Redact secrets from text
   */
  static redact(text: string): string {
    let result = text;
    
    for (const { name, pattern } of SECRET_PATTERNS) {
      result = result.replace(pattern, (match, group1) => {
        const identifier = group1 || match;
        const redacted = this.createRedactedString(identifier);
        logWarn(`Redacted ${name} from output`);
        return match.replace(identifier, redacted);
      });
    }
    
    return result;
  }

  /**
   * Create a redacted version of the secret
   */
  static createRedactedString(secret: string): string {
    if (secret.length <= 8) {
      return '***';
    }
    
    const startChars = 4;
    const endChars = 4;
    const middleChars = secret.length - startChars - endChars;
    return secret.slice(0, startChars) + '*'.repeat(middleChars) + secret.slice(-endChars);
  }

  /**
   * Check if text contains secrets
   */
  static containsSecrets(text: string): boolean {
    return SECRET_PATTERNS.some(({ pattern }) => pattern.test(text));
  }

  /**
   * Redact secrets from JSON objects
   */
  static redactObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.redact(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('api') || 
          lowerKey.includes('key') || 
          lowerKey.includes('token') || 
          lowerKey.includes('secret') || 
          lowerKey.includes('password') || 
          lowerKey.includes('credential')
        ) {
          result[key] = '***';
        } else {
          result[key] = this.redactObject(value);
        }
      }
      return result;
    }
    
    return obj;
  }

  /**
   * Redact secrets from error stack traces
   */
  static redactStacktrace(stacktrace: string): string {
    let result = stacktrace;
    
    // Redact file paths that might contain secrets
    result = result.replace(/at\s+.*?\((.*?)\)/g, (match, path) => {
      if (path && this.containsSecrets(path)) {
        return match.replace(path, '***');
      }
      return match;
    });
    
    return this.redact(result);
  }

  /**
   * Redact secrets from log lines
   */
  static redactLogLine(logLine: string): string {
    return this.redact(logLine);
  }
}

export function redactSecrets(text: string): string {
  return SecretRedactor.redact(text);
}

export function containsSecrets(text: string): boolean {
  return SecretRedactor.containsSecrets(text);
}

export function redactObject(obj: any): any {
  return SecretRedactor.redactObject(obj);
}

export function redactStacktrace(stacktrace: string): string {
  return SecretRedactor.redactStacktrace(stacktrace);
}

export function redactLogLine(logLine: string): string {
  return SecretRedactor.redactLogLine(logLine);
}
