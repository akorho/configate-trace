import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';
import { ConfigLoader, ConfigError } from './config-loader';
import { ConfigOptions } from './types';
import { ConfigFormatter } from './config-formatter';

const program = new Command();

program
  .name('configate-trace')
  .description('Trace the source file for each property in a configate configuration setup')
  .version(version)
  .option('-p, --path <path>', 'Config directory path', './config')
  .option('-e, --environment <env>', 'Environment name', 'development')
  .option('-f, --format <format>', 'Output format: text/json', 'text')
  .option('-v, --verbose', 'Show detailed loading information')
  .action(async (options: ConfigOptions) => {
    try {
      const loader = new ConfigLoader(options);
      const configFiles = await loader.discoverConfigFiles();

      if (configFiles.length === 0) {
        console.error(chalk.yellow('Warning: No configuration files found in'), chalk.blue(options.path));
        process.exit(0);
      }

      let hasErrors = false;

      // Load all config files
      for (const file of configFiles) {
        try {
          const content = await loader.loadConfigFile(file);
          if (options.verbose) {
            console.log(chalk.gray(`Loaded ${file.type}:`), content);
          }
        } catch (error) {
          hasErrors = true;
          if (error instanceof ConfigError) {
            console.error(chalk.red(`Error loading ${file.path}:`));
            console.error(chalk.red(`  ${error.message}`));
            if (error.cause) {
              console.error(chalk.gray(`  Cause: ${error.cause.message}`));
            }
          } else {
            console.error(chalk.red(`Error loading ${file.path}: ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      }

      // If we had errors but some files loaded, warn the user
      if (hasErrors) {
        console.error(chalk.yellow('\nWarning: Some configuration files failed to load. Output may be incomplete.\n'));
      }

      // Format and display the results
      const output = options.format === 'json'
        ? ConfigFormatter.formatAsJson(loader.getConfigMap())
        : ConfigFormatter.formatAsText(loader.getSourcesByProperty());

      console.log(output);
    } catch (error) {
      if (error instanceof ConfigError) {
        console.error(chalk.red('Configuration Error:'), error.message);
        if (error.cause) {
          console.error(chalk.gray('Cause:'), error.cause.message);
        }
      } else {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });

program.parse(); 