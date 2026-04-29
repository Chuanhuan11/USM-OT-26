// ===== SPLASH SCREEN =====

function enterSite() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    sessionStorage.setItem('splashPlayed', 'true');
  }
}

const splashElement = document.getElementById('splash');
if (splashElement && splashElement.style.display !== 'none') {
  // Attach event immediately as elements are already parsed
  const btn = document.getElementById('enterBtn');
  if (btn) btn.addEventListener('click', enterSite);

  // Auto-dismiss after 6s
  setTimeout(enterSite, 6000);
}

// ===== EMBERS =====
const emberContainer = document.getElementById('embers');
for (let i = 0; i < 25; i++) {
  const ember = document.createElement('div');
  ember.classList.add('ember');
  ember.style.left = Math.random() * 100 + '%';
  ember.style.animationDuration = (4 + Math.random() * 8) + 's';
  ember.style.animationDelay = (Math.random() * 10) + 's';
  ember.style.width = ember.style.height = (2 + Math.random() * 4) + 'px';
  ember.style.background = ['#d4a843', '#e74c3c', '#f5d97a', '#b02a2a', '#9a6af0'][Math.floor(Math.random() * 5)];
  emberContainer.appendChild(ember);
}

// ===== BACKGROUNDS =====
const heroBg = document.getElementById('heroChessBg');
if (heroBg) {
  for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    heroBg.appendChild(cell);
  }
}

// ===== BANNER CHESS BG =====
['bannerChess1', 'bannerChess2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) for (let i = 0; i < 32; i++) { const d = document.createElement('div'); el.appendChild(d); }
});

// ===== COUNTDOWN =====
function updateCountdown() {
  const wrapper = document.querySelector('.countdown-wrapper');
  if (!wrapper) return; // Safeguard for pages without countdown

  const target = new Date('2026-06-06T07:30:00+08:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) { wrapper.innerHTML = '<div style="font-family:Cinzel,serif;color:var(--gold);font-size:1.2rem;letter-spacing:0.2em;">THE QUEST HAS BEGUN!</div>'; return; }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const updateEl = (id, val) => document.getElementById(id).textContent = String(val).padStart(2, '0');
  updateEl('cd-days', d);
  updateEl('cd-hours', h);
  updateEl('cd-mins', m);
  updateEl('cd-secs', s);
}

// Only start the countdown interval if the countdown wrapper exists
if (document.querySelector('.countdown-wrapper')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ===== TABS =====
function showTab(prefix, id) {
  document.querySelectorAll(`[id^="${prefix}-"]`).forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`${prefix}-${id}`);
  if (target) target.classList.add('active');
  // update buttons within the same parent
  target.closest('section').querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ===== FAQ =====
function toggleFaq(questionEl) {
  const item = questionEl.parentElement;
  const wasOpen = item.classList.contains('open');
  item.closest('.faq-section').querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));

// ===== INTERACTIVE CHESS =====
const PIECES = {
  wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
  bK: '\u265A', bQ: '\u265B', bR: '\u265C', bB: '\u265D', bN: '\u265E', bP: '\u265F'
};

let boardState = [];
let selected = null;
let currentTurn = 'w';
let flipped = false;
let lastPawnMove = null;
let pendingPromotion = null;

// Dice Chess State
let gameMode = 'classic'; // 'classic' | 'dice'
let diceRolled = false;
let currentDicePieces = []; // array of allowed pieces in current turn

function setGameMode(mode) {
  gameMode = mode;
  document.getElementById('btnClassicMode').classList.toggle('active', mode === 'classic');
  document.getElementById('btnDiceMode').classList.toggle('active', mode === 'dice');
  document.getElementById('diceControls').style.display = mode === 'dice' ? 'block' : 'none';
  resetChess();
}

function playDiceSound() {
  const moveSound = document.getElementById('moveSound');
  if (!moveSound) return;
  // Play the sound quickly a few times to simulate rolling dice pieces
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const clone = moveSound.cloneNode();
      clone.volume = 0.3 + Math.random() * 0.4;
      clone.play().catch(e => { }); // ignore autoplay errors if interaction is missing
    }, i * 150 + Math.random() * 50);
  }
}

