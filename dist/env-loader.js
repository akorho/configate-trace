"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvLoader = void 0;
class EnvLoader {
    constructor(customEnv) {
        this.envMap = customEnv || process.env;
    }
    getValue(key) {
        return this.envMap[key];
    }
    loadFromMapping(mapping) {
        const result = {};
        for (const [configPath, envKey] of Object.entries(mapping)) {
            const value = this.getValue(envKey);
            if (value !== undefined) {
                this.setNestedValue(result, configPath.split('.'), value);
            }
        }
        return result;
    }
    setNestedValue(obj, path, value) {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!(key in current)) {
                current[key] = {};
            }
            else if (typeof current[key] !== 'object') {
                throw new Error(`Cannot set nested property '${path.join('.')}' because '${path.slice(0, i + 1).join('.')}' is not an object`);
            }
            current = current[key];
        }
        const lastKey = path[path.length - 1];
        current[lastKey] = this.parseValue(value);
    }
    parseValue(value) {
        // Try parsing as number
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }
        if (/^-?\d*\.\d+$/.test(value)) {
            return parseFloat(value);
        }
        // Try parsing as boolean
        if (value.toLowerCase() === 'true')
            return true;
        if (value.toLowerCase() === 'false')
            return false;
        // Try parsing as JSON
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            // Return as string if not special value
            return value;
        }
    }
}
exports.EnvLoader = EnvLoader;
