const spBtn = document.getElementById("spBtn");
const nqBtn = document.getElementById("nqBtn");
const pointsInput = document.getElementById("pointsInput");
const result = document.getElementById("result");
const calcBtn = document.getElementById("calcBtn");

const infoBtn = document.getElementById("infoBtn");
const infoBox = document.getElementById("infoBox");

let symbol = "SP1!";

// INFO TOGGLE
infoBtn.addEventListener("click", () => {
  infoBox.classList.toggle("hidden");
});

// SYMBOL SWITCH
spBtn.onclick = () => {
  symbol = "SP1!";
  spBtn.classList.add("bg-slate-700", "text-indigo-300");
  nqBtn.classList.remove("bg-slate-700", "text-indigo-300");
  nqBtn.classList.add("text-slate-400");
};

nqBtn.onclick = () => {
  symbol = "NQ1!";
  nqBtn.classList.add("bg-slate-700", "text-indigo-300");
  spBtn.classList.remove("bg-slate-700", "text-indigo-300");
  spBtn.classList.add("text-slate-400");
};

// CALCULATION
calcBtn.onclick = () => {
  const points = parseFloat(pointsInput.value);

  if (!points || points <= 0) {
    result.textContent = "ENTER VALID POINTS";
    result.classList.remove("hidden");
    return;
  }

  const risk = 500;
  const pointValue = symbol === "SP1!" ? 5 : 20;

  const lot = (risk / (points * pointValue)).toFixed(2);

  result.textContent = `LOT SIZE: ${lot}`;
  result.classList.remove("hidden");
};
