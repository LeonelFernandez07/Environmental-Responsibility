// --- CONFIGURACIÓN DE FIREBASE (Firestore en vivo) ---
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForClassPresentation123",
  authDomain: "living-uruguay-5.firebaseapp.com",
  projectId: "living-uruguay-5",
  storageBucket: "living-uruguay-5.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
db.enablePersistence().catch(() => {});

let playerName = localStorage.getItem('env_player_name') || '';

function promptPlayerName() {
  const input = prompt("Enter your name for the leaderboard:", playerName);
  if (input && input.trim() !== '') {
    playerName = input.trim().substring(0, 20);
    localStorage.setItem('env_player_name', playerName);
    updatePlayerDisplay();
  }
}

function updatePlayerDisplay() {
  const display = document.getElementById('player-display');
  if (display) {
    display.innerText = playerName || 'Anonymous';
  }
}

function showSection(sectionId, button) {
  const sections = ['quiz', 'wordsearch', 'leaderboard'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (id === sectionId) {
      element.classList.remove('hidden-section');
      element.classList.add('active-section');
    } else {
      element.classList.remove('active-section');
      element.classList.add('hidden-section');
    }
  });

  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (button) {
    button.classList.add('active');
  } else {
    const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick').includes(sectionId));
    if (targetBtn) targetBtn.classList.add('active');
  }
}


// --- QUIZ LOGIC ---
let currentScore = 0;
let answeredQuestions = 0;
const totalQuestions = 5;

function selectAnswer(questionNum, isCorrect, button) {
  const card = document.querySelector(`.quiz-card[data-question="${questionNum}"]`);
  const buttons = card.querySelectorAll('.option-btn');
  
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    button.classList.add('correct');
    currentScore++;
  } else {
    button.classList.add('wrong');
  }

  answeredQuestions++;

  if (answeredQuestions === totalQuestions) {
    setTimeout(showQuizResults, 300);
  }
}

function showQuizResults() {
  const resultCard = document.getElementById('quiz-result');
  const scoreText = document.getElementById('final-score-text');

  scoreText.innerText = `Your Score: ${currentScore} / ${totalQuestions}`;

  resultCard.classList.remove('hidden-section');
  resultCard.scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
  currentScore = 0;
  answeredQuestions = 0;

  document.getElementById('quiz-result').classList.add('hidden-section');

  const buttons = document.querySelectorAll('.quiz-card .option-btn');
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- WORD SEARCH LOGIC ---
const GRID_SIZE = 10;
const targetWords = ['LITTER', 'POLICY', 'WASTE', 'PLASTIC', 'DEBATE'];
let gridData = [];
let placedWordsPositions = {}; 

let selectedCells = [];
let foundWords = [];

let timerInterval = null;
let secondsElapsed = 0;
let timerStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  updatePlayerDisplay();
  initWordSearch();
  listenToLeaderboard();
});

function generateRandomGrid() {
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  placedWordsPositions = {};

  const directions = [
    { r: 0, c: 1 },   // Horizontal
    { r: 1, c: 0 },   // Vertical
    { r: 1, c: 1 }    // Diagonal
  ];

  targetWords.forEach(word => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 300) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      const endRow = row + (word.length - 1) * dir.r;
      const endCol = col + (word.length - 1) * dir.c;

      if (endRow >= 0 && endRow < GRID_SIZE && endCol >= 0 && endCol < GRID_SIZE) {
        let fit = true;
        let coords = [];

        for (let i = 0; i < word.length; i++) {
          let currR = row + i * dir.r;
          let currC = col + i * dir.c;
          let existingChar = grid[currR][currC];

          if (existingChar !== '' && existingChar !== word[i]) {
            fit = false;
            break;
          }
          if (existingChar !== '' && (word === 'POLICY' || word === 'PLASTIC')) {
            fit = false;
            break;
          }
          coords.push(`${currR}-${currC}`);
        }

        if (fit) {
          for (let i = 0; i < word.length; i++) {
            let currR = row + i * dir.r;
            let currC = col + i * dir.c;
            grid[currR][currC] = word[i];
          }
          placedWordsPositions[word] = coords;
          placed = true;
        }
      }
    }
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return grid;
}

function initWordSearch() {
  gridData = generateRandomGrid();
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';

  gridData.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.innerText = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      
      cell.addEventListener('click', () => handleCellClick(cell, rowIndex, colIndex));
      gridContainer.appendChild(cell);
    });
  });
}

