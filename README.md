# matchbox

All-purpose matchers in JS

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

Asynchronous matching evaluates predicates concurrently and resolves with the first fulfilled match.

```ts
import { matchbox } from "@driimus/matchbox";

const match = matchbox.async([
  [async (x) => x === 0, "none"],
  [async (x) => x > 0 && x <= 9, "a few"],
  [async (x) => x > 10, "lots"],
  [
    async (x) =>
      new Promise((resolve, reject) =>
        setTimeout(x > 50 ? resolve : reject, 10_000)
      ),
    "too many",
  ],
]);

console.log(await match(99)); // 'lots'
```
