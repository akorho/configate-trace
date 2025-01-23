"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigMerger = void 0;
class ConfigMerger {
    constructor() {
        this.configMap = {};
    }
    flattenObject(obj, prefix = '', source) {
        for (const key in obj) {
            const value = obj[key];
            const fullPath = prefix ? `${prefix}.${key}` : key;
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                this.flattenObject(value, fullPath, source);
            }
            else {
                this.configMap[fullPath] = {
                    value,
                    source
                };
            }
        }
    }
    merge(config, source) {
        this.flattenObject(config, '', source);
    }
    getConfigMap() {
        return this.configMap;
    }
    getSourcesByProperty() {
        const sourceMap = {};
        for (const [path, { source }] of Object.entries(this.configMap)) {
            const parts = path.split('.');
            let currentPath = '';
            for (const part of parts) {
                currentPath = currentPath ? `${currentPath}.${part}` : part;
                if (!sourceMap[currentPath]) {
                    sourceMap[currentPath] = new Set();
                }
                sourceMap[currentPath].add(source);
            }
        }
        return Object.fromEntries(Object.entries(sourceMap).map(([key, value]) => [key, Array.from(value)]));
    }
    getFinalConfig() {
        return { ...this.configMap };
    }
}
exports.ConfigMerger = ConfigMerger;
