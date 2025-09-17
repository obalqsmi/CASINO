const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('casinoUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to parse stored user', error);
    return null;
  }
};

const storeUser = (payload) => {
  localStorage.setItem('casinoUser', JSON.stringify(payload));
};

const removeStoredUser = () => {
  localStorage.removeItem('casinoUser');
};

const getPreferences = () => {
  try {
    const raw = localStorage.getItem('casinoPreferences');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to parse stored preferences', error);
    return null;
  }
};

const storePreferences = (payload) => {
  localStorage.setItem('casinoPreferences', JSON.stringify(payload));
};

const closeMobileMenu = (navLinks, toggle) => {
  if (!navLinks) return;
  navLinks.classList.remove('open');
  document.body.classList.remove('nav-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const authButtons = document.querySelector('[data-auth-buttons]');
  const userInfo = document.querySelector('[data-user-info]');
  const mobileAuth = document.querySelector('[data-mobile-auth]');
  const mobileUser = document.querySelector('[data-mobile-user]');
  const usernameTargets = document.querySelectorAll('[data-username]');
  const logoutButtons = document.querySelectorAll('[data-logout]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      document.body.classList.toggle('nav-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('open')) return;
      if (event.target === menuToggle || menuToggle.contains(event.target)) return;
      if (event.target === navLinks || navLinks.contains(event.target)) return;
      closeMobileMenu(navLinks, menuToggle);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) {
        closeMobileMenu(navLinks, menuToggle);
      }
    });

    navLinks.querySelectorAll('a.nav-link').forEach((link) => {
      link.addEventListener('click', () => closeMobileMenu(navLinks, menuToggle));
    });
  }

  const user = getStoredUser();

  const renderAuthState = (profile) => {
    if (profile && (profile.username || profile.displayName)) {
      const resolvedName = profile.displayName || profile.username || 'Player';
      usernameTargets.forEach((target) => {
        target.textContent = resolvedName;
      });
      authButtons?.classList.add('hidden');
      userInfo?.classList.add('is-visible');
      mobileAuth?.classList.add('hidden');
      mobileUser?.classList.add('is-visible');
    } else {
      authButtons?.classList.remove('hidden');
      userInfo?.classList.remove('is-visible');
      mobileAuth?.classList.remove('hidden');
      mobileUser?.classList.remove('is-visible');
    }
  };

  renderAuthState(user);

  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => {
      removeStoredUser();
      renderAuthState(null);
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
    });
  });

  const accountForm = document.querySelector('[data-account-form]');
  const accountFeedback = document.querySelector('[data-account-feedback]');
  if (accountForm) {
    if (user) {
      const mappings = [
        ['displayName', user.displayName || user.username || ''],
        ['username', user.username || ''],
        ['email', user.email || ''],
        ['currency', user.currency || 'USD'],
        ['country', user.country || 'USA'],
        ['avatar', user.avatar || ''],
        ['bio', user.bio || ''],
      ];

      mappings.forEach(([name, value]) => {
        const field = accountForm.querySelector(`[name="${name}"]`);
        if (field && value) {
          field.value = value;
        }
      });

      const twoFactor = accountForm.querySelector('[name="twoFactor"]');
      if (twoFactor) {
        twoFactor.checked = Boolean(user.twoFactor ?? true);
      }

      const marketing = accountForm.querySelector('[name="marketing"]');
      if (marketing) {
        marketing.checked = Boolean(user.marketing);
      }
    }

    accountForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(accountForm);
      const username = (formData.get('username') || formData.get('displayName') || 'Player').toString().trim() || 'Player';
      const payload = {
        username,
        displayName: (formData.get('displayName') || username).toString().trim() || username,
        email: (formData.get('email') || '').toString().trim(),
        currency: (formData.get('currency') || 'USD').toString().trim(),
        country: (formData.get('country') || 'USA').toString().trim(),
        avatar: (formData.get('avatar') || '').toString().trim(),
        bio: (formData.get('bio') || '').toString().trim(),
        twoFactor: formData.has('twoFactor'),
        marketing: formData.has('marketing'),
        updatedAt: new Date().toISOString(),
      };
      storeUser(payload);
      renderAuthState(payload);
      if (accountFeedback) {
        accountFeedback.classList.remove('hidden');
        accountFeedback.classList.add('is-visible', 'active');
        accountFeedback.textContent = 'Account details saved successfully.';
        setTimeout(() => {
          accountFeedback.classList.remove('is-visible', 'active');
          accountFeedback.classList.add('hidden');
        }, 3200);
      }
    });
  }

  const preferencesForm = document.querySelector('[data-preferences-form]');
  const preferencesFeedback = document.querySelector('[data-preferences-feedback]');
  if (preferencesForm) {
    const defaults = {
      theme: 'dark',
      accent: 'cyan',
      timeFormat: '24h',
      timezone: 'UTC',
      sound: true,
      reduceMotion: false,
      notifications: true,
      emailUpdates: false,
    };

    const storedPreferences = { ...defaults, ...(getPreferences() || {}) };

    Object.entries(storedPreferences).forEach(([key, value]) => {
      const field = preferencesForm.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });

    preferencesForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(preferencesForm);
      const payload = {
        theme: (formData.get('theme') || 'dark').toString(),
        accent: (formData.get('accent') || 'cyan').toString(),
        timeFormat: (formData.get('timeFormat') || '24h').toString(),
        timezone: (formData.get('timezone') || 'UTC').toString(),
        sound: formData.has('sound'),
        reduceMotion: formData.has('reduceMotion'),
        notifications: formData.has('notifications'),
        emailUpdates: formData.has('emailUpdates'),
        savedAt: new Date().toISOString(),
      };
      storePreferences(payload);
      if (preferencesFeedback) {
        preferencesFeedback.classList.remove('hidden');
        preferencesFeedback.classList.add('is-visible', 'active');
        preferencesFeedback.textContent = 'Preferences updated successfully.';
        setTimeout(() => {
          preferencesFeedback.classList.remove('is-visible', 'active');
          preferencesFeedback.classList.add('hidden');
        }, 3200);
      }
    });
  }

  initGamePage();
});

