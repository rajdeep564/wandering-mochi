# Wandering Mochi

A pixel cat that lives on websites that invite her, walks between them and keeps a public diary.

```bash
npm install wandering-mochi
```

```js
import { adoptMochi } from "wandering-mochi";

adoptMochi();
```

In React, call it inside `useEffect` and return the result, which removes her on unmount.

```jsx
useEffect(() => adoptMochi(), []);
```

## What's inside

| Part | Where | What it does |
| --- | --- | --- |
| The cat | `src/cat.js` | No dependencies. Pet, feed, play, sit and hide. Builds to `dist/` and `docs/mochi.js`. |
| The crawler | `crawler/` | MochiBot. Visits guests, leaves reviews and finds invited neighbours. |
| The diary | `docs/index.html` | A static site showing her map and travels. |
| Badges | `docs/badges/` | One live SVG card per visited site. |

There is no server or database. A GitHub Action walks once a day and commits the results, so the
whole project can be hosted for free as static files.

## Adopt her

The steps above put her on your site. To have her visit and review it too:

1. Run `npx wandering-mochi invite` and deploy the `mochi.txt` file it creates.
2. Add your domain to `docs/sites.json` using the link it prints.
3. After her first visit, use `https://rajdeep564.github.io/wandering-mochi/badges/your-domain.com.svg` as an image.

Options:

| Option | Purpose |
| --- | --- |
| `name` | Rename the cat |
| `owner` | Your name, for her loving remarks |
| `photo` | CSS selector for an image she naps under |

No npm? Use a script tag, with `data-name`, `data-owner` and `data-photo` for the options:

```html
<script src="https://rajdeep564.github.io/wandering-mochi/mochi.js" defer></script>
```

## Crawler rules

- Visits only sites with an invitation, and removes any site that drops it.
- Obeys `robots.txt`, and stays out when it can't be read because the server is failing.
- Reads only `robots.txt`, the homepage and `/mochi.txt`, and saves no page text.
- Checks linked sites once a month at most, and stores only a hash of sites that didn't invite her.
- Allows HTTPS only, refuses private network addresses, and limits redirects, size and time.

See [`docs/bot.html`](docs/bot.html) for the public version of these rules.

## Run it

Node 20 or newer is all you need. There are no dependencies to install. Edit the cat in
`src/cat.js`, then run `npm run build`.

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run walk
```

## Host it

1. In the repository settings, enable GitHub Pages from the `main` branch and the `/docs` folder.
2. Allow Actions to write to the repository, under Settings, Actions, General.
3. Run "Mochi's daily walk" once from the Actions tab.

`vercel.json` is included if you would rather host on Vercel.

## Credits

Movement and sprites are adapted from [oneko.js](https://github.com/adryd325/oneko.js) by adryd,
under the MIT License. Wandering Mochi is also MIT licensed.
