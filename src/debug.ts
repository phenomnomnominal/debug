import stack, { CallSite } from 'callsite';
import nodeModule from 'module';
import { DebuggerΩ } from './debugger';
import { DebugOptions, ModulePrivate } from './types';

let initialised = false;
export function debug(options: Partial<DebugOptions> = {}): void {
  if (options.enabled) {
    const [, caller] = stack();

    if (!initialised) {
      init(options, caller);
      initialised = true;
    }
  }
}

function init(options: Partial<DebugOptions>, caller: CallSite): void {
  const d = new DebuggerΩ(options);

  Object.keys(require.cache).forEach((requirePath) => {
    const module = require.cache[requirePath];
    const isCaller = requirePath === caller.getFileName();
    if (module && !isCaller && d.shouldWrap(requirePath)) {
      d.wrap(module.exports);
    }
  });

  const original = nodeModule.Module.prototype.require;
  const debugRequire = function (this: NodeModule, id: string): unknown {
    const Module = nodeModule.Module as ModulePrivate;
    const requirePath = Module._resolveFilename(id, this);
    const module = original.apply(this, [id]) as unknown;
    if (module && d.shouldWrap(requirePath)) {
      return d.wrap(module);
    }
    return module;
  };

  nodeModule.Module.prototype.require = Object.assign(debugRequire, original);
}
