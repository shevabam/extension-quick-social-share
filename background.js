import { DEFAULT_PLATFORMS, updateMissingPlatforms } from './js/platformsConfig.js';
import { SocialShareManager } from './js/socialShareManager.js';

// Initialize default settings
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('platforms');
  
  if (!result.platforms) {
    // Initialize with default values for a new installation
    await chrome.storage.local.set({ 
      platforms: DEFAULT_PLATFORMS,
      mastodonInstance: 'mastodon.social',
      blueskyInstance: 'bsky.app'
    });
  } else {
    // Update existing platforms to add new ones
    const { platforms, updated } = updateMissingPlatforms(result.platforms);
    
    if (updated) {
      // Save updated platforms
      await chrome.storage.local.set({ platforms });
    }
  }
  
  // Create context menus
  createContextMenus();
  createActionContextMenus();
});

async function createActionContextMenus() {
  chrome.contextMenus.create({
    id: "support",
    title: "❤️ Support",
    contexts: ["action"]
  })

  chrome.contextMenus.create({
    id: "issues",
    title: "🤔 Issues and Suggestions",
    contexts: ["action"]
  })

  chrome.contextMenus.create({
    id: "github",
    title: "🌐 GitHub",
    parentId: "issues",
    contexts: ["action"]
  })

  chrome.contextMenus.create({
    id: "reportIssue",
    title: "🐛 Report Issue",
    parentId: "issues",
    contexts: ["action"]
  })

  chrome.contextMenus.create({
    id: "donate",
    title: "🍕 Buy me a pizza",
    parentId: "support",
    contexts: ["action"]
  })

  chrome.contextMenus.create({
    id: "review",
    title: "🌟 Leave a review",
    parentId: "support",
    contexts: ["action"]
  })
}

// Create all context menu items
async function createContextMenus() {
  // Clear existing context menu items
  await chrome.contextMenus.removeAll();
  
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'quick-social-share',
    title: 'Quick Social Share',
    contexts: ['page', 'link']
  });
  
  // Get platforms from storage
  const platforms = await getPlatforms();
  
  // Sort platforms by order and filter enabled ones
  const sortedPlatforms = platforms
    .filter(platform => platform.enabled)
    .sort((a, b) => a.order - b.order);
  
  // Create submenu items for each platform
  sortedPlatforms.forEach(platform => {
    chrome.contextMenus.create({
      id: `share-${platform.id}`,
      parentId: 'quick-social-share',
      title: platform.name,
      contexts: ['page', 'link']
    });
  });
  
  // Add separator
  chrome.contextMenus.create({
    id: 'separator',
    parentId: 'quick-social-share',
    type: 'separator',
    contexts: ['page', 'link']
  });
  
  // Add "All platforms" option to open the popup
  chrome.contextMenus.create({
    id: 'share-all',
    parentId: 'quick-social-share',
    title: 'All platforms...',
    contexts: ['page', 'link']
  });
}

// Get platforms from storage
async function getPlatforms() {
  try {
    const result = await chrome.storage.local.get('platforms');
    return result.platforms || DEFAULT_PLATFORMS;
  } catch (error) {
    console.error('Error retrieving platforms:', error);
    return DEFAULT_PLATFORMS;
  }
}

// Get custom instances from storage
async function getInstances() {
  try {
    const result = await chrome.storage.local.get(['mastodonInstance', 'blueskyInstance']);
    return {
      mastodonInstance: result.mastodonInstance || 'mastodon.social',
      blueskyInstance: result.blueskyInstance || 'bsky.app'
    };
  } catch (error) {
    console.error('Error retrieving instances:', error);
    return {
      mastodonInstance: 'mastodon.social',
      blueskyInstance: 'bsky.app'
    };
  }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Get the URL to share
  const url = info.linkUrl || tab.url;
  const title = tab.title || '';

  if (info.menuItemId.startsWith('share-') && 'share-all' !== info.menuItemId) {
    // Extract platform ID from menu item ID
    const platformId = info.menuItemId.replace('share-', '');
    
    // Get all platforms
    const platforms = await getPlatforms();
    const platform = platforms.find(p => p.id === platformId);
    
    if (platform) {
      // Get instances for Mastodon and Bluesky
      let instance = null;
      if (platformId === 'mastodon' || platformId === 'bluesky') {
        const instances = await getInstances();
        instance = platformId === 'mastodon' ? instances.mastodonInstance : instances.blueskyInstance;
      }
      
      // Share directly to the selected platform
      const shareManager = new SocialShareManager();
      shareManager.share(platformId, url, title, instance);
    }
  } else {
    switch (info.menuItemId) {
      case "github":
        chrome.tabs.create({ url: 'https://github.com/shevabam/extension-quick-social-share' })
        break
      case "reportIssue":
        chrome.tabs.create({ url: 'https://github.com/shevabam/extension-quick-social-share/issues' })
        break
      case "donate":
        chrome.tabs.create({ url: 'https://buymeacoffee.com/shevabam' })
        break
      case "review":
        chrome.tabs.create({ url: `https://chromewebstore.google.com/detail/${chrome.runtime.id}/reviews` })
        break
      case 'share-all':
        await chrome.storage.local.set({
          currentShareUrl: url, 
          currentShareTitle: title 
        });
        
        // Open popup for all platforms
        chrome.windows.create({
          url: 'popup.html',
          type: 'popup',
          width: 460,
          height: 500
        });
        break;
    }
  }
});

// Listen for storage changes to update context menu
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.platforms || changes.mastodonInstance || changes.blueskyInstance)) {
    // Recreate context menus when settings change
    createContextMenus();
  }
});

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getActiveTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({ url: tabs[0].url, title: tabs[0].title });
      } else {
        sendResponse({ url: '', title: '' });
      }
    });
    return true;
  }
});