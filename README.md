# Wandering Mochi

A pixel cat that lives on websites that invite her, walks between them and keeps a public diary.

```html
<script src="https://mochi.is-a.bot/mochi.js" defer></script>
```

## What's inside

| Part | Where | What it does |
| --- | --- | --- |
| The cat | `docs/mochi.js` | One script tag with no dependencies. Pet, feed, play, sit and hide. |
| The crawler | `crawler/` | MochiBot. Visits guests, leaves reviews and finds invited neighbours. |
| The diary | `docs/index.html` | A static site showing her map and travels. |
| Badges | `docs/badges/` | One live SVG card per visited site. |

There is no server or database. A GitHub Action walks once a day and commits the results, so the
whole project can be hosted for free as static files.

## Adopt her

1. Add the script tag to your site, or add `<meta name="mochi" content="welcome" />`.
2. Add your domain to `docs/sites.json` with a pull request.
3. After her first visit, use `https://mochi.is-a.bot/badges/your-domain.com.svg` as an image.

Optional script settings:

| Attribute | Purpose |
| --- | --- |
| `data-name` | Rename the cat |
| `data-owner` | Your name, for her loving remarks |
| `data-photo` | CSS selector for an image she naps under |

## Crawler rules

- Visits only sites with an invitation on their homepage, and removes any site that drops it.
- Obeys `robots.txt`, and stays out when it can't be read because the server is failing.
- Reads only `robots.txt` and the homepage, and saves no page text.
- Checks linked sites once a month at most, and stores only a hash of sites that didn't invite her.
- Allows HTTPS only, refuses private network addresses, and limits redirects, size and time.

See [`docs/bot.html`](docs/bot.html) for the public version of these rules.

## Run it

Node 20 or newer is all you need. There is nothing to install.

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
