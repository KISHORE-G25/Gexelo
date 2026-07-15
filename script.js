// Initialize Lucide Icons
lucide.createIcons();

// Set Current Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for Scroll Animations
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// =========================================================================
// Chat Widget Functionality (Smart Rule-Based 'LLM-like' System)
// =========================================================================
const chatToggleBtn = document.getElementById('chat-toggle');
const chatCloseBtn = document.getElementById('chat-close');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

class ConversationManager {
    constructor() {
        this.state = 'INIT'; // States: INIT, WEBSITE, TRAFFIC_BIZ, GOAL, MINDSET, ROUTING
        this.leadScore = 0; // Numerical score for precise routing
        this.isTyping = false;
        this.hasInitialized = false;
    }

    init() {
        if (this.hasInitialized) return;
        this.hasInitialized = true;
        this.simulateTyping(() => {
            this.appendMessage("Hey 👋 I'm Xelo. I build high-performance systems, resume sites, portfolios, and online storefronts that turn visitors into customers.", 'bot');

            setTimeout(() => {
                this.simulateTyping(() => {
                    this.appendMessage("To give you the right strategy, do you already have a website or are you starting from scratch?", 'bot');
                    this.appendHTML(`
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                            <button class="chat-action-btn" onclick="xelo.handleAction('WEBSITE', 'EXISTING')">Existing Website</button>
                            <button class="chat-action-btn" onclick="xelo.handleAction('WEBSITE', 'FRESH')">Starting Fresh</button>
                        </div>
                    `, 'bot');
                });
            }, 800);
        }, 1000);
    }

    handleInput(message) {
        if (!message || this.isTyping) return;
        this.appendMessage(message, 'user');

        switch (this.state) {
            case 'WEBSITE':
                this.handleTextFallback('WEBSITE', message);
                break;
            case 'TRAFFIC_BIZ':
                this.handleTextFallback('TRAFFIC_BIZ', message);
                break;
            case 'GOAL':
                this.handleTextFallback('GOAL', message);
                break;
            case 'MINDSET':
                this.handleTextFallback('MINDSET', message);
                break;
            case 'ROUTING':
                this.simulateTyping(() => {
                    this.appendMessage("Got it. Our team will review everything. Feel free to use the links above when you're ready.", 'bot');
                });
                break;
            default:
                this.simulateTyping(() => {
                    this.appendMessage("I'm ready to help you scale whenever you are.", 'bot');
                });
        }
    }

    // A fallback if the user types instead of clicking buttons
    handleTextFallback(currentState, msg) {
        let text = msg.toLowerCase();

        if (currentState === 'WEBSITE') {
            if (text.includes('existing') || text.includes('have one')) this.handleAction('WEBSITE', 'EXISTING', msg);
            else this.handleAction('WEBSITE', 'FRESH', msg);
        } else if (currentState === 'TRAFFIC_BIZ') {
            this.handleAction('TRAFFIC_BIZ', 'TEXT_FALLBACK', msg);
        } else if (currentState === 'GOAL') {
            this.handleAction('GOAL', 'TEXT_FALLBACK', msg);
        } else if (currentState === 'MINDSET') {
            if (text.includes('growth') || text.includes('scale')) this.handleAction('MINDSET', 'GROWTH', msg);
            else this.handleAction('MINDSET', 'BASIC', msg);
        }
    }

