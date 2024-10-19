import matcher, { type Match } from '../src/index.js';

describe('matcher', () => {
  describe('#async', () => {
    test('should infer function signature types', () => {
      const match = matcher.sync([
        [(n) => n % 2 !== 0, 'is odd' as const],
        [(n) => n % 2 === 0, 'is even' as const],
      ] satisfies Match<[number], string>[]);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<'is odd' | 'is even'>();
    });
  });

  describe('#async', () => {
    test('should infer function signature types', () => {
      const match = matcher.async([
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
