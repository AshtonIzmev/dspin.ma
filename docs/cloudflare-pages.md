# Cloudflare deployment

DSpin is a static site and does not require Node.js or a framework build. Cloudflare Workers Static Assets publishes only the generated `dist/` directory so repository files such as `deploy.sh`, `index-legacy.html`, and `nginx/` are never public.

## Build settings

Connect `AshtonIzmev/dspin.ma` in **Workers & Pages -> Create -> Import a repository**.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `/` |
| Build command | `./scripts/build-pages.sh` |
| Deploy command | `npx wrangler deploy` |

The committed `wrangler.jsonc` restricts static assets to `dist/`. Do not change its asset directory to `.` because that would expose repository internals.

## Custom domain migration

1. Deploy and verify the generated `*.pages.dev` preview.
2. Add `dspin.ma` under the Worker's **Settings -> Domains & Routes -> Custom Domain**.
3. Allow Cloudflare to replace the existing proxied VPS DNS record.
4. Verify HTTPS, headers, assets, and redirects on `https://dspin.ma`.
5. Keep the VPS available until DNS propagation and production checks pass.
6. After verification, remove the DSpin Nginx site and certificate from the VPS.

The `cloudflare/_headers` file carries the security policy currently enforced by Nginx. Cloudflare handles certificates and HTTP-to-HTTPS redirects automatically.

## Local build

```sh
./scripts/build-pages.sh
python3 -m http.server --directory dist 8765
```

Git integration should remain the production deployment mechanism so pushes to `main` deploy automatically.
