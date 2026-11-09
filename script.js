// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSy...", // Copia el de tu pantalla
  authDomain: "environmental-responsibility.firebaseapp.com",
  projectId: "environmental-responsibility",
  storageBucket: "environmental-responsibility.appapp.com", // o .appspot.com
  messagingSenderId: "236669543848", // El número de tu pantalla
  appId: "1:236669543848:web:2646eb1322f0ecc53e3699d" // El de tu pantalla
};

// Inicializar Firebase (Versión clásica compatible con tu app)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- LÓGICA DE LA TABLA DE POSICIONES Y EL JUEGO ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación cargada correctamente.");
  cargarLeaderboard();
});

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

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}