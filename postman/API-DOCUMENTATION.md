# Backend Auth & RBAC API — Postman Documentation

JWT Authentication, Role-Based Access Control (RBAC), and API security (helmet, rate limiting, express-validator).

---

## Quick Start

1. Start the server:

```bash
npm run dev
```

2. Import the Postman files from the `postman/` folder:
   - `Backend-Auth-API.postman_collection.json`
   - `Backend-Local.postman_environment.json`

3. Select the **Backend Local** environment in Postman (top-right dropdown).

4. Run the **RBAC Demo** folder in order, or:
   - **Register** → **Login** → **Get Profile**
   - **Admin Dashboard** (403 as user)
   - `node scripts/make-admin.js test@example.com` → **Login** again
   - **Products** folder for role-based CRUD

See `RBAC-LESSON-OUTLINE.md` for a full teaching slide deck.

---

## Base URL

```
http://localhost:3000
```

---

## Environment Variables

| Variable   | Default               | Description                          |
|------------|-----------------------|--------------------------------------|
| `baseUrl`  | `http://localhost:3000` | API base URL                       |
| `email`    | `test@example.com`    | Test user email                      |
| `password` | `password123`         | Test user password                   |
| `token`    | *(auto-set)*          | JWT token saved after login          |
| `role`     | `user`                | Role from last login response        |
| `productId`| *(auto-set)*          | Set after Create Product             |
| `targetUserId` | *(auto-set)*      | Set after List All Users (admin)     |

---

## API Endpoints

### 1. Health Check

Check if the API server is running.

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/` |
| **Auth**   | None |

**Response:**

```
JWT Authentication API Running
```

---

### 2. Register

Create a new user account.

| Field    | Value |
|----------|-------|
| **Method** | `POST` |
| **URL**    | `{{baseUrl}}/api/auth/register` |
| **Auth**   | None |

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Test User",
  "email": "{{email}}",
  "password": "{{password}}"
}
```

**Success Response (201):**

```json
{
  "message": "User Registered Successfully",
  "user": {
    "id": "66a1b2c3d4e5f6789012345",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**Validation Error (400):**

```json
{
  "message": "Validation failed",
  "errors": [{ "msg": "Invalid email format", "path": "email" }]
}
```

**Error Response (400):**

```json
{
  "message": "User already exists"
}
```

---

### 3. Login

Login and receive a JWT token. The token is automatically saved to `{{token}}` in Postman.

| Field    | Value |
|----------|-------|
| **Method** | `POST` |
| **URL**    | `{{baseUrl}}/api/auth/login` |
| **Auth**   | None |

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

**Success Response (200):**

```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

**Rate Limit (429):** Too many login attempts (10 per 15 minutes on auth routes).

**Error Responses:**

| Status | Message              |
|--------|----------------------|
| 404    | User Not Found       |
| 401    | Invalid Credentials  |

---

### 4. Get Profile

Get the logged-in user's profile from the JWT token.

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/api/auth/profile` |
| **Auth**   | Bearer Token |

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response (200):**

```json
{
  "message": "Profile Data",
  "user": {
    "id": "66a1b2c3d4e5f6789012345",
    "email": "test@example.com",
    "role": "user",
    "iat": 1718450000,
    "exp": 1718536400
  }
}
```

**Error Responses:**

| Status | Message                      |
|--------|------------------------------|
| 401    | Authorization Header Missing |
| 401    | Token Missing                |
| 401    | Invalid or Expired Token     |

---

### 5. Admin Dashboard

Admin-only route. Returns **403** if JWT role is not `admin`.

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/api/admin/dashboard` |
| **Auth**   | Bearer Token (role: admin) |

**Success Response (200):**

```json
{
  "message": "Admin dashboard",
  "admin": { "id": "...", "email": "...", "role": "admin" }
}
```

**Forbidden (403):**

```json
{
  "message": "Access denied",
  "required": ["admin"],
  "current": "user"
}
```

---

### 6. List All Users (Admin)

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/api/admin/users` |
| **Auth**   | Bearer Token (role: admin) |

---

### 7. Update User Role (Admin)

| Field    | Value |
|----------|-------|
| **Method** | `PATCH` |
| **URL**    | `{{baseUrl}}/api/admin/users/:id/role` |
| **Auth**   | Bearer Token (role: admin) |

**Body:**

```json
{ "role": "moderator" }
```

Valid roles: `admin`, `user`, `moderator`.

---

### 8. Moderation Reports

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/api/moderator/reports` |
| **Auth**   | Bearer Token (role: admin or moderator) |

