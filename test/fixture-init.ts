import { Fixture } from './fixture';

export function init(): Fixture {
  return new Fixture(1, ['hello'], (a: number): number => a);
}
