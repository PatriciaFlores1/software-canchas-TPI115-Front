document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("chartReservas");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["En", "Fe", "Ma", "Ab", "My", "Jn", "Jl", "Ag", "Sp", "Oc", "Nv", "Dc"],
      datasets: [{
        label: "Reservas",
        data: [10, 25, 20, 40, 30, 15, 28, 22, 32, 27, 38, 40],
        backgroundColor: "#333A56",
        borderRadius: 6,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#E3E6EC" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#E3E6EC" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      }
    }
  });
});
