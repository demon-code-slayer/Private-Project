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

// DATA ULAR DAN TANGGA
// Format: { posisi_awal: posisi_akhir }
const tangga = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91
};

const ular = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78
};

const boardElement = document.getElementById('board');
const btnKocok = document.getElementById('btnKocok');
const angkaDaduEl = document.getElementById('angkaDadu');
const giliranText = document.getElementById('giliranText');
const modal = document.getElementById('challengeModal');
const teksTantangan = document.getElementById('teksTantangan');
const btnTutupModal = document.getElementById('btnTutupModal');

onValue(ref(db, 'challenges'), (snapshot) => {
  listChallenge = snapshot.val() || {};
});

function buatPapan() {
  boardElement.innerHTML = '';
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
      
      // Tambahkan teks biasa
      let teksSel = nomor;
      
      // Tambahkan indikator visual teks kecil jika itu kepala ular atau kaki tangga
      if(tangga[nomor]) teksSel += `<br><span style="font-size:10px; color:green;">🪜 ke ${tangga[nomor]}</span>`;
      if(ular[nomor]) teksSel += `<br><span style="font-size:10px; color:red;">🐍 ke ${ular[nomor]}</span>`;
      
      cell.innerHTML = teksSel;
      boardElement.appendChild(cell);
    });
  }
  renderPemain();
}

function renderPemain() {
  document.querySelectorAll('.player').forEach(el => el.remove());
  
  const kotakP1 = document.getElementById(`kotak-${p1Pos}`);
  if(kotakP1) {
    const bidakP1 = document.createElement('div');
    bidakP1.className = 'player p1';
    kotakP1.appendChild(bidakP1);
  }

  const kotakP2 = document.getElementById(`kotak-${p2Pos}`);
  if(kotakP2) {
    const bidakP2 = document.createElement('div');
    bidakP2.className = 'player p2';
    kotakP2.appendChild(bidakP2);
  }
}

btnKocok.addEventListener('click', () => {
  btnKocok.disabled = true; 
  const dadu = Math.floor(Math.random() * 6) + 1;
  angkaDaduEl.innerText = dadu;

  // 1. Pindah dulu sesuai angka dadu
  let posisiSementara = giliran === 1 ? p1Pos + dadu : p2Pos + dadu;
  if (posisiSementara > 100) posisiSementara = 100;

  if (giliran === 1) p1Pos = posisiSementara;
  else p2Pos = posisiSementara;
  
  renderPemain();

  // 2. Beri jeda sebentar, lalu cek apakah dia menginjak Ular atau Tangga
  setTimeout(() => {
    let posisiAkhir = posisiSementara;
    let adaPesan = '';

    if (tangga[posisiSementara]) {
      posisiAkhir = tangga[posisiSementara];
      adaPesan = 'Naik Tangga! 🪜';
    } else if (ular[posisiSementara]) {
      posisiAkhir = ular[posisiSementara];
      adaPesan = 'Digigit Ular! 🐍';
    }

    // Jika menginjak ular/tangga, render ulang bidak ke posisi final
    if (posisiAkhir !== posisiSementara) {
      if(adaPesan) {
         // Tampilkan notifikasi kecil di angka dadu agar pemain tahu
         angkaDaduEl.innerText = `${dadu} (${adaPesan})`;
      }
      if (giliran === 1) p1Pos = posisiAkhir;
      else p2Pos = posisiAkhir;
      renderPemain();
    }

    // 3. Setelah posisi 100% final, baru kita periksa Challenge di posisi akhir tersebut
    setTimeout(() => {
      if (listChallenge[posisiAkhir]) {
        teksTantangan.innerHTML = `<strong>Tugas untuk Pemain ${giliran}:</strong><br><br>${listChallenge[posisiAkhir]}`;
        modal.style.display = 'block';
      } else {
        lanjutGiliran();
      }

      if (posisiAkhir === 100) {
        setTimeout(() => alert(`🎉 SELAMAT! Pemain ${giliran} Menang!`), 300);
      }
    }, 400); // Delay untuk cek challenge
    
  }, 600); // Delay sebelum meluncur naik/turun
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

buatPapan();
