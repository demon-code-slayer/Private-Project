// Import Firebase langsung dari CDN Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Konfigurasi Anda
const firebaseConfig = {
  apiKey: "AIzaSyC6aOJjySdhTjlNqn-w7rYnzFQDj5c_q9E",
  authDomain: "ular-tangga-88ed8.firebaseapp.com",
  databaseURL: "https://ular-tangga-88ed8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ular-tangga-88ed8",
  storageBucket: "ular-tangga-88ed8.firebasestorage.app",
  messagingSenderId: "321434765842",
  appId: "1:321434765842:web:1df46f21e8d67da38fe6cb"
};

// Inisialisasi Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referensi Elemen HTML
const btnSimpan = document.getElementById('btnSimpan');
const listChallenge = document.getElementById('listChallenge');

// FUNGSI 1: SIMPAN DATA
btnSimpan.addEventListener('click', () => {
  const kotak = document.getElementById('inputKotak').value;
  const tantangan = document.getElementById('inputTantangan').value;
  
  if (!kotak || !tantangan) {
    alert('Harap isi nomor kotak dan tantangannya!');
    return;
  }

  // Menyimpan data ke database di path: challenges/nomor_kotak
  set(ref(db, 'challenges/' + kotak), tantangan)
    .then(() => {
      // Kosongkan form jika berhasil
      document.getElementById('inputKotak').value = '';
      document.getElementById('inputTantangan').value = '';
    })
    .catch((error) => {
      alert('Gagal menyimpan: ' + error.message);
    });
});

// FUNGSI 2: BACA & TAMPILKAN DATA SECARA REALTIME
const challengesRef = ref(db, 'challenges');
onValue(challengesRef, (snapshot) => {
  const data = snapshot.val();
  listChallenge.innerHTML = ''; // Kosongkan list sebelum di-render ulang
  
  if (data) {
    for (const kotak in data) {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>Kotak ${kotak}:</strong> ${data[kotak]} 
        <button class="btn-delete" data-kotak="${kotak}">Hapus</button>
      `;
      listChallenge.appendChild(li);
    }

    // Pasang fungsi hapus ke setiap tombol "Hapus" yang baru dibuat
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const kotakHapus = e.target.getAttribute('data-kotak');
        // Hapus data dari Firebase
        remove(ref(db, 'challenges/' + kotakHapus));
      });
    });
  } else {
    listChallenge.innerHTML = '<li>Belum ada challenge yang disimpan.</li>';
  }
});
