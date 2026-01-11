import { GoogleGenAI, Type } from "@google/genai";

// --- Constants ---
const MarketSymbol = {
  SP1: 'SP1!',
  NQ1: 'NQ1!'
};

// --- State Management ---
let currentSymbol = MarketSymbol.SP1;
let isLoading = false;
let history = JSON.parse(localStorage.getItem('trading_calc_history') || '[]');

// --- Initialize Gemini API ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- DOM References ---
const btnSP1 = document.getElementById('btn-sp1');
const btnNQ1 = document.getElementById('btn-nq1');
const pointsInput = document.getElementById('points');
const calculateBtn = document.getElementById('calculate-btn');
const resultsArea = document.getElementById('results-area');
const resultValue = document.getElementById('result-value');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const infoBtn = document.getElementById('info-btn');
const infoTooltip = document.getElementById('info-tooltip');
const copyBtn = document.getElementById('copy-btn');
const copyText = document.getElementById('copy-text');
const historyContainer = document.getElementById('history-container');

const insightText = document.getElementById('insight-text');
const sentimentBadge = document.getElementById('sentiment-badge');
const sourcesContainer = document.getElementById('sources-container');

// --- Functions ---

function updateSymbolUI(symbol) {
  currentSymbol = symbol;
  const activeClass = "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]";
  const inactiveClass = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

  if (symbol === MarketSymbol.SP1) {
    btnSP1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeClass}`;
    btnNQ1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${inactiveClass}`;
  } else {
    btnNQ1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeClass}`;
    btnSP1.className = `flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${inactiveClass}`;
  }
}

function renderHistory() {
  historyContainer.innerHTML = '';
  history.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-slate-900/50 p-4 rounded-2xl flex justify-between items-center text-sm border border-slate-200 dark:border-white/5 border-l-4 border-l-indigo-600 shadow-md transition-all hover:translate-x-1 hover:shadow-lg animate-in fade-in slide-in-from-left-2';
    
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSP1 = item.mode === MarketSymbol.SP1;

    div.innerHTML = `
      <div class="flex flex-col">
        <div class="flex items-center space-x-2 mb-1">
          <span class="px-2 py-0.5 rounded-md text-[9px] font-black ${isSP1 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}">${item.mode}</span>
          <span class="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">${timeStr}</span>
        </div>
        <span class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Entry SL: <span class="text-slate-900 dark:text-slate-100">${item.point} pts</span></span>
      </div>
      <div class="font-black text-indigo-600 dark:text-indigo-400 text-2xl tabular-nums">${item.result.toFixed(1)}</div>
    `;
    historyContainer.appendChild(div);
  });
}

async function fetchAIInsight(symbol, points) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current market sentiment and quick technical analysis for ${symbol} regarding a ${points} point move. Be extremely concise.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "One sentence insight." },
            sentiment: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] }
          },
          required: ["content", "sentiment"]
        }
      }
    });

    const text = response.text || '{"content": "Insights unavailable.", "sentiment": "neutral"}';
    const data = JSON.parse(text);
    
    insightText.textContent = data.content;
    sentimentBadge.textContent = data.sentiment;
    sentimentBadge.className = `px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5 ${
      data.sentiment === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 
      data.sentiment === 'bearish' ? 'bg-rose-500/10 text-rose-400' : 
      'bg-slate-800 text-slate-400'
    }`;

    sourcesContainer.innerHTML = '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          const link = document.createElement('a');
          link.href = chunk.web.uri;
          link.target = "_blank";
          link.className = "px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[8px] font-bold text-slate-500 transition-colors uppercase tracking-tight";
          link.textContent = chunk.web.title.slice(0, 20) + '...';
          sourcesContainer.appendChild(link);
        }
      });
    }
  } catch (err) {
    console.error(err);
    insightText.textContent = "AI insights could not be loaded at this time.";
    sentimentBadge.textContent = "Error";
  }
}

async function handleCalculate() {
  const p = parseFloat(pointsInput.value);
  if (isNaN(p) || p === 0) return;

  isLoading = true;
  calculateBtn.disabled = true;
  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');

  // FORMULA:
  // SP1: 500 / (p * 102)
  // NQ1: 500 / (p * 79.52)
  const calculatedValue = currentSymbol === MarketSymbol.SP1 ? 500 / (p * 102) : 500 / (p * 79.52);
  
  resultValue.textContent = calculatedValue.toFixed(1);
  resultsArea.classList.remove('hidden');
  
  // Update History
  history.unshift({
    mode: currentSymbol,
    point: p,
    result: calculatedValue,
    timestamp: Date.now()
  });
  history = history.slice(0, 10);
  localStorage.setItem('trading_calc_history', JSON.stringify(history));
  renderHistory();

  // Reset insight state
  insightText.textContent = "Fetching real-time insights based on current market data...";
  sentimentBadge.textContent = "Analyzing...";
  sentimentBadge.className = "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-white/5";
  sourcesContainer.innerHTML = '';

  // Trigger Gemini Insight
  fetchAIInsight(currentSymbol, p).finally(() => {
    isLoading = false;
    calculateBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
  });
}

// --- Event Listeners ---

btnSP1.addEventListener('click', () => updateSymbolUI(MarketSymbol.SP1));
btnNQ1.addEventListener('click', () => updateSymbolUI(MarketSymbol.NQ1));

calculateBtn.addEventListener('click', handleCalculate);

pointsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleCalculate();
});

infoBtn.addEventListener('mouseenter', () => infoTooltip.classList.remove('hidden'));
infoBtn.addEventListener('mouseleave', () => infoTooltip.classList.add('hidden'));

copyBtn.addEventListener('click', async () => {
  const value = resultValue.textContent || '';
  try {
    await navigator.clipboard.writeText(value);
    copyText.textContent = "Copied!";
    setTimeout(() => {
      copyText.textContent = "Copy to Clipboard";
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
});

// Initial Setup
updateSymbolUI(MarketSymbol.SP1);
renderHistory();
