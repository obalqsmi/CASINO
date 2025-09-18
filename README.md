# CASINO

Stake.com-inspired responsive casino front-end built with static HTML, a shared stylesheet, and lightweight JavaScript for navigation and pseudo-auth state.

## Pages

- `index.html` &ndash; responsive homepage with hero CTA, trending games, and bankroll callouts.
- `dashboard.html` &ndash; portfolio dashboard summarising games played, profit/loss, and session timeline.
- `casino.html` &ndash; lobby grid for all games with category filters and jackpot overview.
- `history.html` &ndash; complete funds ledger covering deposits, withdrawals, and swaps.
- `help.html` &ndash; support centre featuring live chat, FAQs, and contact table.
- `account.html` &ndash; profile management for username, email, currency, avatar, and security settings.
- `settings.html` &ndash; preference controls for theme, time format, notifications, and accessibility toggles.
- `/games/blackjack.html` &ndash; fully playable blackjack table with bets, hit, stand, and shoe reset controls.
- `/games/roulette.html` &ndash; roulette wheel with colour, parity, straight bets, and bankroll settlements.
- `/games/plinko.html` &ndash; Stake originals plinko board with live multipliers and drop history.
- `/games/baccarat.html` &ndash; banker/player/tie baccarat including third-card logic and commission handling.
- `/games/starburst.html`, `/games/gonzos-quest.html`, `/games/mega-moolah.html`, `/games/book-of-dead.html` &ndash; themed slot rooms powered by the shared slot engine.
- `/games/sic-bo.html` &ndash; big/small/triple Sic Bo dice table with rolling history.
- `/games/keno.html` &ndash; ten-pick Keno with number selection, draw results, and win tracking.

## Quick start

1. Place the project on any static file host or open `index.html` locally in your browser.
2. Ensure `assets/styles.css` and `scripts.js` are served alongside the HTML pages.
3. (Optional) Clear `localStorage` if you want to reset the faux login state stored under the `casinoUser` key.

## Image asset checklist

Upload the following PNG files into `assets/images/` before deploying so every card and hero panel renders with the intended artwork:

- `logo.png`
- `blackjack.png`
- `roulette.png`
- `plinko.png`
- `baccarat.png`
- `starburst.png`
- `gonzos-quest.png`
- `mega-moolah.png`
- `book-of-dead.png`
- `sic-bo.png`
- `keno.png`
- `blackjack-vip.png`
- `crash.png`
- `lightning-roulette.png`
- `dice-duel.png`

Feel free to replace these filenames with your own artwork, but keep the names consistent with the references in the HTML or update the markup accordingly.

## Notes

- The layout adapts from large desktops down to small phones with a sticky header, collapsible navigation, and responsive grids/tables.
- `scripts.js` controls the mobile menu and a simple localStorage-based auth preview that swaps the Register/Login buttons for the Account/Log Out buttons.
- No build step is required—just ship the static files once the image assets are in place.