    handleAction(state, actionType, userText = null) {
        // Prevent clicking old buttons
        if (this.state !== 'INIT' && this.state !== state) return;

        if (state === 'WEBSITE') {
            this.appendMessage(userText || (actionType === 'EXISTING' ? "Existing Website" : "Starting Fresh"), 'user');

            if (actionType === 'EXISTING') {
                this.leadScore += 3;
                this.simulateTyping(() => {
                    this.appendMessage("Got it. Are you currently getting consistent traffic to it?", 'bot');
                    this.appendHTML(`
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                            <button class="chat-action-btn" onclick="xelo.handleAction('TRAFFIC_BIZ', 'TRAFFIC_YES')">Yes, steady traffic</button>
                            <button class="chat-action-btn" onclick="xelo.handleAction('TRAFFIC_BIZ', 'TRAFFIC_NO')">Not much yet</button>
                        </div>
                    `, 'bot');
                });
            } else {
                this.simulateTyping(() => {
                    this.appendMessage("Understood. What kind of project are we starting?", 'bot');
                    this.appendHTML(`
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                            <button class="chat-action-btn" onclick="xelo.handleAction('TRAFFIC_BIZ', 'BIZ_SERVICE')">Service / B2B Website</button>
                            <button class="chat-action-btn" onclick="xelo.handleAction('TRAFFIC_BIZ', 'BIZ_PORTFOLIO')">Portfolio / Resume Site</button>
                            <button class="chat-action-btn" onclick="xelo.handleAction('TRAFFIC_BIZ', 'BIZ_ECOM')">Ecommerce Store</button>
                        </div>
                    `, 'bot');
                });
            }
            this.state = 'TRAFFIC_BIZ';
        }

        else if (state === 'TRAFFIC_BIZ') {
            if (actionType === 'TRAFFIC_YES') {
                this.appendMessage(userText || "Yes, steady traffic", 'user');
                this.leadScore += 2;
            } else if (actionType === 'TRAFFIC_NO') {
                this.appendMessage(userText || "Not much yet", 'user');
            } else if (actionType === 'BIZ_SERVICE') {
                this.appendMessage(userText || "Service / B2B Website", 'user');
                this.leadScore += 2;
            } else if (actionType === 'BIZ_PORTFOLIO') {
                this.appendMessage(userText || "Portfolio / Resume Site", 'user');
                this.leadScore += 2;
            } else if (actionType === 'BIZ_ECOM') {
                this.appendMessage(userText || "Ecommerce Store", 'user');
                this.leadScore += 2;
            } else if (actionType === 'TEXT_FALLBACK') {
                // assume text input implies intent
                this.leadScore += 1;
            }

            this.state = 'GOAL';
            this.simulateTyping(() => {
                this.appendMessage("What's the primary bottleneck right now? Leads, sales, or pure performance?", 'bot');
                this.appendHTML(`
                    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                        <button class="chat-action-btn" onclick="xelo.handleAction('GOAL', 'LEADS')">More Leads</button>
                        <button class="chat-action-btn" onclick="xelo.handleAction('GOAL', 'SALES')">More Sales</button>
                        <button class="chat-action-btn" onclick="xelo.handleAction('GOAL', 'BASIC')">Speed / Setup</button>
                    </div>
                `, 'bot');
            });
        }

        else if (state === 'GOAL') {
            if (actionType === 'LEADS') {
                this.appendMessage(userText || "More Leads", 'user');
                this.leadScore += 2;
            } else if (actionType === 'SALES') {
                this.appendMessage(userText || "More Sales", 'user');
                this.leadScore += 2;
            } else {
                this.appendMessage(userText || (actionType === 'BASIC' ? "Speed / Setup" : "Text response"), 'user');
            }

            this.state = 'MINDSET';
            this.simulateTyping(() => {
                this.appendMessage("Are you looking for a basic setup to get by, or a premium growth-focused system to scale?", 'bot');
                this.appendHTML(`
                    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                        <button class="chat-action-btn" onclick="xelo.handleAction('MINDSET', 'GROWTH')">Growth-focused Scale</button>
                        <button class="chat-action-btn" onclick="xelo.handleAction('MINDSET', 'BASIC')">Just a basic setup</button>
                    </div>
                `, 'bot');
            });
        }

        else if (state === 'MINDSET') {
            if (actionType === 'GROWTH') {
                this.appendMessage(userText || "Growth-focused Scale", 'user');
                this.leadScore += 3;
            } else {
                this.appendMessage(userText || "Just a basic setup", 'user');
            }

            this.state = 'ROUTING';
            this.executeScoreRouting();
        }
    }

