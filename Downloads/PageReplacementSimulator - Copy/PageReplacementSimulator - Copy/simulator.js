document.addEventListener('DOMContentLoaded', function () {
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
  themeToggleBtn.addEventListener('click', function () {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const algorithmParam = urlParams.get('algorithm');

  // Set the algorithm dropdown value if provided in URL
  if (algorithmParam) {
    const algorithmSelect = document.getElementById('algorithm');
    algorithmSelect.value = algorithmParam.toLowerCase();
    updateAlgorithmTitle();
  }

  // Set the algorithm description
  updateAlgorithmDescription();

  // Set up event listeners
  document.getElementById('algorithm').addEventListener('change', updateAlgorithmDescription);
  document.getElementById('algorithm').addEventListener('change', updateAlgorithmTitle);
  document.getElementById('increase-frames').addEventListener('click', increaseFrames);
  document.getElementById('decrease-frames').addEventListener('click', decreaseFrames);
  document.getElementById('simulate-btn').addEventListener('click', simulate);
  document.getElementById('reset-btn').addEventListener('click', resetSimulation);
  document.getElementById('prev-btn').addEventListener('click', showPreviousStep);
  document.getElementById('next-btn').addEventListener('click', showNextStep);

  // Simulation state
  let simulationSteps = [];
  let currentStepIndex = 0;
  let isSimulating = false;
});

// Update the algorithm title
function updateAlgorithmTitle() {
  const algorithmSelect = document.getElementById('algorithm');
  const algorithmTitle = document.getElementById('algorithm-title');
  let title = '';

  switch (algorithmSelect.value) {
    case 'fifo':
      title = 'First-In, First-Out (FIFO) Simulator';
      break;
    case 'lru':
      title = 'Least Recently Used (LRU) Simulator';
      break;
    case 'optimal':
      title = 'Optimal Algorithm Simulator';
      break;
    default:
      title = 'Algorithm Simulator';
  }

  algorithmTitle.textContent = title;
}

// Update the algorithm description section
function updateAlgorithmDescription() {
  const algorithmSelect = document.getElementById('algorithm');
  const descriptionContainer = document.getElementById('algorithm-description');

  // Get algorithm description HTML
  const description = getAlgorithmDescription(algorithmSelect.value);

  // Update the description container
  descriptionContainer.innerHTML = description;
}

// Increase frames
function increaseFrames() {
  const framesInput = document.getElementById('numFrames');
  const currentValue = parseInt(framesInput.value);

  if (currentValue < 10) {
    framesInput.value = currentValue + 1;
  }
}

// Decrease frames
function decreaseFrames() {
  const framesInput = document.getElementById('numFrames');
  const currentValue = parseInt(framesInput.value);

  if (currentValue > 1) {
    framesInput.value = currentValue - 1;
  }
}

// Simulate button click handler
function simulate() {
  // Parse input values
  const refStringInput = document.getElementById('refString').value;
  const numFrames = parseInt(document.getElementById('numFrames').value);
  const algorithm = document.getElementById('algorithm').value;

  try {
    // Parse reference string
    const pages = refStringInput.split(',').map(n => {
      const parsed = parseInt(n.trim());
      if (isNaN(parsed)) {
        throw new Error("Invalid reference string");
      }
      return parsed;
    });

    if (pages.length === 0) {
      alert("Please enter a valid reference string");
      return;
    }

    if (numFrames < 1) {
      alert("Number of frames must be at least 1");
      return;
    }

    // Run simulation based on selected algorithm
    let simulationResult = [];

    if (algorithm === 'fifo') {
      simulationResult = simulateFIFO(pages, numFrames);
    } else if (algorithm === 'lru') {
      simulationResult = simulateLRU(pages, numFrames);
    } else if (algorithm === 'optimal') {
      simulationResult = simulateOptimal(pages, numFrames);
    }

    // Update UI to simulation mode
    setSimulationMode(true);

    // Update global simulation state
    simulationSteps = simulationResult;
    currentStepIndex = 0;

    // Display first step
    displaySimulationStep(currentStepIndex);

    // Update statistics
    updateStatistics();

    // Generate summary table and chart
    generateSummaryTable(simulationSteps);
    generatePieChart(simulationSteps);

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// FIFO simulation
function simulateFIFO(pages, frameCount) {
  let frames = new Array(frameCount).fill(null); // Fixed slots
  let nextReplaceIndex = 0;
  let result = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const isPageFault = !frames.includes(page);

    if (isPageFault) {
      // Replace the page at the fixed FIFO index
      frames[nextReplaceIndex] = page;
      nextReplaceIndex = (nextReplaceIndex + 1) % frameCount; // Move circularly
    }

    // Add step to result
    result.push({
      frames: [...frames], // Always return current frame layout
      currentPage: page,
      pageFault: isPageFault
    });
  }

  return result;
}


// LRU simulation
function simulateLRU(pages, frameCount) {
  let frames = new Array(frameCount).fill(null); // Fixed positions
  let usageQueue = []; // Tracks LRU order
  let result = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const isPageFault = !frames.includes(page);

    if (isPageFault) {
      if (usageQueue.length >= frameCount) {
        // Remove LRU page
        const lruPage = usageQueue.shift();
        const lruIndex = frames.indexOf(lruPage);
        frames[lruIndex] = page; // Replace at same index
      } else {
        // Fill empty slot
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
      }
      usageQueue.push(page);
    } else {
      // Page hit: update usage queue only
      const idx = usageQueue.indexOf(page);
      usageQueue.splice(idx, 1); // Remove from queue
      usageQueue.push(page);     // Re-add to mark as most recently used
    }

    result.push({
      frames: [...frames],
      currentPage: page,
      pageFault: isPageFault
    });
  }

  return result;
}



// Optimal simulation
function simulateOptimal(pages, frameCount) {
  let frames = new Array(frameCount).fill(null); // Fixed-size memory
  let result = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const isPageFault = !frames.includes(page);

    if (isPageFault) {
      if (frames.includes(null)) {
        // If there is an empty slot, insert the page in the first empty slot
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
      } else {
        // If memory is full, find the page to replace based on future use
        const future = pages.slice(i + 1);

        const nextUse = frames.map(p => {
          const index = future.indexOf(p);
          return index === -1 ? Infinity : index;
        });

        // Find the page that will not be used for the longest time
        const replaceIndex = nextUse.indexOf(Math.max(...nextUse));
        frames[replaceIndex] = page;
      }
    }

    // Add step to result (copy of current frame state)
    result.push({
      frames: [...frames],
      currentPage: page,
      pageFault: isPageFault
    });
  }

  return result;
}


// Display simulation step
function displaySimulationStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= simulationSteps.length) {
    return;
  }

  const step = simulationSteps[stepIndex];
  const currentPage = document.getElementById('current-page');
  const pageStatus = document.getElementById('page-status');
  const memoryFrames = document.getElementById('memory-frames');
  const algorithm = document.getElementById('algorithm').value;

  // Update current page
  currentPage.textContent = `Page ${step.currentPage}`;

  // Update page status
  pageStatus.textContent = step.pageFault ? 'PAGE FAULT' : 'PAGE HIT';
  pageStatus.className = step.pageFault ? 'page-status fault' : 'page-status hit';

  // Update memory frames
  memoryFrames.innerHTML = '';

  step.frames.forEach((value, index) => {
    const frameDiv = document.createElement('div');
    frameDiv.className = `memory-frame ${algorithm} ${step.pageFault ? 'fault' : ''}`;

    const frameContent = document.createElement('div');
    if (value !== null) {
      frameContent.className = 'frame-content';
      frameContent.textContent = value;
    } else {
      frameContent.className = 'frame-empty';
      frameContent.textContent = 'Empty';
    }

    const frameNumber = document.createElement('div');
    frameNumber.className = 'frame-number';
    frameNumber.textContent = `Frame ${index}`;

    frameDiv.appendChild(frameContent);
    frameDiv.appendChild(frameNumber);
    memoryFrames.appendChild(frameDiv);
  });

  // Update navigation buttons
  document.getElementById('prev-btn').disabled = stepIndex === 0;
  document.getElementById('next-btn').disabled = stepIndex === simulationSteps.length - 1;

  // Update step indicator in panel title
  document.getElementById('simulation-panel-title').textContent =
    `Simulation (Step ${stepIndex + 1} of ${simulationSteps.length})`;
}

