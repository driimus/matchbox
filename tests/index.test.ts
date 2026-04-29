import {
  type Match,
  type MatchAsync,
  MatchNotFoundError,
  matchbox,
} from '../src/index.js';

// biome-ignore lint/suspicious/noExplicitAny: don't care about test files
const isJSON = (v: any) => {
  try {
    JSON.parse(v);
    return true;
  } catch {
    return false;
  }
};

const output = {
  INT: Symbol('INT'),
  JSON: Symbol('JSON'),
};

describe('matchbox', () => {
  describe('#sync', () => {
    const match = matchbox.sync([
      [Number.isInteger, output.INT],
      [isJSON, output.JSON],
    ] as const);

    test("should error if there's no match", () => {
      expect(() => match('plain string')).toThrow(MatchNotFoundError);
    });

    test.each([
      { expected: output.INT, input: 1 },
      { expected: output.JSON, input: JSON.stringify({}) },
    ] satisfies { expected: ReturnType<typeof match>; input: unknown }[])(
      'should return the output for a matched predicate',
      ({ input, expected }) => {
        expect(match(input)).toBe(expected);
      },
    );

    test('should work with iterators', () => {
      function* gen() {
        yield [(v: number) => v < 0, -1] satisfies Match<number, number>;
        yield [(v: number) => v === 0, 0] satisfies Match<number, number>;
        yield [(v: number) => v > 0, output.INT] satisfies Match<
          number,
          symbol
        >;
      }

      expect(matchbox.sync(gen())(5)).toBe(output.INT);
    });

    test('should evaluate matched function output', () => {
      const match = matchbox.sync([
        [(n: number) => n % 2 === 0, (n) => n * 2],
      ] as const);

      expect(match(4)).toBe(8);
    });

    test('should pass narrowed value to function output for type guards', () => {
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

      expect(match('hi')).toBe('HI');
      expect(match(Math.PI)).toBe('3.14');
    });
  });

  describe('#async', () => {
    const asyncify =
      <T, TReturn>(fn: (value: T) => TReturn) =>
      async (value: T) =>
        fn(value);
    const match = matchbox.async([
      [asyncify(Number.isInteger), output.INT],
      [asyncify(isJSON), output.JSON],
    ] as const);

    test("should error if there's no match", async () => {
      await expect(match('plain string')).rejects.toThrow(MatchNotFoundError);
    });

    test.each([
      { expected: output.INT, input: 1 },
      { expected: output.JSON, input: JSON.stringify({}) },
    ] satisfies {
      expected: Awaited<ReturnType<typeof match>>;
      input: unknown;
    }[])(
      'should return the output for a matched predicate',
      async ({ input, expected }) => {
        await expect(match(input)).resolves.toBe(expected);
      },
    );

    test('should work with iterators', async () => {
      function* gen() {
        yield [async (v: number) => v < 0, -1] satisfies MatchAsync<
          number,
          number
        >;
        yield [async (v: number) => v === 0, 0] satisfies MatchAsync<
          number,
          number
        >;
        yield [async (v: number) => v > 0, output.INT] satisfies MatchAsync<
          number,
          symbol
        >;
      }

      await expect(matchbox.async(gen())(5)).resolves.toBe(output.INT);
    });

    test('should evaluate matched function output', async () => {
      const match = matchbox.async([
        [async (n: number) => n % 2 === 0, (n) => n * 2],
      ] as const);

      await expect(match(4)).resolves.toBe(8);
    });
  });
});
