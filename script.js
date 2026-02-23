// ===== STATE =====
let currentScreen = 'landing';
let completedScreens = new Set();
let memeCount = 0;

// ===== CODE INPUT AUTO-ADVANCE =====
document.querySelectorAll('.code-input-group').forEach(group => {
    const inputs = group.querySelectorAll('.code-char');
    inputs.forEach((input, i) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && i < inputs.length - 1) {
                inputs[i + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                inputs[i - 1].focus();
            }
        });
    });
});

// ===== NAVIGATION =====
function showScreen(id) {
    document.querySelectorAll('.screen, #landing, #victory').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    const el = document.getElementById(id);
    if (el) {
        if (id === 'landing' || id === 'victory') {
            el.style.display = 'flex';
            el.classList.add('active');
        } else {
            el.style.display = 'block';
            el.classList.add('active');
        }
    }

    currentScreen = id;
    updateNav();
    window.scrollTo(0, 0);
}

function startGame() {
    document.getElementById('nav-dots').style.display = 'flex';
    showScreen('enigme1');
}

function goToScreen(id) {
    const num = parseInt(id.replace('enigme', ''));
    if (completedScreens.has(num) || num <= completedScreens.size + 1) {
        showScreen(id);
    }
}

function updateNav() {
    for (let i = 1; i <= 6; i++) {
        const dot = document.getElementById('dot-' + i);
        dot.classList.remove('current', 'completed');
        if (completedScreens.has(i)) dot.classList.add('completed');
        if (currentScreen === 'enigme' + i) dot.classList.add('current');
    }
}

// ===== CODE CHECKING =====
function checkCode(enigmeNum, expectedCode, nextScreen) {
    const screen = document.getElementById('enigme' + enigmeNum);
    const codeSections = screen.querySelectorAll('.code-section');
    const lastSection = codeSections[codeSections.length - 1];
    const codeInputs = lastSection.querySelectorAll('.code-char');

    let code = '';
    codeInputs.forEach(inp => code += inp.value);
    code = code.toUpperCase();

    const errorEl = document.getElementById('error' + enigmeNum);

    if (code === expectedCode.toUpperCase()) {
        completedScreens.add(enigmeNum);
        errorEl.textContent = '';

        codeInputs.forEach(inp => {
            inp.style.borderColor = 'var(--success-light)';
            inp.style.color = 'var(--success-light)';
        });

        setTimeout(() => {
            if (nextScreen === 'victory') {
                showVictoryScreen();
            } else {
                showScreen(nextScreen);
            }
        }, 800);
    } else {
        errorEl.textContent = '✗ Wrong code. Try again.';
        codeInputs.forEach(inp => {
            inp.style.borderColor = 'var(--danger-light)';
            setTimeout(() => inp.style.borderColor = 'var(--border)', 1000);
        });
    }
}

// ===== ENIGME 2: CHARADE =====
function checkCharade() {
    const answers = {
        charade1: 'war',
        charade2: 'room',
        charade3: 'warroom'
    };

    for (const [id, answer] of Object.entries(answers)) {
        const input = document.getElementById(id);
        const fb = document.getElementById('fb-' + id);
        const val = input.value.trim().toLowerCase();

        if (val === answer) {
            input.classList.remove('incorrect');
            input.classList.add('correct');
            fb.textContent = '✓ Correct!';
            fb.className = 'feedback correct';
        } else if (val) {
            input.classList.remove('correct');
            input.classList.add('incorrect');
            fb.textContent = '✗ Try again';
            fb.className = 'feedback incorrect';
        }
    }
}

// ===== ENIGME 3: CAFETERIA QUESTIONS =====
function checkQ3(num) {
    const input = document.getElementById('q3-' + num);
    const fb = document.getElementById('fb-q3-' + num);
    const val = input.value.trim().toLowerCase();

    if (val.length > 0) {
        fb.textContent = '📝 Answer noted — check with your team!';
        fb.className = 'feedback';
        fb.style.color = 'var(--accent)';
    }
}