function initGamePage() {
  const body = document.body;
  if (!body) return;
  const gameType = body.dataset.game;
  if (!gameType) return;
  const root = document.querySelector('[data-game-root]');
  if (!root) return;

  const initializers = {
    blackjack: initBlackjack,
    roulette: initRoulette,
    plinko: initPlinko,
    baccarat: initBaccarat,
    'slot-starburst': (node) => initSlotMachine(node, slotConfigs.starburst),
    'slot-gonzo': (node) => initSlotMachine(node, slotConfigs.gonzo),
    'slot-mega-moolah': (node) => initSlotMachine(node, slotConfigs.megaMoolah),
    'slot-book-of-dead': (node) => initSlotMachine(node, slotConfigs.bookOfDead),
    sicbo: initSicBo,
    keno: initKeno,
  };

  const initializer = initializers[gameType];
  if (typeof initializer === 'function') {
    initializer(root);
  }
}

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createStandardDeck() {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ rank, suit });
    });
  });
  return shuffle(deck);
}

function shuffle(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getBlackjackValue(card) {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.rank)) return 10;
  return Number(card.rank);
}

function calculateBlackjackHandValue(hand) {
  let total = 0;
  let aces = 0;
  hand.forEach((card) => {
    total += getBlackjackValue(card);
    if (card.rank === 'A') aces += 1;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function renderHand(container, hand, { hideFirstCard = false } = {}) {
  if (!container) return;
  container.innerHTML = '';
  hand.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'playing-card';
    if (hideFirstCard && index === 0) {
      cardElement.classList.add('is-hidden');
      cardElement.textContent = 'Hidden';
    } else {
      cardElement.textContent = `${card.rank}${card.suit}`;
    }
    container.appendChild(cardElement);
  });
}

function initBlackjack(root) {
  const dealerCardsEl = root.querySelector('[data-dealer-cards]');
  const playerCardsEl = root.querySelector('[data-player-cards]');
  const dealerTotalEl = root.querySelector('[data-dealer-total]');
  const playerTotalEl = root.querySelector('[data-player-total]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const balanceEl = root.querySelector('[data-balance]');
  const betInput = root.querySelector('[data-bet-input]');
  const currentBetEl = root.querySelector('[data-current-bet]');
  const dealButton = root.querySelector('[data-deal]');
  const hitButton = root.querySelector('[data-hit]');
  const standButton = root.querySelector('[data-stand]');
  const resetButton = root.querySelector('[data-reset]');

  let deck = [];
  let dealerHand = [];
  let playerHand = [];
  let revealDealer = false;
  let roundActive = false;
  let balance = 1000;
  let currentBet = 0;

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  const updateBalance = () => {
    if (balanceEl) {
      balanceEl.textContent = balance.toFixed(2);
    }
    if (currentBetEl) {
      currentBetEl.textContent = currentBet ? currentBet.toFixed(2) : '0.00';
    }
  };

  const updateTotals = () => {
    if (dealerTotalEl) {
      dealerTotalEl.textContent = revealDealer ? calculateBlackjackHandValue(dealerHand) : '??';
    }
    if (playerTotalEl) {
      playerTotalEl.textContent = calculateBlackjackHandValue(playerHand);
    }
  };

  const updateHands = () => {
    renderHand(dealerCardsEl, dealerHand, { hideFirstCard: !revealDealer && roundActive });
    renderHand(playerCardsEl, playerHand);
    updateTotals();
  };

  const drawCard = () => deck.pop();

  const finishRound = (result) => {
    roundActive = false;
    revealDealer = true;
    updateHands();
    if (messageEl) {
      messageEl.textContent = result.message;
    }
    if (typeof result.payout === 'number') {
      balance += result.payout;
    }
    currentBet = 0;
    updateBalance();
    appendHistory(`${new Date().toLocaleTimeString()} – ${result.message}`);
  };

  const evaluateGame = () => {
    const playerTotal = calculateBlackjackHandValue(playerHand);

    if (playerTotal > 21) {
      finishRound({ message: 'Player busts. Dealer wins.', payout: 0 });
      return;
    }

    while (calculateBlackjackHandValue(dealerHand) < 17) {
      dealerHand.push(drawCard());
    }

    const updatedDealerTotal = calculateBlackjackHandValue(dealerHand);

    if (updatedDealerTotal > 21) {
      finishRound({ message: 'Dealer busts. Player wins!', payout: currentBet * 2 });
    } else if (updatedDealerTotal > playerTotal) {
      finishRound({ message: 'Dealer wins the hand.', payout: 0 });
    } else if (updatedDealerTotal < playerTotal) {
      finishRound({ message: 'Player wins!', payout: currentBet * 2 });
    } else {
      finishRound({ message: 'Push. Bet returned.', payout: currentBet });
    }
  };

  const startRound = () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid bet to start.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Bet exceeds available balance.';
      return;
    }

    deck = createStandardDeck();
    dealerHand = [drawCard(), drawCard()];
    playerHand = [drawCard(), drawCard()];
    revealDealer = false;
    roundActive = true;
    currentBet = betValue;
    balance -= betValue;
    updateBalance();
    if (messageEl) messageEl.textContent = 'Good luck! Hit or stand to continue.';
    updateHands();

    const playerTotal = calculateBlackjackHandValue(playerHand);
    const dealerTotal = calculateBlackjackHandValue(dealerHand);
    if (playerTotal === 21) {
      revealDealer = true;
      const blackjackPayout = betValue * 2.5;
      finishRound({ message: 'Blackjack! Paid 3:2.', payout: blackjackPayout });
    } else if (dealerTotal === 21) {
      revealDealer = true;
      finishRound({ message: 'Dealer hits blackjack.', payout: 0 });
    }
  };

  const resetGame = () => {
    deck = [];
    dealerHand = [];
    playerHand = [];
    revealDealer = false;
    roundActive = false;
    currentBet = 0;
    if (messageEl) messageEl.textContent = 'New shoe ready. Place a bet to begin.';
    updateHands();
    updateBalance();
  };

  dealButton?.addEventListener('click', () => {
    if (roundActive) return;
    startRound();
  });

  hitButton?.addEventListener('click', () => {
    if (!roundActive) return;
    playerHand.push(drawCard());
    updateHands();
    if (calculateBlackjackHandValue(playerHand) > 21) {
      finishRound({ message: 'Player busts. Dealer wins.', payout: 0 });
    }
  });

  standButton?.addEventListener('click', () => {
    if (!roundActive) return;
    revealDealer = true;
    evaluateGame();
  });

  resetButton?.addEventListener('click', () => {
    resetGame();
  });

  resetGame();
}

