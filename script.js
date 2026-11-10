// --- CONFIGURACIÓN DE FIREBASE (Credenciales Reales) ---
const firebaseConfig = {
  apiKey: "AIzaSyDQDVfd8dHO1YXZ5fcuMCACmq09k3fHqiM",
  authDomain: "environmental-responsibility.firebaseapp.com",
  databaseURL: "https://environmental-responsibility-default-rtdb.firebaseio.com",
  projectId: "environmental-responsibility",
  storageBucket: "environmental-responsibility.firebasestorage.app",
  messagingSenderId: "236669543848",
  appId: "1:236669543848:web:2646eb1322f0cc53e3699d"
};

// Inicializar Firebase de forma compatible con la versión clásica
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- CONTROL DE NAVEGACIÓN ENTRE SECCIONES ---
function showSection(sectionId, btnElement) {
  const sections = document.querySelectorAll("main > section");
  sections.forEach(sec => {
    sec.classList.remove("active-section");
    sec.classList.add("hidden-section");
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden-section");
    targetSection.classList.add("active-section");
  }

  if (btnElement) {
    const navButtons = document.querySelectorAll("nav .nav-btn");
    navButtons.forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");
  }

  if (sectionId === 'wordsearch') {
    initWordSearch();
  }
}

// --- EVENTO AL CARGAR LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación cargada correctamente.");
  cargarLeaderboard();
  initWordSearch();
});

// --- LÓGICA PARA LAS RESPUESTAS DEL QUIZ ---
let correctAnswersCount = 0;
let answeredQuestions = 0;

function selectAnswer(questionNumber, isCorrect, btnElement) {
  const card = btnElement.closest('.quiz-card');
  if (!card) return;
  
  const buttons = card.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    btnElement.style.backgroundColor = "#d4edda";
    btnElement.style.border = "2px solid #28a745";
    correctAnswersCount++;
  } else {
    btnElement.style.backgroundColor = "#f8dad6";
    btnElement.style.border = "2px solid #dc3545";
  }

  answeredQuestions++;

  if (answeredQuestions === 5) {
    const resultCard = document.getElementById('quiz-result');
    const scoreText = document.getElementById('final-score-text');
    if (resultCard && scoreText) {
      scoreText.textContent = `Your Score: ${correctAnswersCount} / 5`;
      resultCard.classList.remove('hidden-section');
      resultCard.style.display = "block";
    }
  }
}

function resetQuiz() {
  correctAnswersCount = 0;
  answeredQuestions = 0;
  
  const resultCard = document.getElementById('quiz-result');
  if (resultCard) {
    resultCard.classList.add('hidden-section');
    resultCard.style.display = "none";
  }

  const buttons = document.querySelectorAll('.quiz-card .option-btn');
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.style.backgroundColor = "";
    btn.style.border = "";
  });
}

// --- LÓGICA DE LA SOPA DE LETRAS (COORDENADAS Y RESPONSIVA) ---
let wsInitialized = false;
let timerInterval = null;
let secondsElapsed = 0;
let foundWordsCount = 0;
let playerName = "Anonymous";
let selectedCells = [];
const targetWords = ["LITTER", "ANIMALS", "WASTE", "PLASTIC", "RECYCLE"];
const GRID_SIZE = 10;
let gridMatrix = [];
let placedWordsData = [];

function promptPlayerName() {
  const name = prompt("Enter your player name:", playerName);
  if (name && name.trim() !== "") {
    playerName = name.trim();
    const display = document.getElementById("player-display");
    if (display) display.textContent = playerName;
  }
}

function initWordSearch() {
  const gridContainer = document.getElementById("grid-container");
  if (!gridContainer) return;
  
  gridContainer.innerHTML = "";
  wsInitialized = true;
  selectedCells = [];
  foundWordsCount = 0;
  placedWordsData = [];

  gridMatrix = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));

  const directions = [
    [0, 1],   // Horizontal ->
    [1, 0],   // Vertical v
    [1, 1],   // Transversal \
    [-1, 1]   // Transversal /
  ];

  targetWords.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      let canPlace = true;
      let currentCoords = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
          canPlace = false;
          break;
        }
        if (gridMatrix[r][c] !== '' && gridMatrix[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
        currentCoords.push({ r, c });
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = currentCoords[i].r;
          const c = currentCoords[i].c;
          gridMatrix[r][c] = word[i];
        }
        placedWordsData.push({ word: word, coords: currentCoords });
        placed = true;
      }
    }
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (gridMatrix[r][c] === '') {
        gridMatrix[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  gridMatrix.forEach((row, rIdx) => {
    row.forEach((letter, cIdx) => {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.textContent = letter;
      cell.dataset.row = rIdx;
      cell.dataset.col = cIdx;
      cell.addEventListener("click", () => handleCellClick(cell));
      gridContainer.appendChild(cell);
    });
  });
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    const timerElem = document.getElementById("timer");
    if (timerElem) timerElem.textContent = `${mins}:${secs}`;
  }, 1000);
}

