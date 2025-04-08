// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize AOS
AOS.init({
  once: true, duration: 600, offset: 50, delay: 0,
});

// --- Mobile Menu Toggle ---
const menuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const iconMenu = document.getElementById('icon-menu');
const iconClose = document.getElementById('icon-close');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
menuButton.addEventListener('click', () => {
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('hidden');
  iconMenu.classList.toggle('hidden');
  iconClose.classList.toggle('hidden');
});
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.add('hidden');
    iconMenu.classList.remove('hidden');
    iconClose.classList.add('hidden');
  });
});

// Core Allocation Chart (Donut)
const coreAllocationOptions = {
  chart: { type: 'donut', height: 350, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, events: { dataPointSelection: function(event, chartContext, config) { clearCoreHighlights(); highlightImplementationCard(config.dataPointIndex, true); } } },
  series: [60, 20, 20],
  labels: ['Global Developed ETF (€300)', 'Europe ETF (€100)', 'Emerging Markets ETF (€100)'],
  colors: ['#4f46e5', '#6366f1', '#818cf8'],
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) { return opts.w.globals.series[opts.seriesIndex].toFixed(0) + '%' },
    style: { fontSize: '12px', colors: ['#ffffff'] },
    dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.45 }
  },
  legend: { position: 'bottom', fontSize: '12px', markers: { width: 12, height: 12, radius: 12, }, itemMargin: { horizontal: 5, vertical: 5 } },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { show: true, fontSize: '16px', fontWeight: 600, color: '#374151', },
          value: {
            show: true,
            fontSize: '14px',
            color: '#6b7280',
            formatter: function (val, opts) {
              const label = opts.w.globals.labels[opts.seriesIndex];
              const amountMatch = label.match(/€(\d+)/);
              return amountMatch ? `€${amountMatch[1]}` : '';
            }
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Core ETF Monthly',
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#6b7280',
            formatter: function (w) { return '€500 / month'; }
          }
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: function(value, { seriesIndex, w }) {
        const amount = (value / 100 * 500).toFixed(0);
        return `€${amount} (${value.toFixed(0)}%)`;
      },
      title: { formatter: function (seriesName) { return seriesName.split('(')[0].trim(); } }
    }
  },
  responsive: [{ breakpoint: 480, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }]
};
const coreChart = new ApexCharts(document.querySelector("#coreAllocationChart"), coreAllocationOptions);
coreChart.render();

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
  const monthly = parseFloat(inputMonthly.value) || 0;
  const rate = parseFloat(inputRate.value) / 100 || 0;
  const years = parseInt(inputYears.value) || 0;
  rateValueSpan.textContent = `${parseFloat(inputRate.value).toFixed(1)}%`;
  const newGrowthData = calculateGrowth(0, monthly, years, rate);
  if (growthChart) {
    growthChart.updateSeries([{ data: newGrowthData }]);
  }
}
const initialMonthly = parseFloat(inputMonthly.value);
const initialRate = parseFloat(inputRate.value) / 100;
const initialYears = parseInt(inputYears.value);
const initialGrowthData = calculateGrowth(0, initialMonthly, initialYears, initialRate);
const growthOptions = {
  chart: { type: 'area', height: 350, fontFamily: 'Inter, sans-serif', zoom: { enabled: false }, toolbar: { show: false } },
  series: [{ name: 'Projected Value', data: initialGrowthData }],
  colors: ['#8b5cf6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] } },
  xaxis: {
    type: 'numeric',
    title: { text: 'Year', style: { color: '#6b7280', fontSize: '12px', fontWeight: 400, } },
    labels: { formatter: function (value) { return Math.round(value); } }
  },
  yaxis: {
    title: { text: 'Portfolio Value (€)', style: { color: '#6b7280', fontSize: '12px', fontWeight: 400, } },
    labels: { formatter: function (value) { return "€" + value.toLocaleString('de-DE'); } }
  },
  tooltip: {
    x: { formatter: function (value) { return `End of Year: ${Math.round(value)}`; } },
    y: {
      formatter: function (value) { return "€" + value.toLocaleString('de-DE'); },
      title: { formatter: (seriesName) => seriesName + ':' }
    }
  },
  grid: { borderColor: '#e5e7eb', strokeDashArray: 4 }
};
growthChart = new ApexCharts(document.querySelector("#growthChart"), growthOptions);
growthChart.render();
inputMonthly.addEventListener('input', updateGrowthChart);
inputRate.addEventListener('input', updateGrowthChart);
inputYears.addEventListener('input', updateGrowthChart);
rateValueSpan.textContent = `${parseFloat(inputRate.value).toFixed(1)}%`;

// --- Implementation Card Highlighting Logic ---
const implementationCardMap = { 0: 'impl-card-global', 1: 'impl-card-europe', 2: 'impl-card-em' };
const coreRationaleDisplay = document.getElementById('core-rationale-display');
const allImplementationCards = document.querySelectorAll('.implementation-card');

// Store rationale texts corresponding to series index
const coreRationales = {
    0: "Broad global diversification across developed markets. Low cost and accumulating strategy captures long-term growth.", // Global Dev
    1: "Targeted exposure to established European economies. Offers diversification and potential valuation opportunities.",   // Europe
    2: "Access to faster-growing emerging economies. Higher potential returns, balanced by higher risk, within a diversified core.", // Emerging Markets
};

function highlightImplementationCard(seriesIndex, shouldHighlight) {
  const cardId = implementationCardMap[seriesIndex];
  if (cardId) {
    const cardElement = document.getElementById(cardId);
    if (cardElement) {
      if (shouldHighlight) {
        cardElement.classList.add('highlight-card');
      } else {
        cardElement.classList.remove('highlight-card');
      }
    }
  }
  // Update rationale display
  if (coreRationaleDisplay) {
      if (shouldHighlight && coreRationales.hasOwnProperty(seriesIndex)) {
          coreRationaleDisplay.textContent = coreRationales[seriesIndex];
      } else {
          // Optionally clear text when deselecting/hovering off, or leave it until next selection
          // coreRationaleDisplay.textContent = ''; // Clear if deselecting
      }
  }
}

function clearCoreHighlights() {
    allImplementationCards.forEach(card => card.classList.remove('highlight-card'));
    if (coreRationaleDisplay) {
        coreRationaleDisplay.textContent = '';
    }
    // Deselect chart slice if possible (ApexCharts API might be needed)
    // For now, just clear UI elements.
}

// --- Sparer-Pauschbetrag Calculator Logic ---
const inputGains = document.getElementById('input-gains');
const coveredAmountSpan = document.getElementById('covered-amount');
const taxableAmountSpan = document.getElementById('taxable-amount');
const pauschbetrag = 1000;
function updateTaxCalculation() {
  const gains = parseFloat(inputGains.value) || 0;
  const covered = Math.min(gains, pauschbetrag);
  const taxable = Math.max(0, gains - pauschbetrag);
  coveredAmountSpan.textContent = covered.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  taxableAmountSpan.textContent = taxable.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
inputGains.addEventListener('input', updateTaxCalculation);
updateTaxCalculation();

// --- Dark Mode Toggle Logic ---
const htmlElement = document.documentElement;
const desktopToggle = document.getElementById('darkModeToggleDesktop');
const mobileToggle = document.getElementById('darkModeToggleMobile');
const sunIcons = document.querySelectorAll('.sun-icon');
const moonIcons = document.querySelectorAll('.moon-icon');

// Function to update theme based on preference
function applyTheme(isDark) {
  // Apply class to HTML element for Tailwind CSS `dark:` variants
  htmlElement.classList.toggle('dark', isDark);

  // Update toggle button icons
  sunIcons.forEach(icon => icon.classList.toggle('hidden', isDark));
  moonIcons.forEach(icon => icon.classList.toggle('hidden', !isDark));

  // Store preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Update chart themes if charts are initialized
  if (typeof coreChart !== 'undefined' && coreChart !== null) { // Check if charts exist
       updateChartThemes(isDark);
   }
}

// Function to update chart themes more reliably
function updateChartThemes(isDark) {
  const themeMode = isDark ? 'dark' : 'light';
  const labelColor = isDark ? '#9ca3af' : '#6b7280'; // Keep specific label colors if needed
  const titleColor = isDark ? '#e5e7eb' : '#374151';
  const valueColor = isDark ? '#f3f4f6' : '#1f2937';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  // Removed gauge track colors as gauges are removed
  // const gaugeTrackLight = '#e0e7ff';
  // const gaugeTrackDark = '#374151';
  // const splitGaugeTrackLight = '#ede9fe';
  // const splitGaugeTrackDark = '#4b5563';

  // Update Gauge Colors - REMOVED
  // monthlyGauge?.updateOptions({ ... });
  // splitGauge?.updateOptions({ ... });

  // Update Core Chart Theme
  coreChart?.updateOptions({
    chart: { background: 'transparent' },
    theme: { mode: themeMode },
    legend: {
        labels: { colors: isDark ? '#d1d5db' : undefined } // Keep explicit legend override
    },
    plotOptions: {
      pie: {
        donut: {
          labels: { // Keep specific label overrides if theme default isn't right
            name: { color: titleColor },
            value: { color: labelColor },
            total: { color: labelColor }
          }
        }
      }
    },
    tooltip: { theme: themeMode }
  });

  // Update Growth Chart using theme.mode
  growthChart?.updateOptions({
    chart: { background: 'transparent' },
    theme: { mode: themeMode },
    xaxis: {
        title: { style: { color: labelColor } }, // Keep overrides if needed
        labels: { style: { colors: labelColor } }
    },
    yaxis: {
        title: { style: { color: labelColor } },
        labels: { style: { colors: labelColor } }
    },
    grid: { borderColor: gridColor }, // Keep explicit grid color
    tooltip: { theme: themeMode }
  });
}


// Event listener for toggle buttons
function toggleDarkMode() {
  const isCurrentlyDark = htmlElement.classList.contains('dark');
  applyTheme(!isCurrentlyDark);
}

// Attach listeners only if elements exist
desktopToggle?.addEventListener('click', toggleDarkMode);
mobileToggle?.addEventListener('click', toggleDarkMode);

// --- Move all initialization logic inside DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Apply Initial Theme START ---
    // Check local storage and system preference inside DOMContentLoaded
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    // Apply theme classes FIRST, before charts init
     applyTheme(initialDark);
    // --- Apply Initial Theme END ---


    // Initialize AOS
    AOS.init({
      once: true, duration: 600, offset: 50, delay: 0,
    });

    // Mobile Menu Toggle
    const menuButton = document.getElementById('mobile-menu-button');
    // ... (keep existing mobile menu logic) ...

    // Charts Initialization (Now happens AFTER initial theme is set)
    // Overview Dashboard Gauges - REMOVED
    // const monthlyInvestmentGaugeOptions = { ... };
    // const monthlyGauge = new ApexCharts(document.querySelector("#monthlyInvestmentGauge"), monthlyInvestmentGaugeOptions);
    // monthlyGauge.render();
    // const splitGaugeOptions = { ... };
    // const splitGauge = new ApexCharts(document.querySelector("#splitGauge"), splitGaugeOptions);
    // splitGauge.render();

    // Core Allocation Chart (Donut)
    const coreAllocationOptions = {
        // ... existing options ...
         chart: { /*...,*/ background: 'transparent' },
         theme: { mode: initialDark ? 'dark' : 'light' }, // Set initial theme object
         legend: { labels: { colors: initialDark ? ['#d1d5db'] : undefined } },
         tooltip: { theme: initialDark ? 'dark' : 'light' },
         plotOptions: {
             pie: {
                 donut: {
                     labels: {
                         name: { color: initialDark ? '#e5e7eb' : '#374151' },
                         value: { color: initialDark ? '#9ca3af' : '#6b7280' },
                         total: { color: initialDark ? '#9ca3af' : '#6b7280' }
                     }
                 }
             }
         },
         // ... rest of options
    };
    const coreChart = new ApexCharts(document.querySelector("#coreAllocationChart"), coreAllocationOptions);
    coreChart.render();

    // Growth Projection Chart & Controls
    const inputMonthly = document.getElementById('input-monthly');
    // ... keep input refs ...
    let growthChart; // Declare here

    function calculateGrowth(initial, monthly, years, rate) {
        // ... existing function ...
    }

    function updateGrowthChart() {
        // ... existing function ...
         // Make sure this function uses the growthChart variable declared above
         if (growthChart) {
            growthChart.updateSeries([{ data: newGrowthData }]);
          }
    }

    const initialMonthly = parseFloat(inputMonthly.value);
    // ... rest of growth calc setup ...
    const growthOptions = {
       // ... existing options ...
        chart: { /*...,*/ background: 'transparent' },
        theme: { mode: initialDark ? 'dark' : 'light' }, // Set initial theme object
        tooltip: { theme: initialDark ? 'dark' : 'light' },
        xaxis: {
            title: { style: { color: initialDark ? '#9ca3af' : '#6b7280' } },
            labels: { style: { colors: initialDark ? '#9ca3af' : '#6b7280' } }
        },
        yaxis: {
            title: { style: { color: initialDark ? '#9ca3af' : '#6b7280' } },
            labels: { style: { colors: initialDark ? '#9ca3af' : '#6b7280' } }
        },
        grid: { borderColor: initialDark ? '#374151' : '#e5e7eb' }, // Initial grid color
        // ... rest of options
    };
    // Assign to the growthChart variable declared earlier
    growthChart = new ApexCharts(document.querySelector("#growthChart"), growthOptions);
    growthChart.render();

    // Add event listeners for growth chart updates
    inputMonthly.addEventListener('input', updateGrowthChart);
    inputRate.addEventListener('input', updateGrowthChart);
    inputYears.addEventListener('input', updateGrowthChart);
    rateValueSpan.textContent = `${parseFloat(inputRate.value).toFixed(1)}%`; // Initial rate display

    // --- Implementation Card Highlighting Logic ---
    const implementationCardMap = { 0: 'impl-card-global', 1: 'impl-card-europe', 2: 'impl-card-em' };
    function highlightImplementationCard(seriesIndex, shouldHighlight) {
       // ... existing logic ...
    }
     // Attach hover listeners for core chart (needs coreChart variable)
     if (coreChart) {
         const coreChartElement = document.querySelector("#coreAllocationChart");
         // Assuming events are handled within chart options now, but if not:
         // coreChartElement.addEventListener('dataPointMouseEnter', ...) etc.
     }


    // --- Sparer-Pauschbetrag Calculator Logic --- (Ensure elements are selected within DOMContentLoaded)
    const inputGains = document.getElementById('input-gains');
    const coveredAmountSpan = document.getElementById('covered-amount');
    const taxableAmountSpan = document.getElementById('taxable-amount');
    const pauschbetrag = 1000;
    function updateTaxCalculation() {
        // ... existing logic ...
    }
    inputGains?.addEventListener('input', updateTaxCalculation); // Use optional chaining
    updateTaxCalculation(); // Initial calculation


    // Scrollspy Functionality
    // ... (keep existing scrollspy logic) ...

    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- IMPORTANT: Re-Define Chart Variables for Global Scope Access ---
    // If applyTheme needs to access charts, ensure they are accessible.
    // One way is to attach them to the window object (use cautiously)
     window.coreChart = coreChart;
     window.growthChart = growthChart;
     // Now modify the check in applyTheme to use window.monthlyGauge etc.
     // function applyTheme(isDark) { ... if (typeof window.monthlyGauge !== 'undefined' && window.monthlyGauge !== null) { ... } }

    // Add event listener to clear highlights when clicking outside the chart area
    document.addEventListener('click', function(event) {
        const coreChartElement = document.querySelector("#coreAllocationChart");
        // Check if the click was outside the chart element and not on a slice
        if (coreChartElement && !coreChartElement.contains(event.target)) {
            // Check if the click target is NOT part of the chart slices/legend/etc.
            // This simple check works if clicks *inside* the chart trigger dataPointSelection.
            // A more robust check might involve inspecting event.target's parentage.
            clearCoreHighlights();
        }
    });

}); // End of DOMContentLoaded

