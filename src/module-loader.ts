import { register } from 'ts-node';
import path from 'path';

export class ModuleLoader {
  private static isTypeScriptRegistered = false;

  private static registerTypeScript(): void {
    if (!this.isTypeScriptRegistered) {
      register({
        transpileOnly: true,
        compilerOptions: {
          module: 'commonjs',
          esModuleInterop: true,
        },
      });
      this.isTypeScriptRegistered = true;
    }
  }

  public static async loadModule(filePath: string): Promise<any> {
    const ext = path.extname(filePath);
    
    if (ext === '.ts') {
      this.registerTypeScript();
    }

    try {
      // Clear the require cache to ensure we get fresh content
      delete require.cache[require.resolve(filePath)];
      
      const module = require(filePath);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load module ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 