#  Video Enhancer — Patch Notes (v1.1)

Berikut adalah daftar perubahan dan fitur baru yang ditambahkan ke ekstensi "Video Enhancer" setelah *build* awal:

---

##  1. Halaman Pengaturan (Options Page) Lengkap
- Menambahkan **Settings UI** terpisah (`options.html`) dengan desain *premium dark glassmorphism*.
- **Integrasi Penuh**: Pengaturan disimpan secara lokal (`chrome.storage.local`) dan disinkronisasikan ke semua tab yang terbuka secara *real-time*.
- **Subtitle Styling**: Fitur kustomisasi ukuran font, warna teks, warna background, transparansi, shadow, dan jarak dari bawah (dilengkapi dengan *live preview*).
- **Pengaturan Panel**: Opacity panel transparan sekarang bisa diatur (30% hingga 100%).
- **Manajemen Domain**: Daftar domain yang ekstensi ini dimatikan/dinyalakan bisa dilihat dan dihapus langsung dari Settings.
- Menambahkan tombol akses cepat "Settings" di dalam Popup ekstensi.

---

## ️ 2. Peningkatan Fitur Anti-Redirect & Ad-Blocker
- **Global Click Listener**: `click` handler untuk memblokir iklan sekarang dipasang pada `document` level dengan *capture phase* `true`. Ini memblokir klik yang mengarah ke link iklan (*ad URLs*) di **seluruh halaman**, tidak lagi hanya terbatas di area player.
- **Invisible Overlay Destroyer (Click-jack blocker)**: Menambahkan fitur deteksi elemen transparan (`opacity: 0`, `transparent`) dengan ukuran sangat besar (menutupi >80% viewport) dan `z-index` yang tinggi. Jika elemen jebakan klik ini diklik, ekstensi akan memblokir redirect dan otomatis menghancurkan elemen tersebut (`display: none` & `pointer-events: none`).
- **Global Pop-under Blocker**: `window.open` interceptor sekarang berjalan secara global untuk mencegah *pop-under* iklan atau popup yang membuka URL iklan.
- **Editable Ad Domains**: Pengguna kini dapat melihat dan memodifikasi (menambah/menghapus) daftar domain iklan langsung dari halaman Settings.

---

## ️ 3. Fitur "Block Outside Iframes"
- Menambahkan sistem pembersih otomatis (*auto-cleanup*) untuk menghapus elemen `<iframe>` jahat atau pelacak yang di-inject di luar tag utama `<body>` (misalnya di-inject langsung ke `<html>`).
- Fitur ini memiliki toggle khusus bernama **"Block Outside Iframes"** di halaman Settings (bagian Ad Blocker) yang bisa dihidupkan atau dimatikan.
- Pengecekan iframe ini terikat dengan siklus `MutationObserver` dan pengecekan interval periodik, sehingga iframe yang baru muncul secara dinamis akan langsung dibersihkan.

---

## ⌨️ 4. Keyboard Shortcuts
Menambahkan dukungan *Keyboard Shortcuts* (tersedia toggle untuk on/off di Settings):
- `←` : Mundur 5 detik
- `→` : Maju 5 detik
- `Shift + ←` : Mundur 1 menit
- `Shift + →` : Maju 1 menit
- `S` : Menyembunyikan / memunculkan subtitle secara instan

---

## ⏸️ 5. Auto-Pause (Otomatis Jeda)
- Menambahkan fitur **Auto-Pause on Tab Switch**. Jika fitur ini diaktifkan, video akan otomatis dijeda (`pause`) ketika Anda berpindah tab atau mengecilkan (minimize) jendela browser.
- Fitur ini bereaksi terhadap *event* `visibilitychange` dan `blur` untuk mencakup sebanyak mungkin skenario pada berbagai situs web.

---

##  6. Akses Pengaturan Cepat di Popup
- Mengembangkan tampilan **Popup** ekstensi. Kini, selain *toggle* untuk mengaktifkan ekstensi pada domain saat ini, terdapat *toggle* cepat untuk fitur-fitur umum:
  - **Auto-Pause on Tab Switch**
  - **Anti-Redirect & Ads**
  - **Show Floating Panel**
- Perubahan pada *toggle* di popup akan langsung tersimpan dan disinkronisasikan ke halaman yang sedang terbuka tanpa perlu masuk ke menu Settings utama.

---
*Patch notes ini mendokumentasikan pembaruan fitur yang diminta setelah prototipe awal.*

---

#  Video Enhancer — Patch Notes (v1.2)

---

## ⏸️ 7. Auto-Pause Disempurnakan
- **Auto-Resume**: Video kini otomatis *resume* (lanjut putar) saat kembali ke tab, **hanya jika** ekstensi yang melakukan jeda — bukan jika Anda sendiri yang menekan pause.
- **Picture-in-Picture Aware**: Jika video sedang dalam mode PiP (Picture-in-Picture), fitur auto-pause **tidak akan menjeda** video karena Anda masih menonton.
- **5 Event Sources**: Meng-cover semua kemungkinan skenario:
  1. `visibilitychange` — pindah tab
  2. `blur` / `focus` (dengan delay 150ms) — alt-tab, minimize, klik di luar browser
  3. `freeze` / `resume` — browser agresif men-discard tab
  4. `beforeunload` — navigasi ke halaman lain
  5. `leavepictureinpicture` — keluar dari mode PiP lalu re-evaluasi
