const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..'); // La raíz del proyecto total

const config = getDefaultConfig(projectRoot);

// 1. Monitorizar todos los archivos desde la raíz común
config.watchFolders = [workspaceRoot];

// 2. Forzar a Metro a resolver los módulos primero en la app y luego en el shared
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Crear un alias para que no tengas que usar "../../"
config.resolver.extraNodeModules = {
    'shared-logic': path.resolve(workspaceRoot, 'shared-logic'),
};

module.exports = config;