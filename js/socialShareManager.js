export class SocialShareManager {
  /**
   * Shares content on the specified platform
   * @param {string} platformId - Platform identifier
   * @param {string} url - URL to share
   * @param {string} title - Page title
   * @param {string} instance - Custom instance (for Mastodon/Bluesky)
   */
  share(platformId, url, title, instance) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platformId) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
        
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
        
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
        
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
        
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
        
      case 'threads':
        // Threads doesn't have an official sharing API, we use the base URL
        shareUrl = `https://threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;
        break;
        
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
        break;
        
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
        
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20${encodedUrl}`;
        break;
        
      case 'hackernews':
        shareUrl = `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`;
        break;
        
      case 'mastodon':
        // Use custom instance or default
        const mastodonInstance = instance || 'mastodon.social';
        shareUrl = `https://${mastodonInstance}/share?text=${encodedTitle}%20${encodedUrl}`;
        break;
        
      case 'bluesky':
        // Use custom instance or default
        const blueskyInstance = instance || 'bsky.app';
        shareUrl = `https://${blueskyInstance}/intent/compose?text=${encodedTitle}%20${encodedUrl}`;
        break;
        
      case 'flipboard':
        shareUrl = `https://share.flipboard.com/bookmarklet/popout?v=2&url=${encodedUrl}`;
        break;
        
      case 'instapaper':
        shareUrl = `https://www.instapaper.com/edit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
        
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
        break;
        
      case 'tumblr':
        shareUrl = `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}`;
        break;
        
      case 'raindrop':
        shareUrl = `https://app.raindrop.io/add?link=${encodedUrl}&note=${encodedTitle}`;
        break;
      
      case 'trello':
        shareUrl = `https://trello.com/add-card?name=${encodedTitle}&desc=${encodedUrl}`;
        break;
      
      case 'scoopit':
        shareUrl = `https://www.scoop.it/bookmarklet?url=${encodedUrl}`;
        break;
      
      case 'buffer':
        shareUrl = `https://publish.buffer.com/compose?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      
      case 'wallabag':
        shareUrl = `https://app.wallabag.it/bookmarklet?url=${encodedUrl}`;
        break;
      
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${encodedUrl}`;
        break;
        
      default:
        console.error(`Unsupported platform: ${platformId}`);
        return;
    }
    
    // Check if we're in a background script context (no window object)
    if (typeof window === 'undefined') {
      // Use Chrome API to open a new tab
      chrome.tabs.create({ url: shareUrl });
    } else {
      // In popup context, use window.open for a popup window
      window.open(shareUrl, '_blank', 'width=600,height=600');
    }
  }
}