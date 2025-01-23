import { ConfigMap, ConfigSource } from './types';

export class ConfigMerger {
  private configMap: ConfigMap = {};

  private flattenObject(obj: any, prefix = '', source: string): void {
    for (const key in obj) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObject(value, fullPath, source);
      } else {
        this.configMap[fullPath] = {
          value,
          source
        };
      }
    }
  }

  public merge(config: any, source: string): void {
    this.flattenObject(config, '', source);
  }

  public getConfigMap(): ConfigMap {
    return this.configMap;
  }

  public getSourcesByProperty(): Record<string, string[]> {
    const sourceMap: Record<string, Set<string>> = {};

    for (const [path, { source }] of Object.entries(this.configMap)) {
      const parts = path.split('.');
      let currentPath = '';

      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        if (!sourceMap[currentPath]) {
          sourceMap[currentPath] = new Set();
        }
        sourceMap[currentPath].add(source);
      }
    }

    return Object.fromEntries(
      Object.entries(sourceMap).map(([key, value]) => [key, Array.from(value)])
    );
  }

  public getFinalConfig(): Record<string, ConfigSource> {
    return { ...this.configMap };
  }
} 