function rollDice() {
  if (gameMode !== 'dice' || diceRolled) return;
  document.getElementById('rollDiceBtn').disabled = true;

  playDiceSound();

  const pieces = { 1: 'P', 2: 'N', 3: 'B', 4: 'R', 5: 'Q', 6: 'K' };
  const names = { 1: 'Pawn', 2: 'Knight', 3: 'Bishop', 4: 'Rook', 5: 'Queen', 6: 'King' };

  const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);

  // Rotations for each face: 1=Front, 2=Back, 3=Right, 4=Left, 5=Top, 6=Bottom
  const rotations = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateX(0deg) rotateY(-180deg)',
    3: 'rotateX(0deg) rotateY(-90deg)',
    4: 'rotateX(0deg) rotateY(90deg)',
    5: 'rotateX(-90deg) rotateY(0deg)',
    6: 'rotateX(90deg) rotateY(0deg)'
  };
  const getRotation = (roll) => rotations[roll];

  // Animate the dice
  for (let i = 1; i <= 3; i++) {
    const cube = document.getElementById(`dice${i}`);

    // Add multiple spins for effect
    const randomSpinsX = Math.floor(Math.random() * 3 + 2) * 360;
    const randomSpinsY = Math.floor(Math.random() * 3 + 2) * 360;
    const finalTransform = getRotation(rolls[i - 1]);

    cube.style.transform = `translateZ(-30px) rotateX(${randomSpinsX}deg) rotateY(${randomSpinsY}deg) ${finalTransform}`;
  }

  // Set timeout to wait for animation (1.2s)
  setTimeout(() => {
    currentDicePieces = rolls.map(r => pieces[r]);
    diceRolled = true;

    updateDiceResultDisplay();
    checkDiceTurnSkip();
  }, 1200);
}

function updateDiceResultDisplay() {
  const names = { 'P': 'Pawn', 'N': 'Knight', 'B': 'Bishop', 'R': 'Rook', 'Q': 'Queen', 'K': 'King' };
  const resultEl = document.getElementById('diceResult');

  if (currentDicePieces.length === 0) {
    resultEl.textContent = "All moves complete!";
  } else {
    // Show remaining pieces like "Knight, Rook, Pawn"
    const remainingNames = currentDicePieces.map(p => names[p]).join(', ');
    resultEl.textContent = `To Move: ${remainingNames}`;
  }
}

function checkDiceTurnSkip() {
  if (gameMode !== 'dice') return;

  if (currentDicePieces.length === 0) {
    finalizeTurn();
    return;
  }

  // Check if ANY of the remaining dice can make a valid move
  let hasValid = false;
  let piecesWithMoves = [];

  for (const dicePiece of new Set(currentDicePieces)) {
    let canMovePiece = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (boardState[r][c] && boardState[r][c][0] === currentTurn && boardState[r][c][1] === dicePiece) {
          if (getValidMoves(r, c).length > 0) {
            canMovePiece = true;
            hasValid = true;
          }
        }
      }
    }
    if (canMovePiece) piecesWithMoves.push(dicePiece);
  }

  if (!hasValid) {
    document.getElementById('diceResult').innerHTML += "<br><span style='color:#e74c3c; font-size:1.2rem; display:block; margin-top:0.5rem;'>No valid moves! Passing turn...</span>";
    setTimeout(() => {
      finalizeTurn();
    }, 4000);
  } else if (piecesWithMoves.length < new Set(currentDicePieces).size) {
    // Some pieces have no moves, so we must discard them from the required list to avoid soft-locking
    currentDicePieces = currentDicePieces.filter(p => piecesWithMoves.includes(p));
    updateDiceResultDisplay();
  }
}

