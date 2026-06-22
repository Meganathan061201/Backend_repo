# Manual Postman Testing Guide

Step-by-step guide to test the Backend Auth API manually in Postman — without importing any collection.

---

## Before You Start

1. Make sure **MongoDB** is running locally
2. Start the server:

```bash
npm run dev
```

You should see:

```
Server Running on Port 3000
MongoDB Connected
```

3. Open **Postman**
4. (Optional) Create a new **Collection** named `Backend Auth API` to keep requests organized

---

## 1. Health Check

**Create request:**
- Click **New** → **HTTP Request**
- Name it: `Health Check`

| Field  | Value                      |
|--------|----------------------------|
| Method | `GET`                      |
| URL    | `http://localhost:3000/`   |

Click **Send**

**Expected response:**

```
JWT Authentication API Running
```

---

## 2. Register User

**Create request:**
- Click **New** → **HTTP Request**
- Name it: `Register`

| Field  | Value                                      |
|--------|--------------------------------------------|
| Method | `POST`                                     |
| URL    | `http://localhost:3000/api/auth/register`  |

### Headers tab

| Key          | Value              |
|--------------|--------------------|
| Content-Type | `application/json` |

### Body tab

- Select **raw**
- Select **JSON** from the dropdown
- Paste this:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Click **Send**

**Expected response (201):**

```json
{
  "message": "User Registered Successfully"
}
```

> If you see `"User already exists"`, the user is already in the database. Skip to **Login**.

---

## 3. Login

**Create request:**
- Click **New** → **HTTP Request**
- Name it: `Login`

| Field  | Value                                   |
|--------|-----------------------------------------|
| Method | `POST`                                  |
| URL    | `http://localhost:3000/api/auth/login`  |

### Headers tab

| Key          | Value              |
|--------------|--------------------|
| Content-Type | `application/json` |

### Body tab

- Select **raw**
- Select **JSON**
- Paste this:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Click **Send**

**Expected response (200):**

```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

> **Important:** Copy the `token` value from the response. You will need it for the protected routes below.

---

## 4. Get Profile (Protected)

**Create request:**
- Click **New** → **HTTP Request**
- Name it: `Get Profile`

| Field  | Value                                     |
|--------|-------------------------------------------|
| Method | `GET`                                     |
| URL    | `http://localhost:3000/api/auth/profile`  |

### Authorization tab

| Field | Value          |
|-------|----------------|
| Type  | `Bearer Token` |
| Token | Paste the token copied from **Login** |

Click **Send**

**Expected response (200):**

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

---

---

## 5. RBAC Demo — Admin Dashboard (403 as user)

| Field  | Value                                        |
|--------|----------------------------------------------|
| Method | `GET`                                        |
| URL    | `http://localhost:3000/api/admin/dashboard`  |

**Authorization:** Bearer Token (from Login)

**Expected response (403):**

```json
{
  "message": "Access denied",
  "required": ["admin"],
  "current": "user"
}
```

---

## 6. Promote to Admin (Terminal)

In your project folder:

```bash
node scripts/make-admin.js test@example.com
```

Run **Login** again — response should include `"role": "admin"`. Copy the new token.

---

## 7. Admin Dashboard (200 as admin)

Same request as step 5 with the **new admin token**.

**Expected response (200):**

```json
{
  "message": "Admin dashboard",
  "admin": { "id": "...", "email": "...", "role": "admin" }
}
```

---

## 8. Create Product (moderator or admin)

| Field  | Value                                   |
|--------|-----------------------------------------|
| Method | `POST`                                  |
| URL    | `http://localhost:3000/api/products`    |

**Body (raw JSON):**

```json
{
  "name": "Demo Widget",
  "price": 29.99
}
```

**Expected:** `201` for admin/moderator, `403` for regular user.

---

## 9. Delete Product (admin only)

| Field  | Value                                              |
|--------|----------------------------------------------------|
| Method | `DELETE`                                           |
| URL    | `http://localhost:3000/api/products/PRODUCT_ID`  |

Replace `PRODUCT_ID` with the `_id` from Create Product.

