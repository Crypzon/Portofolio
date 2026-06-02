# Stanley Lo Portfolio

Portofolio statis interaktif untuk Stanley Lo. Versi ini memakai UI gelap, layout responsif, animasi reveal-on-scroll, tilt 3D pada panel, mobile navigation, dan background WebGL berbasis Three.js dengan visual holographic system yang lebih rapi.

## Fitur

- Hero portfolio dengan foto utama, CTA, status ketersediaan, dan metrik profil.
- Background 3D WebGL memakai Three.js dari CDN, termasuk central hub, orbit nodes, balanced data bars, clean info panels, dan subtle particles.
- Section lengkap untuk profile, selected work, experience, capabilities, dan contact.
- Animasi scroll, magnetic button, counter animation, active navigation, dan mobile menu.
- Layout responsif untuk desktop dan mobile tanpa horizontal overflow.

## Struktur

```text
.
|-- index.html
|-- style.css
|-- script.js
|-- assets/
|   |-- stanley-hero.jpg
|-- CV-Stanley.pdf
```

## Menjalankan Lokal

Karena halaman memakai ES module dan Three.js, jalankan lewat server lokal:

```bash
python -m http.server 8010 --bind 127.0.0.1
```

Lalu buka:

```text
http://127.0.0.1:8010/
```

## Kustomisasi Cepat

- Ubah konten profil, pengalaman, proyek, dan kontak di `index.html`.
- Ubah warna, spacing, responsivitas, dan motion di `style.css`.
- Ubah scene Three.js, code panel texture, reveal animation, tilt, counters, dan mobile navigation di `script.js`.

## Catatan Deploy

Situs ini tetap bisa di-host di layanan static hosting seperti GitHub Pages, Vercel, Netlify, atau XAMPP. Pastikan koneksi internet tersedia agar font Google dan Three.js CDN bisa dimuat.