function initBoard() {
  boardState = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRank = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let c = 0; c < 8; c++) {
    boardState[0][c] = 'b' + backRank[c];
    boardState[1][c] = 'bP';
    boardState[6][c] = 'wP';
    boardState[7][c] = 'w' + backRank[c];
  }
}

function getPseudoLegalMoves(r, c, board = boardState) {
  const piece = board[r][c];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEmpty = (r, c) => inBounds(r, c) && !board[r][c];
  const isEnemy = (r, c) => inBounds(r, c) && board[r][c] && board[r][c][0] !== color;
  const canMove = (r, c) => isEmpty(r, c) || isEnemy(r, c);

  const addSlide = (dr, dc) => {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (board[nr][nc]) { if (board[nr][nc][0] !== color) moves.push([nr, nc]); break; }
      moves.push([nr, nc]); nr += dr; nc += dc;
    }
  };

  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const enPassantRow = color === 'w' ? 3 : 4;

    if (isEmpty(r + dir, c)) {
      moves.push([r + dir, c]);
      if (r === startRow && isEmpty(r + 2 * dir, c)) moves.push([r + 2 * dir, c]);
    }

    [[r + dir, c - 1], [r + dir, c + 1]].forEach(([nr, nc]) => {
      if (isEnemy(nr, nc)) {
        moves.push([nr, nc]);
      } else if (lastPawnMove && lastPawnMove.color !== color && r === enPassantRow && lastPawnMove.r === r && lastPawnMove.c === nc) {
        moves.push([nr, nc]); // En Passant capture
      }
    });
  } else if (type === 'N') {
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => { if (canMove(r + dr, c + dc)) moves.push([r + dr, c + dc]); });
  } else if (type === 'B') {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => addSlide(dr, dc));
  } else if (type === 'R') {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addSlide(dr, dc));
  } else if (type === 'Q') {
    [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addSlide(dr, dc));
  } else if (type === 'K') {
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => { if (canMove(r + dr, c + dc)) moves.push([r + dr, c + dc]); });
  }
  return moves;
}

function isKingInCheck(color, board = boardState) {
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === color + 'K') {
        kr = r; kc = c;
      }
    }
  }
  if (kr === -1) return false;

  const enemyColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && board[r][c][0] === enemyColor) {
        const moves = getPseudoLegalMoves(r, c, board);
        if (moves.some(([mr, mc]) => mr === kr && mc === kc)) {
          return true;
        }
      }
    }
  }
  return false;
}

function getValidMoves(r, c) {
  const pseudoMoves = getPseudoLegalMoves(r, c);
  const color = boardState[r][c][0];
  const type = boardState[r][c][1];
  const legalMoves = [];

  // Dice Chess validation
  if (gameMode === 'dice') {
    if (!diceRolled) return [];
    if (!currentDicePieces.includes(type)) return [];

    // In Dice chess, kings can move into check and checks are ignored
    return pseudoMoves;
  }

  for (const [mr, mc] of pseudoMoves) {
    const tempBoard = boardState.map(row => [...row]);

    // En passant capture simulation
    if (boardState[r][c][1] === 'P' && mc !== c && !boardState[mr][mc]) {
      tempBoard[r][mc] = null;
    }

    tempBoard[mr][mc] = tempBoard[r][c];
    tempBoard[r][c] = null;

    if (!isKingInCheck(color, tempBoard)) {
      legalMoves.push([mr, mc]);
    }
  }
  return legalMoves;
}

function hasLegalMoves(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (boardState[r][c] && boardState[r][c][0] === color) {
        if (getValidMoves(r, c).length > 0) return true;
      }
    }
  }
  return false;
}

