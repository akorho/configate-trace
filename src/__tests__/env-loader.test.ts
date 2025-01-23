import { EnvLoader } from '../env-loader';

describe('EnvLoader', () => {
  let envLoader: EnvLoader;
  const testEnv = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_PASSWORD: 'secret',
    ENABLE_DEBUG: 'true',
    JSON_CONFIG: '{"key": "value"}',
    FLOAT_VALUE: '3.14'
  };

  beforeEach(() => {
    envLoader = new EnvLoader(testEnv);
  });

  describe('getValue', () => {
    it('should return environment variable value', () => {
      expect(envLoader.getValue('DB_HOST')).toBe('localhost');
    });

    it('should return undefined for non-existent variable', () => {
      expect(envLoader.getValue('NON_EXISTENT')).toBeUndefined();
    });
  });

  describe('loadFromMapping', () => {
    it('should map environment variables to config structure', () => {
      const mapping = {
        'database.host': 'DB_HOST',
        'database.port': 'DB_PORT',
        'database.password': 'DB_PASSWORD'
      };

      const result = envLoader.loadFromMapping(mapping);
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
          password: 'secret'
        }
      });
    });

    it('should handle nested paths correctly', () => {
      const mapping = {
        'database.credentials.password': 'DB_PASSWORD',
        'database.credentials.user': 'NON_EXISTENT'
      };

      const result = envLoader.loadFromMapping(mapping);
      expect(result).toEqual({
        database: {
          credentials: {
            password: 'secret'
          }
        }
      });
    });

    it('should throw error when trying to set nested property on non-object', () => {
      const mapping = {
        'database': 'DB_HOST',
        'database.password': 'DB_PASSWORD'
      };

      expect(() => envLoader.loadFromMapping(mapping)).toThrow(
        "Cannot set nested property 'database.password' because 'database' is not an object"
      );
    });
  });

  describe('value parsing', () => {
    it('should parse integer values', () => {
      const mapping = { 'database.port': 'DB_PORT' };
      const result = envLoader.loadFromMapping(mapping);
      expect(result.database.port).toBe(5432);
    });

    it('should parse float values', () => {
      const mapping = { 'config.value': 'FLOAT_VALUE' };
      const result = envLoader.loadFromMapping(mapping);
      expect(result.config.value).toBe(3.14);
    });

    it('should parse boolean values', () => {
      const mapping = { 'debug': 'ENABLE_DEBUG' };
      const result = envLoader.loadFromMapping(mapping);
      expect(result.debug).toBe(true);
    });

    it('should parse JSON values', () => {
      const mapping = { 'config': 'JSON_CONFIG' };
      const result = envLoader.loadFromMapping(mapping);
      expect(result.config).toEqual({ key: 'value' });
    });

    it('should keep string values as is when no special parsing applies', () => {
      const mapping = { 'database.host': 'DB_HOST' };
      const result = envLoader.loadFromMapping(mapping);
      expect(result.database.host).toBe('localhost');
    });
  });
}); 