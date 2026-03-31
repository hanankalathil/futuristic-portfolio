import * as THREE from 'three';

// Configuration
const CONFIG = {
    particleCount: window.innerWidth < 768 ? 1000 : 4000, // Reduced for mobile
    heroObjectColor: 0xffffff,
    particleColor: 0x888888,
    mouseLerp: 0.05,
};

// Scene Setup
const canvas = document.querySelector('#hero-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Hero Object (Icosahedron)
const geometry = new THREE.IcosahedronGeometry(2, 5); // Detail: 1 or 2 for wireframe looks good
const material = new THREE.MeshStandardMaterial({
    color: CONFIG.heroObjectColor,
    wireframe: true,
    emissive: CONFIG.heroObjectColor,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
});
const heroObject = new THREE.Mesh(geometry, material);
scene.add(heroObject);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(CONFIG.particleCount * 3);

for (let i = 0; i < CONFIG.particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: CONFIG.particleColor,
    transparent: true,
    opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(CONFIG.heroObjectColor, 10);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

camera.position.z = 5;

// Mouse Movement Parallax
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5);
    mouseY = (event.clientY / window.innerHeight - 0.5);

    // Profile Image Parallax
    const profileContainer = document.getElementById('profile-container');
    if (profileContainer) {
        const moveX = mouseX * 40; // Max 20px move
        const moveY = mouseY * 40;
        profileContainer.style.transform = `translate(${moveX}px, ${moveY}px) rotateY(${mouseX * 10}deg) rotateX(${-mouseY * 10}deg)`;
    }
});

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Optimize particles on resize if mobile state changes
    const newCount = window.innerWidth < 768 ? 1000 : 4000;
    if (CONFIG.particleCount !== newCount) {
        CONFIG.particleCount = newCount;
        // Optionally recreate particles or just update system
    }
});

// Scroll Reveal Observer
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate Hero Object
    heroObject.rotation.y = elapsedTime * 0.2;
    heroObject.rotation.x = elapsedTime * 0.15;

    // Rotate Particles
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Smooth Mouse Parallax
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    // Invert for camera feel
    camera.position.x += (targetX - camera.position.x) * CONFIG.mouseLerp;
    camera.position.y += (-targetY - camera.position.y) * CONFIG.mouseLerp;
    camera.lookAt(scene.position);

    // Update point light color/intensity for dynamic glow
    pointLight.intensity = 10 + Math.sin(elapsedTime) * 2;

    // Scroll Effect on Object (Shrink/Move as we scroll)
    const scrollY = window.scrollY;
    const sectionHeight = window.innerHeight;
    const scrollPercent = scrollY / sectionHeight;

    // Smoothly scale down hero object as we scroll away
    if (scrollPercent < 1.0) {
        heroObject.scale.set(1 - scrollPercent * 0.5, 1 - scrollPercent * 0.5, 1 - scrollPercent * 0.5);
        heroObject.position.y = -scrollPercent * 2;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// Form Submission with EmailJS
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Change button state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'SENDING...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';

        // Send email via EmailJS
        // Service ID: service_lgtitf5, Template ID: template_doccg5o
        emailjs.sendForm('service_lgtitf5', 'template_doccg5o', contactForm)
            .then(() => {
                // Success
                submitBtn.textContent = 'SUCCESS!';
                submitBtn.style.borderColor = '#00ff00';
                submitBtn.style.color = '#00ff00';
                submitBtn.style.boxShadow = '0 0 20px #00ff00';

                showNotification('SYSTEM SECURE: Message transmitted successfully.', 'success');
                contactForm.reset();

                // Revert button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.boxShadow = '';
                }, 3000);
            }, (error) => {
                // Error
                console.error('FAILED...', error);
                submitBtn.textContent = 'ERROR!';
                submitBtn.style.borderColor = '#ff0000';
                submitBtn.style.color = '#ff0000';
                submitBtn.style.boxShadow = '0 0 20px #ff0000';

                showNotification('CRITICAL ERROR: System failed to transmit message.', 'error');

                // Revert button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.boxShadow = '';
                }, 3000);
            });
    });
}

// --- Custom Notification Logic ---
const notifOverlay = document.getElementById('notification-overlay');
const notifMessage = document.getElementById('notification-message');
const notifClose = document.getElementById('notification-close');

function showNotification(message, type = 'success') {
    if (!notifOverlay || !notifMessage) return;

    notifMessage.textContent = message;

    // Customize icon/title based on type
    const notifIcon = document.querySelector('.notif-icon');
    const notifTitle = document.querySelector('.notif-title');

    if (type === 'error') {
        if (notifIcon) notifIcon.textContent = '🚨';
        if (notifTitle) notifTitle.textContent = 'SYSTEM ERROR';
    } else {
        if (notifIcon) notifIcon.textContent = '🛡️';
        if (notifTitle) notifTitle.textContent = 'SYSTEM STATUS';
    }

    notifOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scroll
}

if (notifClose) {
    notifClose.addEventListener('click', () => {
        notifOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scroll
    });
}

