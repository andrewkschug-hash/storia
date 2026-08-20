/**
 * Dev-only guard: expo-router stringifies route keys in labels/toasts. On web dev
 * those keys can be Symbol values. Re-apply after npm install.
 */
const fs = require('fs');
const path = require('path');

const buildRoot = path.join(__dirname, '..', 'node_modules', 'expo-router', 'build');

const helper = `function ensureRouteString(value) {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'symbol')
        return value.description ?? 'route';
    if (value == null)
        return 'route';
    return String(value);
}
`;

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-expo-router-symbol] skip missing ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function patchFile(filePath, mutator) {
  const source = read(filePath);
  if (!source) return;
  const next = mutator(source);
  if (next !== source) {
    fs.writeFileSync(filePath, next);
    console.log(`[patch-expo-router-symbol] patched ${path.basename(filePath)}`);
  }
}

function addHelper(source, before) {
  if (source.includes('ensureRouteString')) return source;
  if (!source.includes(before)) return source;
  return source.replace(before, `${helper}${before}`);
}

patchFile(path.join(buildRoot, 'matchers.js'), (source) => {
  let next = addHelper(source, 'function getNameFromFilePath(name) {');
  return next.replace(
    'function getNameFromFilePath(name) {\n    return removeSupportedExtensions(removeFileSystemDots(name));\n}',
    `function getNameFromFilePath(name) {
    const path = ensureRouteString(name);
    return removeSupportedExtensions(removeFileSystemDots(path));
}`,
  );
});

patchFile(path.join(buildRoot, 'useScreens.js'), (source) => {
  let next = source;
  if (!next.includes('function safeDevLabel(value)')) {
    next = addHelper(next, 'function fromImport(value, { ErrorBoundary, SuspenseFallback, ...component }) {');
    next = next.replace(
      `${helper}function fromImport`,
      `${helper}function safeDevLabel(value) {
    return ensureRouteString(value);
}
function fromImport`,
    );
    next = next.replace(
      `    if (component?.default && __DEV__) {
        component.default.displayName ??= \`\${component.default.name ?? 'Route'}(\${value.contextKey})\`;
    }`,
      `    if (component?.default && __DEV__ && Object.isExtensible(component.default)) {
        const routeName = typeof component.default.name === 'string' && component.default.name
            ? component.default.name
            : 'Route';
        component.default.displayName ??= \`\${routeName}(\${safeDevLabel(value.contextKey)})\`;
    }`,
    );
    next = next.replace(
      'Wrapped.displayName = `ErrorBoundary(${value.contextKey})`;',
      'Wrapped.displayName = `ErrorBoundary(${safeDevLabel(value.contextKey)})`;',
    );
  } else if (!next.includes('ensureRouteString')) {
    next = addHelper(next, 'function safeDevLabel(value) {');
    next = next.replace(
      'function safeDevLabel(value) {\n    if (typeof value === \'string\')\n        return value;\n    if (typeof value === \'symbol\')\n        return value.description ?? \'route\';\n    if (value == null)\n        return \'route\';\n    return String(value);\n}',
      'function safeDevLabel(value) {\n    return ensureRouteString(value);\n}',
    );
  }
  next = next.replace(
    'ScreenComponent.displayName = `AsyncRoute(${value.route})`;',
    'ScreenComponent.displayName = `AsyncRoute(${safeDevLabel(value.route)})`;',
  );
  next = next.replace(
    'name: route ? `Route(${route.name})` : undefined',
    'name: route ? `Route(${safeDevLabel(route.name)})` : undefined',
  );
  next = next.replace(
    'BaseRoute.displayName = `Route(${value.route})`;',
    'BaseRoute.displayName = `Route(${safeDevLabel(value.route)})`;',
  );
  return next;
});

patchFile(path.join(buildRoot, 'views', 'Toast.js'), (source) => {
  if (source.includes('filenameToPretty')) return source;
  let next = addHelper(source, 'function Toast({ children, filename, warning, }) {');
  next = next.replace(
    'function Toast({ children, filename, warning, }) {',
    `function filenameToPretty(filename) {
    const text = ensureRouteString(filename);
    return 'app' + text.replace(/^\\./, '');
}
function Toast({ children, filename, warning, }) {`,
  );
  return next.replace(
    `    const filenamePretty = react_1.default.useMemo(() => {
        if (!filename)
            return undefined;
        return 'app' + filename.replace(/^\\./, '');
    }, [filename]);`,
    '    const filenamePretty = react_1.default.useMemo(() => filenameToPretty(filename), [filename]);',
  );
});

patchFile(path.join(buildRoot, 'layouts', 'withLayoutContext.js'), (source) => {
  let next = addHelper(source, 'function useFilterScreenChildren(children, { isCustomNavigator, contextKey, } = {}) {');
  return next.replace(
    'Update Layout Route at: "app${contextKey}/_layout"`',
    'Update Layout Route at: "app${ensureRouteString(contextKey)}/_layout"`',
  );
});

patchFile(path.join(buildRoot, 'views', 'Screen.js'), (source) => {
  let next = addHelper(source, 'function isScreen(child, contextKey) {');
  return next.replaceAll('`app${contextKey}/_layout`', '`app${ensureRouteString(contextKey)}/_layout`');
});