---

### 9. Products

| Action | Method | URL | Required role |
|--------|--------|-----|---------------|
| List | GET | `{{baseUrl}}/api/products` | any authenticated |
| Create | POST | `{{baseUrl}}/api/products` | admin, moderator |
| Delete | DELETE | `{{baseUrl}}/api/products/:id` | admin |

**Create body:**

```json
{ "name": "Demo Widget", "price": 29.99 }
```

---

### 10. Upload Single Image

Multer + Sharp demo. No auth required.

| Field    | Value |
|----------|-------|
| **Method** | `POST` |
| **URL**    | `{{baseUrl}}/api/upload/single` |
| **Auth**   | None |
| **Body**   | form-data |

**Postman Body (form-data):**

| Key     | Type | Value        |
|---------|------|--------------|
| `image` | File | Select image |

**Success Response (201):**

```json
{
  "message": "Image uploaded and processed",
  "file": {
    "filename": "1718700000000-123456789-processed.webp",
    "url": "/uploads/1718700000000-123456789-processed.webp"
  }
}
```

**Validation:** JPEG, PNG, WebP only. Max 5 MB.

---

### 11. Upload Multiple Images

| Field    | Value |
|----------|-------|
| **Method** | `POST` |
| **URL**    | `{{baseUrl}}/api/upload/multiple` |
| **Auth**   | None |
| **Body**   | form-data |

**Postman Body (form-data):**

| Key      | Type | Value      |
|----------|------|------------|
| `images` | File | image 1    |
| `images` | File | image 2    |

Max 5 files. Field name must be **`images`** (not `image`, not custom names).

**Success Response (201):**

```json
{
  "message": "2 images uploaded and processed",
  "files": [
    { "filename": "...-processed.webp", "url": "/uploads/...-processed.webp" }
  ]
}
```

---

### 12. View Uploaded Image

| Field    | Value |
|----------|-------|
| **Method** | `GET` |
| **URL**    | `{{baseUrl}}/uploads/{{filename}}` |
| **Auth**   | None |

Use `filename` from the upload response. Opens the processed WebP from local storage.

**Full Postman guide:** `postman/FILE-UPLOAD-POSTMAN.md`

---

## Promote First Admin (Terminal)

Before admin routes work, promote a user once:

```bash
node scripts/make-admin.js test@example.com
```

Then **Login** again to get a JWT with `role: "admin"`.

---

## Postman Import Steps

1. Open **Postman**
2. Click **Import** (top-left)
3. Select or drag these files:
   - `postman/Backend-Auth-API.postman_collection.json`
   - `postman/Backend-Local.postman_environment.json`
4. Click **Import**
5. Select **Backend Local** from the environment dropdown (top-right)

---

## Auto Token Save (Login Script)

The **Login** request includes a test script that saves the JWT automatically:

```javascript
if (pm.response.code === 200) {
    const json = pm.response.json();
    if (json.token) pm.collectionVariables.set('token', json.token);
    if (json.role) pm.collectionVariables.set('role', json.role);
}
```

After a successful login, protected routes use `{{token}}` without manual copy-paste.

---

## cURL Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Profile

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Admin Dashboard

```bash
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Product (admin/moderator)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Widget","price":29.99}'
```

---

## Project Structure

```
Backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── authorize.js       # checkRole() RBAC
│   ├── security.js        # helmet + rate limiting
│   ├── upload.js          # Multer config + file validation
│   └── validators.js      # express-validator rules
├── models/
│   ├── User.js            # User schema + role field
│   └── products.js        # Product schema
├── routes/
│   ├── auth.routes.js     # Register, login, profile
│   ├── admin.routes.js    # Admin-only routes
│   ├── moderator.routes.js
│   ├── products.routes.js # Mixed role permissions
│   └── upload.routes.js   # Single & multiple file uploads
├── scripts/
│   └── make-admin.js      # Promote user to admin
├── utils/
│   └── imageProcessor.js  # Sharp resize, compress, convert
├── uploads/               # Local file storage
├── postman/
│   ├── API-DOCUMENTATION.md
│   ├── FILE-UPLOAD-POSTMAN.md
│   ├── MANUAL-POSTMAN-TESTING.md
│   ├── RBAC-LESSON-OUTLINE.md
│   ├── Backend-Auth-API.postman_collection.json
│   └── Backend-Local.postman_environment.json
├── server.js              # App entry point
└── .env                   # Environment config
```
