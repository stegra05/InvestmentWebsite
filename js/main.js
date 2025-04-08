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

// --- Chart Configurations ---
// Overview Dashboard Gauges
const monthlyInvestmentGaugeOptions = {
  chart: { height: '100%', type: 'radialBar', toolbar: { show: false }, sparkline: { enabled: true } },
  series: [100],
  colors: ["#4f46e5"],
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: { background: "#e0e7ff", strokeWidth: '97%', margin: 5, },
      dataLabels: {
        name: { show: true, offsetY: -5, fontSize: '14px', fontWeight: 700, color: '#1f2937' },
        value: { offsetY: -30, fontSize: '12px', color: '#4b5563', formatter: function (val) { return "per month"; } }
      }
    }
  },
  grid: { padding: { top: -10 } },
  fill: { type: 'solid' },
  labels: ['€600'],
  tooltip: { enabled: true, y: { formatter: function(value) { return "Total monthly contribution: €600"; } }, theme: 'dark' }
};
const monthlyGauge = new ApexCharts(document.querySelector("#monthlyInvestmentGauge"), monthlyInvestmentGaugeOptions);
monthlyGauge.render();
const splitGaugeOptions = {
  chart: { height: '100%', type: 'radialBar', toolbar: { show: false }, sparkline: { enabled: true } },
  series: [83],
  colors: ["#8b5cf6"],
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: { background: "#ede9fe", strokeWidth: '97%', margin: 5, },
      dataLabels: {
        name: { show: true, offsetY: -5, fontSize: '14px', fontWeight: 700, color: '#1f2937' },
        value: { offsetY: -30, fontSize: '12px', color: '#4b5563', formatter: function (val) { return "Satellite: 17%"; } }
      }
    }
  },
  grid: { padding: { top: -10 } },
  fill: { type: 'solid' },
  labels: ['83% Core'],
  tooltip: {
    enabled: true,
    y: {
      formatter: function(value) {
        const coreAmount = (value / 100 * 600).toFixed(0);
        const satellitePercent = (100 - value).toFixed(0);
        const satelliteAmount = ((100 - value) / 100 * 600).toFixed(0);
        return `Core: €${coreAmount}/mo (${value}%)<br>Satellite: €${satelliteAmount}/mo (${satellitePercent}%)`;
      }
    },
    theme: 'dark'
  }
};
const splitGauge = new ApexCharts(document.querySelector("#splitGauge"), splitGaugeOptions);
splitGauge.render();

// Core Allocation Chart (Donut)
const coreAllocationOptions = {
  chart: { type: 'donut', height: 350, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, events: { dataPointMouseEnter: function(event, chartContext, config) { highlightImplementationCard(config.seriesIndex, true); }, dataPointMouseLeave: function(event, chartContext, config) { highlightImplementationCard(config.seriesIndex, false); } } },
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
  if (isDark) {
    htmlElement.classList.add('dark');
    sunIcons.forEach(icon => icon.classList.add('hidden'));
    moonIcons.forEach(icon => icon.classList.remove('hidden'));
    localStorage.setItem('theme', 'dark');
  } else {
    htmlElement.classList.remove('dark');
    sunIcons.forEach(icon => icon.classList.remove('hidden'));
    moonIcons.forEach(icon => icon.classList.add('hidden'));
    localStorage.setItem('theme', 'light');
  }
  // Re-render charts with potentially different theme options
  updateChartThemes(isDark);
}

// Function to update chart themes
function updateChartThemes(isDark) {
  const labelColor = isDark ? '#9ca3af' : '#6b7280';
  const titleColor = isDark ? '#e5e7eb' : '#374151';
  const valueColor = isDark ? '#f3f4f6' : '#1f2937';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // Update Gauge Colors (Example for monthly gauge, apply similarly to splitGauge if needed)
  monthlyGauge.updateOptions({
    plotOptions: {
      radialBar: {
        track: { background: isDark ? '#374151' : '#e0e7ff' },
        dataLabels: {
          name: { color: valueColor },
          value: { color: labelColor }
        }
      }
    },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  });
  splitGauge.updateOptions({
    plotOptions: {
       radialBar: {
         track: { background: isDark ? '#4b5563' : '#ede9fe' },
         dataLabels: {
           name: { color: valueColor },
           value: { color: labelColor }
         }
       }
     },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  })

  // Update Core Allocation Chart
  coreChart.updateOptions({
    legend: { labels: { colors: isDark ? ['#d1d5db'] : undefined } }, // Set explicitly for dark
    plotOptions: {
      pie: {
        donut: {
          labels: {
            name: { color: titleColor },
            value: { color: labelColor },
            total: { color: labelColor }
          }
        }
      }
    },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  });

  // Update Growth Chart
  growthChart.updateOptions({
    xaxis: { title: { style: { color: labelColor } }, labels: { style: { colors: labelColor } } },
    yaxis: { title: { style: { color: labelColor } }, labels: { style: { colors: labelColor } } },
    grid: { borderColor: gridColor },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  });
}

