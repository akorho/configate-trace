"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFormatter = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ConfigFormatter {
    static formatAsText(sourceMap) {
        const output = ['Configuration Property Sources:', '==============================\n'];
        const sourceGroups = new Map();
        // Group properties by source
        for (const [property, sources] of Object.entries(sourceMap)) {
            for (const source of sources) {
                if (!sourceGroups.has(source)) {
                    sourceGroups.set(source, new Set());
                }
                sourceGroups.get(source).add(property);
            }
        }
        // Sort sources and their properties
        const sortedSources = Array.from(sourceGroups.keys()).sort();
        for (const source of sortedSources) {
            output.push(chalk_1.default.green(`${source}:`));
            const properties = Array.from(sourceGroups.get(source)).sort();
            for (const property of properties) {
                output.push(`  ${property}`);
            }
            output.push('');
        }
        return output.join('\n');
    }
    static formatAsJson(configMap) {
        return JSON.stringify(configMap, null, 2);
    }
}
exports.ConfigFormatter = ConfigFormatter;
