type IterableEntry<T> = T extends Iterable<infer U> ? U : never;

export type Match<
  // biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
  TArgs extends any[] = any[],
  TOut = unknown,
  Async extends boolean = false,
> = [
  predicate: (
    ...args: TArgs
  ) => Async extends true ? Promise<boolean> : boolean,
  output: TOut | ((...args: TArgs) => TOut),
];

// biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
export type MatchAsync = Match<any[], unknown, true>;

type MatchLike = [(...args: unknown[]) => unknown, unknown];

type MatchArgs<T extends Iterable<MatchLike>> = Parameters<IterableEntry<T>[0]>;
type MatchOutput<T extends Iterable<MatchLike>> = IterableEntry<T>[1];

type Unwrapped<T> = T extends (...args: unknown[]) => unknown
  ? ReturnType<T>
  : T;

export class MatchNotFoundError extends Error {
  name = 'MatchNotFoundError' as const;

  message = 'Exhaustive match did not return a value.';
}

export const sync =
  <T extends Iterable<Match>>(checks: T) =>
  (...args: MatchArgs<T>): Unwrapped<MatchOutput<T>> => {
    const result: { found: boolean; value: MatchOutput<T> | undefined } = {
      value: undefined,
      found: false,
    };

    for (const [predicate, output] of checks) {
      if (predicate(...args)) {
        result.value = output;
        result.found = true;
        break;
      }
    }

    if (!result.found) throw new MatchNotFoundError();

    return (
      typeof result.value === 'function' ? result.value(...args) : result.value
    ) as Unwrapped<MatchOutput<T>>;
  };

export const async =
  <T extends Iterable<MatchAsync>>(checks: T) =>
  async (...args: MatchArgs<T>): Promise<MatchOutput<T>> =>
    Promise.any(map(checks, toMatchOutput(args))).catch(() => {
      throw new MatchNotFoundError();
    });

export const matchbox = { sync, async };

const toMatchOutput =
  (args: unknown[]) =>
  ([predicate, output]: MatchAsync) =>
    predicate(...args).then((result) => (result ? output : Promise.reject()));

function* map<T, V>(
  iterable: Iterable<T>,
  mapper: (element: T) => V,
): IterableIterator<V> {
  for (const value of iterable) {
    yield mapper(value);
  }
}
