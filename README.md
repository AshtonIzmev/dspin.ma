# dspin.ma

![dspin.ma](/assets/img/readme/image.png)

---

Le site principal utilise la refonte sur mesure, sans framework ni étape de compilation.
L'ancienne page d'accueil reste disponible dans [`index-legacy.html`](index-legacy.html).

## Déploiement

Le site est préparé pour Cloudflare Workers Static Assets. Le script [`scripts/build-pages.sh`](scripts/build-pages.sh)
génère un dossier `dist/` minimal contenant uniquement les fichiers publics. Les paramètres du
projet et la procédure de migration du domaine sont documentés dans
[`docs/cloudflare-pages.md`](docs/cloudflare-pages.md).

Le déploiement VPS historique reste disponible localement via `deploy.sh` jusqu'à validation de
la migration Cloudflare.
