# Wishlist — Design

Date: 2026-08-13
Status: approved, ready for implementation planning
Page: `https://victorito07.github.io/wishlist/`

## Goal

A birthday wishlist page Victor sends to friends. It must be enjoyable to
browse on a phone, and it must let friends reserve a gift so two people
don't buy the same thing — without revealing who reserved what.

## Non-goals

Deliberately excluded to keep the page small:

- Accounts, passwords, email, or any real authentication.
- A separate desktop layout. Desktop is the mobile layout in a centered,
  wider column.
- Categories, search, sorting, filtering, price tracking.
- Server code of any kind. GitHub Pages serves static files only.

## Structure

Follows the existing repo convention (a self-contained folder per page, no
build step), with data and pure logic split out so they can be edited and
tested independently.

```
wishlist/
  index.html    app shell: markup, styles, orbit, card, firebase glue
  lib.js        pure helpers, no DOM, no network (see Testable core)
  itens.js      the gift list — the only file edited routinely
  test.mjs      Node test for lib.js
  assets/       product photos, favicons
```

Three files instead of one, each justified:

- `itens.js` — adding a gift must not mean editing app code.
- `lib.js` — pure functions are the only part worth automated tests, and
  they can only be tested if they are importable.

Both are plain scripts assigning to a global, not ES modules. A `fetch()`
of a JSON file would break when the page is opened directly from disk;
script tags work from `file://`, `localhost`, and Pages alike.

## Data model

`itens.js`:

```js
window.ITENS = [
  {
    id:   'fone',                        // stable key; see warning below
    nome: 'Fone Bluetooth',
    desc: 'pra eu fingir que não escuto vocês no trabalho',
    img:  'assets/fone.jpg',
    url:  'https://loja.com/produto/123'  // optional
  },
];
```

`id` is the Firebase key for the item's reservation. **Renaming an `id`
after the page is live orphans that item's reservation** — the old claim
stays in the database under the dead key and the item reappears as
available. Renaming `nome`, `desc`, `img`, or `url` is always safe.

`url` is optional; when absent the "Ver na loja" button is not rendered.

Photos are downloaded into `assets/` and committed, cropped square. Store
hotlinks are not used: sizes are inconsistent, many stores block
hotlinking, and a delisted product would leave a hole in the ring.

## Identity and claims

There is no authentication. Identity is a name the friend types, which
makes reservations recoverable across devices and browsers — the point
being that clearing browser data must never strand someone with a
reservation they cannot release.

Flow:

1. On first visit the friend sees a centered name input. It is
   **mandatory** — there is no browse-only mode. This keeps a single path
   through the app and guarantees anyone who can reserve can also un-reserve.
2. The raw name is kept in `localStorage` so it is asked for once per
   device, with a small affordance to change it.
3. The name is normalized, then hashed. The hash is the identity written
   to Firebase.

**Normalization** (`normalizeName` in `lib.js`): lowercase → Unicode NFD →
strip combining diacritics → strip characters outside `[a-z0-9 ]` → collapse
runs of whitespace → trim. So `"  Vítu "`, `"VITU"`, and `"Vitu"` all yield
`"vitu"`.

**Hashing** (`hashName` in `lib.js`): cyrb53, a ~53-bit non-cryptographic
string hash, rendered as hex.

`crypto.subtle` is deliberately *not* used despite being the obvious
choice. It requires a secure context, so it is unavailable over `file://` —
the page would produce different identities when previewed locally than
when served, which is a confusing failure during development. Hash strength
buys nothing here regardless: the input space is a few dozen first names,
so any hash is brute-forceable by someone determined. The hash defends
against casual reading of the database, not against attack.

Two friends who type the same normalized name share one identity and can
release each other's reservations. The input's hint text mitigates this:
`"nome e sobrenome, se o seu for comum"`.

## Firebase

Realtime Database on the Spark (free) plan. With no billing account
attached the project cannot incur charges; it refuses traffic past quota
instead. Quota is 1 GB stored / 10 GB monthly transfer / 100 concurrent
connections — orders of magnitude beyond this use.

Schema — one string per reserved item, nothing else:

```
/claims/<itemId> = "<hashedName>"
```

Absent key means available. No names, no timestamps, no item metadata.

Security rules:

```json
{
  "rules": {
    "claims": {
      ".read": true,
      "$item": {
        ".write": "!data.exists() || !newData.exists()",
        ".validate": "newData.isString() && newData.val().length <= 40"
      }
    }
  }
}
```

Reads are public. A write may only *create* a claim on a free item or
*delete* an existing one; overwriting another person's claim is rejected.

Accepted limitation: rules cannot verify a hash, so anyone able to craft a
request can delete any reservation. The blast radius is an item returning
to available. The alternative is real authentication, which the non-goals
exclude.

