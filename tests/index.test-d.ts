import { type Match, matchbox } from '../src/index.js';

describe('matchbox', () => {
  describe('#sync', () => {
    test('should infer function signature types', () => {
      const match = matchbox.sync([
        [(n) => n % 2 !== 0, 'is odd' as const],
        [(n) => n % 2 === 0, 'is even' as const],
      ] satisfies Match<number, string>[]);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<'is odd' | 'is even'>();
    });

    test('should narrow function-output param when predicate is a type guard', () => {
      const match = matchbox.sync([
        [
          (x: unknown): x is string => typeof x === 'string',
          (s) => s.toUpperCase(),
        ],
        [
          (x: unknown): x is number => typeof x === 'number',
          (n) => n.toFixed(2),
        ],
      ] as const);

      expectTypeOf(match).parameter(0).toBeUnknown();
      expectTypeOf(match).returns.toEqualTypeOf<string>();
    });

    test('should fall back to predicate input when predicate is not a type guard', () => {
      const match = matchbox.sync([
        [(n: number) => n > 0, (n) => n + 1],
        [(n: number) => n <= 0, 0 as const],
      ] as const);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<number | 0>();
    });

    test('should union predicate input types across entries', () => {
      const match = matchbox.sync([
        [(x: string) => x.length > 0, 'str' as const],
        [(x: number) => x > 0, 'num' as const],
      ] as const);

      expectTypeOf(match).parameter(0).toEqualTypeOf<string | number>();
      expectTypeOf(match).returns.toEqualTypeOf<'str' | 'num'>();
    });
  });

  describe('#async', () => {
    test('should infer function signature types', () => {
      const match = matchbox.async([
        [async (n: number) => n % 2 !== 0, 'is odd' as const],
        [async (n: number) => n % 2 === 0, 'is even' as const],
      ] as const);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<
        Promise<'is odd' | 'is even'>
      >();
    });

    test('should infer function-output return types', () => {
      const match = matchbox.async([
        [async (n: number) => n > 0, (n) => n + 1],
      ] as const);

      expectTypeOf(match).parameter(0).toBeNumber();
      expectTypeOf(match).returns.toEqualTypeOf<Promise<number>>();
    });
  });
});
