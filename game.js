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
let giliran = 1; 
let listChallenge = {};

const tangga = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };
const ular = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };

const boardElement = document.getElementById('board');
const btnKocok = document.getElementById('btnKocok');
const angkaDaduEl = document.getElementById('angkaDadu');
const giliranText = document.getElementById('giliranText');
const modal = document.getElementById('challengeModal');
const teksTantangan = document.getElementById('teksTantangan');
const btnTutupModal = document.getElementById('btnTutupModal');

// Bidak Permanen
const bidakP1 = document.createElement('div');
bidakP1.className = 'player p1';
const bidakP2 = document.createElement('div');
bidakP2.className = 'player p2';

onValue(ref(db, 'challenges'), (snapshot) => {
  listChallenge = snapshot.val() || {};
});

function buatPapan() {
  boardElement.innerHTML = '';
  boardElement.style.position = 'relative'; // Penting agar bidak mengapung pas di atas papan
  let kotakId = 100;
  
  for (let baris = 0; baris < 10; baris++) {
    let barisIni = [];
    for (let kolom = 0; kolom < 10; kolom++) {
      barisIni.push(kotakId);
      kotakId--;
    }
    if (baris % 2 !== 0) barisIni.reverse();
    
    barisIni.forEach(nomor => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `kotak-${nomor}`;
      
      let teksSel = nomor;
      if(tangga[nomor]) teksSel += `<br><span style="font-size:10px; color:green;">🪜 ke ${tangga[nomor]}</span>`;
      if(ular[nomor]) teksSel += `<br><span style="font-size:10px; color:red;">🐍 ke ${ular[nomor]}</span>`;
      
      cell.innerHTML = teksSel;
      boardElement.appendChild(cell);
    });
  }

  // Masukkan bidak ke dalam papan
  boardElement.appendChild(bidakP1);
  boardElement.appendChild(bidakP2);
  
  // Tunggu sejenak agar browser selesai merender HTML, lalu letakkan pion
  setTimeout(renderPemain, 100);
}

// Menghitung koordinat Top dan Left kotak untuk menggeser bidak secara smooth
function renderPemain() {
  const k1 = document.getElementById(`kotak-${p1Pos}`);
  if(k1) {
    bidakP1.style.top = k1.offsetTop + 4 + 'px';
    bidakP1.style.left = k1.offsetLeft + 4 + 'px';
  }

  const k2 = document.getElementById(`kotak-${p2Pos}`);
  if(k2) {
    // P2 diletakkan agak geser ke bawah kanan agar tidak tertumpuk sepenuhnya dengan P1
    bidakP2.style.top = k2.offsetTop + (k2.offsetHeight * 0.4) + 'px';
    bidakP2.style.left = k2.offsetLeft + (k2.offsetWidth * 0.4) + 'px';
  }
}

// Render ulang posisi saat ukuran layar berubah (misal HP diputar)
window.addEventListener('resize', renderPemain);

// Logika Kocok Dadu dengan Animasi Putar
btnKocok.addEventListener('click', () => {
  btnKocok.disabled = true;
  angkaDaduEl.classList.add('shake-anim'); // Mulai getar

  let counter = 0;
  // Ganti angka dengan cepat selama 10 kali
  const intervalKocok = setInterval(() => {
    angkaDaduEl.innerText = Math.floor(Math.random() * 6) + 1;
    counter++;
    
    if (counter > 10) {
      clearInterval(intervalKocok); // Berhenti mengocok
      angkaDaduEl.classList.remove('shake-anim'); // Stop getar
      
      // Hasil final
      const daduFinal = Math.floor(Math.random() * 6) + 1;
      angkaDaduEl.innerText = daduFinal;
      
      jalankanBidak(daduFinal);
    }
  }, 80); // interval perubahan angka (ms)
});

// Memindahkan bidak satu per satu agar terlihat berjalan
function jalankanBidak(langkah) {
  let sisaLangkah = langkah;
  
  const timerJalan = setInterval(() => {
    if (sisaLangkah > 0) {
      if (giliran === 1 && p1Pos < 100) p1Pos++;
      else if (giliran === 2 && p2Pos < 100) p2Pos++;
      
      renderPemain();
      sisaLangkah--;
    } else {
      clearInterval(timerJalan);
      cekUlarTangga(); // Setelah selesai melangkah, baru cek posisi
    }
  }, 300); // 300ms per kotak, pas dengan waktu transisi di CSS
}

function cekUlarTangga() {
  let posisiSekarang = giliran === 1 ? p1Pos : p2Pos;
  let posisiAkhir = posisiSekarang;
  let adaPesan = '';

  if (tangga[posisiSekarang]) {
    posisiAkhir = tangga[posisiSekarang];
    adaPesan = 'Naik Tangga! 🪜';
  } else if (ular[posisiSekarang]) {
    posisiAkhir = ular[posisiSekarang];
    adaPesan = 'Digigit Ular! 🐍';
  }

  if (posisiAkhir !== posisiSekarang) {
    angkaDaduEl.innerText += ` (${adaPesan})`; // Beri tahu di layar dadu
    if (giliran === 1) p1Pos = posisiAkhir;
    else p2Pos = posisiAkhir;
    
    // Tunggu sedikit sebelum luncuran dramatis ular/tangga
    setTimeout(() => {
      renderPemain();
      // Setelah meluncur, tunggu slider selesai lalu cek challenge
      setTimeout(() => cekChallenge(posisiAkhir), 400); 
    }, 300);
  } else {
    cekChallenge(posisiSekarang);
  }
}

function cekChallenge(posisi) {
  if (listChallenge[posisi]) {
    teksTantangan.innerHTML = `<strong>Tugas untuk Pemain ${giliran}:</strong><br><br>${listChallenge[posisi]}`;
    modal.style.display = 'block';
  } else {
    if (posisi === 100) {
      setTimeout(() => alert(`🎉 SELAMAT! Pemain ${giliran} Menang!`), 300);
    } else {
      lanjutGiliran();
    }
  }
}

function lanjutGiliran() {
  giliran = giliran === 1 ? 2 : 1;
  giliranText.innerText = giliran === 1 ? "Pemain 1 (Merah)" : "Pemain 2 (Biru)";
  giliranText.style.color = giliran === 1 ? "#ff3b30" : "#007aff";
  btnKocok.disabled = false;
}

btnTutupModal.addEventListener('click', () => {
  modal.style.display = 'none';
  if (p1Pos === 100 || p2Pos === 100) {
     alert(`🎉 SELAMAT! Permainan Selesai!`);
  } else {
     lanjutGiliran();
  }
});

// Mulai menggambar saat file dimuat
buatPapan();
