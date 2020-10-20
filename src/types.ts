import nodeModule from 'module';

export type ModulePrivate = typeof nodeModule.Module & {
  _resolveFilename(id: string, module: NodeModule): string;
};

export type Func = (...args: Array<unknown>) => unknown;
export type Constructor = new (...args: Array<unknown>) => unknown;
export type FuncMap = Record<string, Func | Constructor>;

export type DebugIncludes = Array<RegExp>;
export type DebugIgnores = Array<RegExp>;
export type DebugLogger = (logString: string) => void;

export type DebugOptions = {
  enabled: boolean;
  time: boolean;
  values: boolean;
  logPath: string;
  header: string;
  include: DebugIncludes;
  ignore: DebugIgnores;
  logger: DebugLogger;
};
