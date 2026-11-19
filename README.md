# Family History Technology Workshop website

Source for [fhtw.byu.edu](https://fhtw.byu.edu), built with
[Astro](https://astro.build), MDX, React and Tailwind CSS.

## Development

Requires Node 24 (see `.nvmrc`; with nvm, run `nvm use`).

```sh
npm install
npm run dev        # local server at http://localhost:4321
npm run build      # build to dist/
npm run check-links
```

Pages are in `src/pages/`; past programs are `src/pages/archive/<year>.mdx`.
The Archive menu is defined in `src/layouts/WideLayout.astro`.

## Deployment

Netlify builds and deploys every push to `main`. Build settings and redirects
are in `netlify.toml`. The build runs `check-links`, so a broken `/conf/` link
fails the deploy instead of reaching the live site.

The DNS record for `fhtw.byu.edu` (a CNAME to Netlify) is managed by BYU IT.

## Archive files (papers, slides, audio, video)

Workshop materials are **not stored in git**. They live in the Cloudflare R2
bucket `fhtw-conf` and are served by a small Cloudflare Worker (`r2-worker/`).
Netlify redirects `/conf/*` to the Worker, so pages link to files as
`/conf/<year>/<file>`. The old site's `/static/conf/*` URLs redirect there too.

- `conf-manifest.txt` (committed) lists every file in the bucket.
- `public/conf/` is a local, git-ignored copy used by `npm run dev`.

Name files `lastname-keyword-{abstract,paper,presentation}-fhtw<year>.pdf`
and link them with the label components in `src/components/Label.jsx`:

```mdx
- _Talk Title_, Author Name<Paper url="/conf/2027/name-keyword-paper-fhtw2027.pdf" />
```

To add files:

```sh
npx wrangler login               # once
cp talk.pdf public/conf/2027/name-keyword-paper-fhtw2027.pdf
npm run conf -- status           # shows local files not yet uploaded
npm run conf -- upload           # uploads them and updates conf-manifest.txt
git add conf-manifest.txt src/pages/archive/2027.mdx && git commit
```

To get a local copy of all files (e.g. on a new machine), run
`npm run conf -- download`.

To change the Worker, edit `r2-worker/src/index.js` and run
`npm run deploy-worker`.
