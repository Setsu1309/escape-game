let currentScreen = 'landing';
let completedScreens = new Set();
let memeCount = 0;

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

const TOTAL_MEMES = 10;

function getScannedQRs() {
    try {
        return JSON.parse(localStorage.getItem('scannedQRs') || '[]');
    } catch(e) {
        return [];
    }
}

function saveScannedQR(num) {
    const scanned = getScannedQRs();
    if (!scanned.includes(num)) {
        scanned.push(num);
        localStorage.setItem('scannedQRs', JSON.stringify(scanned));
    }
    return scanned;
}

function updateMemeGrid() {
    const scanned = getScannedQRs();
    const grid = document.querySelectorAll('.meme-qr');
    grid.forEach((el, i) => {
        const num = i + 1;
        if (scanned.includes(num)) {
            el.classList.add('scanned');
        }
    });
    document.getElementById('meme-status').innerHTML =
        `QR Codes scanned: <strong>${scanned.length} / ${TOTAL_MEMES}</strong>` +
        (scanned.length >= TOTAL_MEMES ? ' — 🎯 All scanned! Now scan the final QR code!' : '');
}

function showQRPopup(type, num) {
    const existing = document.getElementById('qr-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'qr-popup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; padding: 2rem; animation: fadeIn 0.3s ease-out;
    `;

    if (type === 'meme') {
        const scanned = saveScannedQR(num);
        popup.innerHTML = `
            <div style="max-width: 400px; width: 100%; text-align: center;">
                <img src="${num}.png" alt="Meme ${num}" style="max-width: 100%; max-height: 60vh; border: 2px solid var(--border); margin-bottom: 1rem;">
                <p style="font-family: 'Special Elite', cursive; color: var(--accent); font-size: 1.1rem; margin-bottom: 0.5rem;">
                    😂 Nice try! This is not the right one...
                </p>
                <p style="font-family: 'Courier Prime', monospace; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                    QR codes scanned: ${scanned.length} / ${TOTAL_MEMES}
                </p>
                <button onclick="closeQRPopup()" style="
                    font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 3px;
                    padding: 0.7rem 2rem; background: transparent; border: 2px solid var(--accent);
                    color: var(--accent); cursor: pointer;
                ">CONTINUE</button>
            </div>
        `;
    } else if (type === 'final') {
        const scanned = getScannedQRs();
        if (scanned.length >= TOTAL_MEMES) {
            popup.innerHTML = `
                <div style="max-width: 400px; width: 100%; text-align: center;">
                    <img src="finalimage.png" alt="Final clue" style="max-width: 100%; max-height: 60vh; border: 2px solid var(--success-light); margin-bottom: 1rem;">
                    <p style="font-family: 'Bebas Neue', sans-serif; color: var(--success-light); font-size: 1.5rem; letter-spacing: 3px; margin-bottom: 0.5rem;">
                        🎯 YOU FOUND THE REAL CLUE!
                    </p>
                    <p style="font-family: 'Special Elite', cursive; color: var(--text); font-size: 1rem; margin-bottom: 1.5rem;">
                        Use this to find the code and enter it on the game page.
                    </p>
                    <button onclick="closeQRPopup()" style="
                        font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 3px;
                        padding: 0.7rem 2rem; background: var(--success); border: none;
                        color: var(--text); cursor: pointer;
                    ">BACK TO GAME</button>
                </div>
            `;
        } else {
            const remaining = TOTAL_MEMES - scanned.length;
            popup.innerHTML = `
                <div style="max-width: 400px; width: 100%; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                    <p style="font-family: 'Bebas Neue', sans-serif; color: var(--danger-light); font-size: 1.5rem; letter-spacing: 3px; margin-bottom: 0.5rem;">
                        LOCKED
                    </p>
                    <p style="font-family: 'Special Elite', cursive; color: var(--text); font-size: 1rem; margin-bottom: 0.5rem;">
                        You must scan all the other QR codes first!
                    </p>
                    <p style="font-family: 'Courier Prime', monospace; color: var(--accent); font-size: 1rem; margin-bottom: 1.5rem;">
                        ${remaining} more to go...
                    </p>
                    <button onclick="closeQRPopup()" style="
                        font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 3px;
                        padding: 0.7rem 2rem; background: transparent; border: 2px solid var(--danger-light);
                        color: var(--danger-light); cursor: pointer;
                    ">GO BACK</button>
                </div>
            `;
        }
    }

    document.body.appendChild(popup);
}

function closeQRPopup() {
    const popup = document.getElementById('qr-popup');
    if (popup) popup.remove();
    updateMemeGrid();
}

function resetQRScans() {
    localStorage.removeItem('scannedQRs');
    updateMemeGrid();
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const qr = params.get('qr');
    
    if (qr) {
        document.getElementById('nav-dots').style.display = 'flex';
        showScreen('enigme5');
        setTimeout(updateMemeGrid, 300);
        
        if (qr === 'final') {
            showQRPopup('final');
        } else {
            const num = parseInt(qr);
            if (num >= 1 && num <= TOTAL_MEMES) {
                showQRPopup('meme', num);
            }
        }
        window.history.replaceState({}, '', window.location.pathname);
    } else {
        setTimeout(updateMemeGrid, 500);
    }
});

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

const RAT_IMG_SRC = 'Skirat.jpg';
const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE; // 9
const EMPTY_TILE = TOTAL_TILES - 1; // piece 8 is hidden (bottom-right)

let puzzleState = [];
let puzzleSolved = false;

function initPuzzle() {
    puzzleSolved = false;
    puzzleState = [0,1,2,3,4,5,6,7,8];
    for (let i = 0; i < 200; i++) {
        const emptyIdx = puzzleState.indexOf(EMPTY_TILE);
        const neighbors = getNeighbors(emptyIdx);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        [puzzleState[emptyIdx], puzzleState[randomNeighbor]] = [puzzleState[randomNeighbor], puzzleState[emptyIdx]];
    }
    if (puzzleState.every((v, i) => v === i)) {
        const emptyIdx = puzzleState.indexOf(EMPTY_TILE);
        const neighbors = getNeighbors(emptyIdx);
        [puzzleState[emptyIdx], puzzleState[neighbors[0]]] = [puzzleState[neighbors[0]], puzzleState[emptyIdx]];
    }
    renderPuzzle();
}

function getNeighbors(idx) {
    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;
    const neighbors = [];
    if (row > 0) neighbors.push(idx - GRID_SIZE); // up
    if (row < GRID_SIZE - 1) neighbors.push(idx + GRID_SIZE); // down
    if (col > 0) neighbors.push(idx - 1); // left
    if (col < GRID_SIZE - 1) neighbors.push(idx + 1); // right
    return neighbors;
}

function renderPuzzle() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';

    puzzleState.forEach((pieceId, slotIndex) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';

        if (pieceId === EMPTY_TILE && !puzzleSolved) {
            piece.style.background = '#0a0a0a';
            piece.style.cursor = 'default';
            piece.style.border = '1px solid var(--border)';
        } else {
            const pieceRow = Math.floor(pieceId / GRID_SIZE);
            const pieceCol = pieceId % GRID_SIZE;

            piece.innerHTML = `<img src="${RAT_IMG_SRC}" style="
                width: 300px;
                height: 300px;
                position: absolute;
                top: ${-pieceRow * 100}%;
                left: ${-pieceCol * 100}%;
                object-fit: cover;
            ">`;
            piece.style.overflow = 'hidden';

            if (!puzzleSolved) {
                const emptyIdx = puzzleState.indexOf(EMPTY_TILE);
                const neighbors = getNeighbors(emptyIdx);
                if (neighbors.includes(slotIndex)) {
                    piece.style.cursor = 'pointer';
                    piece.style.border = '1px solid rgba(201, 162, 39, 0.3)';
                } else {
                    piece.style.cursor = 'default';
                }
            }
        }

        piece.onclick = () => handlePieceClick(slotIndex);
        container.appendChild(piece);
    });

    if (puzzleState.every((v, i) => v === i) && !puzzleSolved) {
        puzzleSolved = true;
        document.getElementById('puzzle-status').innerHTML = '✅ <span style="color: var(--success-light);">Puzzle solved! Now unscramble the letters below.</span>';
        renderPuzzle();
    }

    if (puzzleSolved) {
        document.querySelectorAll('.puzzle-piece').forEach(p => {
            p.style.border = 'none';
            p.style.cursor = 'default';
        });
    }
}

function handlePieceClick(slotIndex) {
    if (puzzleSolved) return;

    const emptyIdx = puzzleState.indexOf(EMPTY_TILE);
    const neighbors = getNeighbors(emptyIdx);

    if (neighbors.includes(slotIndex)) {
        [puzzleState[emptyIdx], puzzleState[slotIndex]] = [puzzleState[slotIndex], puzzleState[emptyIdx]];
        renderPuzzle();
    }
}

function shufflePuzzle() {
    initPuzzle();
}

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
