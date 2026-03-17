// ─── Pi digits (first 200) ────────────────────────────────────
const PI_DIGITS =
    '3.14159265358979323846264338327950288419716939937510' +
    '58209749445923078164062862089986280348253421170679';

// We only show 50 in the reference, but validate against 200
const REFERENCE_COUNT = 50;

// ─── DOM References ───────────────────────────────────────────
const piInput = document.getElementById('pi-input');
const resultIdle = document.getElementById('result-idle');
const resultContent = document.getElementById('result-content');
const scoreNumber = document.getElementById('score-number');
const statusBadge = document.getElementById('status-badge');
const piPreview = document.getElementById('pi-preview');
const refDigits = document.getElementById('reference-digits');
const submitBtn = document.getElementById('submit-btn');

// ─── Build Reference Display ──────────────────────────────────
function buildReference() {
    refDigits.innerHTML = '';
    const slice = PI_DIGITS.slice(0, REFERENCE_COUNT);
    for (const ch of slice) {
        const span = document.createElement('span');
        span.classList.add('ref-digit');
        if (ch === '.') span.classList.add('dot');
        span.dataset.char = ch;
        span.textContent = ch;
        refDigits.appendChild(span);
    }
}

// ─── Core Matching Logic ──────────────────────────────────────
/**
 * Compare the user's input against PI_DIGITS.
 * Returns { score, firstWrongIndex, allCorrect }
 *   score          – number of correct characters up to the first error (or full length)
 *   firstWrongIndex – index of the first wrong character (-1 if none)
 *   allCorrect      – true when every typed character is correct
 */
function evaluateInput(raw) {
    if (raw.length === 0)
        return { score: 0, firstWrongIndex: -1, allCorrect: true };

    for (let i = 0; i < raw.length; i++) {
        if (i >= PI_DIGITS.length) {
            // beyond our known digits — treat as wrong
            return { score: i, firstWrongIndex: i, allCorrect: false };
        }
        if (raw[i] !== PI_DIGITS[i]) {
            return { score: i, firstWrongIndex: i, allCorrect: false };
        }
    }
    return { score: raw.length, firstWrongIndex: -1, allCorrect: true };
}

// ─── Update digit-by-digit preview ───────────────────────────
function buildPreview(raw, firstWrongIndex) {
    piPreview.innerHTML = '';
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        const span = document.createElement('span');
        span.classList.add('digit');
        span.textContent = ch;

        if (ch === '.') {
            span.classList.add('dot');
        } else if (firstWrongIndex !== -1 && i === firstWrongIndex) {
            span.classList.add('wrong');
        } else if (firstWrongIndex === -1 || i < firstWrongIndex) {
            span.classList.add('correct');
        }

        piPreview.appendChild(span);
    }
}

// ─── Update reference highlighting ───────────────────────────
function updateReference(score) {
    const spans = refDigits.querySelectorAll('.ref-digit');
    spans.forEach((span, i) => {
        span.classList.remove('matched', 'missed');
        if (span.classList.contains('dot')) return; // skip dot styling
        if (i < score) {
            span.classList.add('matched');
        }
    });
}

// ─── Animate score number ─────────────────────────────────────
let currentDisplayedScore = 0;
let animFrame = null;

function animateScore(target) {
    if (animFrame) cancelAnimationFrame(animFrame);
    const start = currentDisplayedScore;
    const diff = target - start;
    if (diff === 0) return;
    const duration = Math.min(Math.abs(diff) * 15, 400); // ms
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(start + diff * eased);
        scoreNumber.textContent = current;
        currentDisplayedScore = current;
        if (progress < 1) animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);
}

// ─── Main render ──────────────────────────────────────────────
function render(raw) {
    if (raw.length === 0) {
        // Reset to idle
        resultIdle.hidden = false;
        resultContent.hidden = true;
        updateReference(0);
        currentDisplayedScore = 0;
        return;
    }

    const { score, firstWrongIndex, allCorrect } = evaluateInput(raw);

    // Show result panel
    resultIdle.hidden = true;
    resultContent.hidden = true;

    // Score number
    animateScore(score);

    // Status badge
    statusBadge.className = 'status-badge';
    if (firstWrongIndex !== -1) {
        statusBadge.classList.add('error');
        statusBadge.textContent = '❌ Wrong digit';
    } else if (score >= 10) {
        statusBadge.classList.add('perfect');
        statusBadge.textContent = '🌟 Impressive!';
    } else if (score > 0) {
        statusBadge.classList.add('correct');
        statusBadge.textContent = '✓ All correct';
    } else {
        statusBadge.classList.add('correct');
        statusBadge.textContent = '✓ Keep going';
    }

    // Digit preview
    buildPreview(raw, firstWrongIndex);

    // Reference highlight
    updateReference(score);
}

// ─── Event Listeners ──────────────────────────────────────────
piInput.addEventListener('input', () => {
    render(piInput.value);
});

submitBtn.addEventListener('click', () => {
    resultContent.hidden = false;
    piInput.disabled = true;
});

// ─── Init ─────────────────────────────────────────────────────
buildReference();
piInput.focus();