function renderBoard() {
  const board = document.getElementById('chessBoard');
  board.innerHTML = '';

  const isWhiteInCheck = gameMode === 'classic' ? isKingInCheck('w') : false;
  const isBlackInCheck = gameMode === 'classic' ? isKingInCheck('b') : false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const dr = flipped ? 7 - r : r;
      const dc = flipped ? 7 - c : c;
      const cell = document.createElement('div');
      cell.classList.add('chess-cell');
      cell.classList.add((dr + dc) % 2 === 0 ? 'light' : 'dark');
      cell.dataset.r = dr; cell.dataset.c = dc;
      if (boardState[dr][dc]) {
        cell.textContent = PIECES[boardState[dr][dc]];
        if (boardState[dr][dc] === 'wK' && isWhiteInCheck) cell.classList.add('in-check');
        if (boardState[dr][dc] === 'bK' && isBlackInCheck) cell.classList.add('in-check');
      }
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
    }
  }
  // Re-highlight if selected
  if (selected) {
    const [sr, sc] = selected;
    highlightSelected(sr, sc);
    getValidMoves(sr, sc).forEach(([mr, mc]) => {
      const targetCell = document.querySelector(`[data-r="${mr}"][data-c="${mc}"]`);
      if (targetCell) { targetCell.classList.add('valid-move'); if (boardState[mr][mc]) targetCell.classList.add('occupied'); }
    });
  }
}

function highlightSelected(r, c) {
  document.querySelectorAll('.chess-cell').forEach(el => el.classList.remove('selected', 'valid-move', 'occupied'));
  const el = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  if (el) el.classList.add('selected');
}

function onCellClick(e) {
  if (pendingPromotion) return; // Lock board until promotion is complete

  const r = parseInt(e.currentTarget.dataset.r);
  const c = parseInt(e.currentTarget.dataset.c);
  const piece = boardState[r][c];

  if (selected) {
    const [sr, sc] = selected;
    const moves = getValidMoves(sr, sc);
    const isValidMove = moves.some(([mr, mc]) => mr === r && mc === c);

    if (isValidMove) {
      let captureOccurred = false;

      // Check for en passant capture
      if (boardState[sr][sc][1] === 'P' && c !== sc && !boardState[r][c]) {
        boardState[sr][c] = null; // Remove captured pawn
        captureOccurred = true;
      }

      const captured = boardState[r][c];
      if (captured) captureOccurred = true;

      boardState[r][c] = boardState[sr][sc];
      boardState[sr][sc] = null;

      // Dice Chess Win Condition: King captured
      if (gameMode === 'dice' && captured && captured[1] === 'K') {
        const winner = currentTurn === 'w' ? 'White' : 'Black';
        showGameOverModal('Victory!', `${winner} wins by capturing the King!`);
        document.getElementById('captureSound')?.play().catch(() => { });
        renderBoard();
        return;
      }

      // Pawn promotion
      if (boardState[r][c] === 'wP' && r === 0) boardState[r][c] = 'wQ';
      if (boardState[r][c] === 'bP' && r === 7) boardState[r][c] = 'bQ';

      // Update lastPawnMove for en passant on next turn
      if (boardState[r][c][1] === 'P' && Math.abs(r - sr) === 2) {
        lastPawnMove = { r, c, color: currentTurn };
      } else {
        lastPawnMove = null;
      }

      selected = null;

      // Play sound before rendering board
      if (captureOccurred) {
        document.getElementById('captureSound')?.play().catch(() => { });
      } else {
        document.getElementById('moveSound')?.play().catch(() => { });
      }

      // Pawn promotion
      if (boardState[r][c][1] === 'P' && (r === 0 || r === 7)) {
        pendingPromotion = { r, c };
        showPromotionModal(currentTurn);
        renderBoard();

        // Remove used piece from dice pool before pausing for promotion
        if (gameMode === 'dice') {
          const usedIdx = currentDicePieces.indexOf('P');
          if (usedIdx !== -1) currentDicePieces.splice(usedIdx, 1);
          updateDiceResultDisplay();
        }
        return;
      }

      // If Dice Chess, remove the used piece and check if turn continues
      if (gameMode === 'dice') {
        const usedPieceType = boardState[r][c][1];
        const usedIdx = currentDicePieces.indexOf(usedPieceType);
        if (usedIdx !== -1) {
          currentDicePieces.splice(usedIdx, 1);
        }

        updateDiceResultDisplay();

        // If there are still dice left, check if player has to skip the remaining or can continue
        if (currentDicePieces.length > 0) {
          renderBoard();
          checkDiceTurnSkip();
          return;
          // Turn DOES NOT change yet!
        }
      }

      finalizeTurn();
      return;
    } else if (piece && piece[0] === currentTurn) {
      selected = [r, c];
      renderBoard();
      highlightSelected(r, c);
      getValidMoves(r, c).forEach(([mr, mc]) => {
        const el = document.querySelector(`[data-r="${mr}"][data-c="${mc}"]`);
        if (el) { el.classList.add('valid-move'); if (boardState[mr][mc]) el.classList.add('occupied'); }
      });
      return;
    } else {
      selected = null;
      document.querySelectorAll('.chess-cell').forEach(el => el.classList.remove('selected', 'valid-move', 'occupied'));
      return;
    }
  }

  if (piece && piece[0] === currentTurn) {
    selected = [r, c];
    renderBoard();
    highlightSelected(r, c);
    getValidMoves(r, c).forEach(([mr, mc]) => {
      const el = document.querySelector(`[data-r="${mr}"][data-c="${mc}"]`);
      if (el) { el.classList.add('valid-move'); if (boardState[mr][mc]) el.classList.add('occupied'); }
    });
  }
}

