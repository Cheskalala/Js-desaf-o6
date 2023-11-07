document.addEventListener("DOMContentLoaded", function () {
    const amountInput = document.getElementById("amount");
    const currencySelect = document.getElementById("currency");
    const resultText = document.getElementById("result");
    const errorText = document.getElementById("error");
    const chartCanvas = document.getElementById("chart").getContext("2d");

    document.getElementById("convert").addEventListener("click", () => {
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        const apiUrl = `https://mindicador.cl/api/${currency}`;

        try {
            fetch(apiUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (data.serie) {
                        const exchangeRate = data.serie[0].valor;
                        const convertedAmount = amount / exchangeRate;
                        resultText.innerText = `El monto en ${currency} es: ${convertedAmount.toFixed(2)}`;
                    } else {
                        resultText.innerText = "Datos de conversión no disponibles.";
                    }
                })
                .catch((error) => {
                    errorText.innerText = "Error al consultar la API. Por favor, inténtalo de nuevo más tarde.";
                    console.error(error);
                });
        } catch (error) {
            errorText.innerText = "Error inesperado en la conversión.";
            console.error(error);
        }
    });

    // Chart.js setup
    const chartData = {
        labels: [], // Fechas
        datasets: [
            {
                label: "Valor de la moneda",
                data: [], // Valores
                fill: false,
                borderColor: "#00eaff",
            },
        ],
    };

    const chartConfig = {
        type: "line",
        data: chartData,
        
    };

    const chart = new Chart(chartCanvas, chartConfig);

    currencySelect.addEventListener("change", () => {
        const selectedCurrency = currencySelect.value;
        const historyUrl = `https://mindicador.cl/api/${selectedCurrency}`;

        try {
            fetch(historyUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (data.serie) {
                        const history = data.serie.slice(0, 10); // Últimos 10 días
                        const dates = history.map((item) => {
                            const date = new Date(item.fecha);
                            return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear().toString().slice(-2)}`; // formato dd-mm-yy
                        });
                        const values = history.map((item) => item.valor);

                        chartData.labels = dates.reverse();
                        chartData.datasets[0].data = values.reverse();
                        chart.update();
                    }
                })
                .catch((error) => {
                    console.error("Error al cargar el historial de la moneda:", error);
                });
        } catch (error) {
            console.error("Error inesperado en la carga del historial de la moneda:", error);
        }
    });
});