**Expected:** `200` for admin, `403` for moderator/user.

---

## 10. Validation Demo

**Register** with invalid body:

```json
{
  "name": "",
  "email": "not-an-email",
  "password": "12"
}
```

**Expected response (400):**

```json
{
  "message": "Validation failed",
  "errors": [...]
}
```

---

## Test Order (Full RBAC Lesson)

```
1. Health Check
2. Register
3. Login                    →  role: user
4. Get Profile
5. Admin Dashboard          →  403 (access denied)
6. make-admin.js + Login    →  role: admin
7. Admin Dashboard          →  200
8. Create Product           →  201
9. Delete Product           →  200 (admin only)
10. Register (Invalid)      →  400 validation
```

---

## File Uploads (Multer + Sharp)

See **`FILE-UPLOAD-POSTMAN.md`** for the full step-by-step guide.

| Name              | Method | URL                                         | Body       | Key      |
|-------------------|--------|---------------------------------------------|------------|----------|
| Upload Single     | POST   | `http://localhost:3000/api/upload/single`   | form-data  | `image`  |
| Upload Multiple   | POST   | `http://localhost:3000/api/upload/multiple` | form-data  | `images` |
| View Image        | GET    | `http://localhost:3000/uploads/FILENAME`    | —          | —        |

Or import the collection and use the **File Uploads** folder (field names pre-set).

---

## Quick Reference

| # | Name              | Method | URL                                              | Auth         | Role        |
|---|-------------------|--------|--------------------------------------------------|--------------|-------------|
| 1 | Health Check      | GET    | `http://localhost:3000/`                         | None         | —           |
| 2 | Register          | POST   | `http://localhost:3000/api/auth/register`      | None         | —           |
| 3 | Login             | POST   | `http://localhost:3000/api/auth/login`         | None         | —           |
| 4 | Get Profile       | GET    | `http://localhost:3000/api/auth/profile`       | Bearer Token | any         |
| 5 | Admin Dashboard   | GET    | `http://localhost:3000/api/admin/dashboard`    | Bearer Token | admin       |
| 6 | List Users        | GET    | `http://localhost:3000/api/admin/users`        | Bearer Token | admin       |
| 7 | Create Product    | POST   | `http://localhost:3000/api/products`           | Bearer Token | mod/admin   |
| 8 | Delete Product    | DELETE | `http://localhost:3000/api/products/:id`       | Bearer Token | admin       |

> **Tip:** Import `Backend-Auth-API.postman_collection.json` for pre-built requests with auto-saved tokens. See `RBAC-LESSON-OUTLINE.md` for slide content.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Could not send request` | Server is not running | Run `npm run dev` |
| `User already exists` | Email is already registered | Skip Register, go to Login |
| `User Not Found` | User was never registered | Run Register first |
| `Invalid Credentials` | Wrong email or password | Check the body values |
| `Authorization Header Missing` | No token sent | Add Bearer Token in Authorization tab |
| `Token Missing` | Bearer token field is empty | Paste token from Login response |
| `Invalid or Expired Token` | Token is wrong or expired | Login again and copy a new token |
| `Access denied` (403) | JWT role lacks permission | Use admin token or promote user |
| `Validation failed` (400) | Invalid request body | Fix email, password length, etc. |
| `Too many requests` (429) | Rate limit exceeded | Wait 15 minutes or restart demo |
| `Field name missing` | Empty form-data key | Set key to `image` or `images` |
| `Unexpected field` | Wrong form-data key | Use `image` (single) or `images` (multiple) |
| `Only JPEG, PNG, and WebP...` | Invalid file type | Upload `.jpg`, `.png`, or `.webp` |

---

## Notes

- For **Register** and **Login**, always use **Body → raw → JSON** and set the `Content-Type: application/json` header.
- For **Get Profile** and **Get All Users**, use **Authorization → Bearer Token** and paste the token from the Login response.
- JWT tokens expire after **1 day** (configured in `.env` as `JWT_EXPIRES_IN=1d`). If a protected route fails, login again to get a fresh token.
- Default test credentials:
  - Email: `test@example.com`
  - Password: `password123`