function finalizeTurn() {
  currentTurn = currentTurn === 'w' ? 'b' : 'w';

  // Reset Dice logic for next turn
  if (gameMode === 'dice') {
    diceRolled = false;
    currentDicePieces = [];
    document.getElementById('rollDiceBtn').disabled = false;
    document.getElementById('diceResult').textContent = "Roll to decide your fate...";

    for (let i = 1; i <= 3; i++) {
      const cube = document.getElementById(`dice${i}`);
      if (cube) {
        cube.style.transform = 'translateZ(-30px)';
        cube.className = `cube ${currentTurn === 'w' ? 'white' : 'black'}`;
      }
    }
  }

  const status = document.getElementById('chessStatus');

  if (gameMode === 'classic') {
    const inCheck = isKingInCheck(currentTurn);
    const canMove = hasLegalMoves(currentTurn);

    if (inCheck && !canMove) {
      const winner = currentTurn === 'b' ? 'White' : 'Black';
      status.textContent = `Checkmate! ${winner} wins! ♛`;
      showGameOverModal('Checkmate!', `${winner} wins by Checkmate!`);
    } else if (!canMove) {
      status.textContent = 'Stalemate! Draw.';
      showGameOverModal('Stalemate!', 'The game is a draw.');
    } else if (inCheck) {
      status.textContent = `${currentTurn === 'w' ? 'White' : 'Black'} is in Check!`;
    } else {
      status.textContent = `${currentTurn === 'w' ? 'White' : 'Black'}'s Turn`;
    }
  } else {
    // Dice Chess Status
    status.textContent = `${currentTurn === 'w' ? 'White' : 'Black'}'s Turn`;
  }

  renderBoard();
}

function showPromotionModal(color) {
  const modal = document.getElementById('promotionModal');
  const options = document.getElementById('promoOptions');

  const isW = color === 'w';
  const pieces = [
    { type: 'Q', sym: isW ? '♕' : '♛' },
    { type: 'R', sym: isW ? '♖' : '♜' },
    { type: 'B', sym: isW ? '♗' : '♝' },
    { type: 'N', sym: isW ? '♘' : '♞' }
  ];

  options.innerHTML = pieces.map(p =>
    `<button class="promo-btn" onclick="processPromotion('${p.type}')">${p.sym}</button>`
  ).join('');

  modal.classList.remove('hide');
}