    executeScoreRouting() {
        this.simulateTyping(() => {
            // HIGH SCORE: >= 7 (e.g. Existing Website (3) + Traffic (2) + Leads (2))
            if (this.leadScore >= 7) {
                this.appendMessage("Based on your traffic and growth goals, we should skip the basics. We can go over a custom conversion system in a quick 15-min call.", 'bot');
                this.appendHTML(`<button class="chat-action-btn" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">Book a 15-min Call</button>`, 'bot');
            }
            // MEDIUM SCORE: 4 - 6
            else if (this.leadScore >= 4) {
                this.appendMessage("I see. I can quickly review your current setup and suggest a better structure for your business.", 'bot');
                this.appendHTML(`
                    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                        <button class="chat-action-btn" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">Get Website Review</button>
                        <button class="chat-action-btn whatsapp" onclick="window.open('https://api.whatsapp.com/send?text=Hi', '_blank')">Chat on WhatsApp</button>
                    </div>
                `, 'bot');
            }
            // LOW SCORE: < 4
            else {
                this.appendMessage("Makes sense. A solid foundation is key. I'd suggest starting with a simple, high-converting layout before investing heavily.", 'bot');
                this.appendHTML(`<button class="chat-action-btn" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">Drop your email for advice</button>`, 'bot');
            }
        });
    }

    simulateTyping(callback, delay = 1200) {
        if (this.isTyping) return;
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.classList.add('chat-message', 'bot');
        typingDiv.id = 'typing-indicator-msg';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.disabled = true;

        setTimeout(() => {
            typingDiv.remove();
            this.isTyping = false;
            chatInput.disabled = false;
            if (!window.matchMedia("(max-width: 768px)").matches) {
                chatInput.focus();
            }
            callback();
        }, delay);
    }

    appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message', sender);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('msg-content');
        contentDiv.innerText = text;

        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    appendHTML(htmlStr, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message', sender);
        msgDiv.style.width = "100%";
        msgDiv.innerHTML = htmlStr;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

const xelo = new ConversationManager();

function handleToggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        xelo.init();
        if (!window.matchMedia("(max-width: 768px)").matches) {
            chatInput.focus();
        }
    }
}

chatToggleBtn.addEventListener('click', handleToggleChat);
chatCloseBtn.addEventListener('click', handleToggleChat);

chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    chatInput.value = '';
    xelo.handleInput(message);
});

// =========================================================================
// Contact Form Functionality
// =========================================================================
const mainContactForm = document.getElementById('contact-form');
const formSuccess = document.querySelector('.form-success');

// TODO: Replace this URL with your actual deployed Google Apps Script Web App URL
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8Ayfq-tMU2Mhitj14_VVOKGmFa0a0roLPYVtbmBwkh-7lG1yaMhMyqrxGOq1amzovvA/exec';

if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = mainContactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Convert FormData to URLSearchParams to send it as application/x-www-form-urlencoded.
        // This ensures Google Apps Script can read variables via e.parameter.
        const formData = new FormData(mainContactForm);

        // Expose phone value to other common naming conventions (mobile, tel, etc.)
        // for maximum compatibility with custom Google Sheets column mapping scripts
        const phoneValue = formData.get('phone');
        if (phoneValue) {
            formData.append('mobile', phoneValue);
            formData.append('tel', phoneValue);
            formData.append('mobile-number', phoneValue);
            formData.append('phone-number', phoneValue);
        }

        const searchParams = new URLSearchParams(formData);

        if (APP_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.warn('Google Apps Script URL is not set. Simulating success...');
            setTimeout(() => {
                formSuccess.classList.remove('hidden');
                mainContactForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
            return;
        }

        // Send POST request to the Google Web App
        fetch(APP_SCRIPT_URL, {
            method: 'POST',
            body: searchParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.result === 'success') {
                    formSuccess.classList.remove('hidden');
                    mainContactForm.reset();
                } else {
                    throw new Error(data.error || 'Server returned an error');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('There was an error sending your message. Please try again or email us directly at gexora.official@gmail.com.');
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
    });

    const closeSuccessBtn = document.getElementById('close-success-btn');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            formSuccess.classList.add('hidden');
        });
    }
}

