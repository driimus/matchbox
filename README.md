# `@driimus/matchbox`

A minimalist implementation of type-aware matching based on generic predicates.

Looking for a fully fledged solution for pattern matching? Check out [ts-pattern](https://github.com/gvergnaud/ts-pattern).

## Installation

```sh
pnpm add @driimus/matchbox
```

## Usage

Matcher functions are created from an array of `[predicate, output]` tuples. The matcher takes a single value, runs each predicate against it in order, and returns the corresponding output for the first one that passes.

The output may be a static value, or a function evaluated against the matched value.

### `sync`

Synchronous matching evaluates each predicate in order until a match is found.

```ts
import { matchbox } from '@driimus/matchbox';

const match = matchbox.sync([
  [(x: number) => x === 0, 'none'],
  [(x: number) => x > 0 && x <= 9, 'a few'],
  [() => true, 'lots'],
] as const);

console.log(match(5)); // 'a few'
```

#### Type-guard predicates

When a predicate is a type guard, the function-output form receives the narrowed value:

```ts
const describe = matchbox.sync([
  [
    (x: unknown): x is string => typeof x === 'string',
    (s) => `string of length ${s.length}`,
  ],
  [
    (x: unknown): x is number => typeof x === 'number',
    (n) => `number ${n.toFixed(2)}`,
  ],
  [() => true, 'unknown'],
] as const);

describe('hi');  // "string of length 2"
describe(3.14); // "number 3.14"
describe({});   // "unknown"
```

### `async`

Just like [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any), asynchronous matching evaluates predicates concurrently and resolves with the first fulfilled match.

```ts
import { matchbox } from '@driimus/matchbox';

const match = matchbox.async([
  [async (x: number) => x === 0, 'none'],
  [async (x: number) => x > 0 && x <= 9, 'a few'],
  [
    async (x: number) =>
      new Promise<boolean>((resolve, reject) =>
        setTimeout(() => (x > 10 ? resolve(true) : reject()), 1_000),
      ),
    'lots',
  ],
  [async (x: number) => x > 50, 'too many'],
] as const);

console.log(await match(99)); // 'too many', which resolves before 'lots'
```

> Async matchers do not support type-guard narrowing — TypeScript has no `Promise<value is U>` form.
