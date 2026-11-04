import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6aOJjySdhTjlNqn-w7rYnzFQDj5c_q9E",
  authDomain: "ular-tangga-88ed8.firebaseapp.com",
  databaseURL: "https://ular-tangga-88ed8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ular-tangga-88ed8",
  storageBucket: "ular-tangga-88ed8.firebasestorage.app",
  messagingSenderId: "321434765842",
  appId: "1:321434765842:web:1df46f21e8d67da38fe6cb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Data Permainan
let p1Pos = 1;
let p2Pos = 1;
let giliran = 1; // 1 = P1(Merah), 2 = P2(Biru)
let listChallenge = {};

const boardElement = document.getElementById('board');
const btnKocok = document.getElementById('btnKocok');
const angkaDaduEl = document.getElementById('angkaDadu');
const giliranText = document.getElementById('giliranText');
const modal = document.getElementById('challengeModal');
const teksTantangan = document.getElementById('teksTantangan');
const btnTutupModal = document.getElementById('btnTutupModal');

// Menarik data tantangan dari Firebase (update otomatis jika ada yang nambah dari HP lain)
onValue(ref(db, 'challenges'), (snapshot) => {
  listChallenge = snapshot.val() || {};
});

// Menggambar grid 1-100 dengan bentuk zig-zag
function buatPapan() {
  boardElement.innerHTML = '';
  let kotakId = 100;
  
  for (let baris = 0; baris < 10; baris++) {
    let barisIni = [];
    for (let kolom = 0; kolom < 10; kolom++) {
      barisIni.push(kotakId);
      kotakId--;
    }
    
    // Reverse angka untuk membuat efek zig-zag tangga (baris ganjil)
    if (baris % 2 !== 0) barisIni.reverse();
    
    barisIni.forEach(nomor => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `kotak-${nomor}`;
      cell.innerText = nomor;
      boardElement.appendChild(cell);
    });
  }
  renderPemain();
}

// Menampilkan posisi bidak Merah (P1) dan Biru (P2)
function renderPemain() {
  document.querySelectorAll('.player').forEach(el => el.remove());
  
  const kotakP1 = document.getElementById(`kotak-${p1Pos}`);
  if(kotakP1) kotakP1.innerHTML += `<div class="player p1"></div>`;

  const kotakP2 = document.getElementById(`kotak-${p2Pos}`);
  if(kotakP2) kotakP2.innerHTML += `<div class="player p2"></div>`;
}

// Logika melempar dadu
btnKocok.addEventListener('click', () => {
  btnKocok.disabled = true; // Kunci tombol saat sedang jalan
  const dadu = Math.floor(Math.random() * 6) + 1;
  angkaDaduEl.innerText = dadu;

  if (giliran === 1) {
    p1Pos += dadu;
    if (p1Pos > 100) p1Pos = 100; // Puncak akhir
  } else {
    p2Pos += dadu;
    if (p2Pos > 100) p2Pos = 100;
  }

  renderPemain();

  // Cek apakah posisi akhir memiliki challenge
  const posisiSekarang = giliran === 1 ? p1Pos : p2Pos;
  
  setTimeout(() => {
    if (listChallenge[posisiSekarang]) {
      // Munculkan Pop-up
      teksTantangan.innerHTML = `<strong>Tugas untuk Pemain ${giliran}:</strong><br><br>${listChallenge[posisiSekarang]}`;
      modal.style.display = 'block';
    } else {
      lanjutGiliran(); // Lanjut biasa jika tidak ada tantangan
    }

    if (posisiSekarang === 100) {
      setTimeout(() => alert(`🎉 SELAMAT! Pemain ${giliran} Menang!`), 300);
    }
  }, 400); // Sedikit delay agar bidak terlihat pindah dulu
});

function lanjutGiliran() {
  giliran = giliran === 1 ? 2 : 1;
  giliranText.innerText = giliran === 1 ? "Pemain 1 (Merah)" : "Pemain 2 (Biru)";
  giliranText.style.color = giliran === 1 ? "#ff3b30" : "#007aff";
  btnKocok.disabled = false;
}

btnTutupModal.addEventListener('click', () => {
  modal.style.display = 'none';
  lanjutGiliran();
});

// Mulai menggambar saat file dimuat
buatPapan();