// ===== ENIGME 5: MEME QR =====
function scanMeme(el, num) {
    if (!el.classList.contains('scanned')) {
        el.classList.add('scanned');
        memeCount++;
        document.getElementById('meme-status').innerHTML =
            `QR Codes scanned: <strong>${memeCount} / 6</strong>` +
            (memeCount === 6 ? ' — 🎯 All scanned! Look for the ragebait video clue!' : '');
    }
}

// ===== ENIGME 6: HANDCUFF CODE =====
function checkHandcuffCode() {
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += document.getElementById('hc-' + i).value;
    }
    code = code.toUpperCase();

    if (code === '8297A') {
        document.getElementById('error-hc').textContent = '';
        document.getElementById('part3-header').style.display = 'block';
        document.getElementById('part3-content').style.display = 'block';
        initPuzzle();
        initScramble();

        setTimeout(() => {
            document.getElementById('part3-header').scrollIntoView({ behavior: 'smooth' });
        }, 300);
    } else {
        document.getElementById('error-hc').textContent = '✗ Wrong handcuff code.';
    }
}

// ===== ENIGME 6: IMAGE PUZZLE =====
const RAT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <!-- Sky background -->
    <rect width="300" height="300" fill="#e8f0fe"/>
    <!-- Mountains -->
    <polygon points="0,180 60,80 120,180" fill="#b0c4de"/>
    <polygon points="80,180 160,50 240,180" fill="#8faabe"/>
    <polygon points="180,180 260,90 340,180" fill="#b0c4de"/>
    <!-- Snow peaks -->
    <polygon points="140,50 150,70 160,50 155,60 145,60" fill="white"/>
    <polygon points="50,80 60,95 70,80 65,88 55,88" fill="white"/>
    <!-- Snow ground -->
    <rect x="0" y="180" width="300" height="120" fill="white"/>
    <!-- Ski tracks -->
    <line x1="80" y1="280" x2="180" y2="200" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
    <line x1="90" y1="280" x2="190" y2="200" stroke="#ccc" stroke-width="1.5" stroke-dasharray="4,4"/>
    <!-- Skis -->
    <line x1="115" y1="258" x2="175" y2="218" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
    <line x1="125" y1="262" x2="185" y2="222" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
    <!-- Rat body -->
    <ellipse cx="150" cy="230" rx="28" ry="22" fill="#8b7355" transform="rotate(-20, 150, 230)"/>
    <!-- Rat belly -->
    <ellipse cx="152" cy="234" rx="18" ry="14" fill="#c4a97d" transform="rotate(-20, 152, 234)"/>
    <!-- Rat head -->
    <circle cx="130" cy="210" r="18" fill="#8b7355"/>
    <!-- Rat snout -->
    <ellipse cx="117" cy="215" rx="10" ry="7" fill="#a08860"/>
    <!-- Nose -->
    <circle cx="109" cy="213" r="3" fill="#333"/>
    <!-- Eyes -->
    <circle cx="125" cy="205" r="4" fill="white"/>
    <circle cx="125" cy="205" r="2.5" fill="#333"/>
    <circle cx="126" cy="204" r="1" fill="white"/>
    <!-- Ear -->
    <circle cx="138" cy="195" r="10" fill="#d4a76a"/>
    <circle cx="138" cy="195" r="6" fill="#e8c49a"/>
    <!-- Other ear -->
    <circle cx="122" cy="196" r="8" fill="#d4a76a"/>
    <circle cx="122" cy="196" r="5" fill="#e8c49a"/>
    <!-- Whiskers -->
    <line x1="109" y1="213" x2="85" y2="208" stroke="#555" stroke-width="0.8"/>
    <line x1="109" y1="215" x2="84" y2="216" stroke="#555" stroke-width="0.8"/>
    <line x1="109" y1="217" x2="86" y2="224" stroke="#555" stroke-width="0.8"/>
    <!-- Mouth smile -->
    <path d="M112,219 Q117,224 122,220" fill="none" stroke="#555" stroke-width="1"/>
    <!-- Arm with ski pole -->
    <line x1="140" y1="222" x2="110" y2="195" stroke="#8b7355" stroke-width="5" stroke-linecap="round"/>
    <line x1="110" y1="195" x2="105" y2="260" stroke="#666" stroke-width="2"/>
    <circle cx="105" cy="260" r="4" fill="none" stroke="#666" stroke-width="1.5"/>
    <!-- Other arm with pole -->
    <line x1="158" y1="225" x2="178" y2="200" stroke="#8b7355" stroke-width="5" stroke-linecap="round"/>
    <line x1="178" y1="200" x2="185" y2="265" stroke="#666" stroke-width="2"/>
    <circle cx="185" cy="265" r="4" fill="none" stroke="#666" stroke-width="1.5"/>
    <!-- Tail -->
    <path d="M172,240 Q200,230 195,205 Q192,195 198,190" fill="none" stroke="#8b7355" stroke-width="3" stroke-linecap="round"/>
    <!-- Scarf -->
    <path d="M120,220 Q130,225 142,218" fill="none" stroke="#e74c3c" stroke-width="4" stroke-linecap="round"/>
    <path d="M142,218 Q148,230 145,240" fill="none" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
    <!-- Goggles -->
    <ellipse cx="126" cy="206" rx="7" ry="5" fill="none" stroke="#f39c12" stroke-width="2"/>
    <rect x="132" y="204" width="6" height="2" fill="#f39c12" rx="1"/>
    <!-- Snow particles -->
    <circle cx="30" cy="100" r="2" fill="white" opacity="0.8"/>
    <circle cx="250" cy="60" r="2.5" fill="white" opacity="0.7"/>
    <circle cx="70" cy="150" r="1.5" fill="white" opacity="0.6"/>
    <circle cx="220" cy="130" r="2" fill="white" opacity="0.8"/>
    <circle cx="280" cy="170" r="1.5" fill="white" opacity="0.5"/>
    <circle cx="40" cy="50" r="2" fill="white" opacity="0.7"/>
    <circle cx="200" cy="30" r="1.5" fill="white" opacity="0.6"/>
