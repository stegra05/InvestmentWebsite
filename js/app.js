import { initTheme, initMobileMenu, initScrollspy, initAOS, setFooterYear } from './ui.js';
import { initCharts } from './charts.js';
import { initTaxCalculator } from './calculator.js';

// Initialize all modules when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollspy();
    initAOS();
    setFooterYear();
    initCharts();
    initTaxCalculator();

    console.log("Investment Plan Initialized");
}); 