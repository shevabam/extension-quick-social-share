import { DEFAULT_PLATFORMS, updateMissingPlatforms } from './platformsConfig.js';

/**
 * Class managing user preferences storage
 * Provides methods to read and write to Chrome's local storage
 */
export class StorageManager {
  constructor() {
    // Reference to default social networks configuration
    this.DEFAULT_PLATFORMS = DEFAULT_PLATFORMS;
  }
  
  /**
   * Retrieves the list of platforms from storage
   * @returns {Promise<Array>} List of platforms
   */
  async getPlatforms() {
    try {
      const result = await chrome.storage.local.get('platforms');
      return result.platforms || this.DEFAULT_PLATFORMS;
    } catch (error) {
      console.error('Error retrieving platforms:', error);
      return this.DEFAULT_PLATFORMS;
    }
  }
  
  /**
   * Saves the list of platforms to storage
   * @param {Array} platforms - List of platforms to save
   * @returns {Promise<void>}
   */
  async savePlatforms(platforms) {
    try {
      await chrome.storage.local.set({ platforms });
    } catch (error) {
      console.error('Error saving platforms:', error);
    }
  }
  
  /**
   * Checks and updates missing platforms
   * @returns {Promise<boolean>} Indicates if updates were made
   */
  async checkAndUpdatePlatforms() {
    try {
      const platforms = await this.getPlatforms();
      const { platforms: updatedPlatforms, updated } = updateMissingPlatforms(platforms);
      
      if (updated) {
        await this.savePlatforms(updatedPlatforms);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating platforms:', error);
      return false;
    }
  }
  
  /**
   * Retrieves custom instances from storage
   * @returns {Promise<Object>} Object containing instances
   */
  async getInstances() {
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
  
  /**
   * Saves custom instances to storage
   * @param {string} mastodonInstance - Mastodon instance
   * @param {string} blueskyInstance - Bluesky instance
   * @returns {Promise<void>}
   */
  async saveInstances(mastodonInstance, blueskyInstance) {
    try {
      await chrome.storage.local.set({ mastodonInstance, blueskyInstance });
    } catch (error) {
      console.error('Error saving instances:', error);
    }
  }
  
  /**
   * Resets all preferences to default values
   * @returns {Promise<void>}
   */
  async resetToDefaults() {
    try {
      await chrome.storage.local.set({
        platforms: this.DEFAULT_PLATFORMS,
        mastodonInstance: 'mastodon.social',
        blueskyInstance: 'bsky.app'
      });
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  }
}