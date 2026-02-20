

// Disable right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable common keyboard shortcuts for Inspect Element
// document.addEventListener('keydown', (e) => {
//   // Disable F12
//   if (e.key === 'F12') {
//     e.preventDefault();
//   }

//   // Disable Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Elements)
//   if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
//     e.preventDefault();
//   }

//   // Disable Ctrl+U (View Source)
//   if (e.ctrlKey && e.key === 'u') {
//     e.preventDefault();
//   }

//   // Disable Ctrl+S (Save Page)
//   if (e.ctrlKey && e.key === 's') {
//     e.preventDefault();
//   }
// });




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

/* ─────────────────────────────────────────────────────────────
   CERTIFICATIONS: CELEBRATION CONFETTI + MODAL
   + HOVER / TAP-HOLD DETAIL OVERLAY
───────────────────────────────────────────────────────────── */

// ── Detect desktop hint ──
(function () {
    const isTouch = !window.matchMedia('(hover: hover)').matches;
    const desktopHint = document.querySelector('.desktop-hint');
    const mobileHintGlobal = document.querySelector('.mobile-hint-global');
    if (desktopHint && mobileHintGlobal) {
        if (isTouch) {
            mobileHintGlobal.style.display = 'inline';
            desktopHint.style.display = 'none';
        } else {
            desktopHint.style.display = 'inline';
            mobileHintGlobal.style.display = 'none';
        }
    }
})();

// ── Confetti Engine ──
const canvas = document.getElementById('cert-celebration-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnim = null;
let confettiRunning = false;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = [
    '#0176D3', '#00C6FF', '#A855F7', '#EC4899', '#F59E0B',
    '#10B981', '#F97316', '#6366F1', '#FBBF24', '#34D399'
];

function createConfettiParticles() {
    confettiParticles = [];
    for (let i = 0; i < 160; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 200,
            w: 6 + Math.random() * 10,
            h: 3 + Math.random() * 6,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            vx: (Math.random() - 0.5) * 3,
            vy: 2.5 + Math.random() * 4,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }
}

function drawConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allDone = true;

    confettiParticles.forEach(p => {
        if (p.y < canvas.height + 20) allDone = false;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height * 0.6) {
            p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
    });

    if (!allDone) {
        confettiAnim = requestAnimationFrame(drawConfetti);
    } else {
        stopConfetti();
    }
}

function startConfetti() {
    if (!canvas || confettiRunning) return;
    confettiRunning = true;
    canvas.style.display = 'block';
    createConfettiParticles();
    confettiAnim = requestAnimationFrame(drawConfetti);
}

function stopConfetti() {
    if (!canvas) return;
    confettiRunning = false;
    if (confettiAnim) cancelAnimationFrame(confettiAnim);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
}

// ── Modal controls ──
const modal = document.getElementById('certCelebModal');
const backdrop = document.getElementById('certModalBackdrop');
const closeBtn = document.getElementById('certModalCloseBtn');
let celebrationShown = false;

function showCelebration() {
    if (celebrationShown) return;
    celebrationShown = true;

    startConfetti();

    setTimeout(() => {
        backdrop.classList.add('show');
        modal.classList.add('show');
    }, 500);
}

function hideCelebration() {
    modal.classList.remove('show');
    backdrop.classList.remove('show');
    setTimeout(stopConfetti, 600);
}

closeBtn && closeBtn.addEventListener('click', hideCelebration);
backdrop && backdrop.addEventListener('click', hideCelebration);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) hideCelebration();
});

// ── Scroll trigger for cert section ──
const certSection = document.getElementById('certifications');
if (certSection) {
    const certObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !celebrationShown) {
                showCelebration();
            }
        });
    }, { threshold: 0.3 });
    certObserver.observe(certSection);
}

// ── Cert card tap-and-hold (mobile) ──
const certCards = document.querySelectorAll('.cert-card');
let tapHoldTimer = null;
let activeTappedCard = null;

certCards.forEach(card => {
    // Touch start → begin hold timer
    card.addEventListener('touchstart', (e) => {
        //tapHoldTimer = setTimeout(() => {
            // Remove tapped from others
            certCards.forEach(c => c !== card && c.classList.remove('tapped'));
            card.classList.add('tapped');
            activeTappedCard = card;
            // Subtle haptic if supported
            if (navigator.vibrate) navigator.vibrate(30);
        //}, 0);
    }, { passive: true });

    card.addEventListener('touchend', () => {
        clearTimeout(tapHoldTimer);
    });

    card.addEventListener('touchmove', () => {
        clearTimeout(tapHoldTimer);
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            certCards.forEach(c => c !== card && c.classList.remove('tapped'));
            card.classList.toggle('tapped');
        }
        if (e.key === 'Escape') {
            card.classList.remove('tapped');
        }
    });
});

