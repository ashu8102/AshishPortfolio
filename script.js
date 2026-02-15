
const element = document.getElementById("typing-text");

// Dynamic words that cycle
const dynamicWords = ["Salesforce", "Agentforce", "HubSpot"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let dynamicEl = null;
let typingDone = false;

// Step 1: Type the static prefix first
const staticPrefix = "Building Scalable\nSolutions on the\n ";
let prefixIndex = 0;

function typePrefix() {
    if (prefixIndex < staticPrefix.length) {
        if (staticPrefix.charAt(prefixIndex) === "\n") {
            element.innerHTML += "<br>";
        } else {
            element.innerHTML += staticPrefix.charAt(prefixIndex);
        }
        prefixIndex++;
        setTimeout(typePrefix, 80);
    } else {
        // Prefix done — build the structure
        element.classList.remove("typing");
        element.innerHTML =
            "Building Scalable<br>Solutions on the<br> " +
            "<span class='accent-line' id='dynamic-word'></span>" +
            "<span class='accent-line' id='static-suffix'> Platform</span>";

        dynamicEl = document.getElementById("dynamic-word");

        // Fade in " Platform" suffix
        const suffix = document.getElementById("static-suffix");
        suffix.style.opacity = "0";
        suffix.style.transition = "opacity 0.5s ease";
        setTimeout(() => { suffix.style.opacity = "1"; }, 200);

        // Start cycling words
        setTimeout(cycleWords, 400);
    }
}

// Step 2: Type → pause → delete → next word
function cycleWords() {
    const currentWord = dynamicWords[wordIndex];

    if (!isDeleting) {
        // Typing forward
        dynamicEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
            // Finished typing — pause then start deleting
            setTimeout(() => { isDeleting = true; cycleWords(); }, 1800);
            return;
        }
        setTimeout(cycleWords, 150);

    } else {
        // Deleting
        dynamicEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            // Finished deleting — move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % dynamicWords.length;
            setTimeout(cycleWords, 300);
            return;
        }
        setTimeout(cycleWords, 90);
    }
}

// Kick off
typePrefix();





/* NAV */
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* SKILLS TABS */
const panelIcon = document.getElementById('panelIcon');
const panelTitle = document.getElementById('panelTitle');
const panelDesc = document.getElementById('panelDesc');
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector(`[data-panel="${tab}"]`).classList.add('active');
        panelIcon.textContent = btn.dataset.icon;
        panelTitle.textContent = btn.dataset.title;
        panelDesc.innerHTML = btn.dataset.desc;
    });
});

/* SCROLL FADE */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

/* FORM */
async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Sending…'; btn.disabled = true;
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        subject: e.target.subject.value,
        message: e.target.message.value
    };
    try {
        const response = await fetch(
            'https://ashishkurzekar-dev-ed.develop.my.salesforce-sites.com/webhook/services/apexrest/webhook/case',
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
        );
        if (!response.ok) throw new Error('Failed');
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#166534';
        e.target.reset();
    } catch (err) {
        btn.textContent = 'Error! Try Again';
        btn.style.background = '#b91c1c';
    }
    setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; btn.disabled = false; }, 3000);
}



document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".num");
    const duration = 2500; // slower & smoother
    const animateCounter = (el) => {
        if (el.dataset.animating === "true") return;
        el.dataset.animating = "true";

        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const duration = 2500;

        let current = 0;
        const startTime = performance.now();

        const update = (now) => {
            const elapsed = now - startTime;

            // Calculate how many numbers should have passed by now
            const progress = Math.min(elapsed / duration, 1);
            const nextValue = Math.floor(progress * target);

            // This ensures smooth meter-like counting (no big jumps)
            if (nextValue !== current) {
                current = nextValue;
                el.textContent = current + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
                el.dataset.animating = "false";
            }
        };

        requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const el = entry.target;

                if (entry.isIntersecting) {
                    el.parentElement.classList.add("visible");
                    animateCounter(el);
                } else {
                    el.textContent = "0";
                    el.parentElement.classList.remove("visible");
                    el.dataset.animating = "false";
                }
            });
        },
        { threshold: 0.7 }
    );

    counters.forEach(counter => observer.observe(counter));
});

