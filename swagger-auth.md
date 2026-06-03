POST
/auth/register/admin


Parameters
Cancel
No parameters
Request body
application/json
Edit Value
Schema

Execute
Clear
Responses
Curl

curl -X 'POST' \  'https://sneakerlocal.up.railway.app/auth/register/admin' \  -H 'accept: */*' \  -H 'Content-Type: application/json' \  -d '{  "email": "user@example.com",  "password": "password123"}'
Request URL
https://sneakerlocal.up.railway.app/auth/register/admin
Server response
CodeDetails400Error: response status is 400
Response body

Download
{  "message": "Email already registered",  "error": "Bad Request",  "statusCode": 400}
Response headers
 access-control-allow-origin: * 
 content-encoding: gzip 
 content-type: application/json; charset=utf-8 
 date: Wed,03 Jun 2026 04:24:13 GMT 
 etag: W/"4d-NAM1+LmoLN4kHwKg2oeEQXkLTsc" 
 server: railway-hikari 
 vary: accept-encoding 
 x-hikari-trace: sin1.tr00 
 x-powered-by: Express 
 x-railway-edge: railway/asia-southeast1-eqsg3a 
 x-railway-request-id: V7GuGt4kSgGF6cLFDcO5xA 
Responses
CodeDescriptionLinks201No links400Email sudah terdaftar atau validasi gagal
No links
POST
/auth/register/customer
Registrasi pelanggan baru


Membuat akun pelanggan baru dengan email dan password. Email harus unik.
Parameters
Try it out
No parameters
Request body
application/json
Example Value
Schema
{  "email": "user@example.com",  "password": "password123"}
Responses
CodeDescriptionLinks201Registrasi berhasil
Media type
application/json
Controls Accept header.
Example Value
Schema
{  "user": {    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",    "email": "user@example.com",    "role": "CUSTOMER"  }
}
No links400Email sudah terdaftar atau validasi gagal
No links
POST
/auth/login
Login pengguna


Autentikasi dengan email dan password. Mengembalikan JWT access token.
Parameters
Try it out
Reset
No parameters
Request body
application/json
Example Value
Schema
{  "email": "admin@gmail.com",  "password": "123456"}
Responses
Curl

curl -X 'POST' \  'https://sneakerlocal.up.railway.app/auth/login' \  -H 'accept: application/json' \  -H 'Content-Type: application/json' \  -d '{  "email": "admin@gmail.com",  "password": "123456"}'
Request URL
https://sneakerlocal.up.railway.app/auth/login
Server response
CodeDetails201Undocumented
Response body

Download
{  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXB4ZGg1bnQwMDAwbXMxMmtxYWJyMWt6IiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODA0NTI2MjAsImV4cCI6MTc4MTA1NzQyMH0.OdGwFd-tENM_0Xc04BXaSQmptwEGXbQCpJVlqDZ1acM",  "user": {    "id": "cmpxdh5nt0000ms12kqabr1kz",    "email": "admin@gmail.com",    "role": "ADMIN"  }
}
Response headers
 access-control-allow-origin: * 
 content-encoding: gzip 
 content-type: application/json; charset=utf-8 
 date: Wed,03 Jun 2026 02:10:20 GMT 
 etag: W/"14a-2NdX8TZojrYgoyKTunxeHd38E0I" 
 server: railway-hikari 
 vary: accept-encoding 
 x-hikari-trace: sin1.nzn2 
 x-powered-by: Express 
 x-railway-edge: railway/asia-southeast1-eqsg3a 
 x-railway-request-id: 9kntfTIzRf2c7mF5-8Y8hA 
Responses
CodeDescriptionLinks200Login berhasil
Media type
application/json
Controls Accept header.
Example Value
Schema
{  "access_token": "eyJhbGciOiJIUzI1NiIs...",  "user": {    "id": "clxxxxxxxxxxxxxxxxxxxxxxxxx",    "email": "user@example.com",    "role": "ADMIN"  }
}
No links401Email atau password salah
