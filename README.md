# TalaKing Help Center

Bilingual (English / Filipino) video tutorial site for TalaKing. Static, no build step.

- Guides: register, deposit, betting-pass, bind-wallet, agent
- A guide can have one video per language (`video: { en, fil }`) and its own image folder per language (`shots: { en, fil }`); `wide: true` shows 4:5 desktop screenshots instead of phone crops
- Edit copy/steps in `assets/js/content.js`, then bump `?v=` in `index.html`
- Deep links: `#/g/<id>`, force language with `?lang=en` or `?lang=fil`
- `.nojekyll` must stay (GitHub Pages)
