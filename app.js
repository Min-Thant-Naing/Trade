const sp1Btn = document.getElementById('sp1Btn');
const nq1Btn = document.getElementById('nq1Btn');
const calculateBtn = document.getElementById('calculateBtn');
const pointsInput = document.getElementById('points');
const resultContainer = document.getElementById('resultContainer');
const resultValue = document.getElementById('resultValue');
const copyBtn = document.getElementById('copyBtn');
const historyContainer = document.getElementById('historyContainer');

let mode = 'SP1';
let history = JSON.parse(localStorage.getItem('trading_calc_history') || '[]');

function updateModeButtons() {
  sp1Btn.classList.toggle('bg-white', mode === 'SP1');
  nq1Btn.classList.toggle('bg-white', mode === 'NQ1');
}
updateModeButtons();

sp1Btn.addEventListener('click', () => {
  mode = 'SP1';
  updateModeButtons();
});

nq1Btn.addEventListener('click', () => {
  mode = 'NQ1';
  updateModeButtons();
});

function renderHistory() {
  historyContainer.innerHTML = '';
  history.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-slate-900/50 p-5 rounded-2xl flex justify-between items-center text-sm border border-slate-200 dark:border-white/5 border-l-4 border-l-indigo-600 shadow-md transition-all hover:translate-x-1 hover:shadow-lg';
    div.innerHTML = `
      <div class="flex flex-col">
        <div class="flex items-center space-x-2 mb-1.5">
          <span class="px-2 py-0.5 rounded-md text-[9px] font-black ${item.mode==='SP1'?'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300':'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}">${item.mode}</span>
          <span class="text-[8px] text-slate-400 font-medium">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <span class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Pt: <span class="text-slate-900 dark:text-slate-100">${item.point}</span></span>
      </div>
      <div class="font-black text-indigo-600 dark:text-indigo-400 text-2xl tabular-nums">${item.result.toFixed(1)}</div>
    `;
    historyContainer.appendChild(div);
  });
}
renderHistory();

calculateBtn.addEventListener('click', () => {
  const p = parseFloat(pointsInput.value);
  if (isNaN(p) || p === 0) return;

  let calculatedValue = mode === 'SP1' ? 500 / (p * 102) : 500 / (p * 79.52);
  resultValue.textContent = calculatedValue.toFixed(1);
  resultContainer.classList.remove('hidden');

  const newResult = { mode, point: p, result: calculatedValue, timestamp: new Date() };
  history.unshift(newResult);
  history = history.slice(0,10);
  localStorage.setItem('trading_calc_history', JSON.stringify(history));
  renderHistory();
});

copyBtn.addEventListener('click', () => {
  if (!resultValue.textContent) return;
  navigator.clipboard.writeText(resultValue.textContent);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
});
