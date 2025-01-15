import { type Match, matchbox } from '../src/index.js';

describe('matchbox', () => {
  describe('#sync', () => {
    test('should infer function signature types', () => {
      const match = matchbox.sync([
        [(n) => n % 2 !== 0, 'is odd' as const],
        [(n) => n % 2 === 0, 'is even' as const],
      ] satisfies Match<[number], string>[]);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<'is odd' | 'is even'>();
    });
  });

  describe('#async', () => {
    test('should infer function signature types', () => {
      const match = matchbox.async([
        [async (n) => n % 2 !== 0, 'is odd' as const],
        [async (n) => n % 2 === 0, 'is even' as const],
      ] satisfies Match<[number], string, true>[]);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<
        Promise<'is odd' | 'is even'>
      >();
    });
  });
});
