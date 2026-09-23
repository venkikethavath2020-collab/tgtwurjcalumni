// Budget Modal — charts + open/close logic
export function initBudgetModal() {
    const budgetModal = document.getElementById("budgetModal");
    const budgetBtn = document.getElementById("budgetDetailsBtn");
    const closeBudget = document.getElementById("closeBudget");
  
    if (!budgetModal) return;
  
    let chartsReady = false;
    let overviewChart, batchChart, expenseChart;
  
    const INK = "#0F2E2D";
    const CORAL = "#E85A4A";
    const SUN = "#F5C84C";
    const MUTED = "#5C6B6A";
    const LEAF = "#3F7A5F";
  
    const batchLabels = ["2007", "2008", "2009", "2010", "2011", "2012", "2013"];
    const batchValues = [41000, 24000, 30000, 21000, 31000, 20000, 24000];
  
    const expenseItems = [
      { label: "Food", value: 40000 },
      { label: "Tent", value: 22000 },
      { label: "Plants", value: 11000 },
      { label: "Photography", value: 8000 },
      { label: "Pens", value: 7750 },
      { label: "Mementos", value: 7000 },
      { label: "Sweets", value: 6000 },
      { label: "Student Gift", value: 4560 },
      { label: "Badges", value: 4300 },
      { label: "Sound", value: 4000 },
    ];
  
    function rupee(n) {
      return "₹" + Number(n).toLocaleString("en-IN");
    }
  
    function initCharts() {
      if (chartsReady || typeof Chart === "undefined") return;
      chartsReady = true;
  
      const overviewEl = document.getElementById("budgetOverviewChart");
      const batchEl = document.getElementById("budgetBatchChart");
      const expenseEl = document.getElementById("budgetExpenseChart");
      if (!overviewEl || !batchEl || !expenseEl) return;
  
      const centerPlugin = {
        id: "centerText",
        afterDraw(chart) {
          if (chart.canvas.id !== "budgetOverviewChart") return;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = (chartArea.top + chartArea.bottom) / 2;
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = MUTED;
          ctx.font = "600 11px Inter, system-ui, sans-serif";
          ctx.fillText("RECEIVED", cx, cy - 12);
          ctx.fillStyle = INK;
          ctx.font = "700 16px Georgia, serif";
          ctx.fillText("₹1,91,000", cx, cy + 10);
          ctx.restore();
        },
      };
      if (!Chart.registry.plugins.get("centerText")) {
        Chart.register(centerPlugin);
      }
  
      overviewChart = new Chart(overviewEl, {
        type: "doughnut",
        data: {
          labels: ["Spent", "Balance"],
          datasets: [
            {
              data: [135348, 55652],
              backgroundColor: [CORAL, SUN],
              borderColor: "#ffffff",
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: INK,
                font: { family: "Inter, system-ui, sans-serif", size: 12, weight: "600" },
                padding: 16,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => " " + ctx.label + ": " + rupee(ctx.raw),
              },
            },
          },
        },
      });
  
      batchChart = new Chart(batchEl, {
        type: "bar",
        data: {
          labels: batchLabels,
          datasets: [
            {
              label: "Contribution",
              data: batchValues,
              backgroundColor: batchValues.map((_, i) => (i % 2 === 0 ? CORAL : SUN)),
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 36,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => " " + rupee(ctx.raw) },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: MUTED,
                font: { family: "Inter, system-ui, sans-serif", size: 11, weight: "600" },
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(15,46,45,0.06)" },
              ticks: {
                color: MUTED,
                font: { family: "Inter, system-ui, sans-serif", size: 10 },
                callback: (v) => "₹" + (v >= 1000 ? v / 1000 + "k" : v),
              },
            },
          },
        },
      });
  
      expenseChart = new Chart(expenseEl, {
        type: "bar",
        data: {
          labels: expenseItems.map((e) => e.label),
          datasets: [
            {
              label: "Expense",
              data: expenseItems.map((e) => e.value),
              backgroundColor: LEAF,
              borderRadius: 6,
              borderSkipped: false,
              maxBarThickness: 28,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => " " + rupee(ctx.raw) },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: "rgba(15,46,45,0.06)" },
              ticks: {
                color: MUTED,
                font: { family: "Inter, system-ui, sans-serif", size: 10 },
                callback: (v) => "₹" + (v >= 1000 ? v / 1000 + "k" : v),
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                color: INK,
                font: { family: "Inter, system-ui, sans-serif", size: 11, weight: "600" },
              },
            },
          },
        },
      });
    }
  
    function openBudget() {
      budgetModal.classList.remove("hidden");
      budgetModal.classList.add("flex");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        initCharts();
        overviewChart?.resize();
        batchChart?.resize();
        expenseChart?.resize();
      });
    }
  
    function closeBudgetModal() {
      budgetModal.classList.add("hidden");
      budgetModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  
    budgetBtn?.addEventListener("click", openBudget);
    closeBudget?.addEventListener("click", closeBudgetModal);
    budgetModal?.addEventListener("click", (e) => {
      if (e.target === budgetModal) closeBudgetModal();
    });
  
    // Expose for external use
    window.openBudgetModal = openBudget;
  }