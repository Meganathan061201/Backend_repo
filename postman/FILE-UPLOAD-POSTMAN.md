# File Upload — Postman Testing Guide

Step-by-step guide to test **Multer + Sharp** file uploads manually in Postman.

Covers: single upload, multiple upload, validation errors, and viewing processed images.

---

## Before You Start

1. Start the server:

```bash
npm run dev
```

You should see:

```
Server Running on Port 3000
```

2. Open **Postman**
3. Have a test image ready (`.jpg`, `.png`, or `.webp` — max **5 MB**)

---

## Quick Reference

| # | Name                  | Method | URL                                              | Body type | Field key | Field type |
|---|-----------------------|--------|--------------------------------------------------|-----------|-----------|------------|
| 1 | Upload Single Image   | POST   | `http://localhost:3000/api/upload/single`        | form-data | `image`   | File       |
| 2 | Upload Multiple Images| POST   | `http://localhost:3000/api/upload/multiple`      | form-data | `images`  | File       |
| 3 | View Image            | GET    | `http://localhost:3000/uploads/FILENAME`         | —         | —         | —          |
| 4 | Upload Single File    | POST   | `http://localhost:3000/api/upload/file/single`   | form-data | `file`    | File       |
| 5 | Upload Multiple Files | POST   | `http://localhost:3000/api/upload/file/multiple` | form-data | `files`   | File       |
| 6 | View Document (API)   | GET    | `http://localhost:3000/api/upload/file/FILENAME`   | —         | —         | —          |
| 7 | Download Document   | GET    | `http://localhost:3000/api/upload/file/FILENAME?download=true` | — | — | — |

> **Import option:** Import `Backend-Upload-API.postman_collection.json` (upload-only) or use folder **File Uploads** in `Backend-Auth-API.postman_collection.json`.

---

## 1. Upload Single Image

**Create request:**
- Click **New** → **HTTP Request**
- Name it: `Upload Single Image`

| Field  | Value                                         |
|--------|-----------------------------------------------|
| Method | `POST`                                        |
| URL    | `http://localhost:3000/api/upload/single`     |

### Body tab

- Select **form-data** (not raw, not binary)
- Add one row:

| Key     | Type   | Value              |
|---------|--------|--------------------|
| `image` | **File** | Select your image |

> Key must be exactly **`image`**. Type must be **File**, not Text.

Click **Send**

**Expected response (201):**

```json
{
  "message": "Image uploaded and processed",
  "file": {
    "filename": "1718700000000-123456789-processed.webp",
    "url": "/uploads/1718700000000-123456789-processed.webp"
  }
}
```

---

## 2. Upload Multiple Images

**Create request:**
- Name it: `Upload Multiple Images`

| Field  | Value                                           |
|--------|-------------------------------------------------|
| Method | `POST`                                          |
| URL    | `http://localhost:3000/api/upload/multiple`     |

### Body tab

- Select **form-data**
- Add up to **5** rows (same key for each):

| Key      | Type   | Value        |
|----------|--------|--------------|
| `images` | **File** | image 1    |
| `images` | **File** | image 2    |
| `images` | **File** | image 3    |

> Key must be exactly **`images`** (with **s**). Max 5 files.

Click **Send**

**Expected response (201):**

```json
{
  "message": "2 images uploaded and processed",
  "files": [
    {
      "filename": "...-processed.webp",
      "url": "/uploads/...-processed.webp"
    },
    {
      "filename": "...-processed.webp",
      "url": "/uploads/...-processed.webp"
    }
  ]
}
```

---

## 3. View Uploaded Image

Copy `filename` from the upload response.

**Create request (or open in browser):**

| Field  | Value                                              |
|--------|----------------------------------------------------|
| Method | `GET`                                              |
| URL    | `http://localhost:3000/uploads/PASTE_FILENAME_HERE` |

Example:

```
http://localhost:3000/uploads/1718700000000-123456789-processed.webp
```

No auth required. The image is served from the local `uploads/` folder.

---

## 4. Upload Single File (PDF, DOC, TXT, etc.)

For **non-image** files — no Sharp processing, stored as-is.

**Create request:**
- Name it: `Upload Single File`

| Field  | Value                                           |
|--------|-------------------------------------------------|
| Method | `POST`                                          |
| URL    | `http://localhost:3000/api/upload/file/single`  |

### Body tab

- Select **form-data**
- Add one row:

| Key    | Type   | Value              |
|--------|--------|--------------------|
| `file` | **File** | Select your file |

> Key must be exactly **`file`**.

**Allowed types:** PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, ZIP  
**Max size:** 10 MB

Click **Send**

**Expected response (201):**

```json
{
  "message": "File uploaded successfully",
  "file": {
    "filename": "1718700000000-123456789.pdf",
    "type": "document",
    "originalName": "report.pdf",
    "mimetype": "application/pdf",
    "size": 245760,
    "url": "/uploads/documents/1718700000000-123456789.pdf"
  }
}
```

---

