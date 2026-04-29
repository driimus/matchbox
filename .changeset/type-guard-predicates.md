---
'@driimus/matchbox': major
---

feat: type-guard predicates with narrowed function outputs

Predicates may now act as TypeScript type guards (`(x): x is U`). When a
predicate narrows the input, the corresponding match-arm function receives the
narrowed value:

```ts
const describe = matchbox.sync([
  [(x: unknown): x is string => typeof x === 'string', (s) => s.toUpperCase()],
  [(x: unknown): x is number => typeof x === 'number', (n) => n.toFixed(2)],
] as const);
```

BREAKING CHANGE: matchers are now single-value. Predicates and outputs operate
on a single argument; `Match`/`MatchAsync` types no longer accept a variadic
parameter list. Async matchers do not support type-guard narrowing because
TypeScript has no `Promise<value is U>` form.