// Event listener for toggle buttons
function toggleDarkMode() {
  const isCurrentlyDark = htmlElement.classList.contains('dark');
  applyTheme(!isCurrentlyDark);
}

desktopToggle.addEventListener('click', toggleDarkMode);
mobileToggle.addEventListener('click', toggleDarkMode);

// Check local storage on initial load
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  applyTheme(true);
} else {
  applyTheme(false);
}

document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const themeToggleButtons = document.querySelectorAll('[id^="darkModeToggle"]');
    // ... (keep existing dark mode logic) ...

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    // ... (keep existing mobile menu logic) ...

    // AOS Initialization
    AOS.init({
        // ... (keep existing AOS options) ...
    });

    // Charts Initialization
    // ... (keep existing chart logic for overview, core, growth) ...

    // Tax Calculator
    const gainsInput = document.getElementById('input-gains');
    // ... (keep existing tax calculator logic) ...

    // Growth Projection Interaction
    const monthlyInput = document.getElementById('input-monthly');
    // ... (keep existing growth projection logic) ...

    // Highlight implementation cards on chart hover
    const coreChartElement = document.getElementById('coreAllocationChart');
    // ... (keep existing chart hover logic) ...

    // Scrollspy Functionality
    const navLinksDesktop = document.querySelectorAll('nav .hidden.md\:flex a[href^="#"]');
    const navLinksMobile = document.querySelectorAll('#mobile-menu a[href^="#"]');
    const allNavLinks = [...navLinksDesktop, ...navLinksMobile];

    const sections = Array.from(navLinksDesktop).map(link => { // Use desktop links to map sections
        const sectionId = link.getAttribute('href');
        try {
            // Ensure the selector is valid and the element exists
            if (sectionId && sectionId.startsWith('#') && sectionId.length > 1) {
                 return document.querySelector(sectionId);
            }
            console.warn(`Scrollspy: Invalid or missing href attribute on link: ${link}`);
            return null;
        } catch (e) {
            console.warn(`Scrollspy: Could not find section for ID: ${sectionId}, Error: ${e.message}`);
            return null;
        }
    }).filter(section => section !== null); // Filter out nulls

    let navHeight = 64; // Default height (h-16)
    const navElement = document.querySelector('nav.sticky');
    if (navElement) {
        navHeight = navElement.offsetHeight;
    }

    const activateLink = (targetId) => {
        allNavLinks.forEach(navLink => {
            navLink.classList.remove('nav-active');
            // Restore default styles (adjust if your defaults are different)
            navLink.classList.remove('font-semibold'); // Added by nav-active
            navLink.classList.add('text-gray-600', 'dark:text-gray-400'); // Desktop defaults
             if (navLink.closest('#mobile-menu')) { // Mobile specific defaults
                 navLink.classList.remove('text-gray-600', 'dark:text-gray-400');
                 navLink.classList.add('text-gray-700', 'dark:text-gray-300');
             }
        });

        if (targetId) {
            allNavLinks.forEach(link => {
                if (link.getAttribute('href') === `#${targetId}`) {
                    link.classList.add('nav-active');
                    // Remove default styles when active
                    link.classList.remove('text-gray-600', 'dark:text-gray-400', 'text-gray-700', 'dark:text-gray-300');
                }
            });
        }
    };

    const onScroll = () => {
        let currentSectionId = null;
        // Add extra offset to trigger highlight slightly before section top reaches nav
        const scrollPosition = window.scrollY + navHeight + 20;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section.offsetTop <= scrollPosition) {
                currentSectionId = section.getAttribute('id');
                break; // Found the current or last section above the scroll position
            }
        }

        // Special case for the very top of the page
        if (window.scrollY < sections[0]?.offsetTop - navHeight - 20) {
             currentSectionId = null; // No section active if above the first one
        }

        // Special case for the bottom of the page
         if (window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight - 5) { // Use ceil for precision
             currentSectionId = sections[sections.length - 1]?.getAttribute('id');
         }

        activateLink(currentSectionId);
    };

    window.addEventListener('scroll', onScroll, { passive: true }); // Use passive listener for performance
    onScroll(); // Initial check on page load

    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}); 