function initRoulette(root) {
  const betButtons = root.querySelectorAll('[data-bet-option]');
  const selectedBetEl = root.querySelector('[data-selected-bet]');
  const spinButton = root.querySelector('[data-spin]');
  const betInput = root.querySelector('[data-bet-input]');
  const numberInput = root.querySelector('[data-number-bet]');
  const balanceEl = root.querySelector('[data-balance]');
  const resultEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const wheelNumberEl = root.querySelector('[data-wheel-number]');
  const wheelColorEl = root.querySelector('[data-wheel-color]');

  let selectedBet = 'red';
  let balance = 1000;

  const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

  const updateSelectedBet = () => {
    betButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.betOption === selectedBet);
    });
    if (selectedBetEl) {
      selectedBetEl.textContent = selectedBet.toUpperCase();
    }
  };

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  betButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedBet = button.dataset.betOption || 'red';
      updateSelectedBet();
    });
  });

  spinButton?.addEventListener('click', () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    const straightNumber = numberInput?.value ? Number.parseInt(numberInput.value, 10) : null;
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (resultEl) resultEl.textContent = 'Enter a valid wager before spinning.';
      return;
    }
    if (betValue > balance) {
      if (resultEl) resultEl.textContent = 'Insufficient balance for this wager.';
      return;
    }
    if (straightNumber !== null && (Number.isNaN(straightNumber) || straightNumber < 0 || straightNumber > 36)) {
      if (resultEl) resultEl.textContent = 'Straight bet must be between 0 and 36.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const rolledNumber = Math.floor(Math.random() * 37);
    const color = rolledNumber === 0 ? 'green' : redNumbers.has(rolledNumber) ? 'red' : 'black';

    if (wheelNumberEl) wheelNumberEl.textContent = String(rolledNumber);
    if (wheelColorEl) wheelColorEl.textContent = color.toUpperCase();

    let payout = 0;
    let outcomeMessage = `Ball landed on ${rolledNumber} ${color}.`;

    if (straightNumber !== null) {
      if (rolledNumber === straightNumber) {
        payout = betValue * 36;
        outcomeMessage += ` Straight bet wins ${payout.toFixed(2)}.`;
      } else {
        outcomeMessage += ' Straight bet loses.';
      }
    } else if (selectedBet === color) {
      payout = betValue * (color === 'green' ? 36 : 2);
      outcomeMessage += ` ${color.toUpperCase()} bet wins ${payout.toFixed(2)}.`;
    } else if (selectedBet === 'odd' || selectedBet === 'even') {
      if (rolledNumber !== 0 && rolledNumber % 2 === (selectedBet === 'even' ? 0 : 1)) {
        payout = betValue * 2;
        outcomeMessage += ` ${selectedBet.toUpperCase()} bet wins ${payout.toFixed(2)}.`;
      } else {
        outcomeMessage += ` ${selectedBet.toUpperCase()} bet loses.`;
      }
    } else if (selectedBet === 'low' || selectedBet === 'high') {
      const isLow = rolledNumber >= 1 && rolledNumber <= 18;
      const isHigh = rolledNumber >= 19 && rolledNumber <= 36;
      if (rolledNumber !== 0 && ((selectedBet === 'low' && isLow) || (selectedBet === 'high' && isHigh))) {
        payout = betValue * 2;
        outcomeMessage += ` ${selectedBet.toUpperCase()} bet wins ${payout.toFixed(2)}.`;
      } else {
        outcomeMessage += ` ${selectedBet.toUpperCase()} bet loses.`;
      }
    } else {
      outcomeMessage += ' Bet loses.';
    }

    if (payout > 0) {
      balance += payout;
      updateBalance();
    }

    if (resultEl) resultEl.textContent = outcomeMessage;
    appendHistory(`${new Date().toLocaleTimeString()} – ${outcomeMessage}`);
  });

  updateSelectedBet();
  updateBalance();
}

