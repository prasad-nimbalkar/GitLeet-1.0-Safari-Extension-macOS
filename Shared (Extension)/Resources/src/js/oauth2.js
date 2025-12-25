// eslint-disable-next-line no-unused-vars
const oAuth2 = (() => {
  const AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
  const CLIENT_ID = (window.CLIENT_CONFIG && window.CLIENT_CONFIG.CLIENT_ID);
  const REDIRECT_URL = 'https://github.com/';
  const SCOPES = ['repo'];

  return {
    begin() {
      const scopeParam = encodeURIComponent(SCOPES.join(' '));
      const url = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&scope=${scopeParam}`;

      // Persist any runtime CLIENT_CONFIG so content scripts can read it after redirect
      const cfg = (window.CLIENT_CONFIG && window.CLIENT_CONFIG) || {};
      chrome.storage.local.set({ CLIENT_CONFIG: cfg, pipe_gitleet: true }, () => {
        chrome.tabs.create({ url, active: true }, () => {});
      });
    },
  };
})();
