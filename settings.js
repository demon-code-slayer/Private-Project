import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// --- LOGIKA PENYIMPANAN CHALLENGE ---
const btnSimpan = document.getElementById('btnSimpan');
const listChallenge = document.getElementById('listChallenge');

btnSimpan.addEventListener('click', () => {
  const kotak = document.getElementById('inputKotak').value;
  const tantangan = document.getElementById('inputTantangan').value;
  if (!kotak || !tantangan) { alert('Harap isi nomor kotak dan tantangannya!'); return; }
  set(ref(db, 'challenges/' + kotak), tantangan).then(() => {
    document.getElementById('inputKotak').value = '';
    document.getElementById('inputTantangan').value = '';
  });
});

onValue(ref(db, 'challenges'), (snapshot) => {
  const data = snapshot.val();
  listChallenge.innerHTML = ''; 
  if (data) {
    for (const kotak in data) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Kotak ${kotak}:</strong> ${data[kotak]} <button class="btn-delete" data-kotak="${kotak}">Hapus</button>`;
      listChallenge.appendChild(li);
    }
    document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', (e) => remove(ref(db, 'challenges/' + e.target.getAttribute('data-kotak'))));
    });
  }
});

// --- LOGIKA GENERATOR PAPAN & ULAR TANGGA ACAK ---
const btnSimpanPapan = document.getElementById('btnSimpanPapan');
btnSimpanPapan.addEventListener('click', () => {
  const ukuran = parseInt(document.getElementById('inputUkuran').value);
  if (!ukuran || ukuran < 4 || ukuran > 20) {
    alert('Masukkan ukuran antara 4 sampai 20!'); return;
  }

  const totalKotak = ukuran * ukuran;
  const jumlahRintangan = Math.floor(totalKotak / 10) + 1; // Skala rintangan menyesuaikan ukuran papan
  
  const tangga = {};
  const ular = {};
  const used = new Set([1, totalKotak]); // Kotak Start dan Finish tidak boleh ada ular/tangga

  function getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Generate Tangga (Naik)
  let tCount = 0;
  while (tCount < jumlahRintangan) {
    let awal = getRandom(2, totalKotak - 5);
    let akhir = getRandom(awal + 1, totalKotak - 1);
    if (!used.has(awal) && !used.has(akhir)) {
      tangga[awal] = akhir; used.add(awal); used.add(akhir); tCount++;
    }
  }

  // Generate Ular (Turun)
  let uCount = 0;
  while (uCount < jumlahRintangan) {
    let awal = getRandom(6, totalKotak - 1); // Kepala
    let akhir = getRandom(2, awal - 1); // Ekor
    if (!used.has(awal) && !used.has(akhir)) {
      ular[awal] = akhir; used.add(awal); used.add(akhir); uCount++;
    }
  }

  // Simpan konfigurasi ke database
  set(ref(db, 'config'), { boardSize: ukuran, tangga: tangga, ular: ular }).then(() => {
    alert(`Papan ${ukuran}x${ukuran} berhasil dibuat dan rintangan telah diacak!`);
    document.getElementById('inputUkuran').value = '';
  });
});