function initPlinko(root) {
  const dropButton = root.querySelector('[data-drop]');
  const betInput = root.querySelector('[data-bet-input]');
  const balanceEl = root.querySelector('[data-balance]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const multiplierEl = root.querySelector('[data-multiplier]');

  let balance = 500;
  const multipliers = [0, 0.2, 0.5, 0.8, 1, 1.2, 2, 5, 10, 15];

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  dropButton?.addEventListener('click', () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid stake before dropping a puck.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Not enough balance for this stake.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const winnings = betValue * multiplier;
    if (multiplierEl) multiplierEl.textContent = `${multiplier.toFixed(2)}x`;

    if (winnings > 0) {
      balance += winnings;
      updateBalance();
      if (messageEl) messageEl.textContent = `Puck landed on ${multiplier.toFixed(2)}x! Won ${winnings.toFixed(2)}.`;
    } else if (messageEl) {
      messageEl.textContent = 'Unlucky bounce. No payout this time.';
    }

    appendHistory(`${new Date().toLocaleTimeString()} – Drop ${multiplier.toFixed(2)}x for ${winnings.toFixed(2)}.`);
  });

  updateBalance();
}

function initBaccarat(root) {
  const betButtons = root.querySelectorAll('[data-bet-option]');
  const betInput = root.querySelector('[data-bet-input]');
  const balanceEl = root.querySelector('[data-balance]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const dealButton = root.querySelector('[data-deal]');
  const playerCardsEl = root.querySelector('[data-player-cards]');
  const bankerCardsEl = root.querySelector('[data-banker-cards]');
  const playerTotalEl = root.querySelector('[data-player-total]');
  const bankerTotalEl = root.querySelector('[data-banker-total]');
  const selectedBetEl = root.querySelector('[data-selected-bet]');

  let selectedBet = 'player';
  let balance = 1000;
  let deck = [];

  const baccaratValue = (rank) => {
    if (rank === 'A') return 1;
    if (['10', 'J', 'Q', 'K'].includes(rank)) return 0;
    return Number.parseInt(rank, 10);
  };

  const baccaratDeck = () => {
    const values = [];
    for (let i = 0; i < 8; i += 1) {
      suits.forEach((suit) => {
        ranks.forEach((rank) => {
          values.push({ rank, suit, value: baccaratValue(rank) });
        });
      });
    }
    return shuffle(values);
  };

  const drawCard = () => {
    if (deck.length <= 6) {
      deck = baccaratDeck();
    }
    return deck.pop();
  };

  const cardLabel = (card) => `${card.rank}${card.suit}`;

  const totalValue = (hand) => hand.reduce((sum, card) => (sum + card.value) % 10, 0);

  const updateSelectedBet = () => {
    betButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.betOption === selectedBet);
    });
    if (selectedBetEl) selectedBetEl.textContent = selectedBet.toUpperCase();
  };

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const renderCards = (container, hand) => {
    if (!container) return;
    container.innerHTML = '';
    hand.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'playing-card';
      el.textContent = cardLabel(card);
      container.appendChild(el);
    });
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  betButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedBet = button.dataset.betOption || 'player';
      updateSelectedBet();
    });
  });

  dealButton?.addEventListener('click', () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid wager to deal.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Balance too low for that wager.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const playerHand = [drawCard(), drawCard()];
    const bankerHand = [drawCard(), drawCard()];

    let playerThird = null;
    const playerTotal = totalValue(playerHand);
    const bankerTotal = totalValue(bankerHand);

    const shouldPlayerDraw = playerTotal <= 5;
    if (shouldPlayerDraw) {
      playerThird = drawCard();
      playerHand.push(playerThird);
    }

    const bankerTotalAfterFirst = totalValue(bankerHand);
    let bankerThird = null;

    const bankerDraws = () => {
      bankerThird = drawCard();
      bankerHand.push(bankerThird);
    };

    const bankerShouldDraw = () => {
      if (!playerThird) {
        return bankerTotalAfterFirst <= 5;
      }
      const playerThirdValue = playerThird.value;
      if (bankerTotalAfterFirst <= 2) return true;
      if (bankerTotalAfterFirst === 3) return playerThirdValue !== 8;
      if (bankerTotalAfterFirst === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
      if (bankerTotalAfterFirst === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
      if (bankerTotalAfterFirst === 6) return playerThirdValue === 6 || playerThirdValue === 7;
      return false;
    };

    if (bankerShouldDraw()) {
      bankerDraws();
    }

    const finalPlayerTotal = totalValue(playerHand);
    const finalBankerTotal = totalValue(bankerHand);

    renderCards(playerCardsEl, playerHand);
    renderCards(bankerCardsEl, bankerHand);
    if (playerTotalEl) playerTotalEl.textContent = finalPlayerTotal;
    if (bankerTotalEl) bankerTotalEl.textContent = finalBankerTotal;

    let payout = 0;
    let outcome;
    if (finalPlayerTotal > finalBankerTotal) {
      outcome = 'Player wins';
      if (selectedBet === 'player') payout = betValue * 2;
    } else if (finalBankerTotal > finalPlayerTotal) {
      outcome = 'Banker wins';
      if (selectedBet === 'banker') payout = betValue * 1.95;
    } else {
      outcome = 'Tie';
      if (selectedBet === 'tie') payout = betValue * 9;
      else payout = betValue; // return wagers on tie
    }

    balance += payout;
    updateBalance();

    const message = `${outcome} – Player ${finalPlayerTotal} vs Banker ${finalBankerTotal}.`;
    if (messageEl) messageEl.textContent = message;
    appendHistory(`${new Date().toLocaleTimeString()} – ${message}`);
  });

  deck = baccaratDeck();
  updateSelectedBet();
  updateBalance();
}

