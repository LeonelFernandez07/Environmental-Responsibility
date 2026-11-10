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

// --- NAVEGACIÓN ENTRE SECCIONES ---
function showSection(sectionId, btnElement) {
  // Ocultar todas las secciones principales
  const sections = document.querySelectorAll("main > section");
  sections.forEach(sec => {
    sec.classList.remove("active-section");
    sec.classList.add("hidden-section");
  });

  // Mostrar la sección seleccionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove("hidden-section");
    targetSection.classList.add("active-section");
  }

  // Actualizar botones activos de la barra de navegación móvil
  if (btnElement) {
    const navButtons = document.querySelectorAll("nav .nav-btn");
    navButtons.forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");
  }
}

// --- LÓGICA DE LA APLICACIÓN Y LA TABLA DE POSICIONES ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación conectada correctamente a Firebase.");
  cargarLeaderboard();
});

// Función para guardar puntajes o tiempos en tiempo real
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
    console.log("Puntaje guardado exitosamente.");
    cargarLeaderboard();
  })
  .catch((error) => {
    console.error("Error al guardar el puntaje: ", error);
  });
}

// Función para cargar y actualizar la tabla de posiciones en tiempo real
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
      leaderboardContainer.innerHTML = `<tr><td colspan="3" style="text-align:center; color: red;">Error loading scores.</td></tr>`;
    });
}

// --- LÓGICA PARA LAS RESPUESTAS DEL QUIZ ---
function selectAnswer(questionNumber, isCorrect, btnElement) {
  const card = btnElement.closest('.quiz-card');
  if (!card) return;
  
  const buttons = card.querySelectorAll('.option-btn');

  // Deshabilitar todos los botones de esta pregunta para evitar múltiples clics
  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if (isCorrect) {
    btnElement.style.backgroundColor = "#d4edda";
    btnElement.style.border = "2px solid #28a745";
    console.log("Respuesta correcta");
  } else {
    btnElement.style.backgroundColor = "#f8dad6";
    btnElement.style.border = "2px solid #dc3545";
    console.log("Respuesta incorrecta");
  }
}

function resetQuiz() {
  location.reload();
}

// Función para restablecer la tabla con contraseña
function resetLeaderboardWithPassword() {
  const pass = prompt("Enter reset password:");
  if (pass === "admin123") {
    db.collection("leaderboard").get().then((querySnapshot) => {
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    }).then(() => {
      alert("Leaderboard reset successfully.");
      cargarLeaderboard();
    }).catch((error) => {
      console.error("Error resetting leaderboard: ", error);
    });
  } else if (pass !== null) {
    alert("Incorrect password.");
  }
}

// Seguridad básica para texto (evita inyecciones HTML)
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}