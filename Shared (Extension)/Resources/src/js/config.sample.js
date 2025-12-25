/*
  config.sample.js

  Copy this file to `config.js` in the same folder and fill in your
  OAuth client credentials. Do NOT commit `config.js` if it contains
  real secrets. Keeping the client secret in frontend code is insecure;
  prefer a server-side exchange for production.

  After creating `config.js`, reload the extension in Chrome.
*/

window.CLIENT_CONFIG = {
  // Replace with your OAuth client ID
  CLIENT_ID: 'your_client_id_here',

  // Replace with your OAuth client secret (not recommended client-side)
  CLIENT_SECRET: 'your_client_secret_here',
};