const slotConfigs = {
  starburst: {
    reels: 5,
    name: 'Starburst',
    symbols: ['⭐', '💎', '🔷', '🔶', '🔺', '💚'],
    payouts: { 5: 15, 4: 6, 3: 3 },
    wilds: ['⭐'],
  },
  gonzo: {
    reels: 5,
    name: "Gonzo's Quest",
    symbols: ['🗿', '🐍', '🐆', '🌀', '🔶', '💠'],
    payouts: { 5: 20, 4: 8, 3: 4 },
    wilds: ['🌀'],
  },
  megaMoolah: {
    reels: 5,
    name: 'Mega Moolah',
    symbols: ['🦁', '🐘', '🦓', '🦒', '🐒', '10', 'J', 'Q', 'K', 'A'],
    payouts: { 5: 12, 4: 5, 3: 2 },
    wilds: ['🦁'],
  },
  bookOfDead: {
    reels: 5,
    name: 'Book of Dead',
    symbols: ['📖', '🦅', '🐶', '🗿', 'A', 'K', 'Q', 'J', '10'],
    payouts: { 5: 18, 4: 7, 3: 3 },
    wilds: ['📖'],
  },
};

function initSlotMachine(root, config) {
  const balanceEl = root.querySelector('[data-balance]');
  const betInput = root.querySelector('[data-bet-input]');
  const spinButton = root.querySelector('[data-spin]');
  const reelsEl = root.querySelector('[data-reels]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');

  let balance = 800;

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  const renderReels = (symbols) => {
    if (!reelsEl) return;
    reelsEl.innerHTML = '';
    symbols.forEach((symbol) => {
      const reel = document.createElement('div');
      reel.className = 'slot-reel';
      reel.textContent = symbol;
      reelsEl.appendChild(reel);
    });
  };

  spinButton?.addEventListener('click', () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid stake before spinning.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Balance too low to spin at that stake.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const result = [];
    for (let i = 0; i < config.reels; i += 1) {
      const symbol = config.symbols[Math.floor(Math.random() * config.symbols.length)];
      result.push(symbol);
    }

    renderReels(result);

    const firstSymbol = result[0];
    let matchCount = 1;
    for (let i = 1; i < result.length; i += 1) {
      const current = result[i];
      if (current === firstSymbol || config.wilds.includes(current) || config.wilds.includes(firstSymbol)) {
        matchCount += 1;
      } else {
        break;
      }
    }

    let payout = 0;
    if (config.payouts[matchCount]) {
      payout = betValue * config.payouts[matchCount];
      balance += payout;
      updateBalance();
    }

    const outcome = payout > 0
      ? `${config.name} pays ${payout.toFixed(2)} with ${matchCount} of a kind!`
      : `${config.name} misses this spin.`;

    if (messageEl) messageEl.textContent = outcome;
    appendHistory(`${new Date().toLocaleTimeString()} – ${outcome}`);
  });

  renderReels(new Array(config.reels).fill('❔'));
  updateBalance();
}

