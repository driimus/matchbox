type IterableEntry<T> = T extends Iterable<infer U> ? U : never;

type SyncPredicate<T = unknown, U extends T = T> =
  | ((value: T) => boolean)
  | ((value: T) => value is U);

type AsyncPredicate<T = unknown> = (value: T) => Promise<boolean>;

export type Match<T = unknown, TOut = unknown, U extends T = T> = readonly [
  predicate: SyncPredicate<T, U>,
  output: TOut | ((value: U) => TOut),
];

export type MatchAsync<T = unknown, TOut = unknown> = readonly [
  predicate: AsyncPredicate<T>,
  output: TOut | ((value: T) => TOut),
];

// biome-ignore lint/suspicious/noExplicitAny: predicate signature contravariance
type SyncCheckLike = readonly [(value: any) => boolean, unknown];

type GuardNarrow<P> = P extends (
  // biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
  value: any,
) => value is infer N
  ? N
  : never;

type ConstrainSyncCheck<E> = E extends readonly [infer P, infer O]
  ? [GuardNarrow<P>] extends [never]
    ? P extends (value: infer V) => boolean
      ? readonly [
          P,
          // biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
          O extends (...args: any) => any ? (value: V) => unknown : O,
        ]
      : never
    : readonly [
        P,
        // biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
        O extends (...args: any) => any
          ? (value: GuardNarrow<P>) => unknown
          : O,
      ]
  : never;

// biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
type PredicateInput<P> = P extends (value: infer V) => any ? V : never;

type OutputValue<O> = O extends (
  // biome-ignore lint/suspicious/noExplicitAny: function signature contravariance
  ...args: any
) => infer R
  ? R
  : O;

export class MatchNotFoundError extends Error {
  name = 'MatchNotFoundError' as const;

  message = 'Exhaustive match did not return a value.';
}

export function sync<const Checks extends readonly SyncCheckLike[]>(
  checks: Checks & { [K in keyof Checks]: ConstrainSyncCheck<Checks[K]> },
): (value: PredicateInput<Checks[number][0]>) => OutputValue<Checks[number][1]>;
export function sync<T extends Iterable<Match>>(
  checks: T,
): (
  value: PredicateInput<IterableEntry<T>[0]>,
) => OutputValue<IterableEntry<T>[1]>;
export function sync(checks: Iterable<Match>) {
  return (value: unknown): unknown => {
    for (const [predicate, output] of checks) {
      if (predicate(value)) {
        return typeof output === 'function'
          ? (output as (v: unknown) => unknown)(value)
          : output;
      }
    }
    throw new MatchNotFoundError();
  };
}

export const async =
  <T extends Iterable<MatchAsync>>(checks: T) =>
  (
    value: PredicateInput<IterableEntry<T>[0]>,
  ): Promise<OutputValue<IterableEntry<T>[1]>> =>
    Promise.any(map(checks, toMatchOutput(value))).catch(() => {
      throw new MatchNotFoundError();
    }) as Promise<OutputValue<IterableEntry<T>[1]>>;

export const matchbox = { sync, async };

const toMatchOutput =
  (value: unknown) =>
  ([predicate, output]: MatchAsync) =>
    predicate(value).then((ok) =>
      ok
        ? typeof output === 'function'
          ? (output as (v: unknown) => unknown)(value)
          : output
        : Promise.reject(),
    );

function* map<T, V>(
  iterable: Iterable<T>,
  mapper: (element: T) => V,
): IterableIterator<V> {
  for (const value of iterable) {
    yield mapper(value);
  }
}
