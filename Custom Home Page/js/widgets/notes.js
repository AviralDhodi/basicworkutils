/**
 * Simplified Notes Widget for Homepage
 * Single note with auto-save functionality and bullet points
 */

const NotesWidget = (function() {
    // DOM Elements
    const notesWidget = document.getElementById('notes-widget');
    const noteContent = document.getElementById('note-content');
    const noteStatus = document.getElementById('note-status');
    
    // Save timer and state
    let saveTimer = null;
    let lastSavedContent = '';
    const AUTOSAVE_DELAY = 1000; // 1 second
    
    // Initialize the widget
    function init() {
      // Load note from storage
      loadNote();
      
      // Set up event listeners
      noteContent.addEventListener('input', handleNoteInput);
      noteContent.addEventListener('keydown', handleKeyDown);
      noteContent.addEventListener('blur', saveNote); // Save on blur
      
      console.log('Notes Widget initialized');
    }
    
    // Load note from localStorage
    function loadNote() {
      try {
        const storedNote = localStorage.getItem('homepageNote');
        
        if (storedNote) {
          noteContent.value = storedNote;
          lastSavedContent = storedNote;
        } else {
          // Default content with bullet points
          noteContent.value = '• ';
          lastSavedContent = '• ';
        }
      } catch (error) {
        console.error('Failed to load note from storage:', error);
        noteContent.value = '• ';
        lastSavedContent = '• ';
      }
    }
    
    // Handle note input with debounced auto-save
    function handleNoteInput() {
      // Clear previous timer
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      
      // Set status to indicate typing
      updateStatus('Typing...');
      
      // Set new timer for auto-save
      saveTimer = setTimeout(() => {
        saveNote();
      }, AUTOSAVE_DELAY);
    }
    
    // Handle keydown events for bullets
    function handleKeyDown(e) {
      // Check for Enter key
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // Get current cursor position
        const cursorPos = noteContent.selectionStart;
        const currentText = noteContent.value;
        
        // Check if the current line has a bullet
        const lines = currentText.substr(0, cursorPos).split('\n');
        const currentLine = lines[lines.length - 1];
        
        if (currentLine.trim().startsWith('•')) {
          // If line only has bullet and space, remove it and don't add a new one
          if (currentLine.trim() === '•' || currentLine.trim() === '• ') {
            // Remove the bullet point line
            const beforeBullet = currentText.substr(0, cursorPos - currentLine.length);
            const afterBullet = currentText.substr(cursorPos);
            noteContent.value = beforeBullet + afterBullet;
            noteContent.selectionStart = beforeBullet.length;
            noteContent.selectionEnd = beforeBullet.length;
          } else {
            // Add new bullet point
            const newText = currentText.substr(0, cursorPos) + '\n• ' + currentText.substr(cursorPos);
            noteContent.value = newText;
            noteContent.selectionStart = cursorPos + 3; // Position after the new bullet point
            noteContent.selectionEnd = cursorPos + 3;
          }
        } else {
          // No bullet on the line, just add a new bullet
          const newText = currentText.substr(0, cursorPos) + '\n• ' + currentText.substr(cursorPos);
          noteContent.value = newText;
          noteContent.selectionStart = cursorPos + 3;
          noteContent.selectionEnd = cursorPos + 3;
        }
        
        // Trigger auto-save
        handleNoteInput();
      }
    }
    
    // Save note to localStorage
    function saveNote() {
      const content = noteContent.value;
      
      // Only save if content has changed
      if (content !== lastSavedContent) {
        try {
          localStorage.setItem('homepageNote', content);
          lastSavedContent = content;
          updateStatus('Saved');
          
          // Clear status after 2 seconds
          setTimeout(() => {
            updateStatus('');
          }, 2000);
        } catch (error) {
          console.error('Failed to save note to storage:', error);
          updateStatus('Error saving');
        }
      } else {
        updateStatus('');
      }
      
      // Clear the timer
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
    }
    
    // Update status message
    function updateStatus(message) {
      if (noteStatus) {
        noteStatus.textContent = message;
      }
    }
    
    // Public API
    return {
      init,
      saveNote
    };
  })();
  
  // Initialize the notes widget when DOM is loaded
  document.addEventListener('DOMContentLoaded', NotesWidget.init);