- **Delay pada blur**: Menambahkan delay 150ms pada event `blur` untuk menghindari *false trigger* dari iframe atau popup internal di halaman.

---

## ️ 8. Iframe Cleanup Disempurnakan
- **7 Heuristik Deteksi** untuk menentukan apakah sebuah iframe mencurigakan:
  1. Di luar `<body>` — hampir pasti malicious
  2. URL src cocok dengan daftar pola domain iklan/tracker bawaan (regex)
  3. URL src cocok dengan daftar domain iklan kustom pengguna dari Settings
  4. Ukuran 0×0 atau 1×1 — tracking pixel yang disamarkan sebagai iframe
  5. Posisi off-screen (koordinat negatif) — tersembunyi di luar layar
  6. Overlay transparan menutupi >80% viewport dengan z-index tinggi
  7. `display:none` atau `visibility:hidden` dengan src cross-origin
- **Neutralize sebelum remove**: Iframe kini di-set `src = about:blank` dan `srcdoc = ''` sebelum dihapus, mencegah request terakhir ke server iklan.
- **Fallback hide**: Jika iframe tidak bisa dihapus (proteksi DOM), ia akan disembunyikan (`display:none`, `pointer-events:none`, ukuran 0).
- **Scan `<html>` children**: Selain `querySelectorAll`, kini juga memindai anak langsung dari `<html>` yang mungkin terlewat.

---

##  9. Bypass Site Auto-Pause (Paksa Background Play)
- **Main-World Injection**: Menambahkan script terisolasi (`inject.js`) yang di-inject langsung ke *main world* dari halaman web.
- **Spoofing Visibility**: Script ini memblokir pendeteksian *unfocus* (seperti `visibilitychange`, `blur`, `focus`) dan menipu API browser (`document.hidden` dan `document.visibilityState`) agar halaman web mengira Anda masih aktif melihatnya.
- **Mencegah Jeda Paksa**: Mencegah website secara paksa melakukan jeda video (`video.pause()`) ketika Anda berpindah tab.
- **Toggle Settings**: Fitur canggih ini dapat dihidupkan/dimatikan melalui toggle **"Bypass Site Auto-Pause"** di menu Settings (opsi ini direkomendasikan untuk situs *streaming* yang agresif mem-pause video saat backgrounding).

---

#  Video Enhancer — Patch Notes (v1.3)

---

##  10. UI Revamp & Premium Glassmorphism
- **macOS-Style Glassmorphism**: Melakukan *revamp* (perombakan) besar pada gaya UI Options Page. Desain *card* kini memiliki efek `backdrop-filter` yang kuat (hingga `blur(40px)`) dengan highlight *inset* yang menciptakan kedalaman, sangat mirip dengan material *frosted glass* di macOS.
- **Clean Background**: Menghilangkan efek *white noise/grain* pada layer *background* utama, memungkinkan gambar wallpaper dirender dengan sangat jernih.
- **Global Scrollbar**: Memodernisasi *scrollbar* di seluruh aplikasi dengan desain *pill* melayang dan *track* transparan yang interaktif.
- **Clean Navigation**: Menyembunyikan Topbar (kolom pencarian) pada halaman selain "Home" agar pengguna bisa lebih fokus ke konten pengaturan.

##  11. Tema Siang / Malam (Noon & Night Mode)
- **Mode Switcher**: Menambahkan tombol *toggle* mode interaktif dengan ikon / di pojok kiri bawah *sidebar*.
- **Dynamic CSS Theming**: Membuat variabel CSS dinamis untuk mengubah tema warna secara *real-time*. Pada mode malam (Night), seluruh *glass card*, *sidebar*, dan *input* berubah menggunakan base warna gelap (`#0c0e1a`) dengan transparansi yang disesuaikan.
- **High-Contrast Text**: Mengimplementasikan *text-shadow* dinamis (`rgba(255,255,255)` untuk Noon, `rgba(0,0,0)` untuk Night) di atas halaman depan, untuk memastikan teks (seperti judul situs, jam, dan *todo*) tetap sangat mudah dibaca terlepas dari seberapa ramai atau terangnya gambar *background* yang digunakan.

## ️ 12. Dual Background Configuration
- **Pengaturan Wallpaper Terpisah**: Pengguna kini dapat mengatur dua *background* yang berbeda:
  - **Noon Background**: Aktif saat ekstensi dalam mode Siang.
  - **Night Background**: Aktif saat ekstensi dalam mode Malam.
- **Refactoring Layout Pengaturan**: Merapikan layout *card* pengaturan *background*, memindahkan teks keterangan, tombol "Import Image", dan tombol "Reset" ke dalam satu baris (horizontal) yang rapi, dengan hasil *preview* di bagian bawah.