// =========================================================================
// FAQ Accordion Interactivity
// =========================================================================
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');

        // Close other items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
            }
        });

        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
            answer.style.maxHeight = '0px';
        } else {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// =========================================================================
// Mobile Menu Navigation Drawer
// =========================================================================
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const mobileMenu = document.getElementById('mobile-menu');
const drawerLinks = document.querySelectorAll('.drawer-link');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

if (menuClose && mobileMenu) {
    menuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Close drawer when clicking a link
drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    });
});

// =========================================================================
// Three.js Interactive 3D Particle & Geometric Background
// =========================================================================
function initHero3D() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 45;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10B981, 1.5, 80);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06B6D4, 1.5, 80);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // Floating 3D Geometric shapes
    const shapes = [];
    const shapeColors = [0x10B981, 0x06B6D4, 0xF59E0B]; // Emerald Teal, Electric Cyan, Amber Gold

    const geometries = [
        new THREE.TorusGeometry(3.5, 0.9, 16, 80),
        new THREE.IcosahedronGeometry(4, 1),
        new THREE.OctahedronGeometry(4, 0)
    ];

    geometries.forEach((geom, idx) => {
        const material = new THREE.MeshPhysicalMaterial({
            color: shapeColors[idx],
            roughness: 0.25,        // Smooth clay surface
            metalness: 0.05,        // Non-metallic clay material
            clearcoat: 1.0,         // Glossy clear finish
            clearcoatRoughness: 0.1,// Very shiny gloss reflection
            transparent: false,     // Solid clay blocks
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.set(
            (idx - 1) * 26,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8
        );
        scene.add(mesh);
        shapes.push(mesh);
    });

    // Particles Geometry
    const particleCount = 70;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i + 1] = (Math.random() - 0.5) * 80;
        positions[i + 2] = (Math.random() - 0.5) * 40;

        velocities.push({
            x: (Math.random() - 0.5) * 0.03,
            y: (Math.random() - 0.5) * 0.03,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material
    const material = new THREE.PointsMaterial({
        color: 0x10B981, // Teal
        size: 1.4,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Dynamic Connections Line setup
    const maxDistance = 18;
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x06B6D4, // Electric Cyan
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Mouse Tracking
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.025;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.025;
    });

    // Window Resize handler
    window.addEventListener('resize', () => {
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Rotate particles
        particleSystem.rotation.y = targetX * 0.003;
        particleSystem.rotation.x = -targetY * 0.003;
        lineSegments.rotation.y = targetX * 0.003;
        lineSegments.rotation.x = -targetY * 0.003;

        // Rotate shapes
        shapes.forEach((shape, idx) => {
            shape.rotation.x += 0.004 * (idx + 1);
            shape.rotation.y += 0.002 * (idx + 1);
            shape.position.y += Math.sin(Date.now() * 0.001 + idx) * 0.01;
            shape.rotation.z += targetX * 0.001;
        });

        const positionsArr = geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            positionsArr[ix] += velocities[i].x;
            positionsArr[ix + 1] += velocities[i].y;
            positionsArr[ix + 2] += velocities[i].z;

            // Boundaries
            if (positionsArr[ix] < -45 || positionsArr[ix] > 45) velocities[i].x *= -1;
            if (positionsArr[ix + 1] < -45 || positionsArr[ix + 1] > 45) velocities[i].y *= -1;
            if (positionsArr[ix + 2] < -25 || positionsArr[ix + 2] > 25) velocities[i].z *= -1;

            // Connection Lines
            for (let j = i + 1; j < particleCount; j++) {
                const jx = j * 3;
                const dx = positionsArr[ix] - positionsArr[jx];
                const dy = positionsArr[ix + 1] - positionsArr[jx + 1];
                const dz = positionsArr[ix + 2] - positionsArr[jx + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDistance) {
                    linePositions.push(positionsArr[ix], positionsArr[ix + 1], positionsArr[ix + 2]);
                    linePositions.push(positionsArr[jx], positionsArr[jx + 1], positionsArr[jx + 2]);
                }
            }
        }

        geometry.attributes.position.needsUpdate = true;

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();
}

// =========================================================================
// 3D Tilt Hover Effects
// =========================================================================
function init3DTilt() {
    const tiltElements = document.querySelectorAll('.service-card, .portfolio-card, .image-wrapper, .funnel-3d-layer, .problem-card');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = -(y - centerY) / centerY * 8; // Max 8 deg tilt for elegant feel
            const rotateY = (x - centerX) / centerX * 8;

            element.classList.remove('reset-tilt');
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        element.addEventListener('mouseleave', () => {
            element.classList.add('reset-tilt');
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// =========================================================================
// Dynamic Mouse coordinates for Glowing borders
// =========================================================================
function initMouseGlow() {
    const cards = document.querySelectorAll('.service-card, .problem-card, .portfolio-card, .funnel-3d-layer');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// =========================================================================
// Stats Count-Up Animation & Circle SVG fills
// =========================================================================
function initStatsCounter() {
    const statBlocks = document.querySelectorAll('.stat-block');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numEl = entry.target.querySelector('.stat-number');
                const progressCircle = entry.target.querySelector('.circle-progress');
                if (!numEl) return;

                const targetVal = parseFloat(numEl.getAttribute('data-target'));
                const isDecimal = numEl.getAttribute('data-decimals') === '1';

                // Fill Circle SVG progress
                if (progressCircle) {
                    // Let circle fill relative to target value metric cap
                    const maxCap = targetVal > 10 ? 120 : 1.2;
                    const percentage = Math.min(targetVal / maxCap, 1);
                    const strokeDashOffset = 263.89 - (263.89 * percentage * 0.95);
                    progressCircle.style.strokeDashoffset = strokeDashOffset;
                }

                // Count up text value
                let currentVal = 0;
                const duration = 2000;
                const steps = 60;
                const stepTime = duration / steps;
                const increment = targetVal / steps;

                let step = 0;
                const timer = setInterval(() => {
                    currentVal += increment;
                    step++;
                    if (step >= steps) {
                        numEl.textContent = isDecimal ? targetVal.toFixed(1) : Math.round(targetVal);
                        clearInterval(timer);
                    } else {
                        numEl.textContent = isDecimal ? currentVal.toFixed(1) : Math.round(currentVal);
                    }
                }, stepTime);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    statBlocks.forEach(block => observer.observe(block));
}

// =========================================================================
// Process Timeline Scroll Tracker
// =========================================================================
function initTimelineTracker() {
    const processSection = document.getElementById('process');
    const progressFill = document.querySelector('.progress-line-fill');
    const steps = document.querySelectorAll('.process-step');
    if (!processSection || !progressFill) return;

    window.addEventListener('scroll', () => {
        const rect = processSection.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Calculate dynamic process vertical visibility index
        const progressStart = viewHeight * 0.8;
        const progressEnd = viewHeight * 0.2;

        let pct = (progressStart - rect.top) / (progressStart - rect.bottom);
        pct = Math.max(0, Math.min(1, pct));

        const isMobile = window.innerWidth <= 992;
        progressFill.style.width = isMobile ? '100%' : `${pct * 100}%`;
        progressFill.style.height = isMobile ? `${pct * 100}%` : '100%';

        // Activate step nodes sequentially
        steps.forEach((step, idx) => {
            const stepThreshold = (idx + 0.3) / steps.length;
            if (pct >= stepThreshold) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    });
}

// =========================================================================
// Portfolio Category Filter Logic
// =========================================================================
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (filterVal === 'all' || cardCategory === filterVal) {
                    card.classList.remove('filtered-out');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.96)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.classList.add('filtered-out');
                }
            });
        });
    });
}

// =========================================================================
// Testimonials Carousel Review Slider
// =========================================================================
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('prev-review');
    const nextBtn = document.getElementById('next-review');
    if (!slides.length) return;

    let currentIndex = 0;
    let autoplayTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            resetAutoplay();
        });
    });

    function startAutoplay() {
        autoplayTimer = setInterval(nextSlide, 6000);
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    startAutoplay();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initHero3D();
    init3DTilt();
    initMouseGlow();
    initStatsCounter();
    initTimelineTracker();
    initPortfolioFilter();
    initTestimonialSlider();
});