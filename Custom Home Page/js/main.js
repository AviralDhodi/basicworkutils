/**
 * Main JavaScript for Homepage Dashboard
 * Initializes components and handles global functionality
 */

const HomepageDashboard = (function() {
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const createExcelBtn = document.getElementById('create-excel');
  const createWordBtn = document.getElementById('create-word');
  
  // Initialize the dashboard
  function init() {
    // Set up event listeners
    setupEventListeners();
    
    console.log('Homepage Dashboard initialized');
  }
  
  // Set up event listeners for global elements
  function setupEventListeners() {
    // Search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Office document creation
    createExcelBtn.addEventListener('click', createExcelDocument);
    createWordBtn.addEventListener('click', createWordDocument);
    
    // Global keyboard handling for automatic search focus
    document.addEventListener('keydown', handleGlobalKeydown);
  }
  
  // Handle global keydown events for automatic search focus
  function handleGlobalKeydown(e) {
    // Only handle if no input is focused and not in a modal
    const activeElement = document.activeElement;
    const isInputFocused = activeElement.tagName === 'INPUT' || 
                          activeElement.tagName === 'TEXTAREA' || 
                          activeElement.isContentEditable;
    
    // Check if any modals are open
    const calculatorModalEl = document.getElementById('calculator-modal');
    const isCalculatorOpen = calculatorModalEl && !calculatorModalEl.classList.contains('hidden');
    
    const excalidrawModalEl = document.querySelector('.excalidraw-modal');
    const isExcalidrawOpen = excalidrawModalEl && !excalidrawModalEl.classList.contains('hidden');
    
    // Check for any app modals
    const appModalEls = document.querySelectorAll('.app-modal');
    const isAppOpen = Array.from(appModalEls).some(modal => !modal.classList.contains('hidden'));
    
    // If an input is focused or a modal is open, don't process
    if (isInputFocused || isCalculatorOpen || isExcalidrawOpen || isAppOpen) {
      return;
    }
    
    // Check if key is alphabetic (a-z, A-Z)
    if (/^[a-zA-Z]$/.test(e.key)) {
      // Focus search input and add the pressed key
      searchInput.focus();
      // Don't set the value directly to preserve any existing input
      // The key will be added automatically by the browser
    }
  }
  
  // Perform search using default search engine
  function performSearch() {
    const query = searchInput.value.trim();
    
    if (query) {
      // Use Google as default search engine
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank');
      searchInput.value = '';
    }
  }
  
  // Create new Excel document
  function createExcelDocument() {
    // This would typically use Office online or local app integration
    // For now, we'll just open Excel Online as a demo
    window.open('https://www.office.com/launch/excel', '_blank');
  }
  
  // Create new Word document
  function createWordDocument() {
    // This would typically use Office online or local app integration
    // For now, we'll just open Word Online as a demo
    window.open('https://www.office.com/launch/word', '_blank');
  }
  
  // Public API
  return {
    init
  };
})();

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // First initialize the dashboard core
  HomepageDashboard.init();
  
  // Other components will initialize themselves via their own event listeners
});