// Tap elsewhere to dismiss on mobile
document.addEventListener('touchstart', (e) => {
    if (activeTappedCard && !activeTappedCard.contains(e.target)) {
        activeTappedCard.classList.remove('tapped');
        activeTappedCard = null;
    }
}, { passive: true });

    // Popups for commerce + project sections
    
  (function () {
    const DISMISS_KEY = 'ashish_popup_dismissed_';

    // Target delays (active time on tab, NOT wall clock time)
    const TARGET_DELAYS = { commerce: 20000, project: 40000 };
    const AUTO_HIDE_AFTER = 60000; // hide popup after 60s if ignored

    const POSITIONS = ['pos-bottom-left', 'pos-bottom-right', 'pos-top-right', 'pos-top-left'];

    function pickPositions() {
      if (window.innerWidth < 600) return ['pos-bottom-left', 'pos-bottom-right'];
      const shuffled = [...POSITIONS].sort(() => Math.random() - 0.5);
      return [shuffled[0], shuffled[1]];
    }

    function wasDismissed(key) {
      try { return localStorage.getItem(DISMISS_KEY + key) === '1'; } catch(e) { return false; }
    }

    function dismissForever(el, key) {
      try { localStorage.setItem(DISMISS_KEY + key, '1'); } catch(e) {}
      hidePopup(el);
    }

    function showPopup(el, posClass) {
      el.classList.add(posClass);
      el.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    }

    function hidePopup(el) {
      el.classList.remove('visible');
      el.setAttribute('aria-hidden', 'true');
      setTimeout(() => { el.style.display = 'none'; }, 400);
    }

    // ── Tab-aware timer ──────────────────────────────────────────
    // Instead of setTimeout (counts even when tab is hidden),
    // we track how many milliseconds the tab has actually been ACTIVE.
    // When the tab goes hidden, the timer pauses. When it comes back, it resumes.

    function createTabAwareTimer(callback, delayMs) {
      let elapsed = 0;          // ms of active time accumulated so far
      let lastVisible = null;   // timestamp when tab became visible
      let ticker = null;        // setInterval reference
      let fired = false;

      function startTicking() {
        if (fired || ticker) return;
        lastVisible = performance.now();
        ticker = setInterval(() => {
          if (document.hidden) return; // safety guard
          elapsed += performance.now() - lastVisible;
          lastVisible = performance.now();
          if (elapsed >= delayMs) {
            clearInterval(ticker);
            ticker = null;
            fired = true;
            callback();
          }
        }, 250); // checks 4× per second — lightweight
      }

      function pauseTicking() {
        if (ticker) {
          // Bank whatever time passed since we last checked
          if (lastVisible !== null) {
            elapsed += performance.now() - lastVisible;
            lastVisible = null;
          }
          clearInterval(ticker);
          ticker = null;
        }
      }

      // Page Visibility API listener
      function onVisibilityChange() {
        if (document.hidden) {
          pauseTicking();
        } else {
          startTicking();
        }
      }

      document.addEventListener('visibilitychange', onVisibilityChange);

      // Start immediately if tab is already visible
      if (!document.hidden) startTicking();

      // Return a cancel function in case needed
      return function cancel() {
        fired = true;
        clearInterval(ticker);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }
    // ─────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
      const popupCommerce = document.getElementById('floatPopupCommerce');
      const popupProject  = document.getElementById('floatPopupProject');
      const [pos1, pos2]  = pickPositions();

      // ── Commerce popup ──
      if (!wasDismissed('commerce') && popupCommerce) {
        createTabAwareTimer(() => {
          showPopup(popupCommerce, pos1);
          // Auto-hide after 12s if user ignores it
          createTabAwareTimer(() => {
            if (popupCommerce.classList.contains('visible')) hidePopup(popupCommerce);
          }, AUTO_HIDE_AFTER);
        }, TARGET_DELAYS.commerce);

        document.getElementById('closePopupCommerce')
          .addEventListener('click', () => hidePopup(popupCommerce));
        document.getElementById('laterPopupCommerce')
          .addEventListener('click', () => dismissForever(popupCommerce, 'commerce'));
      } else if (popupCommerce) {
        popupCommerce.style.display = 'none';
      }

      // ── Project popup ──
      if (!wasDismissed('project') && popupProject) {
        createTabAwareTimer(() => {
          showPopup(popupProject, pos2);
          createTabAwareTimer(() => {
            if (popupProject.classList.contains('visible')) hidePopup(popupProject);
          }, AUTO_HIDE_AFTER);
        }, TARGET_DELAYS.project);

        document.getElementById('closePopupProject')
          .addEventListener('click', () => hidePopup(popupProject));
        document.getElementById('laterPopupProject')
          .addEventListener('click', () => dismissForever(popupProject, 'project'));
      } else if (popupProject) {
        popupProject.style.display = 'none';
      }
    });
  })();


  

