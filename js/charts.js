// --- Chart Color Palettes ---
const lightThemeColors = {
    coreDonut: ['#4f46e5', '#6366f1', '#818cf8'], // Indigo
    growthArea: ['#8b5cf6'], // Violet
    textColor: '#374151', // gray-700
    secondaryTextColor: '#6b7280', // gray-500
    gridColor: '#e5e7eb' // gray-200
};

const darkThemeColors = {
    coreDonut: ['#818cf8', '#a5b4fc', '#c7d2fe'], // Lighter Indigo
    growthArea: ['#a78bfa'], // Lighter Violet
    textColor: '#d1d5db', // gray-300
    secondaryTextColor: '#9ca3af', // gray-400
    gridColor: '#4b5563' // gray-600
};

let currentThemeColors = lightThemeColors; // Default

// --- Implementation Card Highlighting ---
const implementationCardMap = { 0: 'impl-card-global', 1: 'impl-card-europe', 2: 'impl-card-em' };
const coreRationaleDisplay = document.getElementById('core-rationale-display');
const allImplementationCards = document.querySelectorAll('.implementation-card');

const coreRationales = {
    0: "Broad global diversification across developed markets. Low cost and accumulating strategy captures long-term growth.",
    1: "Targeted exposure to established European economies. Offers diversification and potential valuation opportunities.",
    2: "Access to faster-growing emerging economies. Higher potential returns, balanced by higher risk, within a diversified core.",
};

function highlightImplementationCard(seriesIndex, shouldHighlight) {
    const cardId = implementationCardMap[seriesIndex];
    if (cardId) {
        const cardElement = document.getElementById(cardId);
        if (cardElement) {
            cardElement.classList.toggle('highlight-card', shouldHighlight);
        }
    }
    if (coreRationaleDisplay) {
        coreRationaleDisplay.textContent = (shouldHighlight && coreRationales.hasOwnProperty(seriesIndex))
            ? coreRationales[seriesIndex]
            : '';
    }
}

function clearCoreHighlights() {
    allImplementationCards.forEach(card => card.classList.remove('highlight-card'));
    if (coreRationaleDisplay) {
        coreRationaleDisplay.textContent = '';
    }
    // Note: Deselecting ApexCharts slice programmatically can be complex, skipping for now.
}

// --- Core Allocation Chart (Donut) ---
let coreChart;
const coreAllocationData = {
    series: [60, 20, 20],
    labels: ['Global Developed ETF (€300)', 'Europe ETF (€100)', 'Emerging Markets ETF (€100)'],
};

