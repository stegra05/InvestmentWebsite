// Handles theme switching and persists the choice

const sunIcons = document.querySelectorAll('.sun-icon');
const moonIcons = document.querySelectorAll('.moon-icon');

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        sunIcons.forEach(icon => icon.classList.add('hidden'));
        moonIcons.forEach(icon => icon.classList.remove('hidden'));
    } else {
        document.documentElement.classList.remove('dark');
        sunIcons.forEach(icon => icon.classList.remove('hidden'));
        moonIcons.forEach(icon => icon.classList.add('hidden'));
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
    // Dispatch a custom event so charts can react
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
}

export function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    let isDark;

    if (savedTheme) {
        isDark = savedTheme === 'dark';
    } else {
        isDark = prefersDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    applyTheme(isDark);

    // Add listeners to toggle buttons
    document.getElementById('darkModeToggleDesktop')?.addEventListener('click', toggleDarkMode);
    document.getElementById('darkModeToggleMobile')?.addEventListener('click', toggleDarkMode);

    // Listener for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const newColorScheme = event.matches ? "dark" : "light";
        // Only change if no theme override is set in localStorage
        if (!localStorage.getItem('theme')) {
            applyTheme(newColorScheme === 'dark');
            // Dispatch event on system change too
             window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: newColorScheme === 'dark' } }));
        }
    });
}

// Handles mobile menu toggling
export function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconClose = document.getElementById('icon-close');

    if (!menuButton || !mobileMenu || !iconMenu || !iconClose) return;

    const mobileMenuLinks = mobileMenu.querySelectorAll('a');

    menuButton.addEventListener('click', () => {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isExpanded));
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
}

// Handles scrollspy for navigation links
export function initScrollspy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksDesktop = document.querySelectorAll('nav .hidden.md\\:flex a[href^="#"]');
    const navLinksMobile = document.querySelectorAll('#mobile-menu a[href^="#"]');
    const allNavLinks = [...navLinksDesktop, ...navLinksMobile];
    const activeClass = 'nav-active';
    const baseNavClasses = 'px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400';
    const activeNavClasses = 'px-3 py-2 rounded-md text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
    const baseMobileClasses = 'block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-400';
    const activeMobileClasses = 'block px-3 py-2 rounded-md text-base font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';

    function updateScrollspy() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Offset slightly
            if (window.scrollY >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            const linkHref = link.getAttribute('href').substring(1);
            const isMobile = link.closest('#mobile-menu') !== null;
            const baseClasses = isMobile ? baseMobileClasses : baseNavClasses;
            const activeClasses = isMobile ? activeMobileClasses : activeNavClasses;

            link.classList.remove(...activeClasses.split(' '));
            link.classList.add(...baseClasses.split(' '));
            link.classList.remove(activeClass); // Remove marker class

            if (linkHref === currentSectionId) {
                link.classList.remove(...baseClasses.split(' '));
                link.classList.add(...activeClasses.split(' '));
                link.classList.add(activeClass); // Add marker class
            }
        });
    }

    window.addEventListener('scroll', updateScrollspy);
    updateScrollspy(); // Initial call
}

// Initializes Animate on Scroll (AOS)
export function initAOS() {
    AOS.init({
        once: true,
        duration: 600,
        offset: 50,
        delay: 0,
    });
}

// Sets the current year in the footer
export function setFooterYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
} 