/**
 * Clock Widget for Homepage
 * Displays current time, date, and greeting based on time of day
 */

const ClockWidget = (function() {
    // DOM Elements
    const clockWidget = document.getElementById('clock-widget');
    const clockTime = document.getElementById('clock-time');
    const clockSeconds = document.getElementById('clock-seconds');
    const clockDate = document.getElementById('clock-date');
    const clockGreeting = document.getElementById('clock-greeting');
    const formatBtn12h = document.getElementById('format-12h');
    const formatBtn24h = document.getElementById('format-24h');
    
    // Clock settings
    const clockSettings = {
      format: localStorage.getItem('clockFormat') || '24h', // 12h or 24h
      showSeconds: localStorage.getItem('clockShowSeconds') === 'true' || false
    };
    
    // Animation timeout
    let animationTimeout = null;
    
    // Initialize the widget
    function init() {
      // Set up event listeners
      if (formatBtn12h && formatBtn24h) {
        formatBtn12h.addEventListener('click', () => setClockFormat('12h'));
        formatBtn24h.addEventListener('click', () => setClockFormat('24h'));
      }
      
      // Set active format button
      setActiveFormatButton();
      
      // Update clock immediately and then every second
      updateClock();
      setInterval(updateClock, 1000);
      
      console.log('Clock Widget initialized');
    }
    
    // Set clock format (12h/24h)
    function setClockFormat(format) {
      localStorage.setItem('clockFormat', format);
      clockSettings.format = format;
      setActiveFormatButton();
      updateClock();
    }
    
    // Set active format button
    function setActiveFormatButton() {
      if (formatBtn12h && formatBtn24h) {
        if (clockSettings.format === '12h') {
          formatBtn12h.classList.add('active');
          formatBtn24h.classList.remove('active');
        } else {
          formatBtn12h.classList.remove('active');
          formatBtn24h.classList.add('active');
        }
      }
    }
    
    // Update the clock
    function updateClock() {
      const now = new Date();
      
      // Format time based on settings
      let timeString = '';
      let secondsString = '';
      
      if (clockSettings.format === '12h') {
        const hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        
        timeString = `${displayHours}:${now.getMinutes().toString().padStart(2, '0')}`;
        secondsString = `${now.getSeconds().toString().padStart(2, '0')} ${ampm}`;
      } else {
        timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        secondsString = now.getSeconds().toString().padStart(2, '0');
      }
      
      // Update time elements
      clockTime.textContent = timeString;
      
      if (clockSeconds) {
        clockSeconds.textContent = secondsString;
      }
      
      // Update date
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      clockDate.textContent = now.toLocaleDateString(undefined, options);
      
      // Update greeting based on time of day
      updateGreeting(now.getHours());
      
      // Add animation class for smooth updates
      // Only on minute changes to avoid too frequent animations
      if (now.getSeconds() === 0) {
        clockTime.classList.add('time-updated');
        
        // Remove the class after animation completes
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
          clockTime.classList.remove('time-updated');
        }, 500);
      }
    }
    
    // Update greeting based on hour
    function updateGreeting(hour) {
      let greeting = 'Good ';
      
      if (hour < 5) {
        greeting += 'night';
      } else if (hour < 12) {
        greeting += 'morning';
      } else if (hour < 17) {
        greeting += 'afternoon';
      } else if (hour < 21) {
        greeting += 'evening';
      } else {
        greeting += 'night';
      }
      
      clockGreeting.textContent = greeting;
    }
    
    // Public API
    return {
      init,
      updateClock,
      setClockFormat
    };
  })();
  
  // Initialize the clock widget when DOM is loaded
  document.addEventListener('DOMContentLoaded', ClockWidget.init);