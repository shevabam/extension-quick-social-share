import { SocialShareManager } from './socialShareManager.js';
import { StorageManager } from './storageManager.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const storageManager = new StorageManager();
  const shareManager = new SocialShareManager();
  
  // Get active tab information or from storage if opened from context menu
  const tabInfo = await getShareInfo();
  const currentUrl = tabInfo.url;
  const pageTitle = tabInfo.title;

  // 
  showTabInfo(tabInfo);
  
  // Check and update platforms if necessary
  await storageManager.checkAndUpdatePlatforms();
  
  // Get configured platforms
  const platforms = await storageManager.getPlatforms();
  
  // Sort platforms by order
  const sortedPlatforms = platforms
    .filter(platform => platform.enabled)
    .sort((a, b) => a.order - b.order);
  
  // Generate share button grid
  const socialGrid = document.getElementById('social-grid');
  
  sortedPlatforms.forEach(platform => {
    const button = createSocialButton(platform, currentUrl, pageTitle);
    socialGrid.appendChild(button);
  });
  
  // Handle copy link button
  const copyButton = document.getElementById('copy-link');
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        copyButton.classList.add('copied');
        copyButton.querySelector('.text').textContent = 'Copied!';
        
        setTimeout(() => {
          copyButton.classList.remove('copied');
          copyButton.querySelector('.text').textContent = 'Copy link';
        }, 2000);
      })
      .catch(err => {
        console.error('Error copying:', err);
      });
  });
  
  // Options link
  document.querySelectorAll('.options-link').forEach(element => {
    element.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  });
});

// Create a social network button
function createSocialButton(platform, url, title) {
  const button = document.createElement('button');
  button.className = 'social-button';
  button.dataset.platform = platform.id;
  
  const icon = document.createElement('span');
  icon.className = 'icon';
  
  // Set icon background image from platform configuration
  if (platform.iconUrl) {
    icon.style.backgroundImage = `url('${platform.iconUrl}')`;
  }
  
  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = platform.name;
  
  button.appendChild(icon);
  button.appendChild(text);
  
  button.addEventListener('click', () => {
    const shareManager = new SocialShareManager();
    shareManager.share(platform.id, url, title, platform.instance);
  });
  
  return button;
}

function showTabInfo(tabInfo) {
  const activeTabDatas = document.getElementById('active-tab-datas');
  activeTabDatas.innerHTML = `
    <span id="active-tab-title">🔗 ${Utils.truncate(tabInfo.title, 56)}</span>
    <span id="active-tab-url"><a href="${tabInfo.url}" target="_blank">${Utils.truncate(tabInfo.url, 60)}</a></span>
  `;

}

// Function to get share information (from storage or active tab)
async function getShareInfo() {
  // First check if we have URL and title in storage (from context menu)
  const storageData = await chrome.storage.local.get(['currentShareUrl', 'currentShareTitle']);
  
  if (storageData.currentShareUrl && storageData.currentShareTitle) {
    // Clear the stored values to avoid using them in future popup openings
    chrome.storage.local.remove(['currentShareUrl', 'currentShareTitle']);
    
    return {
      url: storageData.currentShareUrl,
      title: storageData.currentShareTitle
    };
  }
  
  // If not in storage, get from active tab
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getActiveTabInfo' }, (response) => {
      resolve(response || { url: '', title: '' });
    });
  });
}