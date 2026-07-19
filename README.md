
-----

# BayFund - Platform Crowdfunding Web3 Fullstack

Selamat datang di BayFund, sebuah platform crowdfunding full-stack terdesentralisasi yang dibangun dengan **React**, **TypeScript**, **Express**, **MongoDB**, dan integrasi **Smart Contract** di jaringan Polygon. Platform ini memungkinkan pengguna untuk membuat kampanye penggalangan dana, memberikan donasi, dan melacak kontribusi secara aman dan transparan menggunakan teknologi blockchain.

*(Catatan: Pastikan gambar `Project_Crowdfunding.png` ada di root repository Anda di GitHub agar bisa ditampilkan).*

## Daftar Isi

  - [✨ Fitur Utama](https://www.google.com/search?q=%23-fitur-utama)
  - [🔧 Tumpukan Teknologi (Tech Stack)](https://www.google.com/search?q=%23-tumpukan-teknologi-tech-stack)
  - [🏛️ Arsitektur Proyek](https://www.google.com/search?q=%23%EF%B8%8F-arsitektur-proyek)
  - [🚀 Memulai Proyek](https://www.google.com/search?q=%23-memulai-proyek)
      - [Prasyarat](https://www.google.com/search?q=%23prasyarat)
      - [Instalasi & Konfigurasi](https://www.google.com/search?q=%23instalasi--konfigurasi)
  - [📚 Dokumentasi API Backend](https://www.google.com/search?q=%23-dokumentasi-api-backend)
  - [📄 Smart Contract](https://www.google.com/search?q=%23-smart-contract)
  - [🧪 Pengujian (Testing)](https://www.google.com/search?q=%23-pengujian-testing)
  - [🤝 Berkontribusi](https://www.google.com/search?q=%23-berkontribusi)
  - [📝 Lisensi](https://www.google.com/search?q=%23-lisensi)

-----

## ✨ Fitur Utama

  - **Manajemen Kampanye:** Pengguna dapat membuat, memperbarui, dan mengelola kampanye penggalangan dana dengan deskripsi, target dana, dan batas waktu.
  - **Sistem Donasi Web3:** Donasi diproses melalui interaksi dengan Smart Contract di jaringan Polygon, memastikan setiap transaksi transparan dan tercatat di blockchain.
  - **Pelacakan Progres Real-time:** Donatur dan kreator dapat melacak progres pengumpulan dana secara visual.
  - **Penarikan Dana (Withdrawal):** Kreator dapat menarik dana yang terkumpul langsung ke wallet mereka setelah kampanye berhasil mencapai target.
  - **Otentikasi Pengguna:** Sistem otentikasi aman menggunakan JWT (JSON Web Tokens) untuk mengelola sesi pengguna.
  - **Manajemen Profil:** Pengguna dapat mengelola profil mereka, termasuk menghubungkan dan memutuskan koneksi wallet MetaMask.
  - **UI Responsif:** Antarmuka yang modern dan dapat diakses dengan baik di perangkat desktop maupun mobile.

-----

## 🔧 Tumpukan Teknologi (Tech Stack)

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend** | React.js, Next.js, TypeScript, Tailwind CSS, Axios, Ethers.js |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB (dengan Mongoose) |
| **Blockchain** | Solidity, Hardhat, Polygon (Amoy Testnet) |
| **Otentikasi** | JSON Web Token (JWT), Bcrypt |
| **Tools** | Git & GitHub, Jest, Docker (opsional) |

-----

## 🏛️ Arsitektur Proyek

Proyek ini menggunakan struktur *monorepo* sederhana yang memisahkan antara backend dan frontend.

  - `be-crowdfunding/`: Folder ini berisi seluruh kode untuk server backend (Express.js).
  - `fe-crowdfunding/`: Folder ini berisi seluruh kode untuk aplikasi frontend (Next.js/React).
  - `smart-contract/`: Folder ini berisi kode Smart Contract Solidity dan skrip deployment menggunakan Hardhat.

-----

## 🚀 Memulai Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini secara lokal.

### Prasyarat

Pastikan Anda sudah menginstal perangkat lunak berikut:

  - Node.js (versi \>= 18.0)
  - NPM atau Yarn
  - Akun MongoDB (lokal atau Atlas)
  - Ekstensi browser MetaMask

### Instalasi & Konfigurasi

1.  **Clone Repository**

    ```bash
    git clone https://github.com/harystbd05/crowdfunding-platform.git
    cd crowdfunding-platform
    ```

2.  **Konfigurasi Backend**

    ```bash
    cd be-crowdfunding
    npm install
    ```

    Buat file `.env` di dalam folder `be-crowdfunding` dan isi sesuai contoh di bawah.

3.  **Konfigurasi Frontend**

    ```bash
    cd ../fe-crowdfunding
    npm install
    ```

    Buat file `.env.local` di dalam folder `fe-crowdfunding`.

#### Variabel Lingkungan (.env)

**Backend (`be-crowdfunding/.env`):**
| Variabel | Deskripsi | Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL koneksi ke MongoDB Anda. | `mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/` |
| `DATABASE_NAME`| Nama database yang akan digunakan. | `crowdfunding_db` |
| `JWT_SECRET` | Kunci rahasia untuk menandatangani JWT. | `ini-adalah-kunci-rahasia-yang-sangat-panjang` |
| `PRIVATE_KEY` | Private key dari wallet yang Anda gunakan untuk deploy kontrak. **JANGAN GUNAKAN DI PRODUKSI\!** | `0x...` |
| `CONTRACT_ADDRESS`| Alamat Smart Contract setelah di-deploy. | `0x...` |
| `INFURA_KEY` | URL endpoint RPC dari provider node (misal: Infura, Alchemy). | `https://polygon-amoy.infura.io/v3/xxxxxxxx` |

**Frontend (`fe-crowdfunding/.env.local`):**
| Variabel | Deskripsi | Contoh |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL tempat backend server berjalan. | `http://localhost:5000` |

4.  **Deploy Smart Contract**
    Buka terminal baru di root proyek, lalu jalankan:

    ```bash
    cd smart-contract
    npx hardhat deploy --network polygon
    ```

    Setelah berhasil, salin alamat kontrak ke `CONTRACT_ADDRESS` di `.env` backend, dan salin ABI dari folder `artifacts` ke file di frontend (misal: `fe-crowdfunding/src/constants/abi.ts`).

5.  **Jalankan Aplikasi**

      * **Jalankan Backend Server:**
        ```bash
        cd be-crowdfunding
        npm run dev
        ```
      * **Jalankan Frontend Server:**
        ```bash
        cd fe-crowdfunding
        npm run dev
        ```

Aplikasi frontend akan tersedia di `http://localhost:3000` dan backend di `http://localhost:5000`.

-----

## 📚 Dokumentasi API Backend

Berikut adalah ringkasan endpoint API utama. Semua route diawali dengan `/api/v1`.

### `/users`

  - `POST /users/login`

      - **Deskripsi:** Mengautentikasi pengguna dan mengembalikan JWT.
      - **Body:** `{ "Email": "string", "Password": "string" }`
      - **Respons:** `{ "data": { "token": "string" } }`

  - `POST /users`

      - **Deskripsi:** Mendaftarkan pengguna baru.
      - **Body:** `{ "Name": "string", "Email": "string", "Password": "string" }`

  - `POST /users/connect-wallet`

      - **Deskripsi:** Menghubungkan alamat wallet ke profil pengguna.
      - **Auth:** JWT Diperlukan.
      - **Body:** `{ "WalletAddress": "string" }`

### `/campaigns`

  - `GET /campaigns`

      - **Deskripsi:** Mendapatkan daftar semua kampanye dengan paginasi, filter, dan sorting.
      - **Query Params:** `limit`, `page`, `sort`, `search`.

  - `GET /campaigns/:id`

      - **Deskripsi:** Mendapatkan detail satu kampanye berdasarkan ID.

  - `POST /campaigns`

      - **Deskripsi:** Membuat kampanye baru.
      - **Auth:** JWT Diperlukan.
      - **Tipe Konten:** `multipart/form-data`.
      - **Body:** `Title`, `Description`, `TargetAmount`, `Deadline`, `Image`.

### `/profile`

  - `GET /profile`

      - **Deskripsi:** Mendapatkan detail profil pengguna yang sedang login.
      - **Auth:** JWT Diperlukan.

  - `PUT /profile`

      - **Deskripsi:** Memperbarui detail profil (misal: nama).
      - **Auth:** JWT Diperlukan.
      - **Body:** `{ "Name": "string" }`

  - `GET /profile/campaigns`

      - **Deskripsi:** Mendapatkan daftar kampanye yang dibuat oleh pengguna yang sedang login.
      - **Auth:** JWT Diperlukan.

### `/donations`

  - `POST /donations`

      - **Deskripsi:** Mencatat donasi baru ke database setelah transaksi blockchain berhasil.
      - **Body:** `{ "CampaignID": number, "DonorID": number, "Amount": string }`

  - `POST /donations/withdraw`

      - **Deskripsi:** Memproses permintaan penarikan dana dari sebuah kampanye.
      - **Body:** `{ "CampaignID": number }`

-----

## 📄 Smart Contract

Smart Contract ditulis dalam Solidity dan di-deploy di jaringan Polygon (Amoy Testnet). Fungsi utamanya antara lain:

  - `createCampaign()`: Mencatat kampanye baru di blockchain.
  - `donateToCampaign()`: Memproses donasi dari pengguna ke sebuah kampanye.
  - `withdraw()`: Memungkinkan kreator untuk menarik dana yang terkumpul.

Interaksi dari backend ke Smart Contract dilakukan menggunakan **Ethers.js**.

-----

## 🧪 Pengujian (Testing)

  - **Backend Tests:**
    ```bash
    cd be-crowdfunding
    npm test
    ```
  - **Frontend Tests:**
    ```bash
    cd fe-crowdfunding
    npm test
    ```
  - **Smart Contract Tests:**
    ```bash
    cd smart-contract
    npx hardhat test
    ```

-----

## 🤝 Berkontribusi

Kami menyambut kontribusi untuk meningkatkan platform ini. Jika Anda ingin berkontribusi, silakan ikuti langkah-langkah berikut:

1.  *Fork* repository ini.
2.  Buat *branch* baru untuk fitur atau perbaikan bug Anda.
3.  Tulis pesan *commit* yang jelas dan ringkas.
4.  *Push branch* Anda ke repository *fork* Anda.
5.  Buka *Pull Request* untuk ditinjau.

-----

## 📝 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](https://www.google.com/search?q=LICENSE) untuk detailnya.#   W e b 3 - C r o w d f u n d i n g  
 #   W e b 3 - C r o w d f u n d i n g  
 