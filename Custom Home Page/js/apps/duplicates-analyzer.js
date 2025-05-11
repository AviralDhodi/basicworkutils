/**
 * Duplicates Analyzer App with direct DOM manipulation
 * Analyzes lists for duplicates and allows removal of duplicates
 */

// Global object for the Duplicates Analyzer App
window.DuplicatesAnalyzerApp = (function() {
    // State variables
    let isInitialized = false;
    let map1 = new Map();
    let map2 = new Map();
    
    // Initialize the app
    function init() {
      console.log("Duplicates Analyzer App initializing...");
      
      try {
        // Direct approach - inject HTML directly into content container
        const contentContainer = document.querySelector('#duplicates-analyzer-modal .app-content');
        
        if (!contentContainer) {
          console.error("Content container not found for Duplicates Analyzer");
          return;
        }
        
        // Clear existing content and insert HTML
        contentContainer.innerHTML = `
          <div id="duplicates-analyzer-app-container">
            <div class="analyzer-inputs">
              <textarea id="duplicates-analyzer-list-input" placeholder="Enter your lists (one per line)..." style="width:100%; height:150px; margin-bottom:15px;"></textarea>
              
              <div style="display:flex; align-items:center; margin-bottom:15px;">
                <label for="duplicates-analyzer-separator-input" style="margin-right:10px;">Separator:</label>
                <input type="text" id="duplicates-analyzer-separator-input" placeholder="Separator (default: ,)" value="," style="width:100px;">
              </div>
              
              <div style="margin-bottom:20px;">
                <button id="duplicates-analyzer-check-btn">Check</button>
              </div>
            </div>
            
            <div id="duplicates-analyzer-duplicate-selector" style="display:none; margin-top:20px; padding:15px; background:rgba(0,0,0,0.2); border-radius:6px;">
              <h3>Select Lists to Remove Duplicates</h3>
              
              <div id="duplicates-analyzer-checkbox-group" style="display:flex; flex-wrap:wrap; gap:10px; margin:15px 0;"></div>
              
              <div style="display:flex; align-items:center; margin:15px 0;">
                <label for="duplicates-analyzer-join-separator-input" style="margin-right:10px;">Join Separator:</label>
                <input type="text" id="duplicates-analyzer-join-separator-input" placeholder="Join Separator (default: |)" value="|" style="width:100px;">
              </div>
              
              <div>
                <button id="duplicates-analyzer-finalize-btn">Finalize</button>
              </div>
            </div>
            
            <div id="duplicates-analyzer-preview-area" style="display:none; margin-top:20px;">
              <h3>Preview</h3>
              <div style="overflow-x:auto; margin-bottom:15px;">
                <table id="duplicates-analyzer-preview-table" style="width:100%; border-collapse:collapse; border:1px solid #ddd;"></table>
              </div>
              
              <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button id="duplicates-analyzer-copy-frequency-btn">Copy Frequency</button>
                <button id="duplicates-analyzer-copy-all-btn">Copy All</button>
              </div>
            </div>
          </div>
        `;
        
        // Set up event handlers
        document.getElementById('duplicates-analyzer-check-btn').addEventListener('click', processDuplicates);
        document.getElementById('duplicates-analyzer-finalize-btn').addEventListener('click', finalizeDuplicates);
        document.getElementById('duplicates-analyzer-copy-frequency-btn').addEventListener('click', function() {
          copyColumn(1);
        });
        document.getElementById('duplicates-analyzer-copy-all-btn').addEventListener('click', copyAll);
        
        console.log("Duplicates Analyzer App initialized successfully");
        isInitialized = true;
      } catch (error) {
        console.error("Error initializing Duplicates Analyzer App:", error);
      }
    }
    
    // Process duplicates
    function processDuplicates() {
      console.log("Processing duplicates...");
      try {
        const listInput = document.getElementById('duplicates-analyzer-list-input');
        const separatorInput = document.getElementById('duplicates-analyzer-separator-input');
        const checkboxGroup = document.getElementById('duplicates-analyzer-checkbox-group');
        const duplicateSelector = document.getElementById('duplicates-analyzer-duplicate-selector');
        
        const input = listInput.value.trim();
        if (!input) {
          alert('Please enter some data to analyze');
          return;
        }
        
        const separator = separatorInput.value || ',';
        const rows = input.split('\n').map(row => row.split(separator).map(item => item.trim()));
        
        // Generate duplicate options
        const firstValues = rows.map(row => row[0]).filter(Boolean);
        const uniqueValues = Array.from(new Set(firstValues));
        
        // Clear checkbox group
        checkboxGroup.innerHTML = '';
        
        // Create checkbox for each unique value
        uniqueValues.forEach(value => {
          const checkboxItem = document.createElement('div');
          checkboxItem.style.padding = '5px 10px';
          checkboxItem.style.background = 'rgba(255, 255, 255, 0.1)';
          checkboxItem.style.borderRadius = '4px';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = value;
          checkbox.id = `checkbox-${value.replace(/[^a-zA-Z0-9]/g, '-')}`;
          checkbox.style.marginRight = '5px';
          
          const label = document.createElement('label');
          label.htmlFor = checkbox.id;
          label.textContent = value;
          
          checkboxItem.appendChild(checkbox);
          checkboxItem.appendChild(label);
          checkboxGroup.appendChild(checkboxItem);
        });
        
        // Show the duplicate selector
        duplicateSelector.style.display = 'block';
        
        console.log("Duplicate processing complete, found unique values:", uniqueValues.length);
      } catch (error) {
        console.error("Error processing duplicates:", error);
        alert("Error processing duplicates. See console for details.");
      }
    }
    
    // Finalize duplicates
    function finalizeDuplicates() {
      console.log("Finalizing duplicates...");
      try {
        const listInput = document.getElementById('duplicates-analyzer-list-input');
        const separatorInput = document.getElementById('duplicates-analyzer-separator-input');
        const joinSeparatorInput = document.getElementById('duplicates-analyzer-join-separator-input');
        const previewArea = document.getElementById('duplicates-analyzer-preview-area');
        const previewTable = document.getElementById('duplicates-analyzer-preview-table');
        
        const separator = separatorInput.value || ',';
        const joinSeparator = joinSeparatorInput.value || '|';
        
        // Get selected values
        const checkboxes = document.querySelectorAll('#duplicates-analyzer-checkbox-group input[type="checkbox"]:checked');
        const selectedValues = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedValues.length === 0) {
          alert('Please select at least one list to analyze');
          return;
        }
        
        const input = listInput.value.trim();
        const rows = input.split('\n').map(row => row.split(separator).map(item => item.trim()));
        
        // Reset maps
        map1.clear();
        map2.clear();
        
        // Process lists
        rows.forEach(row => {
          if (row.length > 0) {
            const firstValue = row[0];
            const rest = row.slice(1).join(separator);
            
            if (selectedValues.includes(firstValue)) {
              const key = row.join(joinSeparator);
              map1.set(key, rest);
              map2.set(key, (map2.get(key) || 0) + 1);
            }
          }
        });
        
        // Render preview
        renderPreview(previewTable, joinSeparator);
        
        // Show preview area
        previewArea.style.display = 'block';
        
        console.log("Duplicates finalized");
      } catch (error) {
        console.error("Error finalizing duplicates:", error);
        alert("Error finalizing duplicates. See console for details.");
      }
    }
    
    // Render preview table
    function renderPreview(table, joinSeparator) {
      console.log("Rendering preview table...");
      
      // Clear table
      table.innerHTML = '';
      
      // Create header row
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `
        <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">#</th>
        <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Frequency</th>
        <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Combined Values</th>
      `;
      table.appendChild(headerRow);
      
      // Sort entries by frequency (highest first)
      const sortedEntries = Array.from(map2.entries())
        .sort((a, b) => b[1] - a[1]);
      
      // Create table rows
      sortedEntries.forEach(([key, frequency], index) => {
        const row = document.createElement('tr');
        const values = key.split(joinSeparator);
        
        // Number column
        const numberCell = document.createElement('td');
        numberCell.style.padding = '8px';
        numberCell.style.border = '1px solid #ddd';
        numberCell.textContent = index + 1;
        row.appendChild(numberCell);
        
        // Frequency column
        const frequencyCell = document.createElement('td');
        frequencyCell.style.padding = '8px';
        frequencyCell.style.border = '1px solid #ddd';
        frequencyCell.textContent = frequency;
        row.appendChild(frequencyCell);
        
        // Values columns
        values.forEach(value => {
          const cell = document.createElement('td');
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ddd';
          cell.textContent = value;
          row.appendChild(cell);
        });
        
        table.appendChild(row);
      });
      
      console.log("Preview table rendered with", sortedEntries.length, "rows");
    }
    
    // Copy frequency column
    function copyColumn(columnIndex) {
      console.log("Copying column", columnIndex);
      try {
        const previewTable = document.getElementById('duplicates-analyzer-preview-table');
        const rows = Array.from(previewTable.rows).slice(1); // Skip header row
        const values = rows.map(row => row.cells[columnIndex].textContent);
        
        copyToClipboard(values.join('\n'));
      } catch (error) {
        console.error("Error copying column:", error);
        alert("Error copying column. See console for details.");
      }
    }
    
    // Copy all table data
    function copyAll() {
      console.log("Copying all table data");
      try {
        const previewTable = document.getElementById('duplicates-analyzer-preview-table');
        const rows = Array.from(previewTable.rows);
        const values = rows.map(row =>
          Array.from(row.cells).map(cell => cell.textContent).join("\t")
        );
        
        copyToClipboard(values.join('\n'));
      } catch (error) {
        console.error("Error copying all data:", error);
        alert("Error copying all data. See console for details.");
      }
    }
    
    // Helper function to copy to clipboard
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('Copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy to clipboard:', err);
          alert('Failed to copy to clipboard. Try again or copy manually.');
        });
    }
    
    // Public API
    return {
      init,
      processDuplicates,
      finalizeDuplicates
    };
  })();
  
  // Debug helper - check if the app initialized
  (function() {
    // Check initialization in 2 seconds
    setTimeout(() => {
      console.log("Checking Duplicates Analyzer App status...");
      const container = document.querySelector('#duplicates-analyzer-modal .app-content');
      
      if (container) {
        const hasContent = container.innerHTML.length > 0;
        console.log("Duplicates Analyzer content container found:", container);
        console.log("Has content:", hasContent);
        
        if (!hasContent) {
          console.log("No content found - attempting initialization");
          window.DuplicatesAnalyzerApp.init();
        }
      } else {
        console.log("Duplicates Analyzer container not found in DOM");
      }
    }, 2000);
  })();