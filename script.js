document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtns = document.querySelectorAll('.close-btn');
    const modals = document.querySelectorAll('.modal-overlay');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    const projectRows = document.querySelectorAll('.project-row');

    // --- Open modal ---
    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // --- Close modal via (x) ---
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // --- Close modal by clicking overlay ---
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // --- Close modal with Escape ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });

    // --- Active nav link on scroll ---
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => navObserver.observe(section));

    // --- Staggered fade-in reveal for project rows ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${i * 80}ms`;
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    projectRows.forEach(row => revealObserver.observe(row));

    // --- Lightbox: click any zoomable image to view full-size ---
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
        <img class="lightbox-img" src="" alt="">
        <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
        <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');

    let currentGroup = [];
    let currentIndex = 0;

    function openLightbox(group, index) {
        currentGroup = group;
        currentIndex = index;
        showLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showLightboxImage() {
        const img = currentGroup[currentIndex];
        lightboxImg.src = img.getAttribute('src');
        lightboxImg.alt = img.getAttribute('alt') || '';
        lightboxCaption.textContent = img.getAttribute('alt') || '';
        lightboxNav_visibility();
    }

    function lightboxNav_visibility() {
        const multiple = currentGroup.length > 1;
        lightboxPrev.style.display = multiple ? 'flex' : 'none';
        lightboxNext.style.display = multiple ? 'flex' : 'none';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % currentGroup.length;
        showLightboxImage();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
        showLightboxImage();
    }

    // Group images so left/right arrows can cycle within the same context
    // (e.g. all project media images together, or all images inside one modal together)
    function wireZoomableGroup(selector) {
        document.querySelectorAll(selector).forEach(container => {
            const images = Array.from(container.querySelectorAll('img.zoomable'));
            images.forEach((img, i) => {
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(images, i);
                });
            });
        });
    }

    document.querySelectorAll('img').forEach(img => img.classList.add('zoomable'));

    wireZoomableGroup('.project-list');
    wireZoomableGroup('.modal-gallery');
    wireZoomableGroup('.hero-visual');

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNext);
    lightboxPrev.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
});