function initSicBo(root) {
  const betButtons = root.querySelectorAll('[data-bet-option]');
  const betInput = root.querySelector('[data-bet-input]');
  const rollButton = root.querySelector('[data-roll]');
  const diceEls = root.querySelectorAll('[data-dice]');
  const balanceEl = root.querySelector('[data-balance]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const selectedBetEl = root.querySelector('[data-selected-bet]');

  let selectedBet = 'small';
  let balance = 600;

  const updateSelectedBet = () => {
    betButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.betOption === selectedBet);
    });
    if (selectedBetEl) selectedBetEl.textContent = selectedBet.toUpperCase();
  };

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  betButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedBet = button.dataset.betOption || 'small';
      updateSelectedBet();
    });
  });

  rollButton?.addEventListener('click', () => {
    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid stake to roll the dice.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Stake is higher than your balance.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const dice = [0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
    dice.forEach((value, index) => {
      if (diceEls[index]) {
        diceEls[index].textContent = value;
      }
    });

    const total = dice.reduce((sum, value) => sum + value, 0);
    const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

    let payout = 0;
    if (selectedBet === 'small' && total >= 4 && total <= 10 && !isTriple) {
      payout = betValue * 2;
    } else if (selectedBet === 'big' && total >= 11 && total <= 17 && !isTriple) {
      payout = betValue * 2;
    } else if (selectedBet === 'triple' && isTriple) {
      payout = betValue * 31;
    }

    balance += payout;
    updateBalance();

    const outcome = payout > 0
      ? `${selectedBet.toUpperCase()} wins ${payout.toFixed(2)} on total ${total}.`
      : `${selectedBet.toUpperCase()} loses on total ${total}.`;

    if (messageEl) messageEl.textContent = outcome;
    appendHistory(`${new Date().toLocaleTimeString()} – ${outcome}`);
  });

  updateSelectedBet();
  updateBalance();
}

