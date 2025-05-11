/**
 * Bookmarks Widget for Homepage
 * Uses File System Access API to store bookmarks in a file
 */

const BookmarksWidget = (function() {
  // DOM Elements
  const bookmarksList = document.getElementById('bookmarks-list');
  const addBookmarkBtn = document.getElementById('add-bookmark-btn');
  const addBookmarkForm = document.getElementById('add-bookmark-form');
  const bookmarkNameInput = document.getElementById('bookmark-name');
  const bookmarkUrlInput = document.getElementById('bookmark-url');
  const saveBookmarkBtn = document.getElementById('save-bookmark');
  const cancelBookmarkBtn = document.getElementById('cancel-bookmark');
  const editBookmarksBtn = document.getElementById('edit-bookmarks');
  
  // State variables
  let bookmarks = [];
  let isEditMode = false;
  let bookmarksFileHandle = null;
  let directoryHandle = null;
  
  // Initialize the widget
  async function init() {
    // Set up event listeners
    addBookmarkBtn.addEventListener('click', showAddBookmarkForm);
    saveBookmarkBtn.addEventListener('click', saveBookmark);
    cancelBookmarkBtn.addEventListener('click', hideAddBookmarkForm);
    editBookmarksBtn.addEventListener('click', toggleEditMode);
    
    // Try to load bookmarks from file
    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error('File System Access API not supported');
      }
      
      // Try to get the file handle for bookmarks.txt
      await getBookmarksFileHandle();
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to access bookmarks file:', error);
      // Fall back to localStorage if file access fails
      loadBookmarksFromStorage();
    }
    
    console.log('Bookmarks Widget initialized');
  }
  
  // Check if File System Access API is supported
  function isFileSystemAccessSupported() {
    return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
  }
  
  // Get the file handle for bookmarks.txt
  async function getBookmarksFileHandle() {
    if (bookmarksFileHandle) return bookmarksFileHandle;
    
    try {
      // Ask user to select the directory
      directoryHandle = await window.showDirectoryPicker({
        id: 'bookmarks-directory',
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      // Try to get the bookmarks.txt file
      try {
        bookmarksFileHandle = await directoryHandle.getFileHandle('bookmarks.txt', { create: true });
        return bookmarksFileHandle;
      } catch (error) {
        console.error('Error getting bookmarks.txt:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error accessing file system:', error);
      throw error;
    }
  }
  
  // Load bookmarks from file
  async function loadBookmarks() {
    try {
      if (!bookmarksFileHandle) {
        await getBookmarksFileHandle();
      }
      
      // Read the file
      const file = await bookmarksFileHandle.getFile();
      const contents = await file.text();
      
      // Parse the JSON content
      try {
        if (contents.trim()) {
          bookmarks = JSON.parse(contents);
        } else {
          bookmarks = [];
        }
      } catch (parseError) {
        console.error('Error parsing bookmarks file:', parseError);
        bookmarks = [];
      }
      
      renderBookmarks();
    } catch (error) {
      console.error('Failed to load bookmarks from file:', error);
      throw error;
    }
  }
  
  // Fallback: Load bookmarks from localStorage
  function loadBookmarksFromStorage() {
    try {
      const storedBookmarks = localStorage.getItem('homepageBookmarks');
      bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
    } catch (error) {
      console.error('Failed to load bookmarks from storage:', error);
      bookmarks = [];
    }
    
    renderBookmarks();
  }
  
  // Save bookmarks to file
  async function saveBookmarksToFile() {
    try {
      if (!bookmarksFileHandle) {
        await getBookmarksFileHandle();
      }
      
      // Create a writable stream
      const writable = await bookmarksFileHandle.createWritable();
      
      // Write the JSON data
      await writable.write(JSON.stringify(bookmarks, null, 2));
      
      // Close the stream
      await writable.close();
      
      console.log('Bookmarks saved to file');
    } catch (error) {
      console.error('Failed to save bookmarks to file:', error);
      
      // Fall back to localStorage
      saveBookmarksToStorage();
      // alert('Could not save to file. Saved to browser storage instead.');
    }
  }
  
  // Fallback: Save bookmarks to localStorage
  function saveBookmarksToStorage() {
    try {
      localStorage.setItem('homepageBookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks to storage:', error);
    }
  }
  
  // Render the bookmarks list
  function renderBookmarks() {
    // Clear current bookmarks
    bookmarksList.innerHTML = '';
    
    // Check if there are any bookmarks
    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = `
        <div class="no-bookmarks">
          <p>No bookmarks added yet</p>
        </div>
      `;
      return;
    }
    
    // Render each bookmark
    bookmarks.forEach((bookmark, index) => {
      const bookmarkEl = document.createElement('div');
      bookmarkEl.className = 'bookmark-item';
      
      // Get the first letter for the icon (fallback)
      const firstLetter = bookmark.name.charAt(0).toUpperCase();
      
      // Create initial HTML with placeholder for icon
      bookmarkEl.innerHTML = `
        <div class="bookmark-icon" data-index="${index}">${firstLetter}</div>
        <div class="bookmark-name">${bookmark.name}</div>
        <div class="bookmark-actions">
          <button class="bookmark-delete" data-index="${index}">×</button>
        </div>
      `;
      
      // Find the icon element we just created
      const iconElement = bookmarkEl.querySelector('.bookmark-icon');
      
      // Try to load favicon
      tryLoadFavicon(bookmark.url, iconElement, firstLetter);
      
      // Add event listener for clicking the bookmark
      bookmarkEl.addEventListener('click', (e) => {
        // Don't navigate if in edit mode or if clicking the delete button
        if (isEditMode || e.target.classList.contains('bookmark-delete')) {
          if (e.target.classList.contains('bookmark-delete')) {
            deleteBookmark(parseInt(e.target.dataset.index));
          }
          e.stopPropagation();
          return;
        }
        
        // Open the bookmark URL
        window.open(bookmark.url, '_blank');
      });
      
      bookmarksList.appendChild(bookmarkEl);
    });
    
    // Add or remove editing mode class
    if (isEditMode) {
      bookmarksList.classList.add('editing-mode');
    } else {
      bookmarksList.classList.remove('editing-mode');
    }
  }
  
  // Try to load favicon for a bookmark
  function tryLoadFavicon(url, iconElement, fallbackLetter) {
    try {
      // Parse the URL to get hostname
      const parsedUrl = new URL(url);
      
      // Try different favicon sources in priority order
      const faviconSources = [
        // Google Favicon service provides a reliable source for favicons
        `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`,
        // Try the standard favicon location
        `${parsedUrl.origin}/favicon.ico`,
        // Try common alternative locations
        `${parsedUrl.origin}/favicon.png`,
        `${parsedUrl.origin}/assets/favicon.ico`,
        `${parsedUrl.origin}/images/favicon.ico`
      ];
      
      // Create an image element to load the favicon
      const img = new Image();
      
      // Counter to track which source we're trying
      let sourceIndex = 0;
      
      // Set up image loading events
      img.onload = function() {
        // Successfully loaded the image
        iconElement.innerHTML = '';
        iconElement.appendChild(img);
        
        // Store the favicon URL in the bookmark object if it doesn't have one
        const bookmarkIndex = parseInt(iconElement.dataset.index);
        if (bookmarkIndex >= 0 && bookmarkIndex < bookmarks.length) {
          bookmarks[bookmarkIndex].faviconUrl = img.src;
          // Save the updated bookmarks
          saveBookmarksToFile().catch(() => saveBookmarksToStorage());
        }
      };
      
      img.onerror = function() {
        // Try the next source
        sourceIndex++;
        if (sourceIndex < faviconSources.length) {
          img.src = faviconSources[sourceIndex];
        } else {
          // All sources failed, use the fallback letter
          iconElement.textContent = fallbackLetter;
        }
      };
      
      // Set image attributes
      img.className = 'favicon-img';
      img.alt = `${fallbackLetter} icon`;
      img.width = 16;
      img.height = 16;
      
      // Start loading the first favicon source
      img.src = bookmarks[parseInt(iconElement.dataset.index)].faviconUrl || faviconSources[0];
      
    } catch (e) {
      // Invalid URL or other error, use the fallback letter
      iconElement.textContent = fallbackLetter;
    }
  }
  
  // Show the add bookmark form
  function showAddBookmarkForm() {
    addBookmarkForm.classList.remove('hidden');
    addBookmarkBtn.classList.add('hidden');
    bookmarkNameInput.focus();
  }
  
  // Hide the add bookmark form
  function hideAddBookmarkForm() {
    addBookmarkForm.classList.add('hidden');
    addBookmarkBtn.classList.remove('hidden');
    // Clear form fields
    bookmarkNameInput.value = '';
    bookmarkUrlInput.value = '';
  }
  
  // Save a new bookmark
  async function saveBookmark() {
    const name = bookmarkNameInput.value.trim();
    let url = bookmarkUrlInput.value.trim();
    
    // Validate inputs
    if (!name || !url) {
      alert('Please enter both name and URL');
      return;
    }
    
    // Add http:// prefix if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Try to pre-fetch favicon URL
    let faviconUrl = null;
    try {
      const parsedUrl = new URL(url);
      // Use Google's favicon service as a reliable source
      faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    } catch (e) {
      console.warn('Could not parse URL for favicon:', e);
    }
    
    // Add the bookmark with favicon URL if available
    bookmarks.push({ 
      name, 
      url,
      faviconUrl,
      dateAdded: new Date().toISOString() 
    });
    
    // Save to file (or localStorage as fallback)
    try {
      await saveBookmarksToFile();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      saveBookmarksToStorage();
    }
    
    // Hide the form and render bookmarks
    hideAddBookmarkForm();
    renderBookmarks();
  }
  
  // Delete a bookmark
  async function deleteBookmark(index) {
    if (index >= 0 && index < bookmarks.length) {
      // Remove the bookmark
      bookmarks.splice(index, 1);
      
      // Save to file (or localStorage as fallback)
      try {
        await saveBookmarksToFile();
      } catch (error) {
        console.error('Error deleting bookmark:', error);
        saveBookmarksToStorage();
      }
      
      // Re-render bookmarks
      renderBookmarks();
    }
  }
  
  // Toggle edit mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
    
    // Update the edit button text
    editBookmarksBtn.textContent = isEditMode ? '✓' : '✏️';
    
    // Re-render bookmarks
    renderBookmarks();
  }
  
  // Export bookmarks to a downloadable file (additional feature)
  function exportBookmarks() {
    const bookmarksJson = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([bookmarksJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Import bookmarks from a file (additional feature)
  async function importBookmarks() {
    try {
      // Show file picker
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON Files',
            accept: {
              'application/json': ['.json', '.txt']
            }
          }
        ],
        multiple: false
      });
      
      // Get the file
      const file = await fileHandle.getFile();
      const contents = await file.text();
      
      // Parse the JSON
      const importedBookmarks = JSON.parse(contents);
      
      // Validate the imported data
      if (Array.isArray(importedBookmarks)) {
        // Replace or merge bookmarks
        if (confirm('Replace existing bookmarks with imported ones?')) {
          bookmarks = importedBookmarks;
        } else {
          // Merge, avoiding duplicates
          const urlSet = new Set(bookmarks.map(b => b.url));
          importedBookmarks.forEach(bookmark => {
            if (!urlSet.has(bookmark.url)) {
              bookmarks.push(bookmark);
              urlSet.add(bookmark.url);
            }
          });
        }
        
        // Save and render
        await saveBookmarksToFile();
        renderBookmarks();
      }
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      alert('Failed to import bookmarks: ' + error.message);
    }
  }
  
  // Public API
  return {
    init,
    loadBookmarks,
    exportBookmarks,
    importBookmarks
  };
})();

// Initialize the bookmarks widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
BookmarksWidget.init().catch(error => {
  console.error('Error initializing BookmarksWidget:', error);
});
}); 