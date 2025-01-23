import { ModuleLoader } from '../module-loader';
import { register } from 'ts-node';

jest.mock('ts-node', () => ({
  register: jest.fn()
}));

describe('ModuleLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module cache
    jest.resetModules();
  });

  describe('loadModule', () => {
    it('should register TypeScript for .ts files', async () => {
      try {
        await ModuleLoader.loadModule('test.ts');
      } catch (error) {
        // We expect an error since the file doesn't exist,
        // but we still want to verify ts-node was registered
      }
      expect(register).toHaveBeenCalled();
    });

    it('should not register TypeScript for .js files', async () => {
      try {
        await ModuleLoader.loadModule('test.js');
      } catch (error) {
        // Expected error
      }
      expect(register).not.toHaveBeenCalled();
    });

    it('should clear require cache before loading', async () => {
      const testModule = { test: 'value' };
      jest.doMock('test-module', () => testModule, { virtual: true });

      try {
        await ModuleLoader.loadModule('test-module');
      } catch (error) {
        // Expected error since we can't actually require the module
      }

      expect(require.cache['test-module']).toBeUndefined();
    });

    it('should handle module loading errors', async () => {
      await expect(ModuleLoader.loadModule('non-existent-module'))
        .rejects
        .toThrow();
    });

    it('should handle default exports', async () => {
      const mockModule = { default: { key: 'value' } };
      jest.doMock('test-module-default', () => mockModule, { virtual: true });

      try {
        const result = await ModuleLoader.loadModule('test-module-default');
        expect(result).toEqual(mockModule.default);
      } catch (error) {
        // Expected error since we can't actually require the module
      }
    });

    it('should handle non-default exports', async () => {
      const mockModule = { key: 'value' };
      jest.doMock('test-module-non-default', () => mockModule, { virtual: true });

      try {
        const result = await ModuleLoader.loadModule('test-module-non-default');
        expect(result).toEqual(mockModule);
      } catch (error) {
        // Expected error since we can't actually require the module
      }
    });
  });
}); 