function initKeno(root) {
  const numberButtons = root.querySelectorAll('[data-keno-number]');
  const drawButton = root.querySelector('[data-draw]');
  const balanceEl = root.querySelector('[data-balance]');
  const betInput = root.querySelector('[data-bet-input]');
  const messageEl = root.querySelector('[data-game-message]');
  const historyEl = root.querySelector('[data-history]');
  const drawnNumbersEl = root.querySelector('[data-drawn]');

  let balance = 750;
  const selections = new Set();

  const payoutTable = {
    0: 0,
    1: 0,
    2: 2,
    3: 4,
    4: 8,
    5: 12,
    6: 25,
    7: 50,
    8: 120,
    9: 250,
    10: 500,
  };

  const updateBalance = () => {
    if (balanceEl) balanceEl.textContent = balance.toFixed(2);
  };

  const appendHistory = (entry) => {
    if (!historyEl) return;
    const item = document.createElement('li');
    item.textContent = entry;
    historyEl.prepend(item);
  };

  numberButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number.parseInt(button.dataset.kenoNumber || '0', 10);
      if (selections.has(value)) {
        selections.delete(value);
        button.classList.remove('selected');
      } else if (selections.size < 10) {
        selections.add(value);
        button.classList.add('selected');
      }
      if (messageEl) messageEl.textContent = `Selected ${selections.size} / 10 numbers.`;
    });
  });

  drawButton?.addEventListener('click', () => {
    if (selections.size !== 10) {
      if (messageEl) messageEl.textContent = 'Pick exactly 10 numbers before drawing.';
      return;
    }

    const betValue = Number.parseFloat(betInput?.value || '0');
    if (!betValue || Number.isNaN(betValue) || betValue <= 0) {
      if (messageEl) messageEl.textContent = 'Enter a valid stake to play Keno.';
      return;
    }
    if (betValue > balance) {
      if (messageEl) messageEl.textContent = 'Stake exceeds your balance.';
      return;
    }

    balance -= betValue;
    updateBalance();

    const pool = Array.from({ length: 40 }, (_, index) => index + 1);
    const drawn = [];
    for (let i = 0; i < 10; i += 1) {
      const idx = Math.floor(Math.random() * pool.length);
      drawn.push(pool.splice(idx, 1)[0]);
    }
    drawn.sort((a, b) => a - b);

    if (drawnNumbersEl) {
      drawnNumbersEl.textContent = drawn.join(', ');
    }

    let matches = 0;
    drawn.forEach((num) => {
      if (selections.has(num)) matches += 1;
    });

    const multiplier = payoutTable[matches] || 0;
    const payout = betValue * multiplier;
    balance += payout;
    updateBalance();

    const message = matches > 0
      ? `Matched ${matches} numbers for ${payout.toFixed(2)}.`
      : 'No matches this round.';
    if (messageEl) messageEl.textContent = message;
    appendHistory(`${new Date().toLocaleTimeString()} – ${message}`);
  });

  updateBalance();
}
