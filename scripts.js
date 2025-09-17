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
    if (profile && profile.username) {
      usernameTargets.forEach((target) => {
        target.textContent = profile.username;
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

  const loginForm = document.querySelector('[data-login-form]');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const username = (formData.get('username') || '').toString().trim();
      if (!username) {
        alert('Please enter your username to continue.');
        return;
      }
      const currency = (formData.get('currency') || 'USD').toString().trim();
      const payload = {
        username,
        currency,
        lastLogin: new Date().toISOString(),
      };
      storeUser(payload);
      renderAuthState(payload);
      const redirect = loginForm.dataset.redirect || 'dashboard.html';
      window.location.href = redirect;
    });
  }

  const signupForm = document.querySelector('[data-signup-form]');
  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const username = (formData.get('username') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      if (!username || !email) {
        alert('Please complete all required fields.');
        return;
      }
      const currency = (formData.get('currency') || 'USD').toString().trim();
      const payload = {
        username,
        email,
        currency,
        joinedAt: new Date().toISOString(),
      };
      storeUser(payload);
      renderAuthState(payload);
      const redirect = signupForm.dataset.redirect || 'dashboard.html';
      window.location.href = redirect;
    });
  }

  const settingsForm = document.querySelector('[data-settings-form]');
  const settingsFeedback = document.querySelector('[data-settings-feedback]');
  if (settingsForm) {
    if (user && user.username) {
      const displayInput = settingsForm.querySelector('[name="displayName"]');
      if (displayInput && !displayInput.value) {
        displayInput.value = user.username;
      }
    }

    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(settingsForm);
      const current = getStoredUser() || {};
      const updated = {
        ...current,
        username: (formData.get('displayName') || current.username || 'Player').toString().trim() || 'Player',
        email: (formData.get('email') || current.email || '').toString().trim(),
        currency: (formData.get('currency') || current.currency || 'USD').toString().trim(),
      };
      storeUser(updated);
      renderAuthState(updated);
      if (settingsFeedback) {
        settingsFeedback.classList.remove('hidden');
        settingsFeedback.classList.add('is-visible');
        settingsFeedback.classList.add('active');
        settingsFeedback.textContent = 'Your preferences have been saved successfully.';
        setTimeout(() => {
          settingsFeedback.classList.remove('is-visible');
          settingsFeedback.classList.remove('active');
          settingsFeedback.classList.add('hidden');
        }, 3200);
      }
    });
  }
});
