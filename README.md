# `@driimus/matchbox`

A minimalist implementation of type-aware matching based on generic predicates.

Looking for a fully fledged solution for pattern matching? Check out [ts-pattern](https://github.com/gvergnaud/ts-pattern).

## Installation

```sh
pnpm add @driimus/matchbox
```

## Usage

Matcher functions are created by providing an array of tuples, where each entry consists of a predicate function and the output value for a successful match.

### `sync`

Synchronous matching evaluates each predicates in order until a match is found.

```ts
import { matchbox } from '@driimus/matchbox';

const match = matchbox.sync([
  [(x) => x === 0, 'none'],
  [(x) => x > 0 && x <= 9, 'a few'],
  [() => true, 'lots'],
]);

console.log(match(5)); // 'a few'
```

### `async`

Just like [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any), asynchronous matching evaluates predicates concurrently and resolves with the first fulfilled match.

```ts
import { matchbox } from '@driimus/matchbox';

const match = matchbox.async([
  [async (x) => x === 0, 'none'],
  [async (x) => x > 0 && x <= 9, 'a few'],
  [
    async (x) =>
      new Promise((resolve, reject) =>
        setTimeout(x > 10 ? resolve : reject, 1_000),
      ),
    'lots',
  ],
  [async (x) => x > 50, 'too many'],
]);

console.log(await match(99)); // 'too many', which resolves before 'lots'

```