</svg>`;

let puzzlePieces = [0,1,2,3,4,5,6,7,8];
let selectedPiece = null;
let puzzleSolved = false;

function initPuzzle() {
    shufflePuzzle();
}

function shufflePuzzle() {
    puzzleSolved = false;
    selectedPiece = null;
    puzzlePieces = [0,1,2,3,4,5,6,7,8];
    for (let i = puzzlePieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
    }
    if (puzzlePieces.every((v, i) => v === i)) {
        [puzzlePieces[0], puzzlePieces[8]] = [puzzlePieces[8], puzzlePieces[0]];
    }
    renderPuzzle();
}

function renderPuzzle() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';

    puzzlePieces.forEach((pieceId, slotIndex) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        if (selectedPiece === slotIndex) {
            piece.classList.add('selected');
        }

        const row = Math.floor(pieceId / 3);
        const col = pieceId % 3;

        piece.innerHTML = `<div style="
            width: 300px;
            height: 300px;
            position: absolute;
            top: ${-row * 100}%;
            left: ${-col * 100}%;
        ">${RAT_SVG}</div>`;

        piece.style.overflow = 'hidden';
        piece.onclick = () => handlePieceClick(slotIndex);
        container.appendChild(piece);
    });

    if (puzzlePieces.every((v, i) => v === i)) {
        puzzleSolved = true;
        document.getElementById('puzzle-status').innerHTML = '✅ <span style="color: var(--success-light);">Puzzle solved! Now unscramble the letters below.</span>';
        document.querySelectorAll('.puzzle-piece').forEach(p => {
            p.style.border = 'none';
            p.style.cursor = 'default';
        });
    }
}

