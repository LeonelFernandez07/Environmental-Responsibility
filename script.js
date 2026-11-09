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

// --- LÓGICA DE LA APLICACIÓN Y LA TABLA DE POSICIONES ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación conectada correctamente a Firebase.");
  cargarLeaderboard();
});

// Función para guardar puntajes en tiempo real
function guardarPuntaje(nombreJugador, puntajeObtenido) {
  if (!nombreJugador || nombreJugador.trim() === "") {
    nombreJugador = "Anónimo";
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

// Función para cargar y actualizar la tabla en tiempo real
function cargarLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-list");
  if (!leaderboardContainer) return;

  db.collection("leaderboard")
    .orderBy("score", "desc")
    .limit(10)
    .onSnapshot((querySnapshot) => {
      leaderboardContainer.innerHTML = "";
      let puesto = 1;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>#${puesto}</td>
          <td>${escapeHtml(data.name)}</td>
          <td>${data.score} pts</td>
        `;
        leaderboardContainer.appendChild(row);
        puesto++;
      });
    }, (error) => {
      console.error("Error al obtener la tabla de posiciones: ", error);
    });
}

// Seguridad básica para texto
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}