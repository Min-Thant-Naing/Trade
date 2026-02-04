// Trading PrecisionCalc Logic
let currentMode = 'SP1!'; // SP1! is ES1!
let currentModeNews = 'today';
let calcHistory = [];
let currentSettingsMode = 'SP1!'; // New state variable for the settings modal inputs
let currentSettingsModeTime = 'NY'; 
let events = [];       // global
let activeTime = null; // global
let timesAll = []; // store all times for the current day
let timesVisibleCount = 3; // show only 3 initially
let timePage = 0; // current page of times
const timesPerPage = 3; // show only 3 times at a time

// Default Values for Settings
const defaultSettings = {
    riskAmount: 500,
    esFixedValue: 101.01,
    nqFixedValue: 100.172,
};

let userSettings = { ...defaultSettings };

// DOM Elements (Main UI)
const inputPoints = document.getElementById('points');
const container = document.getElementById("events-container");
const timeList = document.getElementById("time-list");
const btnSP1 = document.getElementById('btn-sp1');
const btnNQ1 = document.getElementById('btn-nq1');
const btnTM = document.getElementById('btn-tm');
const btnTD = document.getElementById('btn-td');
const btnYS = document.getElementById('btn-ys');
const btnCalculate = document.getElementById('calculate-btn');
const containerResult = document.getElementById('result-container');
const valueResult = document.getElementById('result-value');
const btnCopy = document.getElementById('copy-btn');
const textCopy = document.getElementById('copy-text');
const arrowLeft = document.getElementById('time-prev');
const arrowRight = document.getElementById('time-next');
const todoInput = document.getElementById("todo-input");

// Settings Modal DOM Elements (New)
const settingsModal = document.getElementById('settings-modal');
const settingsPanel = document.getElementById('settings-panel'); // For the slide transition
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

// Settings Inputs and Buttons
const riskAmountInput = document.getElementById('risk-amount-input');
const saveRiskBtn = document.getElementById('save-risk-btn');
const esNqFixedValueInput = document.getElementById('es-nq-fixed-value-input');
const btnEsSettings = document.getElementById('btn-es-settings');
const btnNqSettings = document.getElementById('btn-nq-settings');
const btnNySettings = document.getElementById('btn-ny-settings');
const btnMySettings = document.getElementById('btn-my-settings');
const saveFixedBtn = document.getElementById('save-fixed-btn');
const resetDefaultsBtn = document.getElementById('reset-defaults-btn');





// Load Data and Settings
function init() {
    
    // Load History (if implemented later)
    const saved = localStorage.getItem('trading_calc_history_v2');
    if (saved) {
        calcHistory = JSON.parse(saved);
    }

    // Load Settings from LocalStorage
    const savedSettings = localStorage.getItem('trading_calc_settings');
    if (savedSettings) {
        userSettings = JSON.parse(savedSettings);
    }
    
    // Update UI with loaded settings (e.g. default value text)
    updateSettingsUI();
    updateModeUI(); // Also call this to set initial active states
    updateModeNewsUI();

    if (inputPoints) {
        inputPoints.focus();
    }
}

function updateModeUI() {
    // ... existing updateModeUI logic for main calculator ...
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

function updateModeNewsUI() {
    // ... existing updateModeUI logic for main calculator ...
    const activeClass = "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]";
    const inactiveClass = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

    if (currentModeNews === 'today') {
        btnTD.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnYS.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        btnTM.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
    } else if (currentModeNews === 'yesterday') {
        btnYS.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnTD.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        btnTM.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
    } else {
        btnTM.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnTD.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        btnYS.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
    }
}

function calculate() {
    const p = parseFloat(inputPoints.value);
    if (isNaN(p) || p <= 0) {
        alert("Please enter a valid point value.");
        return;
    }

    let result;
    // Use dynamic settings for calculation
    if (currentMode === 'SP1!') {
        result = userSettings.riskAmount / (p * userSettings.esFixedValue);
    } else {
        result = userSettings.riskAmount / (p * userSettings.nqFixedValue);
    }

    // Display Result
    valueResult.textContent = result.toFixed(2);
    containerResult.classList.remove('hidden');

    // Reset copy button
    textCopy.textContent = "Copy to Clipboard";
    btnCopy.classList.remove('bg-emerald-500', 'text-white');
}

// Settings Modal Functions (With Animations)
function openSettingsModal() {
    // Sync inputs with current user settings before opening
    riskAmountInput.value = userSettings.riskAmount;
    // Sync the mode switcher input to match the currently selected mode's value
    esNqFixedValueInput.value = (currentSettingsMode === 'SP1!') ? userSettings.esFixedValue : userSettings.nqFixedValue;

    settingsModal.classList.remove('hidden'); // Make the background visible
    
    // Use a slight timeout to allow the browser to render the modal wrapper
    // before applying the 'translate-x-0' class to trigger the CSS transition
    setTimeout(() => {
        settingsPanel.classList.remove('translate-x-full');
        // Ensure the backdrop opacity also transitions in
        settingsModal.classList.remove('opacity-0');
        settingsModal.classList.add('opacity-100');
    }, 10); 
}

function closeSettingsModal() {
    settingsPanel.classList.add('translate-x-full'); // Start sliding out

    // Fade out backdrop and then hide entirely after transition completes (300ms)
    settingsModal.classList.remove('opacity-100');
    settingsModal.classList.add('opacity-0');

    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 300); // Must match the Tailwind transition duration (duration-300)
}

