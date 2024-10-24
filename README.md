# matchbox

All-purpose matchers in JS

## Installation

```sh
pnpm add @driimus/matchbox
```

## Usage

### `sync`

```ts
import {matcher} from '@driimus/matchbox';

const match = matcher.sync([
    [(x) => x === 0, 'none'],
    [(x) => x > 0 && x <= 9, 'a few'],
    [() => true, 'lots'],
]);

console.log(match(5)); // 'a few'
```

### `async`

```ts
import { matcher } from "@driimus/matchbox";

const match = matcher.async([
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