function processPromotion(pieceType) {
  if (!pendingPromotion) return;
  const { r, c } = pendingPromotion;
  boardState[r][c] = currentTurn + pieceType;
  pendingPromotion = null;

  document.getElementById('promotionModal').classList.add('hide');

  finalizeTurn();
}

function showGameOverModal(title, message) {
  const titleEl = document.getElementById('gameOverTitle');
  const msgEl = document.getElementById('gameOverMsg');
  const modal = document.getElementById('gameOverModal');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (modal) modal.classList.remove('hide');
}

function closeGameOverModal() {
  document.getElementById('gameOverModal')?.classList.add('hide');
}

function resetChess() {
  initBoard(); selected = null; currentTurn = 'w'; lastPawnMove = null; pendingPromotion = null;
  diceRolled = false;
  currentDicePieces = [];

  if (document.getElementById('rollDiceBtn')) {
    document.getElementById('rollDiceBtn').disabled = false;
    document.getElementById('diceResult').textContent = "Roll to decide your fate...";
    for (let i = 1; i <= 3; i++) {
      const cube = document.getElementById(`dice${i}`);
      if (cube) {
        cube.style.transform = 'translateZ(-30px)';
        cube.className = 'cube white';
      }
    }
  }

  const status = document.getElementById('chessStatus');
  if (status) status.textContent = "White's Turn";
  document.getElementById('gameOverModal')?.classList.add('hide');
  document.getElementById('promotionModal')?.classList.add('hide');
  renderBoard();
}

function flipBoard() {
  flipped = !flipped;
  renderBoard();
}

// Initialize chess board on load (only if element exists)
if (document.getElementById('chessBoard')) {
  initBoard();
  renderBoard();
}

// ===== GALLERY AUTO-SCROLL =====
const galleryWrapper = document.querySelector('.gallery-marquee-wrapper');
if (galleryWrapper) {
  let isHovered = false;
  let isDragging = false;
  let startX, scrollLeft;

  // Track hover to pause auto-scroll
  galleryWrapper.addEventListener('mouseenter', () => isHovered = true);
  galleryWrapper.addEventListener('mouseleave', () => {
    isHovered = false;
    isDragging = false;
  });

  // Enable manual drag to scroll
  galleryWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - galleryWrapper.offsetLeft;
    scrollLeft = galleryWrapper.scrollLeft;
  });

  galleryWrapper.addEventListener('mouseup', () => {
    isDragging = false;
  });

  galleryWrapper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - galleryWrapper.offsetLeft;
    const walk = (x - startX) * 2; // Scroll multiplier
    galleryWrapper.scrollLeft = scrollLeft - walk;
  });

  // Auto-scroller loop
  function autoScrollGallery() {
    if (!isHovered && !isDragging) {
      galleryWrapper.scrollLeft += 1;
    }

    // Reset scroll position for seamless loop in BOTH directions
    // Track consists of exactly two identical halves.
    if (galleryWrapper.scrollLeft >= galleryWrapper.scrollWidth / 2) {
      galleryWrapper.scrollLeft -= galleryWrapper.scrollWidth / 2;
    } else if (galleryWrapper.scrollLeft <= 0) {
      galleryWrapper.scrollLeft += galleryWrapper.scrollWidth / 2;
    }

    requestAnimationFrame(autoScrollGallery);
  }

  // Start auto-scroll
  requestAnimationFrame(autoScrollGallery);
}

// ===== MOBILE MENU TOGGLE =====
// Note: Opening the menu is handled purely by the CSS #mobileMenuCheck hack
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const checkbox = document.getElementById('mobileMenuCheck');

  // Close menu if clicking a link inside navLinks
  if (navLinks && checkbox && e.target.closest('#navLinks a')) {
    checkbox.checked = false;
  }
});

