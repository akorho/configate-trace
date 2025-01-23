"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../package.json");
const config_loader_1 = require("./config-loader");
const config_formatter_1 = require("./config-formatter");
const program = new commander_1.Command();
program
    .name('configate-trace')
    .description('Trace the source file for each property in a configate configuration setup')
    .version(package_json_1.version)
    .option('-p, --path <path>', 'Config directory path', './config')
    .option('-e, --environment <env>', 'Environment name', 'development')
    .option('-f, --format <format>', 'Output format: text/json', 'text')
    .option('-v, --verbose', 'Show detailed loading information')
    .action(async (options) => {
    try {
        const loader = new config_loader_1.ConfigLoader(options);
        const configFiles = await loader.discoverConfigFiles();
        if (configFiles.length === 0) {
            console.error(chalk_1.default.yellow('Warning: No configuration files found in'), chalk_1.default.blue(options.path));
            process.exit(0);
        }
        let hasErrors = false;
        // Load all config files
        for (const file of configFiles) {
            try {
                const content = await loader.loadConfigFile(file);
                if (options.verbose) {
                    console.log(chalk_1.default.gray(`Loaded ${file.type}:`), content);
                }
            }
            catch (error) {
                hasErrors = true;
                if (error instanceof config_loader_1.ConfigError) {
                    console.error(chalk_1.default.red(`Error loading ${file.path}:`));
                    console.error(chalk_1.default.red(`  ${error.message}`));
                    if (error.cause) {
                        console.error(chalk_1.default.gray(`  Cause: ${error.cause.message}`));
                    }
                }
                else {
                    console.error(chalk_1.default.red(`Error loading ${file.path}: ${error instanceof Error ? error.message : String(error)}`));
                }
            }
        }
        // If we had errors but some files loaded, warn the user
        if (hasErrors) {
            console.error(chalk_1.default.yellow('\nWarning: Some configuration files failed to load. Output may be incomplete.\n'));
        }
        // Format and display the results
        const output = options.format === 'json'
            ? config_formatter_1.ConfigFormatter.formatAsJson(loader.getConfigMap())
            : config_formatter_1.ConfigFormatter.formatAsText(loader.getSourcesByProperty());
        console.log(output);
    }
    catch (error) {
        if (error instanceof config_loader_1.ConfigError) {
            console.error(chalk_1.default.red('Configuration Error:'), error.message);
            if (error.cause) {
                console.error(chalk_1.default.gray('Cause:'), error.cause.message);
            }
        }
        else {
            console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : error);
        }
        process.exit(1);
    }
});
program.parse();