function updateSettingsUI() {
    // Update the default display text based on current settings 
    // document.getElementById('default-risk-value').textContent = userSettings.riskAmount;
    // document.getElementById('default-es-value').textContent = userSettings.esFixedValue;
    // document.getElementById('default-nq-value').textContent = userSettings.nqFixedValue;
    // The calculation will use `userSettings` automatically after init() runs
}

function saveSettingsToLocalStorage() {
    // Store the current userSettings object as a JSON string
    localStorage.setItem('trading_calc_settings', JSON.stringify(userSettings));
}

function handleSaveRisk() {
    const newRisk = parseFloat(riskAmountInput.value);
    if (!isNaN(newRisk) && newRisk > 0) {
        userSettings.riskAmount = newRisk;
        saveSettingsToLocalStorage();
        updateSettingsUI();
        alert("Risk amount saved!");
    } else {
        alert("Please enter a valid risk amount.");
    }
}

function handleSaveFixed() {
    const newValue = parseFloat(esNqFixedValueInput.value);
    if (!isNaN(newValue) && newValue > 0) {
        if (currentSettingsMode === 'SP1!') {
            userSettings.esFixedValue = newValue;
            alert("ES fixed value saved!");
        } else {
            userSettings.nqFixedValue = newValue;
            alert("NQ fixed value saved!");
        }
        saveSettingsToLocalStorage();
        updateSettingsUI();
    } else {
        alert("Please enter a valid fixed value.");
    }
}

