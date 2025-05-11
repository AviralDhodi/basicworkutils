/**
 * Apps Manager for Homepage
 * Manages all utility apps, their modals, and app switching
 */

const AppsManager = (function() {
  // App definitions
  const apps = [
    {
      id: 'list-formatter',
      name: 'List Formatter',
      icon: '📋',
      description: 'Convert between lists and CSV formats'
    },
    {
      id: 'list-comparison',
      name: 'List Comparison',
      icon: '🔍',
      description: 'Compare two lists and find common or unique items'
    },
    {
      id: 'duplicates-analyzer',
      name: 'Duplicates Analyzer',
      icon: '🔄',
      description: 'Analyze and remove duplicates from lists'
    }
  ];
  
  // DOM Elements
  let appsGrid;
  let activeApp = null;
  const modals = {};
  
  // Initialize the apps manager
  function init() {
    // Get the apps grid element
    appsGrid = document.getElementById('apps-grid');
    
    if (appsGrid) {
      // Render the apps in the grid
      renderApps();
    }
    
    // Create app modals
    createAppModals();
    
    // Set up global event listener for Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && activeApp) {
        closeApp(activeApp);
      }
    });
    
    console.log('Apps Manager initialized');
  }
  
  // Render all apps in the grid
  function renderApps() {
    appsGrid.innerHTML = '';
    
    apps.forEach(app => {
      const appItem = document.createElement('div');
      appItem.className = 'app-item';
      appItem.dataset.id = app.id;
      
      appItem.innerHTML = `
        <div class="app-icon">${app.icon}</div>
        <div class="app-name">${app.name}</div>
      `;
      
      // Add click event to open the app
      appItem.addEventListener('click', () => openApp(app.id));
      
      appsGrid.appendChild(appItem);
    });
  }
  
  // Create modal containers for all apps
  function createAppModals() {
    apps.forEach(app => {
      // Create modal container
      const modal = document.createElement('div');
      modal.id = `${app.id}-modal`;
      modal.className = 'app-modal hidden';
      
      // Create app container
      const appContainer = document.createElement('div');
      appContainer.className = 'app-container';
      
      // Create header
      const header = document.createElement('div');
      header.className = 'app-header';
      header.innerHTML = `
        <h2>${app.name}</h2>
        <button class="app-close" data-app-id="${app.id}">×</button>
      `;
      
      // Create content container
      const content = document.createElement('div');
      content.className = 'app-content';
      content.id = `${app.id}-container`;
      
      // Add elements to DOM
      appContainer.appendChild(header);
      appContainer.appendChild(content);
      modal.appendChild(appContainer);
      document.body.appendChild(modal);
      
      // Store modal reference
      modals[app.id] = modal;
      
      // Add event listener for close button
      const closeBtn = modal.querySelector('.app-close');
      closeBtn.addEventListener('click', () => closeApp(app.id));
    });
  }
  
  // Open an app by ID
  function openApp(appId) {
    // Set active app
    activeApp = appId;
    
    // Show the modal
    const modal = modals[appId];
    if (modal) {
      modal.classList.remove('hidden');
      
      // Initialize the app if needed
      if (window[`${camelCase(appId)}App`] && typeof window[`${camelCase(appId)}App`].init === 'function') {
        // Call the init function to setup the app
        window[`${camelCase(appId)}App`].init();
      }
    }
  }
  
  // Close an app by ID
  function closeApp(appId) {
    // Hide the modal
    const modal = modals[appId];
    if (modal) {
      modal.classList.add('hidden');
    }
    
    // Clear active app
    if (activeApp === appId) {
      activeApp = null;
    }
  }
  
  // Helper function to convert kebab-case to camelCase
  function camelCase(str) {
    return str.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
  }
  
  // Public API
  return {
    init,
    openApp,
    closeApp,
    getApps: () => [...apps] // Return a copy of the apps array
  };
})();

// Initialize the apps manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  AppsManager.init();
});

/**
 * Fixed Diagnostic script that works with the closure pattern
 * Replace the old debug code with this at the bottom of apps-manager.js
 */

// Create debug functions that access the AppsManager
(function() {
  // Save original openApp function
  const originalOpenApp = AppsManager.openApp;
  
  // Override with debug version
  AppsManager.openApp = function(appId) {
    console.log(`=== DEBUG: OPENING APP ${appId} ===`);
    
    // Call original function
    originalOpenApp.call(AppsManager, appId);
    
    // Add debugging after app open
    setTimeout(() => {
      console.log(`App ${appId} opened`);
      
      // Check if app initialized properly
      const appObject = window[`${appId.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}App`];
      console.log(`- App object:`, appObject);
      
      // Check modal state
      const modal = document.getElementById(`${appId}-modal`);
      console.log(`- Modal:`, modal);
      console.log(`- Modal hidden:`, modal ? modal.classList.contains('hidden') : 'N/A');
      
      // Check app content
      const appContent = modal ? modal.querySelector('.app-content') : null;
      console.log(`- App content:`, appContent);
      console.log(`- Content HTML length:`, appContent ? appContent.innerHTML.length : 'N/A');
      console.log(`- Content HTML sample:`, appContent && appContent.innerHTML.length > 0 ? 
                                          appContent.innerHTML.substring(0, 100) + '...' : 'Empty');
    }, 100);
  };
  
  // Add a general debug function
  window.debugAppManager = function() {
    console.log("=== APP MANAGER DEBUG ===");
    
    // Check available modal elements
    const modalElements = document.querySelectorAll('.app-modal');
    console.log(`Number of app modals found in DOM: ${modalElements.length}`);
    
    modalElements.forEach(modal => {
      const id = modal.id;
      const isHidden = modal.classList.contains('hidden');
      const content = modal.querySelector('.app-content');
      
      console.log(`Modal: ${id}`);
      console.log(`- Hidden: ${isHidden}`);
      console.log(`- Content element: ${content ? 'Found' : 'Missing'}`);
      console.log(`- Content ID: ${content ? content.id : 'N/A'}`);
      console.log(`- Has content: ${content && content.innerHTML.trim().length > 0 ? 'Yes' : 'No'}`);
    });
    
    // Check for app objects
    const appIds = ['list-formatter', 'list-comparison', 'duplicates-analyzer'];
    appIds.forEach(appId => {
      const camelCaseName = appId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const appObjectName = camelCaseName + 'App';
      const appObject = window[appObjectName];
      
      console.log(`App object ${appObjectName}:`);
      console.log(`- Exists: ${appObject ? 'Yes' : 'No'}`);
      console.log(`- Has init function: ${appObject && typeof appObject.init === 'function' ? 'Yes' : 'No'}`);
    });
  };
  
  // Run debug automatically after some time
  setTimeout(window.debugAppManager, 1000);
})();