function handleCellClick(cell) {
  startTimer();
  cell.classList.toggle("selected");
  
  if (cell.classList.contains("selected")) {
    selectedCells.push(cell);
  } else {
    selectedCells = selectedCells.filter(c => c !== cell);
  }

  checkWordByCoordinates();
}

function checkWordByCoordinates() {
  if (selectedCells.length === 0) return;

  const selectedCoords = selectedCells.map(c => ({
    r: parseInt(c.dataset.row),
    c: parseInt(c.dataset.col)
  }));

  let matchedWordObj = null;

  for (let item of placedWordsData) {
    if (isSameCoordinateSet(selectedCoords, item.coords)) {
      matchedWordObj = item;
      break;
    }
  }

  if (matchedWordObj) {
    selectedCells.forEach(cell => {
      cell.classList.remove("selected");
      cell.classList.add("found-cell");
      cell.style.backgroundColor = "#81c784";
      cell.style.color = "white";
    });

    const wordItems = document.querySelectorAll("#words-list li");
    wordItems.forEach(li => {
      if (li.dataset.word === matchedWordObj.word || li.textContent.trim() === matchedWordObj.word) {
        li.classList.add("found");
      }
    });

    selectedCells = [];
    foundWordsCount++;
    
    const foundElem = document.getElementById("found-count");
    if (foundElem) foundElem.textContent = foundWordsCount;

    if (foundWordsCount === targetWords.length) {
      clearInterval(timerInterval);
      timerInterval = null;
      
      guardarPuntaje(playerName, secondsElapsed);

      const wsResult = document.getElementById("ws-result");
      const finalTimeText = document.getElementById("ws-final-time");
      const scoreMsg = document.getElementById("ws-score-msg");
      
      if (wsResult && finalTimeText) {
        finalTimeText.textContent = `You finished in: ${secondsElapsed} seconds`;
        if (scoreMsg) scoreMsg.textContent = `Score submitted to leaderboard as ${playerName}!`;
        wsResult.classList.remove("hidden-section");
        wsResult.style.display = "block";
      }
    }
  }
}

function isSameCoordinateSet(sel, target) {
  if (sel.length !== target.length) return false;
  let match = true;
  for (let i = 0; i < target.length; i++) {
    const found = sel.some(s => s.r === target[i].r && s.c === target[i].c);
    if (!found) {
      match = false;
      break;
    }
  }
  return match;
}

function resetWordSearch() {
  clearInterval(timerInterval);
  timerInterval = null;
  secondsElapsed = 0;
  foundWordsCount = 0;
  wsInitialized = false;
  selectedCells = [];
  
  const timerElem = document.getElementById("timer");
  if (timerElem) timerElem.textContent = "00:00";
  
  const foundElem = document.getElementById("found-count");
  if (foundElem) foundElem.textContent = "0";

  const wsResult = document.getElementById("ws-result");
  if (wsResult) {
    wsResult.classList.add('hidden-section');
    wsResult.style.display = "none";
  }

  const wordItems = document.querySelectorAll("#words-list li");
  wordItems.forEach(li => li.classList.remove("found"));

  initWordSearch();
}

// --- FIREBASE: TABLA DE POSICIONES EN TIEMPO REAL ---
function guardarPuntaje(nombreJugador, puntajeObtenido) {
  if (!nombreJugador || nombreJugador.trim() === "") {
    nombreJugador = "Anonymous";
  }

  db.collection("leaderboard").add({
    name: nombreJugador.trim(),
    score: Number(puntajeObtenido),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    cargarLeaderboard();
  })
  .catch((error) => {
    console.error("Error al guardar el puntaje: ", error);
  });
}

function cargarLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-body");
  if (!leaderboardContainer) return;

  db.collection("leaderboard")
    .orderBy("score", "asc")
    .limit(30)
    .onSnapshot((querySnapshot) => {
      leaderboardContainer.innerHTML = "";
      
      if (querySnapshot.empty) {
        leaderboardContainer.innerHTML = `<tr><td colspan="3" style="text-align:center;">No scores yet. Be the first!</td></tr>`;
        return;
      }

      let puesto = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>#${puesto}</td>
          <td>${escapeHtml(data.name)}</td>
          <td>${data.score}s</td>
        `;
        leaderboardContainer.appendChild(row);
        puesto++;
      });
    }, (error) => {
      console.error("Error al obtener la tabla de posiciones: ", error);
    });
}

function resetLeaderboardWithPassword() {
  const pass = prompt("Enter reset password:");
  if (pass === "leonel12354@") {
    db.collection("leaderboard").get().then((querySnapshot) => {
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    }).then(() => {
      alert("Leaderboard reset successfully.");
      cargarLeaderboard();
    });
  } else if (pass !== null) {
    alert("Incorrect password.");
  }
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}