/**
 * Centralized configuration for social sharing platforms
 * This module exports the default platforms list used throughout the extension
 */

// Default platforms list
export const DEFAULT_PLATFORMS = [
  {
    id: 'email', 
    name: 'Email', 
    enabled: true, 
    order: 1,
    iconUrl: '/icons/socials/email.png'
  },
  {
    id: 'twitter', 
    name: 'X (Twitter)', 
    enabled: true, 
    order: 2,
    iconUrl: '/icons/socials/twitter.png'
  },
  {
    id: 'facebook', 
    name: 'Facebook', 
    enabled: true, 
    order: 3,
    iconUrl: '/icons/socials/facebook.png'
  },
  {
    id: 'linkedin', 
    name: 'LinkedIn', 
    enabled: true, 
    order: 4,
    iconUrl: '/icons/socials/linkedin.png'
  },
  {
    id: 'reddit', 
    name: 'Reddit', 
    enabled: true, 
    order: 5,
    iconUrl: '/icons/socials/reddit.png'
  },
  {
    id: 'whatsapp', 
    name: 'WhatsApp', 
    enabled: true, 
    order: 6,
    iconUrl: '/icons/socials/whatsapp.png'
  },
  {
    id: 'bluesky', 
    name: 'Bluesky', 
    enabled: true, 
    order: 7, 
    instance: 'bsky.app',
    iconUrl: '/icons/socials/bluesky.png'
  },
  {
    id: 'mastodon', 
    name: 'Mastodon', 
    enabled: true, 
    order: 8, 
    instance: 'mastodon.social',
    iconUrl: '/icons/socials/mastodon.png'
  },
  {
    id: 'threads', 
    name: 'Threads', 
    enabled: true, 
    order: 9,
    iconUrl: '/icons/socials/threads.png'
  },
  {
    id: 'pinterest', 
    name: 'Pinterest', 
    enabled: true, 
    order: 10,
    iconUrl: '/icons/socials/pinterest.png'
  },
  {
    id: 'telegram', 
    name: 'Telegram', 
    enabled: true, 
    order: 11,
    iconUrl: '/icons/socials/telegram.png'
  },
  {
    id: 'hackernews', 
    name: 'Hacker News', 
    enabled: true, 
    order: 12,
    iconUrl: '/icons/socials/hackernews.png'
  },
  {
    id: 'trello', 
    name: 'Trello', 
    enabled: true, 
    order: 13,
    iconUrl: '/icons/socials/trello.png'
  },
  {
    id: 'flipboard', 
    name: 'Flipboard', 
    enabled: true, 
    order: 14,
    iconUrl: '/icons/socials/flipboard.png'
  },
  {
    id: 'instapaper', 
    name: 'Instapaper', 
    enabled: true, 
    order: 15,
    iconUrl: '/icons/socials/instapaper.png'
  },
  {
    id: 'line', 
    name: 'Line', 
    enabled: true, 
    order: 16,
    iconUrl: '/icons/socials/line.png'
  },
  {
    id: 'tumblr', 
    name: 'Tumblr', 
    enabled: true, 
    order: 17,
    iconUrl: '/icons/socials/tumblr.png'
  },
  {
    id: 'raindrop', 
    name: 'Raindrop', 
    enabled: true, 
    order: 18,
    iconUrl: '/icons/socials/raindrop.png'
  },
  {
    id: 'buffer', 
    name: 'Buffer', 
    enabled: true, 
    order: 19,
    iconUrl: '/icons/socials/buffer.png'
  },
  {
    id: 'scoopit', 
    name: 'ScoopIt!', 
    enabled: true, 
    order: 20,
    iconUrl: '/icons/socials/scoopit.png'
  },
  {
    id: 'wallabag', 
    name: 'Wallabag', 
    enabled: true, 
    order: 21,
    iconUrl: '/icons/socials/wallabag.png'
  },
  {
    id: 'vk', 
    name: 'VK', 
    enabled: true, 
    order: 22,
    iconUrl: '/icons/socials/vk.png'
  }
];

export const PLATFORM_IDS = DEFAULT_PLATFORMS.map(platform => platform.id);

/**
 * Checks for missing platforms and adds them
 * @param {Array} existingPlatforms - List of existing platforms
 * @returns {Object} Result containing updated platforms and a modification indicator
 */
export function updateMissingPlatforms(existingPlatforms) {
  const existingIds = existingPlatforms.map(p => p.id);
  const missingPlatformIds = PLATFORM_IDS.filter(id => !existingIds.includes(id));
  
  let updated = false;
  
  if (missingPlatformIds.length > 0) {
    updated = true;
    const maxOrder = Math.max(...existingPlatforms.map(p => p.order));
    let nextOrder = maxOrder + 1;
    
    missingPlatformIds.forEach(id => {
      const platformToAdd = DEFAULT_PLATFORMS.find(p => p.id === id);
      if (platformToAdd) {
        existingPlatforms.push({
          ...platformToAdd,
          order: nextOrder++
        });
      }
    });
  }
  
  // Update existing platforms with missing properties (like iconUrl)
  existingPlatforms.forEach(platform => {
    const defaultPlatform = DEFAULT_PLATFORMS.find(p => p.id === platform.id);
    if (defaultPlatform /*&& !platform.iconUrl*/) {
      platform.iconUrl = defaultPlatform.iconUrl;
      updated = true;
    }
  });
  
  return { platforms: existingPlatforms, updated };
}