## 5. Upload Multiple Files

| Field  | Value                                             |
|--------|---------------------------------------------------|
| Method | `POST`                                            |
| URL    | `http://localhost:3000/api/upload/file/multiple`  |

### Body tab

| Key     | Type   | Value     |
|---------|--------|-----------|
| `files` | **File** | file 1  |
| `files` | **File** | file 2  |

> Key must be **`files`** (plural). Max 5 files.

---

## 6. View Document (Postman)

After **Upload Single File**, copy `filename` from the response (or use auto-saved `{{uploadedDocFilename}}` if you imported the collection).

### Option A — API view (recommended)

| Field  | Value                                                        |
|--------|--------------------------------------------------------------|
| Method | `GET`                                                        |
| URL    | `http://localhost:3000/api/upload/file/PASTE_FILENAME_HERE`    |

Example:

```
http://localhost:3000/api/upload/file/1718700000000-123456789.pdf
```

- **PDF, TXT, CSV** → opens inline in Postman / browser
- **DOC, XLS, ZIP** → downloads (browser)

### Option B — Force download

Add `?download=true`:

```
http://localhost:3000/api/upload/file/1718700000000-123456789.pdf?download=true
```

### Option C — Static URL (also works)

```
http://localhost:3000/uploads/documents/PASTE_FILENAME_HERE
```

### Postman steps

1. Run **Upload Single File** → get `filename` from response
2. Create new request → **GET**
3. URL: `http://localhost:3000/api/upload/file/YOUR_FILENAME.pdf`
4. Click **Send**
5. Postman shows PDF preview / text content in the response body

**Upload response includes `viewUrl`:**

```json
{
  "file": {
    "filename": "1718700000000-123456789.pdf",
    "viewUrl": "/api/upload/file/1718700000000-123456789.pdf",
    "url": "/uploads/documents/1718700000000-123456789.pdf"
  }
}
```

Use `viewUrl` → full URL: `http://localhost:3000` + `viewUrl`

---

## What Happens on Upload

1. **Multer** receives the file (validates type + size, saves to `uploads/`)
2. **Sharp** resizes, compresses, and converts to WebP
3. Original file is deleted; processed file is kept
4. API returns the processed filename and URL

| Endpoint   | Max width | Quality | Output format |
|------------|-----------|---------|---------------|
| `/single`  | 800px     | 80      | WebP          |
| `/multiple`| 400px     | 75      | WebP          |

---

## Validation Rules

### Images (`/single`, `/multiple`)

| Rule        | Value                          |
|-------------|--------------------------------|
| Allowed types | JPEG, PNG, WebP              |
| Max file size | 5 MB per file                |
| Max files (multiple) | 5                      |
| Processing  | Sharp → WebP                   |

### Documents (`/file/single`, `/file/multiple`)

| Rule        | Value                          |
|-------------|--------------------------------|
| Allowed types | PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, ZIP |
| Max file size | 10 MB per file               |
| Max files (multiple) | 5                      |
| Processing  | None (stored as-is)            |
| Storage     | `uploads/documents/`           |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Field name missing` | Empty key in form-data | Set key to `image` or `images` |
| `Unexpected field "..."` | Wrong key name (e.g. `test_imges`) | Use `image` for single, `images` for multiple |
| `No file uploaded` | Body is raw JSON or key type is Text | Use **form-data** + **File** type |
| `Only JPEG, PNG, and WebP images are allowed` | Wrong file type on image route | Use `/file/single` for PDF/DOC/etc. |
| `Allowed files: PDF, TXT, CSV...` | Wrong type on file route | Upload allowed document types only |
| `File too large (max 5 MB)` | File exceeds limit | Use a smaller image |
| `Too many files` | More than 5 on `/multiple` | Upload max 5 files |

---

## Test Order (Suggested)

```
Images:
1. Upload Single Image     →  201 + processed WebP URL
2. View Image (GET)        →  image displays

Documents:
3. Upload Single File      →  201 + PDF/DOC URL
4. View File (GET)         →  opens or downloads

Errors:
5. PDF on /single route    →  400 (use /file/single instead)
6. Wrong field name        →  400 Unexpected field
```

---

## Postman Import

1. Open **Postman** → **Import**
2. Select these files from `postman/`:
   - `Backend-Upload-API.postman_collection.json` ← **upload only**
   - `Backend-Local.postman_environment.json` (optional)
3. Select **Backend Local** environment (top-right)
4. Open **Upload Single Image** → Body → form-data → select file for key `image` → **Send**
5. Run **View Uploaded Image** — filename is saved automatically after single upload

| Request | Key | Type |
|---------|-----|------|
| Upload Single Image | `image` | File |
| Upload Multiple Images | `images` | File (each row) |
| View Uploaded Image | — | uses `{{uploadedFilename}}` |
| Upload Single File | `file` | File |
| Upload Multiple Files | `files` | File (each row) |
| View Document (inline) | — | `{{uploadedDocFilename}}` |
| Download Document | — | `?download=true` |
