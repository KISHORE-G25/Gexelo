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
        this.chatHistory = [];
        this.isTyping = false;
        this.hasInitialized = false;
    }

    init() {
        if (this.hasInitialized) return;
        this.hasInitialized = true;
        
        // Push initial greetings to chat history
        this.chatHistory.push({ role: 'bot', text: "Hey 👋 I'm Xelo. I build high-performance systems, resume sites, portfolios, and online storefronts that turn visitors into customers." });
        this.chatHistory.push({ role: 'bot', text: "To give you the right strategy, do you already have a website or are you starting from scratch?" });

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
        
        // Command handlers for testing AI mode client-side
        if (message.startsWith('/apikey ') || message.startsWith('/key ')) {
            const key = message.replace(/^\/(apikey|key)\s+/, '').trim();
            localStorage.setItem('GEMINI_API_KEY', key);
            this.appendMessage(message, 'user');
            this.simulateTyping(() => {
                this.appendMessage("Gemini API Key saved locally in your browser. Future responses will be generated directly using Google's Gemini AI model! Type `/clearkey` to remove it.", 'bot');
                this.chatHistory.push({ role: 'bot', text: "Gemini API Key saved locally." });
            }, 600);
            return;
        }
        
        if (message.trim() === '/clearkey') {
            localStorage.removeItem('GEMINI_API_KEY');
            this.appendMessage(message, 'user');
            this.simulateTyping(() => {
                this.appendMessage("Gemini API Key removed. Reverting to Google Apps Script proxy / local fallback.", 'bot');
                this.chatHistory.push({ role: 'bot', text: "Gemini API Key removed." });
            }, 600);
            return;
        }

        // Append user query to UI
        this.appendMessage(message, 'user');
        
        // Add user message to history
        this.chatHistory.push({ role: 'user', text: message });
        
        // Fetch AI response (Gemini via secure Apps Script proxy or local smart helper fallback)
        this.getAIResponse(message);
    }

    handleAction(state, actionType) {
        if (state === 'WEBSITE') {
            const text = actionType === 'EXISTING' ? "I have an existing website" : "I am starting fresh";
            this.handleInput(text);
        }
    }

    getAIResponse(message) {
        this.simulateTyping(() => {
            const localApiKey = localStorage.getItem('GEMINI_API_KEY');
            if (localApiKey && localApiKey.trim() !== '') {
                this.queryGeminiDirect(message, localApiKey);
                return;
            }

            const isBackendConfigured = typeof APP_SCRIPT_URL !== 'undefined' && 
                                       APP_SCRIPT_URL !== '' && 
                                       APP_SCRIPT_URL.indexOf('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') === -1;

            if (isBackendConfigured) {
                const payload = {
                    action: 'chat',
                    message: message,
                    history: JSON.stringify(this.chatHistory.slice(0, -1)) // Send history up to the current turn
                };

                fetch(APP_SCRIPT_URL, {
                    method: 'POST',
                    body: new URLSearchParams(payload),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Network response failed');
                    return response.json();
                })
                .then(data => {
                    if (data.result === 'success' && data.reply) {
                        const reply = data.reply;
                        this.appendMessage(reply, 'bot');
                        this.chatHistory.push({ role: 'bot', text: reply });
                    } else {
                        throw new Error(data.error || 'API returns error');
                    }
                })
                .catch(error => {
                    console.warn('Google Apps Script Gemini proxy failed. Falling back to local smart helper...', error);
                    this.handleLocalFallback(message);
                });
            } else {
                this.handleLocalFallback(message);
            }
        }, 1200);
    }

    queryGeminiDirect(message, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const contents = this.chatHistory.map(item => {
            return {
                role: item.role === 'bot' ? 'model' : 'user',
                parts: [{ text: item.text }]
            };
        });

        const payload = {
            contents: contents,
            systemInstruction: {
                parts: [
                    {
                        text: "You are Xelo, an elite growth AI consultant for Gexelo, a premium digital systems agency. Your goal is to guide visitors, answer technical questions, explain Gexelo's services, and encourage them to scale their business. \n\nServices details:\n- Launch Tier (starts at ₹25,000): 5-page conversion website, responsive layout, basic SEO, basic support.\n- Growth Tier (starts at ₹60,000): Custom UI/UX, CMS integration, blogs, advanced SEO, 90-day support.\n- Scale Tier (Custom Quote): AI chatbots, CRM & API integrations, ecommerce storefronts, automation, dedicated VIP support.\n\nGuidelines:\n- Your tone is professional, consultative, extremely intelligent, concise, and focused on scaling. \n- Keep responses short (under 3 sentences per paragraph, maximum 2 paragraphs) and structured in clear markdown (use bullets where appropriate).\n- Keep all descriptions aligned with digital engineering and growth. \n- Always encourage booking a free strategy consultation by using Gexelo's contact form, or scrolling down to get started."
                    }
                ]
            }
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) throw new Error('API key may be invalid or quota exceeded.');
            return response.json();
        })
        .then(data => {
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const reply = data.candidates[0].content.parts[0].text;
                this.appendMessage(reply, 'bot');
                this.chatHistory.push({ role: 'bot', text: reply });
            } else {
                throw new Error('Invalid response structure');
            }
        })
        .catch(error => {
            console.error('Direct Gemini query failed:', error);
            this.appendMessage(`Direct query failed: ${error.message}. Falling back to local assistant...`, 'bot');
            this.handleLocalFallback(message);
        });
    }

    handleLocalFallback(message) {
        const text = message.toLowerCase();
        let reply = "";

        if (text.includes('price') || text.includes('pricing') || text.includes('pricings') || text.includes('cost') || text.includes('costs') || text.includes('how much') || text.includes('fee') || text.includes('fees') || text.includes('budget') || text.includes('budgets')) {
            reply = "We offer three transparent starting plans tailored to your stage of growth:\n\n" +
                    "* **Launch (₹25,000):** 5-page conversion website, responsive, basic SEO, basic support.\n" +
                    "* **Growth (₹60,000):** Custom UI/UX, CMS integration, blog systems, advanced SEO, 90-day support (Most Popular).\n" +
                    "* **Scale (Custom Quote):** Bespoke e-commerce, AI chatbots, CRM & API integrations, dedicated VIP support.\n\n" +
                    "Which plan matches your objectives?";
        } 
        else if (text.includes('launch')) {
            reply = "Our **Launch Plan** starts at **₹25,000**. It's built for startups and contains:\n" +
                    "- 5 conversion-optimized pages\n" +
                    "- Full mobile responsive layouts\n" +
                    "- Technical SEO setup & Google Analytics\n" +
                    "- WhatsApp messaging widget integration\n" +
                    "- 30 days of active post-launch support\n\n" +
                    "Would you like to book a strategy call for this plan?";
        } 
        else if (text.includes('growth')) {
            reply = "Our **Growth Plan** starts at **₹60,000**. Ideal for expanding businesses, it adds:\n" +
                    "- Dynamic CMS (content management system) integration\n" +
                    "- Custom bespoke UI/UX designs\n" +
                    "- Business blog system & speed tuning\n" +
                    "- Higher tier Technical & On-page SEO campaign\n" +
                    "- 90 days of dedicated VIP support\n\n" +
                    "Let me know if you would like to book a strategy call to get started!";
        } 
        else if (text.includes('scale')) {
            reply = "Our **Scale Plan** is quote-based and custom-engineered for enterprise dominant results. It features:\n" +
                    "- Custom Ecommerce integrations\n" +
                    "- AI Chatbot (Xelo) customer assistants\n" +
                    "- Full CRM, database, & webhook integrations\n" +
                    "- Marketing automations & admin dashboards\n" +
                    "- Dedicated, 24/7 technical VIP support\n\n" +
                    "We can discuss this in detail during a strategy discovery session.";
        } 
        else if (text.includes('portfolio') || text.includes('work') || text.includes('recent') || text.includes('case study') || text.includes('works') || text.includes('portfolios') || text.includes('example') || text.includes('examples')) {
            reply = "We design executive resume sites, portfolios, and e-commerce platforms. Scroll to the **Recent Work** section above to view live platforms we've deployed, or let me know if you have a specific niche in mind!";
        } 
        else if (text.includes('service') || text.includes('services') || text.includes('capability') || text.includes('capabilities') || text.includes('what you do') || text.includes('what do you do') || text.includes('features') || text.includes('offer') || text.includes('offers') || text.includes('offering') || text.includes('offerings')) {
            reply = "Gexelo builds high-performance growth engines including:\n" +
                    "* **B2B & Service Websites**\n" +
                    "* **Ecommerce Storefronts**\n" +
                    "* **Personal Branding & Portfolios**\n" +
                    "* **Growth Optimization & A/B testing**\n\n" +
                    "Which category best fits your digital goals?";
        } 
        else if (text.includes('process') || text.includes('how you work') || text.includes('timeline') || text.includes('step') || text.includes('steps') || text.includes('method') || text.includes('methodology')) {
            reply = "We use a 3-step synchronized timeline to guarantee conversions:\n" +
                    "1. **Understand (Phase 1):** We study your target customers and bottlenecks.\n" +
                    "2. **Build (Phase 2):** We develop custom designs and performance tracking.\n" +
                    "3. **Launch & Optimize (Phase 3):** We iterate and perform continuous speed tests.\n\n" +
                    "Scroll to the **Deployment Process** section to check it out.";
        } 
        else if (text.includes('contact') || text.includes('call') || text.includes('strategy') || text.includes('book') || text.includes('appointment') || text.includes('meeting') || text.includes('schedule') || text.includes('strategy call')) {
            reply = "You can fill out the contact form directly on this page to schedule a 15-minute strategy discovery session. Our execution team will review your business bottlenecks and outline a conversion roadmap!";
        } 
        else if (text.includes('xelo') || text.includes('xora') || text.includes('who are you') || text.includes('your name') || text.includes('what are you') || text.includes('who you are')) {
            reply = "I'm **Xelo**, Gexelo's AI Growth Consultant. I'm here to answer your questions about our agency, our capabilities, our pricing plans, and guide you towards scaling your business!";
        } 
        else if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('greet') || text.includes('greetings')) {
            reply = "Hello! 👋 How can Gexelo help you scale your business today? Ask me about our website pricing, technical capabilities, or our process!";
        } 
        else {
            reply = "I'm here to help you scale your business. Ask me anything about our web engineering capabilities, pricing plans (Launch, Growth, Scale), process timelines, or how to schedule a discovery call!";
        }

        this.appendMessage(reply, 'bot');
        this.chatHistory.push({ role: 'bot', text: reply });
    }

    formatMarkdown(text) {
        if (!text) return "";
        let html = text;
        
        // Escape HTML to prevent injection
        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
            
        // Bold formatting (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        
        // Bullet lists (* text or - text)
        const lines = html.split('\n');
        let inList = false;
        const formattedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                const content = trimmed.substring(2);
                if (!inList) {
                    inList = true;
                    return '<ul style="margin: 0.5rem 0 0.5rem 1.2rem; padding: 0; list-style-type: disc;"><li>' + content + '</li>';
                }
                return '<li>' + content + '</li>';
            } else {
                if (inList) {
                    inList = false;
                    return '</ul>' + line;
                }
                return line;
            }
        });
        
        html = formattedLines.join('<br>');
        if (inList) {
            html += '</ul>';
        }
        
        return html;
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
        
        if (sender === 'bot') {
            contentDiv.innerHTML = this.formatMarkdown(text);
        } else {
            contentDiv.innerText = text;
        }

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
    const tiltElements = document.querySelectorAll('.service-card, .portfolio-card, .image-wrapper, .funnel-3d-layer, .problem-card, .pricing-card');

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
    const cards = document.querySelectorAll('.service-card, .problem-card, .portfolio-card, .funnel-3d-layer, .pricing-card');
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
    const steps = document.querySelectorAll('.process-step');
    if (!processSection || !steps.length) return;

    const progressFill = document.querySelector('.progress-line-fill');

    window.addEventListener('scroll', () => {
        const rect = processSection.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Calculate dynamic process vertical visibility index
        const progressStart = viewHeight * 0.8;
        const progressEnd = viewHeight * 0.2;

        let pct = (progressStart - rect.top) / (progressStart - rect.bottom);
        pct = Math.max(0, Math.min(1, pct));

        if (progressFill) {
            const isMobile = window.innerWidth <= 992;
            progressFill.style.width = isMobile ? '100%' : `${pct * 100}%`;
            progressFill.style.height = isMobile ? `${pct * 100}%` : '100%';
        }

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