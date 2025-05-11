/**
 * List Formatter App with direct DOM manipulation
 * Converts between list and CSV formats
 */

// Global object for the List Formatter App
window.ListFormatterApp = (function() {
  // State
  let isInitialized = false;
  
  // Initialize the app
  function init() {
    console.log("List Formatter App initializing...");
    
    try {
      // Direct approach - inject HTML directly into content container
      const contentContainer = document.querySelector('#list-formatter-modal .app-content');
      
      if (!contentContainer) {
        console.error("Content container not found for List Formatter");
        return;
      }
      
      // Clear existing content and insert HTML
      contentContainer.innerHTML = `
        <div id="list-formatter-app-container">
          <h3>List to CSV Formatter</h3>
          <textarea id="list-formatter-input" placeholder="Enter list (one item per line)" style="width:100%; height:150px; margin-bottom:10px;"></textarea>
          
          <div style="margin-bottom:15px;">
            <label style="margin-right:15px;">
              <input type="checkbox" id="list-formatter-remove-duplicates"> Remove Duplicates
            </label>
            
            <label style="margin-right:15px;">
              Separator: <input type="text" id="list-formatter-separator" value="," style="width:40px;">
            </label>
            
            <label style="margin-right:10px;">
              <input type="radio" name="list-formatter-enclosure" value="'" checked> Single Quotes
            </label>
            
            <label>
              <input type="radio" name="list-formatter-enclosure" value='"'> Double Quotes
            </label>
          </div>
          
          <button id="list-formatter-convert-btn" style="margin-bottom:20px;">Convert and Copy</button>
          
          <div style="text-align:center; margin:20px 0; position:relative;">
            <hr style="margin:0;">
            <span style="position:absolute; top:0; left:50%; transform:translate(-50%, -50%); background:#fff; padding:0 10px;">OR</span>
          </div>
          
          <h3>CSV to List Converter</h3>
          <textarea id="list-formatter-csv-input" placeholder="Enter CSV (comma-separated)" style="width:100%; height:150px; margin-bottom:10px;"></textarea>
          
          <div style="margin-bottom:15px;">
            <label style="margin-right:15px;">
              Separator: <input type="text" id="list-formatter-csv-separator" value="," style="width:40px;">
            </label>
            
            <label style="margin-right:10px;">
              <input type="radio" name="list-formatter-csv-enclosure" value="'" checked> Single Quotes
            </label>
            
            <label>
              <input type="radio" name="list-formatter-csv-enclosure" value='"'> Double Quotes
            </label>
          </div>
          
          <button id="list-formatter-convert-csv-btn">Convert to List</button>
          
          <div id="list-formatter-status" style="margin-top:15px; font-style:italic; min-height:20px;"></div>
        </div>
      `;
      
      // Set up event handlers AFTER HTML is inserted
      document.getElementById('list-formatter-convert-btn').addEventListener('click', convertAndCopy);
      document.getElementById('list-formatter-convert-csv-btn').addEventListener('click', convertCsvToList);
      
      console.log("List Formatter App initialized successfully");
      isInitialized = true;
    } catch (error) {
      console.error("Error initializing List Formatter App:", error);
    }
  }
  
  // Convert list to CSV
  function convertAndCopy() {
    try {
      console.log("Convert to CSV button clicked");
      
      const listInput = document.getElementById('list-formatter-input').value.trim();
      if (!listInput) {
        showStatus("Please enter a list to convert");
        return;
      }
      
      const removeDuplicates = document.getElementById('list-formatter-remove-duplicates').checked;
      const separator = document.getElementById('list-formatter-separator').value || ',';
      const enclosure = document.querySelector('input[name="list-formatter-enclosure"]:checked').value;
      
      // Split into lines
      let lines = listInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Remove duplicates if needed
      if (removeDuplicates) {
        lines = [...new Set(lines)];
      }
      
      // Create CSV
      const csvString = lines.map(line => `${enclosure}${line}${enclosure}`).join(separator);
      
      // Copy to clipboard
      navigator.clipboard.writeText(csvString)
        .then(() => {
          showStatus("Copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy to clipboard:", err);
          showStatus("Error copying to clipboard");
        });
    } catch (error) {
      console.error("Error in convertAndCopy:", error);
      showStatus("Error converting list to CSV");
    }
  }
  
  // Convert CSV to list
  function convertCsvToList() {
    try {
      console.log("Convert to List button clicked");
      
      const csvInput = document.getElementById('list-formatter-csv-input').value.trim();
      if (!csvInput) {
        showStatus("Please enter CSV to convert");
        return;
      }
      
      const separator = document.getElementById('list-formatter-csv-separator').value || ',';
      const enclosure = document.querySelector('input[name="list-formatter-csv-enclosure"]:checked').value;
      
      let listItems;
      
      // Try to parse with enclosures
      if (enclosure) {
        const regex = new RegExp(`${escapeRegEx(enclosure)}(.*?)${escapeRegEx(enclosure)}(?:${escapeRegEx(separator)}|$)`, 'g');
        const matches = Array.from(csvInput.matchAll(regex), m => m[1]);
        
        if (matches.length > 0) {
          listItems = matches;
        }
      }
      
      // Fallback to simple split
      if (!listItems) {
        listItems = csvInput.split(separator).map(item => {
          item = item.trim();
          // Remove enclosures if present
          if (item.startsWith(enclosure) && item.endsWith(enclosure)) {
            return item.substring(1, item.length - 1);
          }
          return item;
        });
      }
      
      const listString = listItems.join('\n');
      document.getElementById('list-formatter-input').value = listString;
      
      // Copy to clipboard
      navigator.clipboard.writeText(listString)
        .then(() => {
          showStatus("Converted to list and copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy to clipboard:", err);
          showStatus("Converted to list but failed to copy to clipboard");
        });
    } catch (error) {
      console.error("Error in convertCsvToList:", error);
      showStatus("Error converting CSV to list");
    }
  }
  
  // Helper to escape regex special characters
  function escapeRegEx(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Show status message
  function showStatus(message) {
    const statusElement = document.getElementById('list-formatter-status');
    if (statusElement) {
      statusElement.textContent = message;
      
      // Clear after 3 seconds
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    }
  }
  
  // Public API
  return {
    init: init
  };
})();

// Debug helper - check if the app initialized
(function() {
  // Check initialization in 2 seconds
  setTimeout(() => {
    console.log("Checking List Formatter App status...");
    const container = document.querySelector('#list-formatter-modal .app-content');
    
    if (container) {
      const hasContent = container.innerHTML.length > 0;
      console.log("List Formatter content container found:", container);
      console.log("Has content:", hasContent);
      
      if (!hasContent) {
        console.log("No content found - attempting initialization");
        window.ListFormatterApp.init();
      }
    } else {
      console.log("List Formatter container not found in DOM");
    }
  }, 2000);
})();