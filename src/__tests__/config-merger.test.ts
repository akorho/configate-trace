import { ConfigMerger } from '../config-merger';

describe('ConfigMerger', () => {
  let merger: ConfigMerger;

  beforeEach(() => {
    merger = new ConfigMerger();
  });

  describe('merge', () => {
    it('should merge flat objects with source tracking', () => {
      merger.merge({ host: 'localhost', port: 5432 }, 'default');
      merger.merge({ host: 'prod-host' }, 'production');

      expect(merger.getConfigMap()).toEqual({
        'host': { value: 'prod-host', source: 'production' },
        'port': { value: 5432, source: 'default' }
      });
    });

    it('should handle nested objects', () => {
      merger.merge({
        database: {
          host: 'localhost',
          port: 5432
        }
      }, 'default');

      expect(merger.getConfigMap()).toEqual({
        'database.host': { value: 'localhost', source: 'default' },
        'database.port': { value: 5432, source: 'default' }
      });
    });

    it('should track multiple sources for nested properties', () => {
      merger.merge({
        database: {
          host: 'localhost',
          credentials: {
            user: 'admin'
          }
        }
      }, 'default');

      merger.merge({
        database: {
          credentials: {
            password: 'secret'
          }
        }
      }, 'local');

      const sources = merger.getSourcesByProperty();
      expect(sources).toEqual({
        'database': ['default', 'local'],
        'database.host': ['default'],
        'database.credentials': ['default', 'local'],
        'database.credentials.user': ['default'],
        'database.credentials.password': ['local']
      });
    });

    it('should handle arrays as values', () => {
      merger.merge({
        tags: ['dev', 'test'],
        config: {
          ports: [8080, 8081]
        }
      }, 'default');

      expect(merger.getConfigMap()).toEqual({
        'tags': { value: ['dev', 'test'], source: 'default' },
        'config.ports': { value: [8080, 8081], source: 'default' }
      });
    });

    it('should handle null and undefined values', () => {
      merger.merge({
        nullValue: null,
        undefinedValue: undefined,
        emptyString: ''
      }, 'default');

      expect(merger.getConfigMap()).toEqual({
        'nullValue': { value: null, source: 'default' },
        'undefinedValue': { value: undefined, source: 'default' },
        'emptyString': { value: '', source: 'default' }
      });
    });
  });

  describe('getFinalConfig', () => {
    it('should return the final merged configuration with sources', () => {
      merger.merge({ host: 'localhost', debug: true }, 'default');
      merger.merge({ host: 'prod-host' }, 'production');

      const finalConfig = merger.getFinalConfig();
      expect(finalConfig).toEqual({
        'host': { value: 'prod-host', source: 'production' },
        'debug': { value: true, source: 'default' }
      });
    });
  });
}); 