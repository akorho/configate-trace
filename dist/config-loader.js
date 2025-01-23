"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = exports.ConfigError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const module_loader_1 = require("./module-loader");
const config_merger_1 = require("./config-merger");
const env_loader_1 = require("./env-loader");
class ConfigError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ConfigLoader {
    constructor(options) {
        this.extensions = ['.json', '.js', '.ts'];
        this.validateOptions(options);
        this.configPath = options.path;
        this.environment = options.environment;
        this.verbose = options.verbose;
        this.merger = new config_merger_1.ConfigMerger();
        this.envLoader = new env_loader_1.EnvLoader();
    }
    validateOptions(options) {
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
    log(message) {
        if (this.verbose) {
            console.log(message);
        }
    }
    async fileExists(filePath) {
        try {
            await fs_1.default.promises.access(filePath, fs_1.default.constants.R_OK);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    getConfigFilename(type, extension) {
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
    async discoverConfigFiles() {
        try {
            const configFiles = [];
            const types = [
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
                    const filePath = path_1.default.join(this.configPath, filename);
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
        }
        catch (error) {
            if (error instanceof ConfigError)
                throw error;
            throw new ConfigError('Failed to discover config files', error);
        }
    }
    async loadConfigFile(configFile) {
        this.log(`Loading config file: ${configFile.path}`);
        try {
            let content;
            switch (configFile.extension) {
                case '.json':
                    const fileContent = await fs_1.default.promises.readFile(configFile.path, 'utf-8');
                    content = JSON.parse(fileContent);
                    break;
                case '.js':
                case '.ts':
                    const absolutePath = path_1.default.resolve(configFile.path);
                    content = await module_loader_1.ModuleLoader.loadModule(absolutePath);
                    break;
            }
            if (configFile.type === 'custom-environment-variables') {
                // For environment variables mapping, load the actual values
                content = this.envLoader.loadFromMapping(content);
            }
            // Use the file basename (without extension) as the source
            const source = path_1.default.basename(configFile.path, configFile.extension);
            this.merger.merge(content, source);
            return content;
        }
        catch (error) {
            throw new ConfigError(`Failed to load config file ${configFile.path}`, error);
        }
    }
    getConfigMap() {
        return this.merger.getConfigMap();
    }
    getSourcesByProperty() {
        return this.merger.getSourcesByProperty();
    }
}
exports.ConfigLoader = ConfigLoader;