// --- Ensure these functions are defined globally if needed by inline handlers or other scripts ---
// function calculateGrowth(...) { ... } // Keep global if needed elsewhere
// function updateGrowthChart(...) { ... } // Keep global if needed elsewhere
// function highlightImplementationCard(...) { ... } // Keep global if needed elsewhere
// function updateTaxCalculation(...) { ... } // Keep global if needed elsewhere
// function applyTheme(...) { ... } // Keep global
// function updateChartThemes(...) { ... } // Keep global
// function toggleDarkMode(...) { ... } // Keep global

// --- Scrollspy Navigation Highlighting ---
const navLinks = document.querySelectorAll('nav a[href^="#"]:not([href="#"])'); // Select links starting with #, excluding href="#"
const sections = Array.from(navLinks).map(link => {
  try {
    // Use querySelector which is more forgiving than getElementById if ID contains invalid characters
    // Though in this case, IDs seem standard
    return document.querySelector(link.getAttribute('href'));
  } catch (e) {
    console.warn(`Scrollspy target not found for link: ${link.getAttribute('href')}`, e);
    return null;
  }
}).filter(section => section !== null); // Filter out nulls if any section wasn't found

function updateScrollspy() {
  const scrollPosition = window.scrollY;
  // Get nav height dynamically or use a fixed value that matches scroll-mt-*
  // Tailwind's mt-16 is 4rem (64px). Add a little buffer.
  const navHeight = 70; // Adjust if nav height changes significantly

  let activeSectionId = null;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navHeight; // Adjust for sticky nav
    const sectionBottom = sectionTop + section.offsetHeight;

    // Check if section is in view
    // Prioritize the section whose top edge has passed the nav bar
    if (scrollPosition >= sectionTop) {
        activeSectionId = section.id;
    }
  });

    // Special case for bottom of page: if scrolled near the end, activate the last section
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) { // 50px buffer
        if (sections.length > 0) {
          activeSectionId = sections[sections.length - 1].id;
        }
    }
    // Special case for top of page
    else if (scrollPosition < sections[0].offsetTop - navHeight) {
        activeSectionId = null; // Or set to overview if preferred when at the very top
    }


  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === `#${activeSectionId}`) {
      link.classList.add('nav-active');
    } else {
      link.classList.remove('nav-active');
    }
  });
}

// Debounce scroll events for performance
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateScrollspy, 50); // Run update 50ms after the last scroll event
});

// Initial call to set the state on load
document.addEventListener('DOMContentLoaded', updateScrollspy);
// Also call after charts/dynamic content might affect layout
window.addEventListener('load', updateScrollspy); // Ensure layout is fully stable