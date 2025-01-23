import fs from 'fs';
import path from 'path';
import { ConfigLoader, ConfigError } from '../config-loader';
import { ConfigOptions } from '../types';
import { ModuleLoader } from '../module-loader';

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn()
  },
  constants: {
    R_OK: 4
  }
}));

jest.mock('../module-loader', () => ({
  ModuleLoader: {
    loadModule: jest.fn()
  }
}));

describe('ConfigLoader', () => {
  const mockOptions: ConfigOptions = {
    path: './config',
    environment: 'development',
    format: 'text',
    verbose: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // By default, make all files not exist
    (fs.promises.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
    // But make the config directory exist
    (fs.promises.access as jest.Mock).mockImplementation((path: string) => {
      if (path === './config') {
        return Promise.resolve();
      }
      return Promise.reject(new Error('ENOENT'));
    });
  });

  describe('constructor', () => {
    it('should throw error if path is missing', () => {
      expect(() => new ConfigLoader({ ...mockOptions, path: '' }))
        .toThrow(ConfigError);
    });

    it('should throw error if environment is missing', () => {
      expect(() => new ConfigLoader({ ...mockOptions, environment: '' }))
        .toThrow(ConfigError);
    });

    it('should throw error if format is invalid', () => {
      expect(() => new ConfigLoader({ ...mockOptions, format: 'invalid' as any }))
        .toThrow(ConfigError);
    });
  });

  describe('discoverConfigFiles', () => {
    it('should discover existing config files', async () => {
      // Make specific files exist
      (fs.promises.access as jest.Mock).mockImplementation((path: string) => {
        if (path === './config' || 
            path === 'config/default.json' ||
            path === 'config/development.js') {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const loader = new ConfigLoader({ ...mockOptions, verbose: true });
      const files = await loader.discoverConfigFiles();
      
      expect(files).toEqual([
        {
          path: 'config/default.json',
          type: 'default',
          extension: '.json'
        },
        {
          path: 'config/development.js',
          type: 'environment',
          extension: '.js'
        }
      ]);
    });

    it('should throw if config directory does not exist', async () => {
      (fs.promises.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
      const loader = new ConfigLoader(mockOptions);
      
      await expect(loader.discoverConfigFiles())
        .rejects
        .toThrow(ConfigError);
    });
  });

  describe('loadConfigFile', () => {
    beforeEach(() => {
      (fs.promises.readFile as jest.Mock).mockResolvedValue('{"key": "value"}');
      (ModuleLoader.loadModule as jest.Mock).mockResolvedValue({ key: 'value' });
    });

    it('should load JSON config file', async () => {
      const loader = new ConfigLoader({ ...mockOptions, verbose: true });
      const result = await loader.loadConfigFile({
        path: 'config/default.json',
        type: 'default',
        extension: '.json'
      });

      expect(result).toEqual({ key: 'value' });
      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('default.json'),
        'utf-8'
      );
    });

    it('should load JS/TS config file', async () => {
      const loader = new ConfigLoader({ ...mockOptions, verbose: true });
      const result = await loader.loadConfigFile({
        path: 'config/default.js',
        type: 'default',
        extension: '.js'
      });

      expect(result).toEqual({ key: 'value' });
      expect(ModuleLoader.loadModule).toHaveBeenCalledWith(
        expect.stringContaining('default.js')
      );
    });

    it('should throw on invalid JSON', async () => {
      (fs.promises.readFile as jest.Mock).mockResolvedValue('invalid json');
      const loader = new ConfigLoader(mockOptions);

      await expect(loader.loadConfigFile({
        path: 'config/default.json',
        type: 'default',
        extension: '.json'
      })).rejects.toThrow(ConfigError);
    });

    it('should handle JS/TS module loading errors', async () => {
      (ModuleLoader.loadModule as jest.Mock).mockRejectedValue(new Error('Module error'));
      const loader = new ConfigLoader(mockOptions);

      await expect(loader.loadConfigFile({
        path: 'config/default.js',
        type: 'default',
        extension: '.js'
      })).rejects.toThrow(ConfigError);
    });

    it('should handle environment variables mapping', async () => {
      const loader = new ConfigLoader({ ...mockOptions, verbose: true });
      await loader.loadConfigFile({
        path: 'config/custom-environment-variables.json',
        type: 'custom-environment-variables',
        extension: '.json'
      });

      // Verify that the config was loaded and processed
      expect(fs.promises.readFile).toHaveBeenCalled();
    });
  });

  describe('verbose logging', () => {
    it('should log messages when verbose is true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const loader = new ConfigLoader({ ...mockOptions, verbose: true });

      // Make a file exist to trigger logging
      (fs.promises.access as jest.Mock).mockImplementation((path: string) => {
        if (path === './config' || path === 'config/default.json') {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });

      await loader.discoverConfigFiles();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log messages when verbose is false', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const loader = new ConfigLoader(mockOptions);

      await loader.discoverConfigFiles();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getConfigMap and getSourcesByProperty', () => {
    it('should return merged config map', async () => {
      const loader = new ConfigLoader(mockOptions);
      const configMap = loader.getConfigMap();
      expect(configMap).toBeDefined();
    });

    it('should return sources by property', async () => {
      const loader = new ConfigLoader(mockOptions);
      const sources = loader.getSourcesByProperty();
      expect(sources).toBeDefined();
    });
  });
}); 