// Close on background click
if (notifOverlay) {
    notifOverlay.addEventListener('click', (e) => {
        if (e.target === notifOverlay) {
            notifOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

/* --- Project Data & Modal Logic --- */

const PROJECTS_DATA = {
    chai: {
        title: "THE CHAI VILLA",
        tags: ["HTML", "CSS", "JS"],
        img: "assets/optimized/project1-neon.png",
        description: "A modern and responsive cafe website built to practice professional web layouts. It features a clean menu presentation and is optimized for the best user experience on mobile devices.",
        link: "https://thechaivilla.netlify.app",
        repo: "https://github.com/hanankalathil/THE-CHAI-VILLA"
    },
    portfolio: {
        title: "3D Interactive Portfolio",
        tags: ["Three.js", "JS", "CSS3"],
        img: "assets/optimized/project2-neon.png",
        description: "My personal developer portfolio showcasing my exploration of 3D web design. It features a custom particle system and interactive 3D shapes to create a futuristic and immersive feel.",
        link: "#",
        repo: "https://github.com/hanankalathil"
    },
    love: {
        title: "Love Calculator App",
        tags: ["JS", "Logic", "UI"],
        img: "assets/optimized/project3-neon.png",
        description: "A fun and interactive web application built to practice JavaScript algorithms and user interaction. It generates a compatibility score using creative logic and a clean user interface.",
        link: "https://lovecalaculater.netlify.app",
        repo: "https://github.com/hanankalathil/-Valentines-Love-Calculator"
    }
};

const modal = document.getElementById('project-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalTags = document.getElementById('modal-tags');
const modalDesc = document.getElementById('modal-description');
const modalLink = document.getElementById('modal-link');
const modalRepo = document.getElementById('modal-repo');

function openModal(projectId) {
    const data = PROJECTS_DATA[projectId];
    if (!data) return;

    if (data.img) {
        modalImg.src = data.img;
        modalImg.style.display = 'block';
    } else {
        modalImg.style.display = 'none';
    }
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;
    modalLink.href = data.link;
    modalRepo.href = data.repo;

    // Clear and add tags
    modalTags.innerHTML = '';
    data.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        modalTags.appendChild(tagSpan);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop scroll
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scroll
}

// Event Listeners for project buttons
document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.project-card');
        const projectId = card.getAttribute('data-project');
        openModal(projectId);
    });
});

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Mobile Menu Toggle
const navToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// Disable custom cursor on touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (isTouchDevice) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
} else if (cursorDot && cursorOutline) {
    // Hide default cursor gracefully handling hover states
    document.body.style.cursor = 'none';
    const links = document.querySelectorAll('a, button, .nav-toggle, input, textarea');
    
    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let outlineX = dotX;
    let outlineY = dotY;

    window.addEventListener('mousemove', (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
    });

    const animateCursor = () => {
        // Dot follows exactly
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        
        // Outline lags behind via lerping
        outlineX += (dotX - outlineX) * 0.2;
        outlineY += (dotY - outlineY) * 0.2;
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effects
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
        link.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });
}

// === NEW FEATURES LOGIC ===

// Preloader Logic
const preloader = document.getElementById('preloader');
const preloaderBar = document.querySelector('.loader-bar');
const preloaderPercent = document.getElementById('loader-percent');

// Hide preloader naturally once fully loaded (faked progress for cinematic effect)
if (preloader) {
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 20; 
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 500);
        }
        if (preloaderBar) preloaderBar.style.width = `${loadProgress}%`;
        if (preloaderPercent) preloaderPercent.textContent = `${Math.floor(loadProgress)}%`;
    }, 150);
}

// Scroll Progress Bar Logic
const scrollProgressBar = document.getElementById('scroll-progress-bar');
if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgressBar.style.width = `${scrollPercent}%`;
    });
}

// === ULTIMATE EXTENDED FEATURES LOGIC ===

// 1. 3D Tilt Effect on Skill & Project Cards
const tiltCards = document.querySelectorAll('.project-card, .skill-card');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        // Only run on non-touch devices
        if (isTouchDevice) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt
        const rotateX = ((y - centerY) / centerY) * -12; // 12 deg tilt
        const rotateY = ((x - centerX) / centerX) * 12;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        card.style.transition = 'none'; // Snappy tracking
        card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
        if (isTouchDevice) return;
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.zIndex = '1';
    });
});

// 2. Terminal Typing Effect for Hero Subheader
const typedTextElement = document.querySelector('.neon-text');
if (typedTextElement) {
    const textToType = typedTextElement.textContent;
    typedTextElement.textContent = '';
    typedTextElement.style.borderRight = '3px solid var(--neon-blue)'; // Blinking cursor
    typedTextElement.style.paddingRight = '5px';
    typedTextElement.style.display = 'inline-block';
    
    let charIndex = 0;

    const typeWriter = () => {
        if (charIndex < textToType.length) {
            typedTextElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 40); // speed of typing
        } else {
            // Infinite Cursor Blink
            setInterval(() => {
                typedTextElement.style.borderColor = typedTextElement.style.borderColor === 'transparent' ? 'var(--neon-blue)' : 'transparent';
            }, 500);
        }
    };
    
    // Begin typing shortly after preloader
    setTimeout(typeWriter, 1200); 
}

// 3. Cyber Click Shockwave Effect
window.addEventListener('click', (e) => {
    // Avoid triggering on purely functional clicks like modal closing where it might distract
    if (e.target.closest('.modal-content')) return;

    const shockwave = document.createElement('div');
    shockwave.className = 'cyber-shockwave';
    shockwave.style.left = `${e.clientX}px`;
    shockwave.style.top = `${e.clientY}px`;
    document.body.appendChild(shockwave);
    
    // Remove element after animation finishes
    setTimeout(() => {
        shockwave.remove();
    }, 600);
});
