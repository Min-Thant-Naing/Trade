// Trading PrecisionCalc Logic
let currentMode = 'SP1!'; // SP1! is ES1!
let calcHistory = [];
let currentSettingsMode = 'SP1!'; // New state variable for the settings modal inputs

// Default Values for Settings
const defaultSettings = {
    riskAmount: 500,
    esFixedValue: 101.01,
    nqFixedValue: 100.172,
};

let userSettings = { ...defaultSettings };

// DOM Elements (Main UI)
const inputPoints = document.getElementById('points');
const btnSP1 = document.getElementById('btn-sp1');
const btnNQ1 = document.getElementById('btn-nq1');
const btnCalculate = document.getElementById('calculate-btn');
const containerResult = document.getElementById('result-container');
const valueResult = document.getElementById('result-value');
const btnCopy = document.getElementById('copy-btn');
const textCopy = document.getElementById('copy-text');

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


// Close modal if user clicks outside of the content area
window.onclick = function(event) {
  if (event.target == settingsModal) {
    closeSettingsModal();
  }
}

init();


