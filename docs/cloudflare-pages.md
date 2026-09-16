# Cloudflare Pages deployment

DSpin is a static site and does not require Node.js or a framework build. Cloudflare Pages should publish only the generated `dist/` directory so repository files such as `deploy.sh`, `index-legacy.html`, and `nginx/` are never public.

## Build settings

Connect `AshtonIzmev/dspin.ma` in **Workers & Pages -> Create -> Pages -> Connect to Git**.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `/` |
| Build command | `./scripts/build-pages.sh` |
| Build output directory | `dist` |

No environment variables are required.

## Custom domain migration

1. Deploy and verify the generated `*.pages.dev` preview.
2. Add `dspin.ma` under the Pages project's **Custom domains**.
3. Allow Cloudflare to replace the existing proxied VPS DNS record.
4. Verify HTTPS, headers, assets, and redirects on `https://dspin.ma`.
5. Keep the VPS available until DNS propagation and production checks pass.
6. After verification, remove the DSpin Nginx site and certificate from the VPS.

The `cloudflare/_headers` file carries the security policy currently enforced by Nginx. Cloudflare Pages handles certificates and HTTP-to-HTTPS redirects automatically.

## Local build

```sh
./scripts/build-pages.sh
python3 -m http.server --directory dist 8765
```

## Direct preview deployment

After authenticating Wrangler:

```sh
npx wrangler login
npx wrangler pages deploy dist --project-name dspin-ma
```

Git integration should remain the production deployment mechanism so pushes to `main` deploy automatically.
