# Netlify and Cloudflare Dual Runtime

## Objective

Keep the existing Cloudflare Pages deployment functional while adding a working
Netlify deployment for the same consultation form endpoint.

## Design

- Preserve `wrangler.toml`, the Cloudflare Pages Function, the Wrangler
  development dependency, and the existing Cloudflare test coverage.
- Keep the Netlify Function as a separate adapter using the native Netlify
  route configuration.
- Read Netlify runtime secrets from `process.env`, which is the Node Functions
  runtime API.
- Declare `netlify-cli` as a development dependency so `npm run dev` works
  after a clean `npm install`.
- Add tests covering the Netlify environment accessor while retaining the
  existing behavior tests for both runtimes.

## Data Flow and Errors

Both functions validate the submitted fields, send credentials only from their
server-side runtime environment to Trello, and return the existing response
statuses: 422 for invalid input, 503 for missing configuration, 502 for
Trello failures, and 201 for success.

## Verification

Run `npm test` on the supported Node.js runtime and verify that both deployment
configuration files and both function implementations remain present.
