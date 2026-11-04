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
  boardElement.style.position = 'relative'; 
  
  // Buat Lapisan Kanvas SVG untuk menggambar ular dan tangga
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "svgOverlay";
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none"; // Agar klik tetap tembus ke bawah
  svg.style.zIndex = "5"; // Muncul di atas papan, tapi di bawah bidak
  boardElement.appendChild(svg);

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
      cell.innerText = nomor; // Teks emoji lama dihapus, hanya tampilkan angka
      boardElement.appendChild(cell);
    });
  }

  boardElement.appendChild(bidakP1);
  boardElement.appendChild(bidakP2);
  
  // Tunggu DOM selesai dirender untuk mengambil koordinat
  setTimeout(() => {
    renderPemain();
    gambarGarisUlarTangga();
  }, 100);
}

// FUNGSI BARU: Menggambar garis visual penghubung
function gambarGarisUlarTangga() {
  const svg = document.getElementById('svgOverlay');
  if(!svg) return;
  svg.innerHTML = ''; // Bersihkan garis lama jika di-resize

  // Fungsi pembantu untuk mengambil koordinat tengah sebuah kotak
  function getPusatKotak(nomor) {
    const kotak = document.getElementById(`kotak-${nomor}`);
    if (!kotak) return null;
    return {
      x: kotak.offsetLeft + (kotak.offsetWidth / 2),
      y: kotak.offsetTop + (kotak.offsetHeight / 2)
    };
  }

  // 1. Gambar Visual Tangga (Garis lurus hijau putus-putus)
  for (const [awal, akhir] of Object.entries(tangga)) {
    const p1 = getPusatKotak(awal);
    const p2 = getPusatKotak(akhir);
    if(p1 && p2) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("stroke", "rgba(76, 175, 80, 0.7)"); // Hijau transparan agar angka di bawahnya masih terbaca
      line.setAttribute("stroke-width", "12");
      line.setAttribute("stroke-dasharray", "10, 8"); // Efek anak tangga
      svg.appendChild(line);
    }
  }

  // 2. Gambar Visual Ular (Garis melengkung merah tebal)
  for (const [awal, akhir] of Object.entries(ular)) {
    const p1 = getPusatKotak(awal);
    const p2 = getPusatKotak(akhir);
    if(p1 && p2) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Hitung titik tengah dan geser untuk membuat kurva lengkung seperti ular
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const d = `M ${p1.x} ${p1.y} Q ${midX + 50} ${midY - 50} ${p2.x} ${p2.y}`;
      
      path.setAttribute("d", d);
      path.setAttribute("stroke", "rgba(244, 67, 54, 0.7)"); // Merah transparan
      path.setAttribute("stroke-width", "12");
      path.setAttribute("fill", "none");
      svg.appendChild(path);
    }
  }
}

function renderPemain() {
  const k1 = document.getElementById(`kotak-${p1Pos}`);
  if(k1) {
    bidakP1.style.top = k1.offsetTop + 4 + 'px';
    bidakP1.style.left = k1.offsetLeft + 4 + 'px';
  }

  const k2 = document.getElementById(`kotak-${p2Pos}`);
  if(k2) {
    bidakP2.style.top = k2.offsetTop + (k2.offsetHeight * 0.4) + 'px';
    bidakP2.style.left = k2.offsetLeft + (k2.offsetWidth * 0.4) + 'px';
  }
}

// Render ulang garis dan pion saat ukuran layar HP diputar/berubah
window.addEventListener('resize', () => {
  renderPemain();
  gambarGarisUlarTangga();
});

btnKocok.addEventListener('click', () => {
  btnKocok.disabled = true;
  angkaDaduEl.classList.add('shake-anim');

  let counter = 0;
  const intervalKocok = setInterval(() => {
    angkaDaduEl.innerText = Math.floor(Math.random() * 6) + 1;
    counter++;
    
    if (counter > 10) {
      clearInterval(intervalKocok);
      angkaDaduEl.classList.remove('shake-anim');
      
      const daduFinal = Math.floor(Math.random() * 6) + 1;
      angkaDaduEl.innerText = daduFinal;
      jalankanBidak(daduFinal);
    }
  }, 80);
});

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
      cekUlarTangga();
    }
  }, 300);
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
    angkaDaduEl.innerText += ` (${adaPesan})`;
    if (giliran === 1) p1Pos = posisiAkhir;
    else p2Pos = posisiAkhir;
    
    setTimeout(() => {
      renderPemain();
      setTimeout(() => cekChallenge(posisiAkhir), 400); 
    }, 300);
  } else {
    cekChallenge(posisiSekarang);
  }
}

function cekChallenge(posisi) {
  if (listChallenge[posisi]) {
    // FALLBACK: Jika elemen modal HTML hilang/gagal, gunakan pop-up alert bawaan browser agar game tidak macet
    if (!modal || !teksTantangan) {
      alert(`⚠️ TUGAS PEMAIN ${giliran}:\n\n${listChallenge[posisi]}`);
      lanjutGiliran();
      return;
    }
    
    // Paksa modal tampil dan timpa aturan CSS z-index agar selalu paling depan
    teksTantangan.innerHTML = `<strong>Tugas untuk Pemain ${giliran}:</strong><br><br>${listChallenge[posisi]}`;
    modal.style.display = 'block';
    modal.style.zIndex = '9999';
    
  } else {
    // Jika tidak ada challenge di kotak ini
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

buatPapan();
