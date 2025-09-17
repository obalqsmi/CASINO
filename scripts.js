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
});
