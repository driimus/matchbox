import { type Match, matcher } from '../src/index.js';

const isJSON = (v: unknown) => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: don't care
    JSON.parse(v as any);
    return true;
  } catch {
    return false;
  }
};

const output = {
  INT: Symbol('INT'),
  JSON: Symbol('JSON'),
};

describe('matcher', () => {
  const match = matcher([
    [output.INT, Number.isInteger],
    [output.JSON, isJSON],
  ] as const);

  test("should error if there's no match", () => {
    expect(() => match('plain string')).toThrow();
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
      yield [-1, (v: number) => v < 0] satisfies Match;
      yield [0, (v: number) => v === 0] satisfies Match;
      yield [output.INT, (v: number) => v > 0] satisfies Match;
    }

    expect(matcher(gen())(5)).toBe(output.INT);
  });
});
