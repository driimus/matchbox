type IterableEntry<T> = T extends Iterable<infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: any parameter type goes
export type Match<TArgs extends any[] = any[], TOut = unknown> = [
  predicate: (...args: TArgs) => boolean,
  output: TOut,
];

type MatchArgs<T extends Iterable<Match>> = Parameters<IterableEntry<T>[0]>;
type MatchOutput<T extends Iterable<Match>> = IterableEntry<T>[1];

export const matcher =
  <T extends Iterable<Match>>(checks: T) =>
  (...args: MatchArgs<T>): MatchOutput<T> => {
    for (const [predicate, output] of checks) {
      if (predicate(...args)) return output;
    }

    throw new MatchNotFoundError();
  };

export class MatchNotFoundError extends Error {
  name = 'MatchNotFoundError' as const;

  message = 'Exhaustive match did not return a value.';
}
