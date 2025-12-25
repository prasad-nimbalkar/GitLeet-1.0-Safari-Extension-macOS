const displayWelcomePage = () => {
  const url = chrome.runtime.getURL('src/html/welcome.html');
  chrome.tabs.create({ url: url, active: true });
};

const closeTab = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    if (tabs && tabs.length > 0 && tabs[0] && typeof tabs[0].id !== 'undefined') {
      chrome.tabs.remove(tabs[0].id);
    } else {
      console.warn('closeTab: no active tab found to remove');
    }
  });
};

const handleMessage = request => {
  if (!request) {
    console.log('Received undefined message');
    return;
  }

  if (request.action === 'customCommitMessageUpdated') {
    chrome.storage.local.set({ custom_commit_message: request.message });
  }

  if (request.closeWebPage) {
    if (request.isSuccess) {
      chrome.storage.local.set({ gitleet_username: request.username });
      chrome.storage.local.set({ gitleet_token: request.token });
      chrome.storage.local.set({ pipe_gitleet: false }, () => {});
      closeTab();
      displayWelcomePage();
    } else {
      console.error('Error while trying to authenticate your profile!');
      // Mark auth error so UI can react if needed
      chrome.storage.local.set({ gitleet_auth_error: true }, () => {});

      // Show a user notification (requires "notifications" permission in manifest)
      const notificationOptions = {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/thumbnail.png'),
        title: 'Authentication Failed',
        message: 'Error while trying to authenticate your profile!'
      };
      if (chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create('', notificationOptions, () => {});
      } else {
        console.warn('Notifications API not available');
      }

      closeTab();
    }
  }
};

chrome.runtime.onMessage.addListener(handleMessage);
