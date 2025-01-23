"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoader = void 0;
const ts_node_1 = require("ts-node");
const path_1 = __importDefault(require("path"));
class ModuleLoader {
    static registerTypeScript() {
        if (!this.isTypeScriptRegistered) {
            (0, ts_node_1.register)({
                transpileOnly: true,
                compilerOptions: {
                    module: 'commonjs',
                    esModuleInterop: true,
                },
            });
            this.isTypeScriptRegistered = true;
        }
    }
    static async loadModule(filePath) {
        const ext = path_1.default.extname(filePath);
        if (ext === '.ts') {
            this.registerTypeScript();
        }
        try {
            // Clear the require cache to ensure we get fresh content
            delete require.cache[require.resolve(filePath)];
            const module = require(filePath);
            return module.default || module;
        }
        catch (error) {
            throw new Error(`Failed to load module ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ModuleLoader = ModuleLoader;
ModuleLoader.isTypeScriptRegistered = false;
