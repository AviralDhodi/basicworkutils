/**
 * List Comparison App with direct DOM manipulation
 * Compares two lists and identifies common and unique items
 */

// Global object for the List Comparison App
window.ListComparisonApp = (function() {
  // State variables
  let isInitialized = false;
  let listA = [];
  let listB = [];
  let commonValues = [];
  let uniqueA = [];
  let uniqueB = [];
  let lastHighlightedCell = null;
  let prevDuplicate = null;
  let nextDuplicate = null;
  
  // Initialize the app
  function init() {
    console.log("List Comparison App initializing...");
    
    try {
      // Direct approach - inject HTML directly into content container
      const contentContainer = document.querySelector('#list-comparison-modal .app-content');
      
      if (!contentContainer) {
        console.error("Content container not found for List Comparison");
        return;
      }
      
      // Clear existing content and insert HTML
      contentContainer.innerHTML = `
        <div id="list-comparison-app-container">
          <h3>List Comparison</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h4>List A</h4>
              <textarea id="list-comparison-list-a" placeholder="Enter List A (one item per line)" style="width:100%; height:150px;"></textarea>
            </div>
            
            <div>
              <h4>List B</h4>
              <textarea id="list-comparison-list-b" placeholder="Enter List B (one item per line)" style="width:100%; height:150px;"></textarea>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <button id="list-comparison-process-btn">Process</button>
          </div>
          
          <div id="list-comparison-output-buttons" style="display: none; text-align: center; margin-bottom: 20px;">
            <button id="list-comparison-copy-common">Copy Common Values</button>
            <button id="list-comparison-copy-unique-a">Copy A-B</button>
            <button id="list-comparison-copy-unique-b">Copy B-A</button>
          </div>
          
          <div id="list-comparison-preview" style="display: none;">
            <h3>Preview</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h4>List A</h4>
                <table id="list-comparison-table-a" style="width:100%; border-collapse: collapse; border: 1px solid #ddd;"></table>
              </div>
              
              <div>
                <h4>List B</h4>
                <table id="list-comparison-table-b" style="width:100%; border-collapse: collapse; border: 1px solid #ddd;"></table>
              </div>
            </div>
            
            <div style="position: fixed; right: 30px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px;">
              <button id="list-comparison-up-arrow" class="disabled" style="width: 40px; height: 40px; font-size: 20px; padding: 0; display: flex; align-items: center; justify-content: center;">↑</button>
              <button id="list-comparison-down-arrow" class="disabled" style="width: 40px; height: 40px; font-size: 20px; padding: 0; display: flex; align-items: center; justify-content: center;">↓</button>
            </div>
          </div>
        </div>
      `;
      
      // Get references to elements
      const processBtn = document.getElementById('list-comparison-process-btn');
      const copyCommonBtn = document.getElementById('list-comparison-copy-common');
      const copyUniqueABtn = document.getElementById('list-comparison-copy-unique-a');
      const copyUniqueBBtn = document.getElementById('list-comparison-copy-unique-b');
      const upArrow = document.getElementById('list-comparison-up-arrow');
      const downArrow = document.getElementById('list-comparison-down-arrow');
      
      // Add event listeners
      processBtn.addEventListener('click', processLists);
      copyCommonBtn.addEventListener('click', () => copyToClipboard('common'));
      copyUniqueABtn.addEventListener('click', () => copyToClipboard('uniqueA'));
      copyUniqueBBtn.addEventListener('click', () => copyToClipboard('uniqueB'));
      upArrow.addEventListener('click', () => navigateDuplicates('up'));
      downArrow.addEventListener('click', () => navigateDuplicates('down'));
      
      console.log("List Comparison App initialized successfully");
      isInitialized = true;
    } catch (error) {
      console.error("Error initializing List Comparison App:", error);
    }
  }
  
  // Process the lists and display results
  function processLists() {
    console.log("Processing lists...");
    try {
      // Get input values
      const listAInput = document.getElementById('list-comparison-list-a');
      const listBInput = document.getElementById('list-comparison-list-b');
      const previewElement = document.getElementById('list-comparison-preview');
      const outputButtons = document.getElementById('list-comparison-output-buttons');
      const tableA = document.getElementById('list-comparison-table-a');
      const tableB = document.getElementById('list-comparison-table-b');
      
      // Parse lists - handle both newline and comma delimiters
      listA = parseList(listAInput.value);
      listB = parseList(listBInput.value);
      
      if (listA.length === 0 || listB.length === 0) {
        alert('Please enter values for both lists.');
        return;
      }
      
      // Find common and unique values
      commonValues = listA.filter(x => listB.includes(x));
      uniqueA = listA.filter(x => !listB.includes(x));
      uniqueB = listB.filter(x => !listA.includes(x));
      
      // Save results for copy operations
      outputButtons.dataset.common = JSON.stringify(commonValues);
      outputButtons.dataset.uniqueA = JSON.stringify(uniqueA);
      outputButtons.dataset.uniqueB = JSON.stringify(uniqueB);
      
      // Display results
      generateTable(tableA, listA, commonValues);
      generateTable(tableB, listB, commonValues);
      
      // Show output buttons and preview
      outputButtons.style.display = 'block';
      previewElement.style.display = 'block';
      
      // Reset navigation
      lastHighlightedCell = null;
      prevDuplicate = null;
      nextDuplicate = null;
      refreshArrows();
      
      console.log("Lists processed successfully");
    } catch (error) {
      console.error("Error processing lists:", error);
      alert("Error processing lists. See console for details.");
    }
  }
  
  // Parse a list from text input
  function parseList(text) {
    if (!text || !text.trim()) return [];
    
    // First try splitting by newlines
    let items = text.trim().split(/\n/).map(item => item.trim()).filter(Boolean);
    
    // If only one item, try splitting by commas
    if (items.length === 1 && items[0].includes(',')) {
      items = items[0].split(',').map(item => item.trim()).filter(Boolean);
    }
    
    return items;
  }
  
  // Generate a table for the list
  function generateTable(table, list, common) {
    table.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">#</th>
      <th style="padding:8px; border:1px solid #ddd; background:#f2f2f2;">Value</th>
    `;
    table.appendChild(headerRow);
    
    // Create rows for each item
    list.forEach((item, idx) => {
      const row = document.createElement('tr');
      const isCommon = common.includes(item);
      const boldClass = isCommon ? 'bold' : '';
      
      const indexCell = document.createElement('td');
      indexCell.style.padding = '8px';
      indexCell.style.border = '1px solid #ddd';
      indexCell.textContent = idx + 1;
      indexCell.addEventListener('click', function() {
        highlightCell(this);
      });
      
      const valueCell = document.createElement('td');
      valueCell.style.padding = '8px';
      valueCell.style.border = '1px solid #ddd';
      if (isCommon) {
        valueCell.style.fontWeight = 'bold';
        valueCell.style.color = '#4CAF50';
      }
      valueCell.textContent = item;
      valueCell.addEventListener('click', function() {
        findMatch(this);
      });
      
      row.appendChild(indexCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });
  }
  
  // Copy selected values to clipboard
  function copyToClipboard(type) {
    const outputButtons = document.getElementById('list-comparison-output-buttons');
    let data = [];
    
    switch (type) {
      case 'common':
        data = JSON.parse(outputButtons.dataset.common || '[]');
        break;
      case 'uniqueA':
        data = JSON.parse(outputButtons.dataset.uniqueA || '[]');
        break;
      case 'uniqueB':
        data = JSON.parse(outputButtons.dataset.uniqueB || '[]');
        break;
    }
    
    if (data.length > 0) {
      const text = data.join('\n');
      navigator.clipboard.writeText(text)
        .then(() => {
          alert(`Copied ${data.length} items to clipboard!`);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          alert('Failed to copy to clipboard. Please try again.');
        });
    } else {
      alert('No items to copy.');
    }
  }
  
  // Highlight a cell
  function highlightCell(cell) {
    const valueCell = cell.nextElementSibling;
    triggerHighlightEvent(valueCell);
  }
  
  // Find matching value in the other table
  function findMatch(cell) {
    const value = cell.textContent.trim();
    
    // Determine which table this cell is in
    const isTableA = cell.closest('table').id === 'list-comparison-table-a';
    const otherTableId = isTableA ? 'list-comparison-table-b' : 'list-comparison-table-a';
    const otherTable = document.getElementById(otherTableId);
    
    // Find matching cell in other table
    const valueCells = otherTable.querySelectorAll('td:nth-child(2)');
    
    // Remove any existing highlights
    document.querySelectorAll('td.highlight').forEach(td => {
      td.classList.remove('highlight');
      td.style.border = '1px solid #ddd';
    });
    
    let foundMatch = false;
    
    valueCells.forEach(valueCell => {
      if (valueCell.textContent.trim() === value) {
        // Highlight the match
        valueCell.classList.add('highlight');
        valueCell.style.border = '2px solid #f44336';
        valueCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        triggerHighlightEvent(valueCell);
        foundMatch = true;
      }
    });
    
    if (!foundMatch) {
      // No match found, just highlight this cell
      triggerHighlightEvent(cell);
    }
  }
  
  // Trigger highlight event
  function triggerHighlightEvent(newHighlight) {
    // Remove existing highlights
    document.querySelectorAll('td.highlight').forEach(td => {
      td.classList.remove('highlight');
      td.style.border = '1px solid #ddd';
    });
    
    // Add highlight to new cell
    newHighlight.classList.add('highlight');
    newHighlight.style.border = '2px solid #f44336';
    lastHighlightedCell = newHighlight;
    
    // Find previous and next duplicates
    prevDuplicate = findDuplicate(newHighlight, -1);
    nextDuplicate = findDuplicate(newHighlight, 1);
    
    // Update arrow buttons
    refreshArrows();
  }
  
  // Find a duplicate in the table
  function findDuplicate(cell, direction) {
    const value = cell.textContent.trim();
    const table = cell.closest('table');
    const rows = Array.from(table.rows);
    const currentRow = cell.closest('tr');
    const currentIndex = rows.indexOf(currentRow);
    
    if (direction === -1) {
      // Look backward
      for (let i = currentIndex - 1; i >= 1; i--) { // Start from 1 to skip header
        const valueCell = rows[i].querySelector('td:nth-child(2)');
        if (valueCell && valueCell.textContent.trim() === value) {
          return valueCell;
        }
      }
    } else if (direction === 1) {
      // Look forward
      for (let i = currentIndex + 1; i < rows.length; i++) {
        const valueCell = rows[i].querySelector('td:nth-child(2)');
        if (valueCell && valueCell.textContent.trim() === value) {
          return valueCell;
        }
      }
    }
    
    return null;
  }
  
  // Update navigation arrows
  function refreshArrows() {
    const upArrow = document.getElementById('list-comparison-up-arrow');
    const downArrow = document.getElementById('list-comparison-down-arrow');
    
    if (!upArrow || !downArrow) return;
    
    if (prevDuplicate) {
      upArrow.classList.remove('disabled');
      upArrow.style.backgroundColor = 'rgba(66, 133, 244, 0.7)';
      upArrow.style.cursor = 'pointer';
    } else {
      upArrow.classList.add('disabled');
      upArrow.style.backgroundColor = 'rgba(100, 100, 100, 0.3)';
      upArrow.style.cursor = 'not-allowed';
    }
    
    if (nextDuplicate) {
      downArrow.classList.remove('disabled');
      downArrow.style.backgroundColor = 'rgba(66, 133, 244, 0.7)';
      downArrow.style.cursor = 'pointer';
    } else {
      downArrow.classList.add('disabled');
      downArrow.style.backgroundColor = 'rgba(100, 100, 100, 0.3)';
      downArrow.style.cursor = 'not-allowed';
    }
  }
  
  // Navigate between duplicates
  function navigateDuplicates(direction) {
    if (direction === 'up' && prevDuplicate) {
      prevDuplicate.scrollIntoView({ behavior: 'smooth', block: 'center' });
      triggerHighlightEvent(prevDuplicate);
    } else if (direction === 'down' && nextDuplicate) {
      nextDuplicate.scrollIntoView({ behavior: 'smooth', block: 'center' });
      triggerHighlightEvent(nextDuplicate);
    }
  }
  
  // Public API
  return {
    init,
    highlightCell,
    findMatch
  };
})();

// Debug helper - check if the app initialized
(function() {
  // Check initialization in 2 seconds
  setTimeout(() => {
    console.log("Checking List Comparison App status...");
    const container = document.querySelector('#list-comparison-modal .app-content');
    
    if (container) {
      const hasContent = container.innerHTML.length > 0;
      console.log("List Comparison content container found:", container);
      console.log("Has content:", hasContent);
      
      if (!hasContent) {
        console.log("No content found - attempting initialization");
        window.ListComparisonApp.init();
      }
    } else {
      console.log("List Comparison container not found in DOM");
    }
  }, 2000);
})();