The Firebase web config (apiKey, databaseURL, projectId) is public in the
repo. This is expected — Firebase treats these as identifiers, not
secrets; the rules above are what actually constrain access.

## Modules

Four pieces inside `index.html`, each with one purpose and a narrow
interface:

**`orbit`** — rotation, momentum, snapping, depth scaling, tile painting.
Constructed with a count and a `onSelect(index)` callback; exposes
`goTo(index)` and `setTaken(index, bool)`. Knows nothing about gifts,
Firebase, or identity.

**`card`** — renders one item and its claim state. `render(item, state)`
where state is `available | taken | mine`. Pure display; the reserve button
emits a callback rather than acting.

**`claims`** — the entire Firebase surface. Four functions:
`subscribe(cb)`, `claim(id)`, `unclaim(id)`, `isMine(id)`. Nothing else in
the app references Firebase.

**`app`** — wires the three together and owns the name gate.

Isolating `claims` is what makes degradation trivial: when Firebase is
unavailable, `claims` becomes a stub reporting nothing claimed and refusing
writes, and no other module changes behavior.

## Testable core

`lib.js` holds every pure function — no DOM, no network:

- `normalizeName(raw) -> string`
- `hashName(normalized) -> string`
- `selectedIndex(angle, count) -> number` — which item is in front
- `snapTarget(angle, count) -> number` — nearest resting angle
- `layout(angle, i, count) -> {x, y, scale, opacity, z}` — one tile's placement

These carry the logic that is easy to get subtly wrong (wrap-around at the
0/2π seam, shortest-path snapping, normalization edge cases) and are tested
directly. Everything else is DOM wiring, verified by hand.

`lib.js` assigns `globalThis.WL` and contains no `export` statements, so the
same file loads as a `<script>` in the browser and as CommonJS under Node —
`test.mjs` imports it for the side effect and reads `globalThis.WL`. This
avoids needing a `package.json` or a module bundler.

## Interaction

- Horizontal drag rotates the ring; vertical drag is ignored.
- On release the ring eases to the nearest item. It never rests between
  items, because the detail card requires an unambiguous selection.
- Tapping an off-center item rotates it to focus rather than requiring a
  precise drag.
- Selection change fades the card out (170ms), swaps content, fades in.
- Reserved items stay in the ring, desaturated with a check overlay. They
  are out of contention but still visible — a shrinking list is confusing,
  and people like seeing what has been picked.
- Reserving is optimistic: the tile greys immediately, and reverts if the
  write fails.

## Layout

Single viewport, no page scroll. Header (title, position counter, count of
remaining items) → orbit → detail card pinned to the bottom.

The card sizes to its content up to `max-height`, then scrolls internally.
It must never reach the ring. Short descriptions stay compact rather than
padding out a fixed box.

Mobile specifics: `100dvh` rather than `100vh`, so Safari's collapsing
toolbar cannot crop the card; `env(safe-area-inset-*)` padding for notches;
`touch-action: none` scoped to the ring only.

Desktop: identical layout, centered, `max-width: 560px`, larger ring.

## Failure handling

| Failure | Behavior |
| --- | --- |
| Firebase SDK blocked or offline (3s timeout) | Page runs stateless: full browsing, no reserve buttons, note reading `"reservas indisponíveis"` |
| Firebase unavailable *before* the name gate | The gate is shown unconditionally and does not wait on the network. It is instant and offline, and making it conditional would either flicker as the timeout resolves or fork the app into two paths. |
| A write fails | Optimistic state reverts, toast explains |
| Image 404s | Tile falls back to a neutral placeholder |
| `itens.js` empty or malformed | Friendly empty state, not a blank screen |
| `prefers-reduced-motion` | Idle drift and bobbing disabled; snapping becomes instant |

## Verification

The repo has no test infrastructure, and this does not add a framework.

- **Automated:** a small Node script exercising the `lib.js` functions,
  runnable with `node wishlist/test.mjs`. Covers accented and mixed-case
  names, hash determinism, wrap-around at the seam, and shortest-path
  snapping.
- **Manual, on a real phone:** the whole point is mobile, so the final
  check is the page open on an actual device — flick and snap feel, card
  legibility, safe-area behavior, and a reservation appearing live in a
  second browser.
- **Degradation:** verified by blocking the Firebase domain in devtools and
  confirming the page still browses cleanly.

## Prerequisites from Victor

Neither blocks implementation; the page is built against placeholder data.

1. The gift list — name, description, store link per item. Photos are
   downloaded from those links.
2. A Firebase project and its web config. Click-by-click setup steps,
   including applying the rules above, are written as part of the work.