// Function to manage the visual active state of the ES/NQ buttons in the settings panel
function updateSettingsModeButtonsUI() {
    // These classes match the design provided by the user
    const activeClass = "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]";
    
    // Updated inactiveClass definition for consistency:
    const inactiveClass = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

    if (currentSettingsMode === 'SP1!') {
        btnEsSettings.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnNqSettings.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        esNqFixedValueInput.value = userSettings.esFixedValue; // Sync input value
    } else {
        btnNqSettings.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnEsSettings.className = `flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        esNqFixedValueInput.value = userSettings.nqFixedValue; // Sync input value
    }
}

function updateSettingsModeButtonsUITime() {
    const activeClass = "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]";
    const inactiveClass = "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

    if (currentSettingsModeTime === 'NY') {
        btnNySettings.className = `flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnMySettings.className = `flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        // esNqFixedValueInput.value = userSettings.esFixedValue;
    } else {
        btnMySettings.className = `flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${activeClass}`;
        btnNySettings.className = `flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${inactiveClass}`;
        // esNqFixedValueInput.value = userSettings.nqFixedValue;
    }
}

function updateModeUI() {
    // ... existing updateModeUI logic for main calculator ...
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


function handleResetDefaults() {
    if (confirm("Are you sure you want to reset all settings to factory defaults?")) {
        userSettings = { ...defaultSettings };
        saveSettingsToLocalStorage();
        updateSettingsUI();
        closeSettingsModal();
        alert("All settings reset to defaults.");
    }
}


// Event Listeners (Main UI)
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

btnTD.addEventListener('click', () => {
    currentModeNews = 'today';
    updateModeNewsUI();
    const filteredEvents = getFilteredEvents();
    const times = [...new Set(filteredEvents.map(getLocalTimeOnly))].sort();
    activeTime = times[0] || null;
    timePage = 0; // reset pagination
    renderTimes();
    renderEvents();
});

btnYS.addEventListener('click', () => {
    currentModeNews = 'yesterday';
    updateModeNewsUI();
    const filteredEvents = getFilteredEvents();
    const times = [...new Set(filteredEvents.map(getLocalTimeOnly))].sort();
    activeTime = times[0] || null;
    timePage = 0;
    renderTimes();
    renderEvents();
});

btnTM.addEventListener('click', () => {
    currentModeNews = 'tomorrow';
    updateModeNewsUI();
    const filteredEvents = getFilteredEvents();
    const times = [...new Set(filteredEvents.map(getLocalTimeOnly))].sort();
    activeTime = times[0] || null;
    timePage = 0;
    renderTimes();
    renderEvents();
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

// Event Listeners (Settings Modal)
openSettingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);
saveRiskBtn.addEventListener('click', handleSaveRisk);
saveFixedBtn.addEventListener('click', handleSaveFixed);
resetDefaultsBtn.addEventListener('click', handleResetDefaults);

// Listeners for the ES/NQ switch within the settings panel
btnEsSettings.addEventListener('click', () => {
    currentSettingsMode = 'SP1!';
    updateSettingsModeButtonsUI();
});
btnNqSettings.addEventListener('click', () => {
    currentSettingsMode = 'NQ1!';
    updateSettingsModeButtonsUI();
});


function convertTimeBetweenZones(timeStr, fromZone, toZone) {
    // timeStr = "HH:MM"
    let [hour, minute] = timeStr.split(":").map(Number);

    // NY offset = -13 for your current code, MY offset = -12
    const offsets = { NY: -13, MY: -12 };

    let diff = offsets[toZone] - offsets[fromZone]; // e.g., NY->MY = -12 - (-13) = 1
    hour += diff;

    if (hour < 0) hour += 24;
    if (hour >= 24) hour -= 24;

    return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
}

// Listeners for the MY/NY switch within the settings panel
btnNySettings.addEventListener('click', () => {
    if (currentSettingsModeTime === 'MY') {
        activeTime = convertTimeBetweenZones(activeTime, 'MY', 'NY');
    }
    currentSettingsModeTime = 'NY';
    updateSettingsModeButtonsUITime();
    renderTimes();
});

btnMySettings.addEventListener('click', () => {
    if (currentSettingsModeTime === 'NY') {
        activeTime = convertTimeBetweenZones(activeTime, 'NY', 'MY');
    }
    currentSettingsModeTime = 'MY';
    updateSettingsModeButtonsUITime();
    renderTimes();
});


// Close modal if user clicks outside of the content area
window.onclick = function(event) {
  if (event.target == settingsModal) {
    closeSettingsModal();
  }
}

// news data fetch and display



// Convert event date+time to NY 24h format
function convertToLocalTime24(dateStr, timeStr) {
    const [month, day, year] = dateStr.split("-").map(Number);
    let [hour, minute] = timeStr.replace(/(am|pm)/i, "").split(":").map(Number);
    const isPM = /pm/i.test(timeStr);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

    let offsetHours = 0;

    if (currentSettingsModeTime === 'NY') offsetHours = -13; 
    if (currentSettingsModeTime === 'MY') offsetHours = -12; 

    const adjustedTime = new Date(utcDate.getTime() + offsetHours * 60 * 60000);

    const adjHour = String(adjustedTime.getHours()).padStart(2, "0");
    const adjMinute = String(adjustedTime.getMinutes()).padStart(2, "0");
    const adjMonth = String(adjustedTime.getMonth() + 1).padStart(2, "0");
    const adjDay = String(adjustedTime.getDate()).padStart(2, "0");
    const adjYear = adjustedTime.getFullYear();

    return `${adjMonth}-${adjDay}-${adjYear} ${adjHour}:${adjMinute}`;
}

// Only get the time part
function getLocalTimeOnly(ev) {
    return convertToLocalTime24(ev.date, ev.time).split(" ")[1];
}


// Filter events based on selected news mode
function getFilteredEvents() {
    if (!events.length) return [];

    const now = new Date();
    const nyOffset = -5 * 60;
    const nyDate = new Date(now.getTime() + (now.getTimezoneOffset() - nyOffset) * 60000);

    let baseDate = new Date(nyDate);
    if (currentModeNews === 'yesterday') baseDate.setDate(baseDate.getDate() - 1);
    if (currentModeNews === 'tomorrow') baseDate.setDate(baseDate.getDate() + 1);

    const m = String(baseDate.getMonth() + 1).padStart(2, "0");
    const d = String(baseDate.getDate()).padStart(2, "0");
    const y = baseDate.getFullYear();
    const targetDate = `${m}-${d}-${y}`;

    return events.filter(ev => ev.date === targetDate);
}

function formatTimeLabel(time24) {
    if (currentSettingsModeTime !== 'MY') {
        return time24; // NY → 24h
    }

    let [hour, minute] = time24.split(":").map(Number);

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// --- RENDERING ---
function renderTimes() {
    const filteredEvents = getFilteredEvents();
    
    // --- NO EVENTS CASE ---
    if (!filteredEvents.length) {
        timeList.innerHTML = `
        `;
        activeTime = null;
        arrowLeft.innerHTML = `
        `;
        arrowRight.innerHTML = `
        `;
        // arrowLeft.style.visibility = "hidden";
        // arrowRight.style.visibility = "hidden";
        
        // Disable NY/MY buttons
        btnNySettings.disabled = true;
        btnMySettings.disabled = true;

        // Optional: visually show disabled state
        btnNySettings.classList.add('opacity-50');
        btnMySettings.classList.add('opacity-50');
        
        return;
    }

    // --- ENABLE BUTTONS IF EVENTS EXIST ---
    btnNySettings.disabled = false;
    btnMySettings.disabled = false;
    arrowLeft.innerHTML = `‹
        `;
    arrowRight.innerHTML = `›
    `;
    btnNySettings.classList.remove('opacity-50');
    btnMySettings.classList.remove('opacity-50');

    // --- NORMAL TIMES RENDERING ---
    timesAll = [...new Set(filteredEvents.map(getLocalTimeOnly))].sort();
    activeTime = activeTime || timesAll[0];

    const start = timePage;
    const end = Math.min(start + timesPerPage, timesAll.length);
    const timesToShow = timesAll.slice(start, end);

    timeList.innerHTML = timesToShow.map(time => {
        const isActive = time === activeTime;
        return `
            <span data-time="${time}" class="inline-flex flex-auto min-w-[80px] max-w-[120px] justify-center py-2 px-10 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all duration-200
            ${isActive ? "bg-white dark:bg-slate-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-[1.02]" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}">
                ${formatTimeLabel(time)}
            </span>
        `;
    }).join("");

    arrowLeft.style.visibility = (start > 0) ? "visible" : "hidden";
    arrowRight.style.visibility = (end < timesAll.length) ? "visible" : "hidden";

    arrowLeft.onclick = () => {
        if (timePage > 0) {
            timePage--;
            renderTimes();
        }
    };
    arrowRight.onclick = () => {
        if (end < timesAll.length) {
            timePage++;
            renderTimes();
        }
    };
}

function renderEvents() {
    if (!activeTime) {
        container.innerHTML = "<p>No events to display.</p>";
        return;
    }
    const filteredEvents = getFilteredEvents();
    container.innerHTML = filteredEvents
        .filter(ev => getLocalTimeOnly(ev) === activeTime)
        .map(ev => {
        let impactClass = "bg-yellow-400 dark:bg-yellow-600"; // default low impact
        if (ev.impact === "Medium") impactClass = "bg-orange-400 dark:bg-orange-600";
        else if (ev.impact === "High") impactClass = "bg-red-500 dark:bg-red-600";
            return `
                <div class="flex items-center gap-3 py-3 text-xs text-slate-400 dark:text-slate-400 font-semibold">
                    <span class="w-2 h-2 rounded-full inline-block border  border-slate-200 dark:border-transparent ${impactClass}"></span>
                    <span class="flex-1">${ev.title}</span>
                </div>                
            `;
        }).join("");
}
// --- LOAD EVENTS ---
async function loadEvents() {
    try {
        const res = await fetch("/calendar");
        events = await res.json();
        if (!events || events.length === 0) {
            container.innerHTML = "<p>No USD events available.</p>";
            return;
        }

        renderTimes();
        renderEvents();

        // CLICK HANDLER
        timeList.onclick = e => {
            const el = e.target.closest("[data-time]");
            if (!el) return;
            activeTime = el.dataset.time;
            renderTimes();
            renderEvents();
        };
    } catch (err) {
        container.innerHTML = "<p>Failed to load events.</p>";
        console.error(err);
    }
}

// note session storage for todo list

// Persistent note state for To-Do
let noteState = {
    text: ""
};

// Load note from localStorage if available
function loadNoteLocal() {
    const saved = localStorage.getItem("todo_note");
    if (saved) {
        try {
            noteState = JSON.parse(saved);
            todoInput.value = noteState.text || "";
        } catch (err) {
            console.warn("Failed to parse saved note, resetting...", err);
            noteState = { text: "" };
            todoInput.value = "";
            localStorage.removeItem("todo_note"); // optional: clean bad data
        }
    }
}
// Save note to localStorage
function saveNoteLocal(text) {
    noteState.text = text;
    localStorage.setItem("todo_note", JSON.stringify(noteState));
}

let todoSaveTimer = null;

todoInput.addEventListener("input", () => {
    const note = todoInput.value;
    saveNoteLocal(note);
    adjustTextareaHeight();
});

function adjustTextareaHeight() {
    const maxHeight = 300; // max height in pixels
    todoInput.style.height = 'auto'; // reset height to recalc scrollHeight
    const newHeight = Math.min(todoInput.scrollHeight, maxHeight);
    todoInput.style.height = newHeight + 'px';
    
    // Optional: show scrollbar if max reached
    if (todoInput.scrollHeight > maxHeight) {
        todoInput.style.overflowY = 'auto';
    } else {
        todoInput.style.overflowY = 'hidden';
    }
}


loadNoteLocal();
adjustTextareaHeight();
loadEvents();
init();