function startTimer() {
  if (!timerStarted) {
    if (!playerName) {
      promptPlayerName();
    }
    timerStarted = true;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      let mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      let secs = (secondsElapsed % 60).toString().padStart(2, '0');
      document.getElementById('timer').innerText = `${mins}:${secs}`;
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleCellClick(cell, row, col) {
  if (cell.classList.contains('found')) return;

  startTimer();

  if (cell.classList.contains('selected')) {
    cell.classList.remove('selected');
    selectedCells = selectedCells.filter(item => !(item.row === row && item.col === col));
  } else {
    cell.classList.add('selected');
    selectedCells.push({ element: cell, row: row, col: col });
  }

  checkWordSearchAnyOrder();
}

function checkWordSearchAnyOrder() {
  if (selectedCells.length === 0) return;

  const currentCoords = selectedCells.map(item => `${item.row}-${item.col}`);

  targetWords.forEach(word => {
    if (!foundWords.includes(word)) {
      const targetCoords = placedWordsPositions[word];
      if (!targetCoords) return;

      if (currentCoords.length === targetCoords.length) {
        const matchesAll = targetCoords.every(coord => currentCoords.includes(coord));

        if (matchesAll) {
          foundWords.push(word);

          selectedCells.forEach(item => {
            item.element.classList.remove('selected');
            item.element.classList.add('found');
          });

          const wordListItem = document.querySelector(`#words-list li[data-word="${word}"]`);
          if (wordListItem) {
            wordListItem.classList.add('found-word');
          }

          document.getElementById('found-count').innerText = foundWords.length;
          selectedCells = [];

          if (foundWords.length === targetWords.length) {
            stopTimer();
            setTimeout(showWordSearchVictory, 100);
          }
        }
      }
    }
  });

  if (selectedCells.length >= 8) {
    selectedCells.forEach(item => item.element.classList.remove('selected'));
    selectedCells = [];
  }
}

function showWordSearchVictory() {
  const wsResult = document.getElementById('ws-result');
  const finalTimeText = document.getElementById('ws-final-time');
  const scoreMsg = document.getElementById('ws-score-msg');

  finalTimeText.innerText = `You finished in: ${secondsElapsed} seconds!`;

  if (secondsElapsed <= 25) {
    scoreMsg.innerText = "🏆 Outstanding speed! You're an environmental vocabulary pro.";
  } else if (secondsElapsed <= 55) {
    scoreMsg.innerText = "🌟 Great job! Fast and sharp.";
  } else {
    scoreMsg.innerText = "👍 Solid effort! Practice makes perfect.";
  }

  saveScoreToFirestore(playerName || 'Anonymous', secondsElapsed);

  wsResult.classList.remove('hidden-section');
  wsResult.scrollIntoView({ behavior: 'smooth' });
}

function resetWordSearch() {
  stopTimer();
  timerStarted = false;
  secondsElapsed = 0;
  foundWords = [];
  selectedCells = [];

  document.getElementById('timer').innerText = "00:00";
  document.getElementById('found-count').innerText = "0";
  document.getElementById('ws-result').classList.add('hidden-section');

  const listItems = document.querySelectorAll('#words-list li');
  listItems.forEach(li => {
    li.classList.remove('found-word');
  });

  initWordSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- GUARDAR Y ESCUCHAR TABLA EN TIEMPO REAL (Top 30) ---
function saveScoreToFirestore(name, timeInSeconds) {
  db.collection("wordsearch_leaderboard").add({
    name: name,
    timeSeconds: timeInSeconds,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    console.log("Offline mode or sync delay:", err);
  });
}

function listenToLeaderboard() {
  db.collection("wordsearch_leaderboard")
    .orderBy("timeSeconds", "asc")
    .limit(30)
    .onSnapshot(snapshot => {
      const body = document.getElementById('leaderboard-body');
      if (!body) return;

      if (snapshot.empty) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;">No scores registered yet. Be the first!</td></tr>`;
        return;
      }

      let html = '';
      let rank = 1;

      snapshot.forEach(doc => {
        const data = doc.data();
        let mins = Math.floor(data.timeSeconds / 60).toString().padStart(2, '0');
        let secs = (data.timeSeconds % 60).toString().padStart(2, '0');
        let medal = rank === 1 ? '🥇 ' : rank === 2 ? '🥈 ' : rank === 3 ? '🥉 ' : '';

        html += `
          <tr>
            <td>${medal}${rank}</td>
            <td><strong>${escapeHtml(data.name || 'Anonymous')}</strong></td>
            <td>${mins}:${secs}</td>
          </tr>
        `;
        rank++;
      });

      body.innerHTML = html;
    }, err => {
      console.log("Error loading leaderboard:", err);
    });
}

// --- REINICIAR TABLA CON CONTRASEÑA ---
function resetLeaderboardWithPassword() {
  const pwd = prompt("Enter administrator password to reset leaderboard:");
  if (pwd === "leonel12354@") {
    if (confirm("Password correct. Are you sure you want to delete all scores?")) {
      db.collection("wordsearch_leaderboard").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.delete();
        });
        alert("Leaderboard successfully cleared!");
      }).catch(err => {
        alert("Error clearing leaderboard: " + err.message);
      });
    }
  } else if (pwd !== null) {
    alert("Incorrect password!");
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}