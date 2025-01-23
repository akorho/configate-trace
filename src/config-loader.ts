import fs from 'fs';
import path from 'path';
import { ConfigFile, ConfigFileExtension, ConfigFileType, ConfigOptions, ConfigMap } from './types';
import { ModuleLoader } from './module-loader';
import { ConfigMerger } from './config-merger';
import { EnvLoader } from './env-loader';

export class ConfigError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ConfigLoader {
  private readonly configPath: string;
  private readonly environment: string;
  private readonly verbose: boolean;
  private readonly extensions: ConfigFileExtension[] = ['.json', '.js', '.ts'];
  private readonly merger: ConfigMerger;
  private readonly envLoader: EnvLoader;

  constructor(options: ConfigOptions) {
    this.validateOptions(options);
    this.configPath = options.path;
    this.environment = options.environment;
    this.verbose = options.verbose;
    this.merger = new ConfigMerger();
    this.envLoader = new EnvLoader();
  }

  private validateOptions(options: ConfigOptions): void {
    if (!options.path) {
      throw new ConfigError('Config path is required');
    }
    if (!options.environment) {
      throw new ConfigError('Environment is required');
    }
    if (options.format && !['text', 'json'].includes(options.format)) {
      throw new ConfigError('Format must be either "text" or "json"');
    }
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  private getConfigFilename(type: ConfigFileType, extension: ConfigFileExtension): string {
    switch (type) {
      case 'default':
        return `default${extension}`;
      case 'environment':
        return `${this.environment}${extension}`;
      case 'local':
        return `local${extension}`;
      case 'local-environment':
        return `local-${this.environment}${extension}`;
      case 'custom-environment-variables':
        return `custom-environment-variables${extension}`;
    }
  }

  public async discoverConfigFiles(): Promise<ConfigFile[]> {
    try {
      const configFiles: ConfigFile[] = [];
      const types: ConfigFileType[] = [
        'default',
        'environment',
        'local',
        'local-environment',
        'custom-environment-variables'
      ];

      // Ensure config directory exists
      if (!(await this.fileExists(this.configPath))) {
        throw new ConfigError(`Config directory not found: ${this.configPath}`);
      }

      for (const type of types) {
        for (const extension of this.extensions) {
          const filename = this.getConfigFilename(type, extension);
          const filePath = path.join(this.configPath, filename);

          if (await this.fileExists(filePath)) {
            this.log(`Found config file: ${filePath}`);
            configFiles.push({
              path: filePath,
              type,
              extension
            });
          }
        }
      }

      return configFiles;
    } catch (error) {
      if (error instanceof ConfigError) throw error;
      throw new ConfigError('Failed to discover config files', error as Error);
    }
  }

  public async loadConfigFile(configFile: ConfigFile): Promise<any> {
    this.log(`Loading config file: ${configFile.path}`);

    try {
      let content: any;

      switch (configFile.extension) {
        case '.json':
          const fileContent = await fs.promises.readFile(configFile.path, 'utf-8');
          content = JSON.parse(fileContent);
          break;
        case '.js':
        case '.ts':
          const absolutePath = path.resolve(configFile.path);
          content = await ModuleLoader.loadModule(absolutePath);
          break;
      }

      if (configFile.type === 'custom-environment-variables') {
        // For environment variables mapping, load the actual values
        content = this.envLoader.loadFromMapping(content);
      }

      // Use the file basename (without extension) as the source
      const source = path.basename(configFile.path, configFile.extension);
      this.merger.merge(content, source);
      return content;
    } catch (error) {
      throw new ConfigError(
        `Failed to load config file ${configFile.path}`,
        error as Error
      );
    }
  }

  public getConfigMap(): ConfigMap {
    return this.merger.getConfigMap();
  }

  public getSourcesByProperty(): Record<string, string[]> {
    return this.merger.getSourcesByProperty();
  }
} 