import { type Match, matcher } from '../src/index.js';

describe('matcher', () => {
  test('should infer argument types', () => {
    const match = matcher([
      ['is odd' as const, (n) => n % 2 !== 0],
      ['is even' as const, (n) => n % 2 === 0],
    ] satisfies Match<[number], string>[]);

    expectTypeOf(match).parameter(0).toBeNumber();
  });
});