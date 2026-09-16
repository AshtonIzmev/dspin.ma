# dspin.ma — proposition de refonte

Maquette **fonctionnelle** (pas une image) d'une refonte de dspin.ma, inspirée du travail
fait sur [34stud.io](https://34stud.io). Elle vit dans `/redesign/` et **ne touche pas** au
site actuel : les deux cohabitent, on peut les comparer côte à côte.

```
# depuis la racine du dépôt
python3 -m http.server 8000
# site actuel   → http://localhost:8000/
# proposition   → http://localhost:8000/redesign/
```

---

## Ce qui change

Le site actuel est le template Bootstrap **Regna v4.10** (BootstrapMade), acheté sur étagère
et daté. Cette proposition le remplace par du code écrit à la main.

| | Actuel | Proposition |
|---|---|---|
| Base | Template Regna + Bootstrap 5 | Écrit à la main, zéro framework |
| Dépendances JS | Bootstrap, GLightbox, Isotope, Swiper, PureCounter, AOS | aucune |
| Poids transféré | ~950 Ko de vendor (13 fichiers) + 1,3 Mo de photos | ~150 Ko au total, 1 photo |
| Polices | Google Fonts (requête tierce, RGPD) | auto-hébergées, `woff2` variable |
| Identité | verte, mais générique | construite autour du vert du logo |
| Crédit en pied de page | « Designed by BootstrapMade » | le vôtre |

Rien n'est chargé depuis un domaine tiers hormis Fathom, déjà en place et sans cookie.

## Le principe visuel

Le fond est un champ de points en orbite, dessiné en Canvas 2D. **En haut de page il tourne en
désordre ; en descendant, il se range en anneaux concentriques reliés entre eux.** C'est la
promesse de DSpin rendue littérale — la donnée brute qui devient décision — et c'est aussi le
motto `T³` : le repère en bas à gauche passe de `think` à `teach` puis `transform` selon la
profondeur de lecture.

Le fond passe progressivement de `#0a1a17` à `#0e2622` section par section (`data-bed`).

## Le parcours

`Hero → T³ → Missions → Offre → Valeurs → Équipe → Contact`

Tout le contenu vient du site actuel. Les trois missions, les trois valeurs, le paragraphe
sur l'IA/ML/LLM et les deux formulaires Google sont repris **mot pour mot**. Les seuls textes
nouveaux sont les trois descriptions `Think / Teach / Transform`, qui développent un motto
jusque-là énoncé sans être expliqué — **à relire et corriger**, ils engagent le discours.

## À compléter avant publication

- **Chiffres clés** — un bloc `#keynums` stylé et animé attend dans `index.html`, en commentaire.
  Il est volontairement désactivé : à n'activer qu'avec de vrais chiffres (missions livrées,
  personnes formées, années d'expérience…). Décommenter et remplir les trois valeurs.
- **Équipe** — une seule fiche (Issam) comme sur le site actuel. La grille en accueille plus
  sans modification.
- **Image de partage** — pas d'`og:image`. Prévoir un visuel 1200×630 et ajouter la balise.
- **Textes `T³`** — voir ci-dessus.

## Détails techniques

- `index.html` · `styles.css` · `app.js` — servis tels quels, aucun build, aucune étape de
  compilation. Même approche que 34stud.io.
- Accessibilité : lien d'évitement, `aria-label` sur les liens sociaux, focus visibles, menu
  mobile pilotable au clavier (`Échap` ferme), contrastes texte conformes AA.
- `prefers-reduced-motion` respecté : animations, grain et champ de points figés.
- L'adresse e-mail est assemblée en JavaScript, comme aujourd'hui, pour gêner les robots.
- Les photos Unsplash (`hero-bg`, `river`, `about-img`, `call-to-action-bg`) ne sont plus
  utilisées : le fond est calculé. Elles restent dans `/assets/` pour le site actuel.

### Polices

`Oswald`, `Manrope` et `Lora` — les trois sous licence **SIL Open Font License**,
auto-hébergées. Un seul fichier variable par famille.

> La police d'affichage de 34stud.io (**Thunder**, Pangram Pangram) est sous licence
> commerciale et **n'a pas été reprise**. Oswald joue ce rôle ici — ce qui distingue aussi
> visuellement les deux marques, ce qui est souhaitable.

## Mettre en ligne

Le dossier est autonome. Pour promouvoir la proposition en site principal :

```sh
git mv index.html index-legacy.html          # garder l'ancien sous la main
git mv redesign/index.html redesign/styles.css redesign/app.js .
git mv redesign/assets/fonts assets/fonts
# puis corriger dans index.html : ../assets/ → assets/
```

Les chemins `../assets/img/...` (favicon, photo d'équipe) deviennent `assets/img/...`.
