# API Listing Generator

Script ini digunakan untuk membaca file HAR, mengekstrak endpoint API, lalu menghasilkan daftar API ke file Excel.

## Fitur

- Membaca request dari file HAR (`/api/` saja).
- Deteksi service otomatis:
  - `general-api` -> `General Management`
  - `account-api` -> `Account Management`
  - `invoice-api` -> `Invoice Management`
  - `vendor-api` -> `Vendor Management`
- Normalisasi endpoint:
  - Query string dihapus
  - ID numerik diganti `{id}`
  - UUID diganti `{uuid}`
- Deteksi kebutuhan auth (`Y` / `N`) dari header `Authorization`.
- Menyimpan data incremental ke `api-data.json` (tidak duplikat berdasarkan `method + endpoint`).
- Generate Excel multi-sheet per service ke `api-list.xlsx`.

## Requirement

- Node.js 18+ (disarankan Node.js 20).

## Install Dependency

Jalankan di folder project:

```bash
npm install exceljs
```

## Struktur File Utama

- `auto-listing.js` -> script utama
- `dev.evoqx.id-user.har` -> input HAR
- `api-data.json` -> penyimpanan data sementara/incremental
- `api-list.xlsx` -> output Excel

## Cara Menjalankan

1. Simpan file HAR dengan nama `dev.evoqx.id-user.har` di folder yang sama dengan script.
2. Jalankan:

```bash
node auto-listing.js
```

3. Jika sukses, terminal menampilkan:

```text
✅ Excel updated (multi-sheet + normalized)
```

## Catatan

- Jika ingin mengganti nama file input/output, ubah konstanta berikut di `auto-listing.js`:
  - `HAR_FILE`
  - `OUTPUT_FILE`
  - `TEMP_JSON`
- Untuk reset data incremental, hapus file `api-data.json` lalu jalankan ulang script.
