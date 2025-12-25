/*
    (needs patch)
    IMPLEMENTATION OF AUTHENTICATION ROUTE AFTER REDIRECT FROM GITHUB.
*/

const localAuth = {
  /**
   * Initialize
   */
  init() {
    this.KEY = 'gitleet_token';
    this.ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    this.AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
    this.CLIENT_ID = undefined; // loaded from chrome.storage.local at runtime
    this.CLIENT_SECRET = undefined; // loaded from chrome.storage.local at runtime
    this.REDIRECT_URL = 'https://github.com/';
    this.SCOPES = ['repo'];
  },

  /**
   * Parses Access Code
   *
   * @param url The url containing the access code.
   */
  parseAccessCode(url) {
    const that = this;
    // Load client config saved by oauth2.begin()
    chrome.storage.local.get('CLIENT_CONFIG', data => {
      const cfg = (data && data.CLIENT_CONFIG) || {};
      that.CLIENT_ID = cfg.CLIENT_ID;
      that.CLIENT_SECRET = cfg.CLIENT_SECRET;

      const errorMatch = url.match(/[?&]error=([^&]+)/);
      if (errorMatch) {
        // inform background to close the tab and mark failure
        chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
        return;
      }

      const codeMatch = url.match(/[?&]code=([^&]+)/);
      if (!codeMatch) {
        chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
        return;
      }

      const code = codeMatch[1];
      that.requestToken(code);
    });
  },

  /**
   * Request Token
   *
   * @param code The access code returned by provider.
   */
  requestToken(code) {
    const that = this;

    // Use fetch to request access token, prefer JSON response
    const body = `client_id=${encodeURIComponent(this.CLIENT_ID || '')}&client_secret=${encodeURIComponent(
      this.CLIENT_SECRET || ''
    )}&code=${encodeURIComponent(code)}`;

    fetch(this.ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
      .then(res => res.json())
      .then(json => {
        if (json && json.access_token) {
          that.finish(json.access_token);
        } else {
          chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
        }
      })
      .catch(() => {
        chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
      });
  },

  /**
   * Finish
   *
   * @param token The OAuth2 token given to the application from the provider.
   */
  finish(token) {
    const that = this;
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    fetch(AUTHENTICATION_URL, { headers: { Authorization: `token ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('user fetch failed');
        return res.json();
      })
      .then(user => {
        const username = user && user.login;
        if (username) {
          chrome.runtime.sendMessage({
            closeWebPage: true,
            isSuccess: true,
            token,
            username,
            KEY: that.KEY,
          });
        } else {
          chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
        }
      })
      .catch(() => {
        chrome.runtime.sendMessage({ closeWebPage: true, isSuccess: false });
      });
  },
};

localAuth.init(); // load params.
const link = window.location.href;

/* Check for open pipe */
if (window.location.host === 'github.com') {
  chrome.storage.local.get('pipe_gitleet', data => {
    if (data && data.pipe_gitleet) {
      localAuth.parseAccessCode(link);
    }
  });
}
