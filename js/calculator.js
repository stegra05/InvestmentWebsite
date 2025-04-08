// Handles the tax allowance calculator

const inputGains = document.getElementById('input-gains');
const coveredAmountSpan = document.getElementById('covered-amount');
const taxableAmountSpan = document.getElementById('taxable-amount');
const pauschbetrag = 1000; // Single filer allowance for 2023+

function formatCurrencyDE(amount) {
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateTaxCalculation() {
    const gains = parseFloat(inputGains.value) || 0;
    const covered = Math.min(gains, pauschbetrag);
    const taxable = Math.max(0, gains - pauschbetrag);

    if (coveredAmountSpan) {
        coveredAmountSpan.textContent = formatCurrencyDE(covered);
    }
    if (taxableAmountSpan) {
        taxableAmountSpan.textContent = formatCurrencyDE(taxable);
    }
}

export function initTaxCalculator() {
    if (!inputGains) return;
    inputGains.addEventListener('input', updateTaxCalculation);
    updateTaxCalculation(); // Initial calculation
} 