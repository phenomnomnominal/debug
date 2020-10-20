import { deepStrictEqual } from 'assert';

import { debug } from '../src/index';

const logs: Array<string> = [];

debug({
  enabled: true,
  time: false,
  values: true,
  logger: (logString) => {
    logs.push(logString);
  }
});

import { init } from './fixture-init';

const fixture = init();
fixture.func();

deepStrictEqual(
  logs.slice(1).join('\n'),
  `
▸ init args: []
▸▸ Fixture args: [ 1, [ 'hello' ], [Function] ]
▸▸ Fixture return: Fixture { _a: 1, _b: [ 'hello' ], _c: [Function] }
▸ init return: Fixture { _a: 1, _b: [ 'hello' ], _c: [Function] }
▸ Fixture.func args: []
▸▸ Fixture._func args: [ 1 ]
▸▸▸ _c args: [ 1 ]
▸▸▸ _c return: 1
▸▸ Fixture._func return: [ 'hello' ]
▸ Fixture.func return: undefined
`.trim()
);
