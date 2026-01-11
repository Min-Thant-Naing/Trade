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
        result = 500 / (p * 60.57);
    } else {
        result = 500 / (p * 79.52);
    }

    // Display Result
    valueResult.textContent = result.toFixed(2);
    containerResult.classList.remove('hidden');


    // Reset copy button
    textCopy.textContent = "Copy to Clipboard";
    btnCopy.classList.remove('bg-emerald-500', 'text-white');
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

init();
