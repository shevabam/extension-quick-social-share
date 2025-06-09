import { StorageManager } from './storageManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  const storageManager = new StorageManager();
  
  // Check and update platforms if necessary
  await storageManager.checkAndUpdatePlatforms();
  
  // Get updated platforms
  const platforms = await storageManager.getPlatforms();
  
  // Get custom instances
  const { mastodonInstance, blueskyInstance } = await storageManager.getInstances();
  
  // Fill instance fields
  document.getElementById('mastodon-instance').value = mastodonInstance;
  document.getElementById('bluesky-instance').value = blueskyInstance;
  
  // Generate platforms list with checkboxes
  const platformsList = document.getElementById('platforms-list');
  platforms.forEach(platform => {
    const item = createPlatformCheckbox(platform);
    platformsList.appendChild(item);
  });
  
  // Generate sortable list
  const sortableList = document.getElementById('sortable-platforms');
  const sortedPlatforms = [...platforms].sort((a, b) => a.order - b.order);
  
  sortedPlatforms.forEach(platform => {
    const item = createSortableItem(platform);
    sortableList.appendChild(item);
  });
  
  // Initialize drag-and-drop sorting
  initSortable();
  
  // Initialize tabs
  initTabs();
  
  // Handle save button
  document.getElementById('save-button').addEventListener('click', saveOptions);
  
  // Handle reset button
  document.getElementById('reset-button').addEventListener('click', resetOptions);
});

// Function to initialize tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding content
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Function to create a checkbox element for a platform
function createPlatformCheckbox(platform) {
  const item = document.createElement('div');
  item.className = 'platform-item';
  item.dataset.platform = platform.id;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `platform-${platform.id}`;
  checkbox.checked = platform.enabled;
  checkbox.dataset.platformId = platform.id;
  
  const label = document.createElement('label');
  label.htmlFor = `platform-${platform.id}`;
  label.textContent = platform.name;
  
  // Set icon for the label if available
  if (platform.iconUrl) {
    label.style.setProperty('--platform-icon', `url('${platform.iconUrl}')`);
  }
  
  item.appendChild(checkbox);
  item.appendChild(label);
  
  return item;
}

// Function to create a sortable item
function createSortableItem(platform) {
  const item = document.createElement('div');
  item.className = 'sortable-item';
  item.dataset.platformId = platform.id;
  item.dataset.platform = platform.id;
  
  const handle = document.createElement('div');
  handle.className = 'handle';
  handle.innerHTML = '⋮⋮';
  
  const name = document.createElement('span');
  name.textContent = platform.name;
  
  // Set icon for the span if available
  if (platform.iconUrl) {
    name.style.setProperty('--platform-icon', `url('${platform.iconUrl}')`);
  }
  
  item.appendChild(handle);
  item.appendChild(name);
  
  return item;
}

// Function to initialize drag-and-drop sorting
function initSortable() {
  const sortableList = document.getElementById('sortable-platforms');
  let draggedItem = null;
  
  // Add events for each item
  const items = sortableList.querySelectorAll('.sortable-item');
  items.forEach(item => {
    // Drag start event
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      setTimeout(() => {
        item.classList.add('dragging');
      }, 0);
    });
    
    // Drag end event
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
    });
    
    // Make the item draggable
    item.setAttribute('draggable', 'true');
  });
  
  // Events for the drop zone
  sortableList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(sortableList, e.clientY);
    if (draggedItem) {
      if (afterElement) {
        sortableList.insertBefore(draggedItem, afterElement);
      } else {
        sortableList.appendChild(draggedItem);
      }
    }
  });
}

// Function to determine after which element to drop the dragged element
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Function to save options
async function saveOptions() {
  const storageManager = new StorageManager();
  const platforms = await storageManager.getPlatforms();
  
  // Update enabled/disabled state
  const checkboxes = document.querySelectorAll('#platforms-list input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const platformId = checkbox.dataset.platformId;
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      platform.enabled = checkbox.checked;
    }
  });
  
  // Update order
  const sortableItems = document.querySelectorAll('#sortable-platforms .sortable-item');
  sortableItems.forEach((item, index) => {
    const platformId = item.dataset.platformId;
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      platform.order = index + 1;
    }
  });
  
  // Update custom instances
  const mastodonInstance = document.getElementById('mastodon-instance').value.trim() || 'mastodon.social';
  const blueskyInstance = document.getElementById('bluesky-instance').value.trim() || 'bsky.app';
  
  // Update instances in platforms
  platforms.forEach(platform => {
    if (platform.id === 'mastodon') {
      platform.instance = mastodonInstance;
    } else if (platform.id === 'bluesky') {
      platform.instance = blueskyInstance;
    }
  });
  
  // Save changes
  await storageManager.savePlatforms(platforms);
  await storageManager.saveInstances(mastodonInstance, blueskyInstance);
  
  // Show confirmation message
  const saveButton = document.getElementById('save-button');
  const originalText = saveButton.textContent;
  saveButton.textContent = 'Saved!';
  saveButton.classList.add('saved');
  
  setTimeout(() => {
    saveButton.textContent = originalText;
    saveButton.classList.remove('saved');
  }, 2000);
}

// Function to reset options
async function resetOptions() {
  if (confirm('Are you sure you want to reset all options?')) {
    const storageManager = new StorageManager();
    await storageManager.resetToDefaults();
    
    // Reload page to display default values
    location.reload();
  }
}