// Functional logic for smooth scrolling and mobile menu

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links-container');
    const body = document.body;
    const menuLinks = document.querySelectorAll('.nav-links-container a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    const offsets = {
        '#Home': 0,
        '#about': 60,
        '#experience': 90,
        '#education': 135,
        '#skills-modal': 150,
        '#certifications': 110,
        '#projects': 110
    };

    function smoothScroll(targetId) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const offset = offsets[targetId] || 60;
            const targetPosition = targetSection.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
        }
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            smoothScroll(targetId);
        });
    });

    if (window.location.hash) {
        setTimeout(() => {
            smoothScroll(window.location.hash);
        }, 100);
    }
});