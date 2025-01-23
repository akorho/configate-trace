export type ConfigFileExtension = '.json' | '.js' | '.ts';

export type ConfigFileType = 
  | 'default'
  | 'environment'
  | 'local'
  | 'local-environment'
  | 'custom-environment-variables';

export interface ConfigSource {
  value: any;
  source: string;
}

export interface ConfigMap {
  [key: string]: ConfigSource;
}

export interface ConfigOptions {
  path: string;
  environment: string;
  format: 'text' | 'json';
  verbose: boolean;
}

export interface ConfigFile {
  path: string;
  type: ConfigFileType;
  extension: ConfigFileExtension;
  content?: any;
} 