// ===== PAGE TRANSITIONS =====
(function () {
  const SIGILS = ['♛', '♞', '♜', '♝', '♚', '♟'];
  const PANEL_COUNT = 4;

  // Detect touch/mobile
  const isMobile = () => window.innerWidth <= 768 || ('ontouchstart' in window);

  // Build the overlay DOM once
  function buildOverlay() {
    if (document.getElementById('page-transition-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    for (let i = 0; i < PANEL_COUNT; i++) {
      const panel = document.createElement('div');
      panel.className = 'pt-panel';
      overlay.appendChild(panel);
    }

    const sigil = document.createElement('div');
    sigil.className = 'pt-sigil';
    sigil.id = 'pt-sigil';
    sigil.textContent = SIGILS[Math.floor(Math.random() * SIGILS.length)];

    document.body.appendChild(overlay);
    document.body.appendChild(sigil);
  }

  // Cover screen → then navigate
  function transitionOut(href) {
    const overlay = document.getElementById('page-transition-overlay');
    const sigil = document.getElementById('pt-sigil');
    if (!overlay) { window.location.href = href; return; }

    const mobile = isMobile();

    // Randomise sigil — hide on very small screens
    sigil.textContent = SIGILS[Math.floor(Math.random() * SIGILS.length)];
    sigil.style.display = window.innerWidth <= 400 ? 'none' : '';

    // Trigger cover
    overlay.classList.remove('is-revealing');
    void overlay.offsetWidth; // Force reflow
    overlay.classList.add('is-covering');

    // Show sigil slightly after (skip on tiny screens)
    if (window.innerWidth > 400) {
      setTimeout(() => sigil.classList.add('visible'), mobile ? 100 : 150);
    }

    // Mobile: faster panels (0.12s delay + 0.28s = 0.4s total), navigate at 440ms
    // Desktop: 0.15s delay + 0.35s = 0.5s total, navigate at 560ms
    const navigateDelay = mobile ? 440 : 560;
    setTimeout(() => {
      window.location.href = href;
    }, navigateDelay);
  }

  // Reveal screen on page load
  function transitionIn() {
    const overlay = document.getElementById('page-transition-overlay');
    const sigil = document.getElementById('pt-sigil');
    if (!overlay) return;

    // Start fully covered
    overlay.classList.add('is-covering');
    void overlay.offsetWidth; // Force reflow

    // Then reveal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-covering');
        overlay.classList.add('is-revealing');
        if (sigil) sigil.classList.remove('visible');
      });
    });
  }

  // Touch ripple feedback on tapped links (mobile only)
  function addTouchFeedback() {
    document.addEventListener('touchstart', (e) => {
      const anchor = e.target.closest('a, button');
      if (!anchor) return;
      anchor.style.transition = 'opacity 0.1s';
      anchor.style.opacity = '0.75';
      setTimeout(() => { anchor.style.opacity = ''; }, 200);
    }, { passive: true });
  }

  // Intercept anchor clicks that go to a different page (not #anchors)
  function interceptLinks() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore: same-page hash links, external links, downloads, javascript:
      if (
        href.startsWith('#') ||
        href.startsWith('javascript') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) return;

      // Only intercept relative links to our own HTML pages
      if (
        href.startsWith('index.html') ||
        href.startsWith('team.html') ||
        href === './' ||
        href === '.'
      ) {
        e.preventDefault();
        transitionOut(href);
      }
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    buildOverlay();
    interceptLinks();
    addTouchFeedback();
    // Small timeout so CSS has been applied before we run the reveal
    setTimeout(transitionIn, isMobile() ? 30 : 50);
  });
})();

// ===== IMAGE PROTECTION =====
(function () {
  function protectImages() {
    // Block right-click "Save Image As" on all images
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    });

    // Block drag-to-desktop / drag-to-tab on all images
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    });

    // Block long-press save on Android Chrome
    document.addEventListener('touchstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.addEventListener('touchend', (ev) => ev.preventDefault(), { once: true });
      }
    }, { passive: true });
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectImages);
  } else {
    protectImages();
  }
})();