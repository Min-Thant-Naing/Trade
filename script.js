// Trading PrecisionCalc Logic
let currentMode = 'SP1!';
let calcHistory = [];

// DOM Elements
const inputPoints = document.getElementById('points');
const btnSP1 = document.getElementById('btn-sp1');
const btnNQ1 = document.getElementById('btn-nq1');
const btnCalculate = document.getElementById('calculate-btn');
const containerResult = document.getElementById('result-container');
const valueResult = document.getElementById('result-value');
const btnCopy = document.getElementById('copy-btn');
const textCopy = document.getElementById('copy-text');
const sectionHistory = document.getElementById('history-section');
const listHistory = document.getElementById('history-list');
const btnClearHistory = document.getElementById('clear-history');
const infoBtn = document.getElementById('info-btn');
const infoTooltip = document.getElementById('info-tooltip');

// Load Data
function init() {
    const saved = localStorage.getItem('trading_calc_history_v2');
    if (saved) {
        calcHistory = JSON.parse(saved);
        renderHistory();
    }
    if (inputPoints) {
        inputPoints.focus();
    }
}

function updateModeUI() {
    const activeClass = "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]";
    const inactiveClass = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

    if (currentMode === 'SP1!') {
        btnSP1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnNQ1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
    } else {
        btnNQ1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnSP1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
    }
    containerResult.classList.add('hidden');
}

function calculate() {
    const p = parseFloat(inputPoints.value);
    if (isNaN(p) || p <= 0) {
        alert("Please enter a valid point value.");
        return;
    }

    let result;
    if (currentMode === 'SP1!') {
        result = 500 / (p * 102);
    } else {
        result = 500 / (p * 79.52);
    }

    // Display Result
    valueResult.textContent = result.toFixed(1);
    containerResult.classList.remove('hidden');

    // Add to History
    const entry = {
        mode: currentMode,
        point: p,
        result: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    calcHistory = [entry, ...calcHistory].slice(0, 10);
    localStorage.setItem('trading_calc_history_v2', JSON.stringify(calcHistory));
    renderHistory();

    // Reset copy button
    textCopy.textContent = "Copy to Clipboard";
    btnCopy.classList.remove('bg-emerald-500', 'text-white');
}

function renderHistory() {
    if (calcHistory.length === 0) {
        sectionHistory.classList.add('hidden');
        return;
    }

    sectionHistory.classList.remove('hidden');
    listHistory.innerHTML = calcHistory.map((item) => `
      <div class="bg-white dark:bg-slate-900/50 p-5 rounded-2xl flex justify-between items-center text-sm border border-slate-200 dark:border-white/5 border-l-4 border-l-indigo-600 shadow-md transition-all hover:translate-x-1 hover:shadow-lg">
        <div class="flex flex-col">
          <div class="flex items-center space-x-2 mb-1.5">
            <span class="px-2 py-0.5 rounded-md text-[9px] font-black ${item.mode === 'SP1!' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}">
              ${item.mode}
            </span>
            <span class="text-[8px] text-slate-400 font-medium">${item.timestamp}</span>
          </div>
          <span class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Pt: <span class="text-slate-900 dark:text-slate-100">${item.point}</span></span>
        </div>
        <div class="font-black text-indigo-600 dark:text-indigo-400 text-2xl tabular-nums">
          ${item.result.toFixed(1)}
        </div>
      </div>
    `).join('');
}

// Event Listeners
btnSP1.addEventListener('click', () => {
    currentMode = 'SP1!';
    updateModeUI();
    inputPoints.focus();
});

btnNQ1.addEventListener('click', () => {
    currentMode = 'NQ1!';
    updateModeUI();
    inputPoints.focus();
});

btnCalculate.addEventListener('click', calculate);

inputPoints.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
});

btnCopy.addEventListener('click', () => {
    const val = valueResult.textContent;
    navigator.clipboard.writeText(val).then(() => {
        textCopy.textContent = "Copied!";
        btnCopy.classList.add('bg-emerald-500', 'text-white');
        setTimeout(() => {
            textCopy.textContent = "Copy to Clipboard";
            btnCopy.classList.remove('bg-emerald-500', 'text-white');
        }, 2000);
    });
});

btnClearHistory.addEventListener('click', () => {
    if (confirm("Clear all recent activity?")) {
        calcHistory = [];
        localStorage.removeItem('trading_calc_history_v2');
        renderHistory();
    }
});

infoBtn.addEventListener('mouseenter', () => infoTooltip.classList.remove('hidden'));
infoBtn.addEventListener('mouseleave', () => infoTooltip.classList.add('hidden'));

init();
