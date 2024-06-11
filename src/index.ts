type Entry<T> = T extends Array<infer E> ? E : T;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Match<T extends any[] = any[]> = [
  output: unknown,
  predicate: (...args: T) => boolean,
];

export const matcher =
  <T extends Match, TIter extends Iterable<T>>(checks: TIter) =>
  (...args: Parameters<T[1]>): T[0] => {
    for (const [output, predicate] of checks) {
      if (predicate(...args)) return output;
    }

    throw new Error('Exhaustive match did not return a value.');
  };
