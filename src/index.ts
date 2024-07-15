type IterableEntry<T> = T extends Iterable<infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: any parameter type goes
export type Match<TArgs extends any[] = any[], TOut = unknown> = [
  output: TOut,
  predicate: (...args: TArgs) => boolean,
];

export const matcher =
  <T extends Iterable<Match>>(checks: T) =>
  (...args: Parameters<IterableEntry<T>[1]>): IterableEntry<T>[0] => {
    for (const [output, predicate] of checks) {
      if (predicate(...args)) return output;
    }

    throw new MatchNotFoundError();
  };

export class MatchNotFoundError extends Error {
  name = 'MatchNotFoundError' as const;

  message = 'Exhaustive match did not return a value.';
}
