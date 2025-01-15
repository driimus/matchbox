import {
  type Match,
  type MatchAsync,
  MatchNotFoundError,
  matchbox,
} from '../src/index.js';

// biome-ignore lint/suspicious/noExplicitAny: don't care
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
        yield [(v: number) => v < 0, -1] satisfies Match;
        yield [(v: number) => v === 0, 0] satisfies Match;
        yield [(v: number) => v > 0, output.INT] satisfies Match;
      }

      expect(matchbox.sync(gen())(5)).toBe(output.INT);
    });
  });

  describe('#async', () => {
    const asyncify =
      // biome-ignore lint/suspicious/noExplicitAny:
        <TArgs extends any[], TReturn>(fn: (...args: TArgs) => TReturn) =>
        async (...args: TArgs) =>
          fn(...args);
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
        yield [async (v: number) => v < 0, -1] satisfies MatchAsync;
        yield [async (v: number) => v === 0, 0] satisfies MatchAsync;
        yield [async (v: number) => v > 0, output.INT] satisfies MatchAsync;
      }

      await expect(matchbox.async(gen())(5)).resolves.toBe(output.INT);
    });
  });
});
