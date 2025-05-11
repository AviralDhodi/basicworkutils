/**
 * Background Image Handler for Homepage
 * Manages loading background images from Picsum API and scheduling updates
 */

const BackgroundManager = (function() {
    // Private variables
    let lastUpdateTime = null;
    
    // Initialize background
    function init() {
      // Load initial background
      loadBackground();
      
      // Schedule background update at the top of each hour
      scheduleHourlyBackgroundUpdate();
      
      console.log('Background Manager initialized');
    }
    
    // Load background image with blur effect
    function loadBackground() {
      // Get screen dimensions for optimal image size
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Apply blur level 2
      const blurLevel = 2;
      
      // Create timestamp for cache busting
      const timestamp = new Date().getTime();
      
      // Build the background URL with picsum
      const backgroundUrl = `https://picsum.photos/${width}/${height}?blur=${blurLevel}&random=${timestamp}`;
      
      // Create a new image to preload
      const img = new Image();
      img.onload = function() {
        // Once loaded, apply to body
        document.body.style.backgroundImage = `url('${backgroundUrl}')`;
        
        // Save the update time
        lastUpdateTime = new Date();
        console.log(`Background updated at ${lastUpdateTime.toLocaleTimeString()}`);
      };
      
      img.onerror = function() {
        console.error('Failed to load background image');
        // Fallback to a basic background
        document.body.style.backgroundImage = `url('https://picsum.photos/${width}/${height}')`;
      };
      
      // Start loading the image
      img.src = backgroundUrl;
    }
    
    // Schedule background update exactly at the top of each hour
    function scheduleHourlyBackgroundUpdate() {
      const now = new Date();
      
      // Calculate time until next hour
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();
      
      // Time until next hour (exactly when minutes, seconds, and milliseconds are all zero)
      const timeUntilNextHour = (60 - minutes - 1) * 60 * 1000 + (60 - seconds) * 1000 + (1000 - milliseconds);
      
      // Schedule the first update
      setTimeout(() => {
        loadBackground();
        // Set up interval for subsequent hourly updates
        setInterval(loadBackground, 60 * 60 * 1000); // Every hour
      }, timeUntilNextHour);
      
      console.log(`Background will update in ${Math.floor(timeUntilNextHour / 60000)} minutes and ${Math.floor((timeUntilNextHour % 60000) / 1000)} seconds`);
    }
    
    // Get the last update time
    function getLastUpdateTime() {
      return lastUpdateTime;
    }
    
    // Force an immediate background update
    function forceUpdate() {
      loadBackground();
    }
    
    // Public API
    return {
      init,
      getLastUpdateTime,
      forceUpdate
    };
  })();
  
  // Initialize the background manager when DOM is loaded
  document.addEventListener('DOMContentLoaded', BackgroundManager.init);