export class EnvLoader {
  private envMap: Record<string, string | undefined>;

  constructor(customEnv?: Record<string, string>) {
    this.envMap = customEnv || process.env;
  }

  public getValue(key: string): string | undefined {
    return this.envMap[key];
  }

  public loadFromMapping(mapping: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [configPath, envKey] of Object.entries(mapping)) {
      const value = this.getValue(envKey);
      if (value !== undefined) {
        this.setNestedValue(result, configPath.split('.'), value);
      }
    }

    return result;
  }

  private setNestedValue(obj: Record<string, any>, path: string[], value: string): void {
    let current = obj;
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) {
        current[key] = {};
      } else if (typeof current[key] !== 'object') {
        throw new Error(`Cannot set nested property '${path.join('.')}' because '${path.slice(0, i + 1).join('.')}' is not an object`);
      }
      current = current[key];
    }

    const lastKey = path[path.length - 1];
    current[lastKey] = this.parseValue(value);
  }

  private parseValue(value: string): any {
    // Try parsing as number
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d*\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Try parsing as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Try parsing as JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not special value
      return value;
    }
  }
} 