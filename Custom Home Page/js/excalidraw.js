/**
 * Excalidraw Widget for Homepage
 * Initializes an iframe-based Excalidraw editor in a modal overlay
 */

const ExcalidrawWidget = (function() {
    // DOM Elements
    let edgeTrigger;
    let excalidrawModal;
    let closeExcalidrawBtn;
    let excalidrawContainer;
    let excalidrawIframe;
    
    // State
    let isInitialized = false;
    let isOpen = false;
  
    // Initialize the widget
    function init() {
      // Create the edge trigger
      createEdgeTrigger();
      
      // Create the excalidraw modal (initially hidden)
      createExcalidrawModal();
      
      // Set up event listeners
      setupEventListeners();
      
      isInitialized = true;
      console.log('Excalidraw Widget initialized');
    }
    
    // Create the edge trigger element
    function createEdgeTrigger() {
      edgeTrigger = document.createElement('div');
      edgeTrigger.className = 'edge-trigger';
      document.body.appendChild(edgeTrigger);
    }
    
    // Create the excalidraw modal
    function createExcalidrawModal() {
      // Create modal container
      excalidrawModal = document.createElement('div');
      excalidrawModal.className = 'excalidraw-modal hidden';
      
      // Create the inner container
      excalidrawContainer = document.createElement('div');
      excalidrawContainer.className = 'excalidraw-container';
      
      // Create the header with close button
      const header = document.createElement('div');
      header.className = 'excalidraw-header';
      
      closeExcalidrawBtn = document.createElement('button');
      closeExcalidrawBtn.className = 'close-excalidraw';
      closeExcalidrawBtn.textContent = '×';
      
      header.appendChild(closeExcalidrawBtn);
      excalidrawContainer.appendChild(header);
      
      // Create wrapper for excalidraw
      const wrapper = document.createElement('div');
      wrapper.id = 'excalidraw-wrapper';
      excalidrawContainer.appendChild(wrapper);
      
      // Add everything to the modal
      excalidrawModal.appendChild(excalidrawContainer);
      document.body.appendChild(excalidrawModal);
    }
    
    // Set up event listeners
    function setupEventListeners() {
      // Edge trigger click
      edgeTrigger.addEventListener('click', openExcalidraw);
      
      // Close button click
      closeExcalidrawBtn.addEventListener('click', closeExcalidraw);
      
      // Escape key to close
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
          closeExcalidraw();
        }
      });
    }
    
    // Load the excalidraw iframe
    function loadExcalidrawIframe() {
      const wrapper = document.getElementById('excalidraw-wrapper');
      
      // Only create the iframe if it doesn't exist
      if (!excalidrawIframe) {
        excalidrawIframe = document.createElement('iframe');
        excalidrawIframe.style.width = '100%';
        excalidrawIframe.style.height = '100%';
        excalidrawIframe.style.border = 'none';
        
        // Use the public Excalidraw embed
        excalidrawIframe.src = 'https://excalidraw.com/';
        
        wrapper.appendChild(excalidrawIframe);
      }
    }
    
    // Open the excalidraw modal
    function openExcalidraw() {
      if (!isInitialized) {
        init();
      }
      
      // Load the iframe
      loadExcalidrawIframe();
      
      // Show the modal
      excalidrawModal.classList.remove('hidden');
      isOpen = true;
    }
    
    // Close the excalidraw modal
    function closeExcalidraw() {
      excalidrawModal.classList.add('hidden');
      isOpen = false;
    }
    
    // Public API
    return {
      init,
      openExcalidraw,
      closeExcalidraw
    };
  })();
  
  // Initialize the excalidraw widget when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Wait a short moment to let other widgets initialize first
    setTimeout(function() {
      ExcalidrawWidget.init();
    }, 100);
  });