import * as fs from 'fs';
import * as path from 'path';
import { inspect } from 'util';

import { DebugLogger, DebugOptions } from './types';

let index = 0;
export class DebugLoggerΩ {
  private _depth = 0;
  private _logger: DebugLogger;
  private _time: boolean;
  private _values: boolean;
  private _name: number;

  constructor(options: Partial<DebugOptions>) {
    const { header = '' } = options;
    this._time = options.time || false;
    this._values = options.values || false;
    this._logger = options.logger || this._getLogger(options.logPath);

    this._raw(`${header} starting ${Date.now()}`.trimStart());
    this._name = index++;
  }

  public name(): number {
    return this._name;
  }

  private _raw(logString: string): void {
    this._logger(logString);
  }

  public start(name: string, args: Array<unknown>): void {
    this._depth += 1;
    let debugString = this._printDepth(name);
    if (this._values) {
      debugString += ` args: ${this._printObject(args)}`;
    }
    this._logger(debugString);
  }

  public end(name: string, startTime: number, endTime: number, result: unknown): void {
    let debugString = this._printDepth(name);
    if (this._time) {
      debugString += ` time: ${endTime - startTime}ms`;
    }
    if (this._values) {
      debugString += ` return: ${this._printObject(result)}`;
    }
    this._logger(debugString);
    this._depth -= 1;
  }

  private _getLogger(relativeLogPath?: string): DebugLogger {
    if (relativeLogPath) {
      const { dir, name, ext } = path.parse(relativeLogPath);
      const logPath = `${dir}${path.sep}${name}.${Date.now()}${ext}`;
      const absoluteLogPath = path.resolve(process.cwd(), logPath);
      return function (logString: string): void {
        fs.appendFileSync(absoluteLogPath, `${logString}\n`);
      };
    } else {
      return function (logString: string): void {
        process.stdout.write(`${logString}\n`);
      };
    }
  }

  private _printDepth(name: string): string {
    return `${'▸'.repeat(this._depth)} ${name}`;
  }

  private _printObject(object: unknown): string {
    return inspect(object, { getters: true, depth: Infinity }).replace(/\n/g, '');
  }
}
