let overallChart = null;
let copiesChart = null;

function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

function hypergeometric(k, N, K, n) {
  const numerator = combinations(K, k) * combinations(N - K, n - k);
  const denominator = combinations(N, n);
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function handleCalculation(event) {
  event.preventDefault();

  // Elementos do botão de loading
  const calcBtn = document.getElementById("calculateBtn");
  const btnText = calcBtn.querySelector(".btn-text");
  const spinner = calcBtn.querySelector(".spinner-border");

  // Ativa o estado de loading
  calcBtn.disabled = true;
  btnText.classList.add("d-none");
  spinner.classList.remove("d-none");

  // Adiciona um pequeno delay para o efeito visual do loading ser perceptível
  setTimeout(() => {
    const deckSize = parseInt(document.getElementById("deckSize").value);
    const handSize = parseInt(document.getElementById("handSize").value);
    const cardCount = parseInt(document.getElementById("cardCount").value);
    let minCopies = parseInt(document.getElementById("minCopies").value);
    let maxCopies = parseInt(document.getElementById("maxCopies").value);

    if (minCopies > maxCopies) {
      [minCopies, maxCopies] = [maxCopies, minCopies];
      document.getElementById("minCopies").value = minCopies;
      document.getElementById("maxCopies").value = maxCopies;
    }
    if (maxCopies > cardCount) {
      maxCopies = cardCount;
      document.getElementById("maxCopies").value = maxCopies;
    }
    if (maxCopies > handSize) {
      maxCopies = handSize;
      document.getElementById("maxCopies").value = maxCopies;
    }

    let cumulativeProbability = 0;
    for (let k = minCopies; k <= maxCopies; k++) {
      cumulativeProbability += hypergeometric(k, deckSize, cardCount, handSize);
    }
    const probabilityPercent = cumulativeProbability * 100;

    const resultElement = document.getElementById("result");
    resultElement.innerText = `Chance de comprar entre ${minCopies} e ${maxCopies} cópia(s): ${probabilityPercent.toFixed(
      2
    )}%`;

    let bgClass = "bg-danger-subtle text-danger-emphasis";
    if (probabilityPercent >= 70) {
      bgClass = "bg-success-subtle text-success-emphasis";
    } else if (probabilityPercent >= 40) {
      bgClass = "bg-warning-subtle text-warning-emphasis";
    }
    resultElement.className = `text-center fs-4 fw-bold p-3 rounded-2 ${bgClass}`;

    updateCharts(deckSize, handSize, cardCount, probabilityPercent);

    // Desativa o estado de loading
    calcBtn.disabled = false;
    btnText.classList.remove("d-none");
    spinner.classList.add("d-none");
  }, 300); // 400ms de loading
}

function updateCharts(deckSize, handSize, cardCount, probabilityPercent) {
  const tickColor = "#adb5bd";
  const gridColor = "rgba(255, 255, 255, 0.1)";

  const overallCtx = document.getElementById("overallChart").getContext("2d");
  const successProb = probabilityPercent;
  const failureProb = 100 - successProb;

  if (overallChart) {
    overallChart.data.datasets[0].data = [successProb, failureProb];
    overallChart.update("none"); // 'none' para evitar a animação padrão do Chart.js
  } else {
    overallChart = new Chart(overallCtx, {
      type: "doughnut",
      data: {
        labels: ["Comprar na Mão", "Não Comprar"],
        datasets: [
          {
            data: [successProb, failureProb],
            backgroundColor: ["#6366f1", "#343a40"],
            borderColor: "#1a2233",
            borderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: tickColor },
          },
        },
      },
    });
  }

  const copiesCtx = document.getElementById("copiesChart").getContext("2d");
  const labels = [];
  const probabilities = [];

  for (let k = 0; k <= Math.min(cardCount, handSize); k++) {
    labels.push(`${k} Cópia(s)`);
    const prob = hypergeometric(k, deckSize, cardCount, handSize) * 100;
    probabilities.push(prob);
  }

  if (copiesChart) {
    copiesChart.data.labels = labels;
    copiesChart.data.datasets[0].data = probabilities;
    copiesChart.update("none");
  } else {
    copiesChart = new Chart(copiesCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Probabilidade (%)",
            data: probabilities,
            backgroundColor: "rgba(99, 102, 241, 0.7)",
            borderColor: "#6366f1",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400, // Sincroniza a animação do gráfico com o loading
          easing: "easeOutQuart",
        },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: tickColor, callback: (value) => value + "%" },
            grid: { color: gridColor },
          },
          x: {
            ticks: { color: tickColor },
            grid: { display: false },
          },
        },
      },
    });
  }
}

document
  .getElementById("probabilityForm")
  .addEventListener("submit", handleCalculation);
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("probabilityForm")
    .dispatchEvent(new Event("submit", { cancelable: true }));
});
