import { parseScript } from 'esprima';
import { query } from 'esquery';
import * as ESTree from 'estree';
import nodeModule from 'module';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { types } from 'util';

import { DebugLoggerΩ } from './logger';
import { FuncMap, Func, Constructor, DebugOptions, DebugIncludes, DebugIgnores } from './types';

export class DebuggerΩ {
  private _logger: DebugLoggerΩ;
  private _include: DebugIncludes;
  private _ignore: DebugIgnores;

  constructor(options: Partial<DebugOptions>) {
    const { header = '', ignore = [], include = [] } = options;

    this._include = include;
    this._ignore = ignore;
    this._logger = new DebugLoggerΩ(options);
    this._logger.raw(`${header} starting ${Date.now()}`.trimStart());
  }

  public shouldWrap(requirePath: string): boolean {
    const normalisedRequirePath = normalisePath(requirePath);
    const isNodeModule =
      nodeModule.builtinModules.includes(normalisedRequirePath) || normalisedRequirePath.includes('node_modules');
    const isIncludedModule = this._include.some((regexp) => regexp.test(normalisedRequirePath));
    const isIgnoredModule = this._ignore.some((regexp) => regexp.test(normalisedRequirePath));
    return !((isNodeModule && !isIncludedModule) || isIgnoredModule);
  }

  public wrap(module: unknown): unknown {
    const exports: FuncMap = module as FuncMap;
    const exportFunctions = this._getFunctions(exports);
    Object.keys(exportFunctions).forEach((functionName) => {
      Object.defineProperty(exports, functionName, {
        value: new Proxy(exports[functionName], {
          apply: this._createFunctionCallWrap(functionName),
          construct: this._createConstructorCallWrap(functionName)
        })
      });
    });
    return exports;
  }

  private _createFunctionCallWrap(name: string): ProxyHandler<Func>['apply'] {
    return (target: Func, thisArg, args): unknown => {
      const startTime = performance.now();
      this._logger.start(name, args);
      const argNames = this._getArgNames(target);
      const result = target.apply(thisArg, this._wrapArgs(argNames, args));
      if (isPromise(result)) {
        return result.then((result) => {
          const endTime = performance.now();
          this._logger.end(name, startTime, endTime, result);
          return result;
        });
      }
      const endTime = performance.now();
      this._logger.end(name, startTime, endTime, result);
      return result;
    };
  }

  private _createConstructorCallWrap(name: string): ProxyHandler<Constructor>['construct'] {
    return (target: Constructor, args): Constructor => {
      const startTime = performance.now();
      this._logger.start(name, args);
      const proto: FuncMap = target.prototype as FuncMap;
      const prototypeFunctions = this._getFunctions(proto);
      Object.keys(prototypeFunctions).forEach((functionName) => {
        Object.defineProperty(proto, functionName, {
          value: new Proxy(proto[functionName], {
            apply: this._createFunctionCallWrap(`${name}.${functionName}`)
          })
        });
      });
      const argNames = this._getArgNames(target);
      const instance = new target(...this._wrapArgs(argNames, args));
      const endTime = performance.now();
      this._logger.end(name, startTime, endTime, instance);
      return instance as Constructor;
    };
  }

  private _wrapArgs(argNames: Array<string>, args: Array<unknown>): Array<unknown> {
    return args.map((arg, index) => {
      if (!isFunction<Func>(arg)) {
        return arg;
      }
      return new Proxy(arg, {
        apply: this._createFunctionCallWrap(argNames[index])
      });
    });
  }

  private _getArgNames(target: Func | Constructor): Array<string> {
    const [func] = query(parseScript(`const f = ${target.toString()}`), '[type=/Function/]') as Array<ESTree.Function>;
    return func.params.map((param) => {
      const [identifier] = query(param, 'Identifier') as Array<ESTree.Identifier>;
      return identifier.name;
    });
  }

  private _getFunctions(map: FuncMap): FuncMap {
    const functions: FuncMap = {} as FuncMap;
    Object.keys(map)
      .filter((functionName) => isFunction(map[functionName]) && !types.isProxy(map[functionName]))
      .forEach((functionName) => {
        functions[functionName] = map[functionName];
      });
    return functions;
  }
}

function isPromise(value: unknown): value is Promise<unknown> {
  return types.isPromise(value);
}

function isFunction<T>(value: unknown): value is T {
  return typeof value === 'function';
}

function normalisePath(filePath: string): string {
  return path.sep === path.posix.sep ? filePath : filePath.split(path.sep).join(path.posix.sep);
}
