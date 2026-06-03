# API Integration Guide (Acuan sesuai Swagger)

Dokumen ini dibuat untuk menjadi **acuan integrasi** FE ke BE berdasarkan file swagger:

- `swagger-auth.md`
- `swagger-categories,product,orders.md`

## Base URL & Auth
- Base URL: `https://sneakerlocal.up.railway.app` (mengikuti swagger)
- Untuk endpoint yang membutuhkan autentikasi: kirim header:
  - `Authorization: Bearer <access_token>`
- Token:
  - Didapat dari: `POST /auth/login` (top-level `access_token`)

---

## 1) Auth API (`swagger-auth.md`)

### POST `/auth/register/customer`
**Tujuan:** registrasi pelanggan (Customer)  
**Body (application/json)**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response (contoh):**
```json
{
  "user": {
    "id": "cmpxehn7q0009ms125hb6o3wt",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```
**Status penting:**
- `201` sukses
- `400` email sudah terdaftar / validasi gagal

---

### POST `/auth/login`
**Tujuan:** login dengan email & password  
**Body (application/json)**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response sukses (`200`) (contoh):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmpxehn7q0009ms125hb6o3wt",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

**Curl (contoh):**
```bash
curl -X POST 'https://sneakerlocal.up.railway.app/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Catatan integrasi:**
- FE/axios harus menyimpan `access_token` dari **top-level** response.

---

## 2) Categories, Products & SKU/Inventory (`swagger-categories,product,orders.md`)

### GET `/categories`
**Tujuan:** daftar semua kategori (publik)  
**Query (opsional):**
- `q` (string) kata kunci
- `slug` (string)
- `isActive` (boolean)
- `page` (number)
- `limit` (number, default 20)

Contoh:
`GET /categories?isActive=true&limit=20`

---

### GET `/products`
**Tujuan:** daftar produk aktif (publik)  
**Query (opsional):**
- `q`
- `categorySlug`
- `color`
- `size`
- `minPrice`
- `maxPrice`
- `page`
- `limit`

Contoh:
`GET /products?q=kaos&categorySlug=kaos-polos&color=Hitam&size=L&minPrice=50000&maxPrice=200000&page=1&limit=20`

---

### GET `/products/{slug}`
**Tujuan:** detail produk berdasarkan slug (publik), termasuk SKU & inventory.

Contoh:
`GET /products/kaos-polos-hitam`

---

### POST `/products/{id}/image` (Admin)
**Tujuan:** upload gambar produk  
**Auth:** wajib  
**Header:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (multipart/form-data):**
- `file` (required)

Contoh curl:
```bash
curl -X POST 'https://sneakerlocal.up.railway.app/products/1/image' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@Screenshot.png;type=image/png'
```

---

### PATCH `/products/{id}` (Admin)
**Tujuan:** update produk (Admin)

**Auth:** wajib  
**Body (application/json):**
Swagger menjelaskan body dengan field `type` (mis. `type=PRODUCT` atau kosongkan type sesuai swagger).

Contoh (type=PRODUCT):
```json
{
  "type": "PRODUCT",
  "categoryId": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  "name": "Kaos Polos Premium",
  "slug": "kaos-polos-premium",
  "description": "Kaos polos premium bahan cotton combed 24s",
  "basePrice": 95000,
  "imageUrl": "string",
  "color": "Putih",
  "size": "XL",
  "stock": 100
}
```

**Catatan integrasi penting:**
- Pastikan payload admin sesuai swagger (ada kebutuhan field `type`).

---

### PATCH `/skus/{id}` (Admin)
**Tujuan:** update warna & ukuran SKU (Admin)  
**Auth:** wajib  
**Body (application/json):**
Swagger menekankan `type=SKU`.

---

### PATCH `/inventories/{skuId}` (Admin)
**Tujuan:** update stok inventory (Admin)  
**Auth:** wajib  
**Body (application/json):**
Swagger menekankan `type=STOCK` dan stok wajib diisi.

---

## 3) Orders (`swagger-categories,product,orders.md`)

### POST `/checkout`
**Tujuan:** membuat pesanan baru  
**Auth:** wajib

**Body (application/json):**
```json
{
  "items": [
    { "skuId": "clxxxxxxxxxxxxxxxxxxxxxxxxx", "quantity": 2 }
  ],
  "shippingType": "DELIVERY",
  "district": "LOWOKWARU",
  "shippingAddress": "Jl. Soekarno-Hatta No. 9, Lowokwaru, Malang",
  "paymentMethod": "MANUAL_TRANSFER"
}
```

**Catatan integrasi:**
- Jika `shippingType=DELIVERY`, swagger mewajibkan `district` dan `shippingAddress`.
- Pastikan format field `quantity` (bukan `qty`) sesuai swagger.

---

### GET `/orders`
**Tujuan:** daftar pesanan user login  
**Auth:** wajib

**Query opsional:**
- `status`
- `page`
- `limit`

---

### GET `/orders/{id}`
**Tujuan:** detail pesanan milik sendiri  
**Auth:** wajib

---

### POST `/orders/{id}/payment-proof` (Admin/Flow upload)
**Tujuan:** upload bukti transfer untuk pesanan yang masih `PENDING`  
**Auth:** wajib  
**Body (multipart/form-data):**
- `file` (required)
- `note` (optional)

Catatan swagger:
- Jika `note` tidak ada, bisa kirim empty value (sesuai contoh swagger).

---

### PATCH `/orders/{id}/status` (Admin)
**Tujuan:** ubah status pesanan dengan transisi:
- `PENDING` → `CANCELLED`
- `WAITING_CONFIRMATION` → `PAID` / `CANCELLED`
- `PAID` → `SHIPPED`

**Auth:** wajib  
**Body (application/json):**
```json
{
  "status": "PAID",
  "note": "Transfer via BCA a/n Budi"
}
```

---

## Quick Mapping ke FE (sesuai `src/lib/api.ts`)
Di FE, axios baseURL mengikuti env:
- `NEXT_PUBLIC_API_URL` (jika tidak ada fallback)

Fungsi FE yang sesuai dengan swagger:
- `authApi.registerCustomer` → `POST /auth/register/customer`
- `authApi.login` → `POST /auth/login`
- `productsApi.getAll` → `GET /products`
- `productsApi.getBySlug` → `GET /products/{slug}`
- `productsApi.uploadImage` → `POST /products/{id}/image`
- `ordersApi.checkout` → `POST /checkout`
- `ordersApi.getMyOrders` → `GET /orders`
- `ordersApi.getById` → `GET /orders/{id}`
- `ordersApi.uploadProof` → `POST /orders/{orderId}/payment-proof`
- `ordersApi.updateStatus` → `PATCH /orders/{id}/status`

**Langkah integrasi paling penting:**
1) Pastikan payload body FE benar-benar memakai field yang diminta swagger (contoh penting: `quantity` di checkout, `file` di multipart upload, dan field `type` pada update SKU/inventory/products admin).
2) Pastikan token dikirim top-level sebagai `Authorization: Bearer <access_token>`.
