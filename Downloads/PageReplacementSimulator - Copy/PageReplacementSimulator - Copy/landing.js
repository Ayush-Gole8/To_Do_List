const cards = document.querySelectorAll('.algorithm-card');
const desc = document.getElementById('description');
const startBtn = document.getElementById('startBtn');
let selectedAlgo = null;

const details = {
  FIFO: `<h2>FIFO (First-In, First-Out)</h2>
         <p>The simplest page replacement algorithm. Pages are removed in the order they arrived. No consideration is given to how often or how recently a page is used.</p>
         <ul>
           <li>Easy to implement</li>
           <li>Can suffer from Belady's anomaly</li>
         </ul>`,
  LRU: `<h2>LRU (Least Recently Used)</h2>
        <p>Replaces the page that has not been used for the longest time. It approximates the optimal algorithm without knowing the future.</p>
        <ul>
          <li>Better hit rate than FIFO</li>
          <li>Requires tracking usage history</li>
        </ul>`,
  Optimal: `<h2>Optimal</h2>
            <p>Replaces the page that will not be used for the longest time in the future. Gives the best possible page fault rate, but needs future knowledge.</p>
            <ul>
              <li>Used as a benchmark</li>
              <li>Impossible to implement in real OS</li>
            </ul>`
};

cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    selectedAlgo = card.dataset.algo;
    desc.innerHTML = details[selectedAlgo];
    startBtn.href = `simulator.html?algorithm=${selectedAlgo}`;
    startBtn.removeAttribute('aria-disabled');
  });
});
