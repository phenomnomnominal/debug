import { debug } from '../src/index';
import { Fixture } from './fixture';

export function init(logs: Array<string>): Fixture {
  debug({
    enabled: true,
    time: false,
    values: true,
    logger: (logString) => {
      logs.push(logString);
    }
  });
  return new Fixture(1, ['hello'], (a: number): number => a);
}
