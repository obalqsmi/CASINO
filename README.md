# CASINO

Stake.com-inspired responsive casino front-end built with static HTML, a shared stylesheet, and lightweight JavaScript for navigation and pseudo-auth state.

## Quick start

1. Place the project on any static file host or open `index.html` locally in your browser.
2. Ensure `assets/styles.css` and `scripts.js` are served alongside the HTML pages.
3. (Optional) Clear `localStorage` if you want to reset the faux login state stored under the `casinoUser` key.

## Image asset checklist

Upload the following PNG files into `assets/images/` before deploying so every card and hero panel renders with the intended artwork:

- `logo.png`
- `aztec-riches.png`
- `blackjack-elite.png`
- `blackjack-table.png`
- `blackjack-vip.png`
- `crash.png`
- `dice-arena.png`
- `dice-duel.png`
- `gates-of-olympus.png`
- `lightning-roulette.png`
- `mega-moolah.png`
- `mega-wheel.png`
- `plinko.png`
- `roulette-live.png`
- `roulette-ultimate.png`
- `speed-baccarat.png`
- `sweet-vault.png`

Feel free to replace these filenames with your own artwork, but keep the names consistent with the references in the HTML or update the markup accordingly.

## Notes

- The layout adapts from large desktops down to small phones with a sticky header, collapsible navigation, and responsive grids/tables.
- `scripts.js` controls the mobile menu and a simple localStorage-based auth preview that swaps the Register/Login buttons for the Account/Log Out buttons.
- No build step is required—just ship the static files once the image assets are in place.
