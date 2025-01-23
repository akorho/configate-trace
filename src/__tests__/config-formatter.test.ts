import { ConfigFormatter } from '../config-formatter';
import { ConfigMap } from '../types';
import chalk from 'chalk';

describe('ConfigFormatter', () => {
  describe('formatAsText', () => {
    it('should format source map as text', () => {
      const sourceMap = {
        'database': ['default', 'local'],
        'database.host': ['default'],
        'database.port': ['local'],
        'logging.level': ['environment']
      };

      const result = ConfigFormatter.formatAsText(sourceMap);
      const expected = [
        'Configuration Property Sources:',
        '==============================\n',
        chalk.green('default:'),
        '  database',
        '  database.host',
        '',
        chalk.green('environment:'),
        '  logging.level',
        '',
        chalk.green('local:'),
        '  database',
        '  database.port',
        ''
      ].join('\n');

      expect(result).toBe(expected);
    });

    it('should handle empty source map', () => {
      const result = ConfigFormatter.formatAsText({});
      expect(result).toContain('Configuration Property Sources:');
    });
  });

  describe('formatAsJson', () => {
    it('should format config map as JSON', () => {
      const configMap: ConfigMap = {
        'database.host': {
          value: 'localhost',
          source: 'default'
        },
        'database.port': {
          value: 5432,
          source: 'local'
        }
      };

      const result = ConfigFormatter.formatAsJson(configMap);
      const expected = JSON.stringify(configMap, null, 2);
      expect(result).toBe(expected);
    });

    it('should handle empty config map', () => {
      const result = ConfigFormatter.formatAsJson({});
      expect(result).toBe('{}');
    });

    it('should preserve types in JSON output', () => {
      const configMap: ConfigMap = {
        'number': { value: 123, source: 'default' },
        'boolean': { value: true, source: 'default' },
        'null': { value: null, source: 'default' },
        'array': { value: [1, 2, 3], source: 'default' },
        'object': { value: { key: 'value' }, source: 'default' }
      };

      const result = JSON.parse(ConfigFormatter.formatAsJson(configMap));
      expect(result.number.value).toBe(123);
      expect(result.boolean.value).toBe(true);
      expect(result.null.value).toBe(null);
      expect(Array.isArray(result.array.value)).toBe(true);
      expect(typeof result.object.value).toBe('object');
    });
  });
}); 