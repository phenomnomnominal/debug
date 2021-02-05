import { deepStrictEqual } from 'assert';

import { init } from './fixture-init';

async function test() {
  const logs: Array<string> = [];
  const fixture1 = init(logs);

  await fixture1.func();

  deepStrictEqual(
    logs.slice(1).join('\n'),
    `
▸ Fixture args: [ 1, [ 'hello' ], [Function (anonymous)] ]
▸ Fixture return: Fixture { _a: 1, _b: [ 'hello' ], _c: [Function (anonymous)] }
▸ Fixture.func args: []
▸▸ Fixture._func args: [ 1 ]
▸▸▸ _c args: [ 1 ]
▸▸▸ _c return: 1
▸▸ Fixture._func return: [ 'hello' ]
▸ Fixture.func return: undefined
    `.trim()
  );
}

void test();
