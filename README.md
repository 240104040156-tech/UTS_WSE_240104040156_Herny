# SIMADU API - Sistem Layanan Informasi dan Pengaduan Mahasiswa

REST API berbasis Node.js dan Express 5 untuk pengelolaan pengaduan mahasiswa terkait fasilitas kampus, layanan akademik, dan teknologi informasi. Proyek ini dirancang menggunakan arsitektur berlapis dengan mekanisme keamanan autentikasi JWT, otorisasi berbasis role serta kepemilikan data, validasi input ketat, dan dokumentasi interaktif OpenAPI / Swagger UI.

---

## 1. Prasyarat Sistem
- **Node.js** versi v24.21.0
- **NPM** (Node Package Manager) 11.19.0
- **Web Browser** (untuk mengakses Swagger UI) atau **Postman / HTTP Client** Microsoft Edge

---

## 2. Instalasi & Konfigurasi

1. **Clone atau buka direktori proyek:**
   ```bash
   cd UTS_WSE_240104040156_Herny
   ```

2. **Install seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan isi file `.env`:
   ```env
   PORT=3000
   JWT_SECRET=rahasia_super_aman_simadu_2026
   JWT_EXPIRES_IN=1h
   ```

---

## 3. Cara Menjalankan Server

- **Mode Pengembangan (dengan auto-reload Nodemon):**
  ```bash
  npm run dev
  ```
- **Mode Produksi:**
  ```bash
  npm start
  ```

Setelah server berjalan:
- Base URL API: `http://localhost:3000`
- Dokumentasi Interaktif Swagger UI: `http://localhost:3000/api-docs`

---

## 4. Arsitektur Berlapis & Pembagian Tanggung Jawab

Struktur proyek dipisahkan menjadi beberapa layer agar kode terorganisir, mudah dipelihara, dan memiliki pemisahan tanggung jawab (*Separation of Concerns*) yang jelas:

- **Routes (`src/routes/`)**: Mendefinisikan alamat URL endpoint dan metode HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), serta menghubungkannya ke middleware keamanan sebelum diteruskan ke controller.
- **Middleware (`src/middleware/`)**: Bertugas sebagai lapisan penyaring (*interceptor*) sebelum request diproses lebih lanjut, meliputi verifikasi JWT (`authenticate`), pembatasan hak akses peran (`authorizeRole`), validasi skema & field payload (`validate`), serta penanganan error global (`errorHandler`).
- **Controller (`src/controllers/`)**: Menerima objek HTTP `req` dan `res`, mengekstrak parameter/body, memanggil fungsi pada layer service, dan mengembalikan respons JSON terstandar beserta kode status HTTP yang sesuai.
- **Service (`src/services/`)**: Mengelola aturan bisnis utama, seperti pencocokan kredensial login, pembuatan token, pembatasan akses berdasarkan kepemilikan data (`mahasiswaId`), serta pengecekan bahwa pengaduan hanya dapat diubah/dihapus saat status masih `diajukan`.
- **Repository (`src/repositories/`)**: Mengelola operasi akses baca, tulis, ubah, dan hapus terhadap sumber data (*in-memory data store*) sehingga layer bisnis tidak bergantung langsung pada struktur penyimpanan data.

---

## 5. Akun Uji Awal & Hak Akses

Sistem menyediakan data awal dengan password ter-hash (`bcrypt`) untuk pengujian. Password untuk seluruh akun di bawah adalah **`password123`**:

| Role | Username | ID / NIM | Nama | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| `mahasiswa` | `herny` | `240104040156` | Herny | Buat pengaduan, lihat/ubah/hapus pengaduan milik sendiri (selama status `diajukan`) |
| `mahasiswa` | `haikal` | `240104040105` | Muhammad Haikal | Buat pengaduan, lihat/ubah/hapus pengaduan milik sendiri (selama status `diajukan`) |
| `admin` | `admin` | `ADM001` | Admin Kampus | Lihat seluruh pengaduan mahasiswa & ubah status penanganan (`diajukan` / `diproses` / `selesai`) |

---

## 6. Mekanisme Autentikasi & Daftar Endpoint

1. Kirim request ke `POST /api/auth/login` untuk memperoleh `token` JWT.
2. Sertakan token tersebut pada setiap request ke endpoint terlindungi melalui HTTP Header:
   ```http
   Authorization: Bearer <token_anda>
   ```

### Ringkasan Kontrak Endpoint

| Metode | Endpoint | Deskripsi | Hak Akses | Status Sukses | Status Gagal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login pengguna & generate JWT | Publik | `200` | `400`, `401` |
| `GET` | `/api/pengaduan` | Ambil daftar pengaduan | Mahasiswa (milik sendiri), Admin (semua) | `200` | `401` |
| `GET` | `/api/pengaduan/:id` | Ambil detail pengaduan berdasarkan ID | Pemilik, Admin | `200` | `401`, `403`, `404` |
| `POST` | `/api/pengaduan` | Tambah pengaduan baru | Mahasiswa | `201` | `400`, `401`, `403` |
| `PUT` | `/api/pengaduan/:id` | Ubah judul, kategori, dan deskripsi | Pemilik (status `diajukan`) | `200` | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/pengaduan/:id/status` | Ubah status pengaduan | Admin | `200` | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/pengaduan/:id` | Hapus pengaduan | Pemilik (status `diajukan`) | `200` | `401`, `403`, `404` |

### Format Respons Kesalahan (Error Handling)
Seluruh kesalahan mengembalikan struktur JSON konsisten tanpa mengekspos *stack trace* internal:
```json
{
  "status": "error",
  "message": "Keterangan kesalahan spesifik"
}
```
- `400 Bad Request`: Input kosong, nilai kategori/status tidak valid, format JSON salah, atau menyertakan field terlarang (`id`, `mahasiswaId`, `status`, `createdAt`).
- `401 Unauthorized`: Header `Authorization` tidak ada, format salah, token tidak sah, atau token kedaluwarsa.
- `403 Forbidden`: Peran tidak sesuai atau mencoba mengakses/mengubah pengaduan milik mahasiswa lain.
- `404 Not Found`: ID pengaduan atau URL endpoint tidak ditemukan.
- `500 Internal Server Error`: Kesalahan tak terduga pada sisi server.