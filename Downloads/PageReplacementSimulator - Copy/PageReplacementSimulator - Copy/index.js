document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Check for saved theme preference or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
    }
    
    // Theme toggle button event listener
    themeToggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  
    // Get modal elements
    const modal = document.getElementById('algorithm-modal');
    const modalContent = document.getElementById('modal-content');
    const closeButton = document.querySelector('.close-button');
    
    // Get all "Learn More" buttons
    const infoButtons = document.querySelectorAll('.info-btn');
    
    // Add click event to each info button
    infoButtons.forEach(button => {
      button.addEventListener('click', function() {
        const algorithm = this.getAttribute('data-algorithm');
        const content = getAlgorithmDescription(algorithm, true);
        modalContent.innerHTML = content;
        modal.style.display = 'block';
        
        // Prevent scrolling on the body when modal is open
        document.body.style.overflow = 'hidden';
      });
    });
    
    // Close modal when clicking close button
    closeButton.addEventListener('click', function() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  });
  
  // Get algorithm description
  function getAlgorithmDescription(algorithm, isModal = false) {
    let iconHtml = '';
    let title = '';
    let mainDescription = '';
    let steps = '';
    let advantages = '';
    let disadvantages = '';
    
    if (algorithm === 'fifo') {
      iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
      title = 'First-In, First-Out (FIFO)';
      mainDescription = 'FIFO is the simplest page replacement algorithm. When a page needs to be replaced, the oldest page in memory (the one that was loaded first) is selected for replacement.';
      steps = `
        <ol>
          <li>Pages are placed in a queue when they are loaded into memory</li>
          <li>When a page fault occurs and all frames are full, the page at the front of the queue (oldest) is removed</li>
          <li>The new page is added to the rear of the queue</li>
        </ol>
      `;
      advantages = `
        <ul>
          <li>Simple to understand and implement</li>
          <li>Low overhead - only need to track order of arrival</li>
          <li>Fair - all pages have the same lifetime in memory</li>
        </ul>
      `;
      disadvantages = `
        <ul>
          <li>Doesn't consider page usage frequency</li>
          <li>Subject to Belady's Anomaly</li>
          <li>May remove heavily used pages</li>
        </ul>
      `;
    } else if (algorithm === 'lru') {
      iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
      title = 'Least Recently Used (LRU)';
      mainDescription = 'LRU replaces the page that has not been used for the longest period of time. This approach assumes that pages that have been heavily used in the past will likely be used again in the near future.';
      steps = `
        <ol>
          <li>The system keeps track of when each page was last accessed</li>
          <li>When a page fault occurs and all frames are full, the page with the oldest "last used" timestamp is removed</li>
          <li>Each time a page is accessed, its timestamp is updated</li>
        </ol>
      `;
      advantages = `
        <ul>
          <li>Better performance than FIFO for most workloads</li>
          <li>Adapts to changing access patterns</li>
          <li>Not subject to Belady's Anomaly</li>
        </ul>
      `;
      disadvantages = `
        <ul>
          <li>More complex to implement</li>
          <li>Higher overhead - must track page usage</li>
          <li>Does not consider future access patterns</li>
        </ul>
      `;
    } else if (algorithm === 'optimal') {
      iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
      title = 'Optimal Algorithm';
      mainDescription = 'The Optimal algorithm (also known as Belady\'s algorithm or the clairvoyant algorithm) replaces the page that will not be used for the longest time in the future. It provides the best possible performance but requires future knowledge.';
      steps = `
        <ol>
          <li>When a page fault occurs and all frames are full, the algorithm looks at future page requests</li>
          <li>It identifies which pages in memory will not be used for the longest time</li>
          <li>The page that won't be used for the longest time is replaced</li>
        </ol>
      `;
      advantages = `
        <ul>
          <li>Provides the lowest possible page fault rate</li>
          <li>Useful as a theoretical benchmark</li>
          <li>Not subject to Belady's Anomaly</li>
        </ul>
      `;
      disadvantages = `
        <ul>
          <li>Requires future knowledge (impossible in real systems)</li>
          <li>Can only be simulated, not implemented in practice</li>
          <li>Used mainly for comparison purposes</li>
        </ul>
      `;
    }
    
    // Format HTML differently for modal vs. page content
    if (isModal) {
      return `
        <div class="description-header">
          <div class="icon">${iconHtml}</div>
          <h2>${title}</h2>
        </div>
        <p class="description-text">${mainDescription}</p>
        <div class="steps-container">
          <h3>How ${algorithm.toUpperCase()} Works:</h3>
          <div class="steps">${steps}</div>
        </div>
        <div class="description-cards">
          <div class="advantage-card">
            <h4>Advantages</h4>
            ${advantages}
          </div>
          <div class="disadvantage-card">
            <h4>Disadvantages</h4>
            ${disadvantages}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="description-header">
          <div class="icon">${iconHtml}</div>
          <h3>${title}</h3>
        </div>
        <p class="description-text">${mainDescription}</p>
        <div class="steps-container">
          <h4>How ${algorithm.toUpperCase()} Works:</h4>
          <div class="steps">${steps}</div>
        </div>
        <div class="description-cards">
          <div class="advantage-card">
            <h4>Advantages</h4>
            ${advantages}
          </div>
          <div class="disadvantage-card">
            <h4>Disadvantages</h4>
            ${disadvantages}
          </div>
        </div>
      `;
    }
  }