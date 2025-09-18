# Stake Casino Hub

Phase 1 delivers a Stake-inspired casino dashboard shell across every page in this project. The layout now features a fixed top bar, persistent sidebar navigation, tab rail, and responsive content canvas ready for future gameplay modules.

## Project structure

- `index.html` – unified Stake lobby with roadmap callouts for all upcoming features.
- `dashboard.html` – legacy entry point that now redirects to `index.html` to avoid duplicate layouts.
- `history.html`, `settings.html`, `help.html` – share the Stake shell with scoped placeholder content for future integrations.
- `login.html`, `signup.html` – redesigned auth screens that hydrate the new `stakeCasinoState` container alongside the existing legacy storage.

## State storage

A new localStorage key (`stakeCasinoState`) seeds project-wide state for wallet, user, live counters, and upcoming modules while remaining backward compatible with the earlier `casinoUser` entry.

## Next steps

With the layout foundation in place, upcoming work will wire interactive tab navigation, Stake Originals, wallet and bet controls, slot simulations, history, discovery features, and advanced security tooling.
