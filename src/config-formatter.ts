import chalk from 'chalk';
import { ConfigMap } from './types';

export class ConfigFormatter {
  public static formatAsText(sourceMap: Record<string, string[]>): string {
    const output: string[] = ['Configuration Property Sources:', '==============================\n'];
    
    const sourceGroups = new Map<string, Set<string>>();
    
    // Group properties by source
    for (const [property, sources] of Object.entries(sourceMap)) {
      for (const source of sources) {
        if (!sourceGroups.has(source)) {
          sourceGroups.set(source, new Set());
        }
        sourceGroups.get(source)!.add(property);
      }
    }

    // Sort sources and their properties
    const sortedSources = Array.from(sourceGroups.keys()).sort();
    for (const source of sortedSources) {
      output.push(chalk.green(`${source}:`));
      const properties = Array.from(sourceGroups.get(source)!).sort();
      for (const property of properties) {
        output.push(`  ${property}`);
      }
      output.push('');
    }

    return output.join('\n');
  }

  public static formatAsJson(configMap: ConfigMap): string {
    return JSON.stringify(configMap, null, 2);
  }
} 