// Show previous step
function showPreviousStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    displaySimulationStep(currentStepIndex);
  }
}

// Show next step
function showNextStep() {
  if (currentStepIndex < simulationSteps.length - 1) {
    currentStepIndex++;
    displaySimulationStep(currentStepIndex);
  }
}

// Update statistics
function updateStatistics() {
  const totalRequests = simulationSteps.length;
  const pageFaults = simulationSteps.filter(step => step.pageFault).length;
  const hits = totalRequests - pageFaults;
  const hitRatio = ((hits / totalRequests) * 100).toFixed(2);

  document.getElementById('total-requests').textContent = totalRequests;
  document.getElementById('page-faults').textContent = pageFaults;
  document.getElementById('hit-ratio').textContent = `${hitRatio}%`;
}

// Set simulation mode
function setSimulationMode(isSimulating) {
  const algorithmDescription = document.getElementById('algorithm-description');
  const simulationResults = document.getElementById('simulation-results');
  const simulateBtn = document.getElementById('simulate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const summarySection = document.getElementById('summary-section');

  if (isSimulating) {
    algorithmDescription.classList.add('hidden');
    simulationResults.classList.remove('hidden');
    simulateBtn.classList.add('hidden');
    resetBtn.classList.remove('hidden');

    // Show summary section
    if (summarySection) {
      summarySection.classList.remove('hidden');
    }
  } else {
    algorithmDescription.classList.remove('hidden');
    simulationResults.classList.add('hidden');
    simulateBtn.classList.remove('hidden');
    resetBtn.classList.add('hidden');

    // Hide summary section
    if (summarySection) {
      summarySection.classList.add('hidden');
    }
  }
}

// Reset simulation
function resetSimulation() {
  setSimulationMode(false);
  simulationSteps = [];
  currentStepIndex = 0;

  // Clear the summary table and chart
  const summaryTableBody = document.getElementById('summary-table-body');
  if (summaryTableBody) {
    summaryTableBody.innerHTML = '';
  }

  // Destroy pie chart if it exists
  if (window.hitMissChart) {
    window.hitMissChart.destroy();
    window.hitMissChart = null;
  }
}

// Get algorithm description from imported function from index.js
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

// Generate summary table
function generateSummaryTable(steps) {
  const summaryTableBody = document.getElementById('summary-table-body');
  if (!summaryTableBody) return;

  // Clear previous content
  summaryTableBody.innerHTML = '';

  // Create a row for each step
  steps.forEach((step, index) => {
    const row = document.createElement('tr');

    // Create request number cell
    const requestNumCell = document.createElement('td');
    requestNumCell.textContent = (index + 1).toString();
    row.appendChild(requestNumCell);

    // Create page cell
    const pageCell = document.createElement('td');
    pageCell.textContent = step.currentPage.toString();
    pageCell.classList.add('font-medium');
    row.appendChild(pageCell);

    // Create frames cells
    step.frames.forEach((frame, frameIndex) => {
      const frameCell = document.createElement('td');
      frameCell.textContent = frame !== null ? frame.toString() : '-';

      // Highlight newly added frame
      if (step.pageFault && index > 0) {
        const prevStep = steps[index - 1];
        if (prevStep) {
          const isNewFrame = prevStep.frames[frameIndex] !== frame;
          if (isNewFrame && frame !== null) {
            frameCell.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
          }
        }
      }

      row.appendChild(frameCell);
    });

    // Create status cell
    const statusCell = document.createElement('td');
    if (step.pageFault) {
      statusCell.innerHTML = '<span class="status-badge fault">Miss</span>';
    } else {
      statusCell.innerHTML = '<span class="status-badge hit">Hit</span>';
    }
    row.appendChild(statusCell);

    // Add row to table
    summaryTableBody.appendChild(row);
  });
}

// Generate pie chart for hit/miss ratio
function generatePieChart(steps) {
  const chartCanvas = document.getElementById('hit-miss-chart');
  if (!chartCanvas) return;

  // Calculate hits and misses
  const pageFaults = steps.filter(step => step.pageFault).length;
  const hits = steps.length - pageFaults;

  // Get algorithm colors
  const algorithm = document.getElementById('algorithm').value;
  let primaryColor;

  switch (algorithm) {
    case 'fifo':
      primaryColor = '#3B82F6';
      break;
    case 'lru':
      primaryColor = '#8B5CF6';
      break;
    case 'optimal':
      primaryColor = '#10B981';
      break;
    default:
      primaryColor = '#3B82F6';
  }

  // Destroy previous chart if it exists
  if (window.hitMissChart) {
    window.hitMissChart.destroy();
  }

  // Create chart
  const ctx = chartCanvas.getContext('2d');
  window.hitMissChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Hits', 'Misses'],
      datasets: [{
        data: [hits, pageFaults],
        backgroundColor: [
          primaryColor,
          '#EF4444'
        ],
        borderColor: [
          document.body.classList.contains('dark-theme') ? '#1f2937' : '#ffffff',
          document.body.classList.contains('dark-theme') ? '#1f2937' : '#ffffff'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark-theme') ? '#e5e7eb' : '#374151',
            font: {
              family: "'Inter', sans-serif",
              size: 14
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: document.body.classList.contains('dark-theme') ? '#374151' : '#ffffff',
          titleColor: document.body.classList.contains('dark-theme') ? '#e5e7eb' : '#111827',
          bodyColor: document.body.classList.contains('dark-theme') ? '#e5e7eb' : '#374151',
          borderColor: document.body.classList.contains('dark-theme') ? '#4b5563' : '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Update chart on theme change
  document.getElementById('theme-toggle-btn').addEventListener('click', function () {
    generatePieChart(steps);
  });
}