function getCoreAllocationOptions(isDark = false) {
    const colors = isDark ? darkThemeColors : lightThemeColors;
    return {
        chart: {
            type: 'donut', height: 350, fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            background: 'transparent',
            events: {
                dataPointSelection: function (event, chartContext, config) {
                    clearCoreHighlights();
                    highlightImplementationCard(config.dataPointIndex, true);
                },
                mouseLeave: function(event, chartContext, config) {
                    // Option: Clear highlights when mouse leaves the chart area
                    // clearCoreHighlights();
                }
                // Add clickOutside event listener if needed for reliable deselection
            }
        },
        series: coreAllocationData.series,
        labels: coreAllocationData.labels,
        colors: colors.coreDonut,
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(0)}%`,
            style: { fontSize: '12px', colors: ['#ffffff'] }, // Keep white for better contrast on segments
            dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.45 }
        },
        legend: {
            position: 'bottom', fontSize: '12px',
            labels: { colors: colors.textColor },
            markers: { width: 12, height: 12, radius: 12, },
            itemMargin: { horizontal: 5, vertical: 5 }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '16px', fontWeight: 600, color: colors.textColor, },
                        value: {
                            show: true, fontSize: '14px', color: colors.secondaryTextColor,
                            formatter: function (val, opts) {
                                const label = opts.w.globals.labels[opts.seriesIndex];
                                const amountMatch = label.match(/€(\d+)/);
                                return amountMatch ? `€${amountMatch[1]}` : '';
                            }
                        },
                        total: {
                            show: true, showAlways: true, label: 'Core ETF Monthly',
                            fontSize: '14px', fontWeight: 'normal', color: colors.secondaryTextColor,
                            formatter: () => '€500 / month'
                        }
                    }
                }
            }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (value) => {
                    const amount = (value / 100 * 500).toFixed(0);
                    return `€${amount} (${value.toFixed(0)}%)`;
                },
                title: { formatter: (seriesName) => seriesName.split('(')[0].trim() }
            }
        },
        stroke: {
           show: true,
           width: 2,
           colors: [isDark ? '#1f2937' : '#ffffff'] // Match dark/light bg for border
        },
        responsive: [{ breakpoint: 480, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }]
    };
}

function renderCoreChart(isDark = false) {
    const options = getCoreAllocationOptions(isDark);
    const chartEl = document.querySelector("#coreAllocationChart");
    if (!chartEl) return;

    if (coreChart) {
        coreChart.updateOptions(options);
    } else {
        coreChart = new ApexCharts(chartEl, options);
        coreChart.render();
    }
}

// --- Growth Projection Chart & Controls ---
const inputMonthly = document.getElementById('input-monthly');
const inputRate = document.getElementById('input-rate');
const rateValueSpan = document.getElementById('rate-value');
const inputYears = document.getElementById('input-years');
let growthChart;

function calculateGrowth(initial, monthly, years, rate) {
    let balance = initial;
    const monthlyRate = rate / 12;
    const data = [{ x: new Date().getFullYear(), y: balance }];
    let currentYear = new Date().getFullYear();
    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            balance = balance * (1 + monthlyRate) + monthly;
        }
        currentYear++;
        data.push({ x: currentYear, y: Math.round(balance) });
    }
    return data;
}

function updateGrowthChart() {
    if (!inputMonthly || !inputRate || !inputYears || !rateValueSpan || !growthChart) return;

    const monthly = parseFloat(inputMonthly.value) || 0;
    const rate = parseFloat(inputRate.value) / 100 || 0;
    const years = parseInt(inputYears.value) || 0;
    rateValueSpan.textContent = `${parseFloat(inputRate.value).toFixed(1)}%`;

    const newGrowthData = calculateGrowth(0, monthly, years, rate);
    growthChart.updateSeries([{ data: newGrowthData }]);
}

function getGrowthChartOptions(isDark = false) {
    const colors = isDark ? darkThemeColors : lightThemeColors;
    const initialMonthly = parseFloat(inputMonthly?.value) || 600;
    const initialRate = parseFloat(inputRate?.value) / 100 || 0.07;
    const initialYears = parseInt(inputYears?.value) || 20;
    const initialGrowthData = calculateGrowth(0, initialMonthly, initialYears, initialRate);

    return {
        chart: {
            type: 'area', height: 350, fontFamily: 'Inter, sans-serif',
            zoom: { enabled: false }, toolbar: { show: false },
            background: 'transparent'
        },
        series: [{ name: 'Projected Value', data: initialGrowthData }],
        colors: colors.growthArea,
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] } },
        xaxis: {
            type: 'numeric',
            title: { text: 'Year', style: { color: colors.secondaryTextColor, fontSize: '12px', fontWeight: 400, } },
            labels: { formatter: (value) => Math.round(value), style: { colors: colors.secondaryTextColor } },
            axisBorder: { color: colors.gridColor },
            axisTicks: { color: colors.gridColor },
        },
        yaxis: {
            title: { text: 'Portfolio Value (€)', style: { color: colors.secondaryTextColor, fontSize: '12px', fontWeight: 400, } },
            labels: {
                formatter: (value) => "€" + value.toLocaleString('de-DE'),
                style: { colors: colors.secondaryTextColor }
             }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            x: { formatter: (value) => `End of Year: ${Math.round(value)}` },
            y: {
                formatter: (value) => "€" + value.toLocaleString('de-DE'),
                title: { formatter: (seriesName) => seriesName + ':' }
            }
        },
        grid: { borderColor: colors.gridColor, strokeDashArray: 4 }
    };
}

function renderGrowthChart(isDark = false) {
    const options = getGrowthChartOptions(isDark);
    const chartEl = document.querySelector("#growthChart");
    if (!chartEl) return;

    if (growthChart) {
        growthChart.updateOptions(options);
    } else {
        growthChart = new ApexCharts(chartEl, options);
        growthChart.render();
    }

    // Initial setup for rate display
    if (rateValueSpan && inputRate) {
        rateValueSpan.textContent = `${parseFloat(inputRate.value).toFixed(1)}%`;
    }

    // Attach listeners only once
    if (inputMonthly && inputRate && inputYears && !inputMonthly.dataset.listenerAttached) {
        inputMonthly.addEventListener('input', updateGrowthChart);
        inputRate.addEventListener('input', updateGrowthChart);
        inputYears.addEventListener('input', updateGrowthChart);
        inputMonthly.dataset.listenerAttached = 'true'; // Mark as attached
    }
}

// --- Theme Update Listener ---
function handleThemeChange(event) {
    const isDark = event.detail.isDark;
    currentThemeColors = isDark ? darkThemeColors : lightThemeColors;
    // Update charts with new theme colors
    renderCoreChart(isDark);
    renderGrowthChart(isDark);
}

// --- Initialization Export ---
export function initCharts() {
    const isInitiallyDark = document.documentElement.classList.contains('dark');
    currentThemeColors = isInitiallyDark ? darkThemeColors : lightThemeColors;

    renderCoreChart(isInitiallyDark);
    renderGrowthChart(isInitiallyDark);

    // Listen for theme changes dispatched from ui.js
    window.addEventListener('themeChanged', handleThemeChange);
} 