// Initialize Lucide Icons
lucide.createIcons();

// Set Current Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        navbar.style.boxShadow = 'none';
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
            this.appendMessage("Hey 👋 I'm Xora. I build systems that turn visitors into customers.", 'bot');

            setTimeout(() => {
                this.simulateTyping(() => {
                    this.appendMessage("To give you the right strategy, do you already have a website or are you starting from scratch?", 'bot');
                    this.appendHTML(`
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                            <button class="chat-action-btn" onclick="xora.handleAction('WEBSITE', 'EXISTING')">Existing Website</button>
                            <button class="chat-action-btn" onclick="xora.handleAction('WEBSITE', 'FRESH')">Starting Fresh</button>
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
                            <button class="chat-action-btn" onclick="xora.handleAction('TRAFFIC_BIZ', 'TRAFFIC_YES')">Yes, steady traffic</button>
                            <button class="chat-action-btn" onclick="xora.handleAction('TRAFFIC_BIZ', 'TRAFFIC_NO')">Not much yet</button>
                        </div>
                    `, 'bot');
                });
            } else {
                this.simulateTyping(() => {
                    this.appendMessage("Understood. What kind of business are we building this for?", 'bot');
                    this.appendHTML(`
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem">
                            <button class="chat-action-btn" onclick="xora.handleAction('TRAFFIC_BIZ', 'BIZ_SERVICE')">Service / B2B</button>
                            <button class="chat-action-btn" onclick="xora.handleAction('TRAFFIC_BIZ', 'BIZ_ECOM')">Ecommerce</button>
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
                this.appendMessage(userText || "Service / B2B", 'user');
                this.leadScore += 2;
            } else if (actionType === 'BIZ_ECOM') {
                this.appendMessage(userText || "Ecommerce", 'user');
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
                        <button class="chat-action-btn" onclick="xora.handleAction('GOAL', 'LEADS')">More Leads</button>
                        <button class="chat-action-btn" onclick="xora.handleAction('GOAL', 'SALES')">More Sales</button>
                        <button class="chat-action-btn" onclick="xora.handleAction('GOAL', 'BASIC')">Speed / Setup</button>
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
                        <button class="chat-action-btn" onclick="xora.handleAction('MINDSET', 'GROWTH')">Growth-focused Scale</button>
                        <button class="chat-action-btn" onclick="xora.handleAction('MINDSET', 'BASIC')">Just a basic setup</button>
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

const xora = new ConversationManager();

function handleToggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        xora.init();
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
    xora.handleInput(message);
});

// =========================================================================
// Contact Form Functionality
// =========================================================================
const mainContactForm = document.getElementById('contact-form');
const formSuccess = document.querySelector('.form-success');

// TODO: Replace this URL with your actual deployed Google Apps Script Web App URL
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeaeQNwLUE6kN-4wpq-5_hwuorZ4XpvR0cttlzVrfAKPXti0Xf8VEjQv_MdVah4vFVIg/exec';

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
        const searchParams = new URLSearchParams(formData);

        if (APP_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.warn('Google Apps Script URL is not set. Simulating success...');
            setTimeout(() => {
                mainContactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
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
                    mainContactForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                } else {
                    throw new Error(data.error || 'Server returned an error');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('There was an error sending your message. Please try again or email us directly at gexora.official@gmail.com.');
                btn.textContent = originalText;
                btn.disabled = false;
            });
    });
}