function handlePieceClick(slotIndex) {
    if (puzzleSolved) return;

    if (selectedPiece === null) {
        selectedPiece = slotIndex;
        renderPuzzle();
    } else if (selectedPiece === slotIndex) {
        selectedPiece = null;
        renderPuzzle();
    } else {
        [puzzlePieces[selectedPiece], puzzlePieces[slotIndex]] = [puzzlePieces[slotIndex], puzzlePieces[selectedPiece]];
        selectedPiece = null;
        renderPuzzle();
    }
}

// ===== ENIGME 6: LETTER SCRAMBLE =====
const TARGET_WORD = 'SCHIRA';
let scrambledLetters = [];
let selectedLetters = [];

function initScramble() {
    const letters = TARGET_WORD.split('');
    scrambledLetters = [...letters].sort(() => Math.random() - 0.5);
    selectedLetters = [];
    renderScramble();
}

function renderScramble() {
    const container = document.getElementById('scramble-letters');
    const slots = document.getElementById('answer-slots');

    container.innerHTML = '';
    slots.innerHTML = '';

    scrambledLetters.forEach((letter, i) => {
        const el = document.createElement('div');
        el.className = 'scramble-letter' + (selectedLetters.some(s => s.origIndex === i) ? ' selected' : '');
        el.textContent = letter;
        el.onclick = () => selectLetter(i, letter);
        container.appendChild(el);
    });

    for (let i = 0; i < TARGET_WORD.length; i++) {
        const el = document.createElement('div');
        el.className = 'answer-slot' + (selectedLetters[i] ? ' filled' : '');
        el.textContent = selectedLetters[i] ? selectedLetters[i].letter : '';
        el.onclick = () => removeLetter(i);
        slots.appendChild(el);
    }
}

function selectLetter(origIndex, letter) {
    if (selectedLetters.some(s => s.origIndex === origIndex)) return;
    if (selectedLetters.length >= TARGET_WORD.length) return;

    selectedLetters.push({ origIndex, letter });
    renderScramble();
}

function removeLetter(slotIndex) {
    if (selectedLetters[slotIndex]) {
        selectedLetters.splice(slotIndex, 1);
        renderScramble();
    }
}

function resetScramble() {
    selectedLetters = [];
    renderScramble();
}

function checkArrest() {
    const word = selectedLetters.map(s => s.letter).join('').toUpperCase();
    const errorEl = document.getElementById('error-arrest');

    if (word === TARGET_WORD) {
        completedScreens.add(6);
        errorEl.textContent = '';

        document.getElementById('arrest-btn').textContent = '✓ SUSPECT ARRESTED!';
        document.getElementById('arrest-btn').style.background = 'var(--success)';
        document.getElementById('arrest-btn').disabled = true;

        setTimeout(() => {
            showVictoryScreen();
        }, 1500);
    } else {
        errorEl.textContent = '✗ Wrong name. Rearrange the letters!';
    }
}

// ===== PROOF CODE GENERATION =====
function generateProofCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateHash() {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).substring(2, 10);
    const r2 = Math.random().toString(36).substring(2, 10);
    return (t + r + r2).toUpperCase().match(/.{1,4}/g).join('-');
}

function showVictoryScreen() {
    document.getElementById('nav-dots').style.display = 'none';

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('proof-date').textContent = dateStr + ' — ' + timeStr;
    document.getElementById('proof-code').textContent = generateProofCode();
    document.getElementById('proof-hash').textContent = generateHash();

    showScreen('victory');
    launchConfetti();
}

// ===== CONFETTI =====
function launchConfetti() {
    const colors = ['#c9a227', '#8b0000', '#2d6a2d', '#e0d5c1', '#cc0000'];
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 8 + 5) + 'px';
            confetti.style.height = (Math.random() * 8 + 5) + 'px';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}
