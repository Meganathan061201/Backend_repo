# RBAC & API Security — Lesson Outline

**Duration:** 45–60 minutes  
**Prerequisites:** JWT auth basics (register, login, protected routes)

---

## Slide 1 — Title

**Role-Based Access Control (RBAC) & API Security**

- Who can do what?
- How do we protect APIs beyond login?

---

## Slide 2 — Authentication vs Authorization

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | Who are you? | Login → JWT |
| **Authorization** | What can you do? | Admin-only delete |

> Login proves identity. RBAC decides permissions.

---

## Slide 3 — Roles in This Project

Three roles stored on the User document:

| Role | Typical access |
|------|----------------|
| `user` | Read own profile, list products |
| `moderator` | Create products, view moderation reports |
| `admin` | Everything + delete products, manage roles |

**Code:** `models/User.js` → `role` field with `enum` + `default: "user"`

---

## Slide 4 — User Schema

```javascript
role: {
  type: String,
  enum: ["admin", "user", "moderator"],
  default: "user",
}
```

**Teaching points:**
- Enum prevents invalid roles in the database
- Default role on register = least privilege (`user`)
- Never let clients pick their own role on signup (in production)

---

## Slide 5 — JWT Carries the Role

At login, embed role in the token payload:

```javascript
jwt.sign({ id, email, role }, secret, { expiresIn: "1d" })
```

**Why?** Authorization middleware reads `req.user.role` without a DB query on every request.

**Trade-off:** If role changes in DB, user must re-login for a fresh token.

---

## Slide 6 — Middleware Chain

```
Request → helmet → rateLimit → auth → checkRole → handler
```

1. **helmet** — secure HTTP headers  
2. **rateLimit** — block abuse  
3. **auth** — verify JWT, set `req.user`  
4. **checkRole('admin')** — verify permission  
5. **handler** — business logic  

---

## Slide 7 — `checkRole()` Middleware

```javascript
const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
```

**HTTP status codes:**
- `401` — not logged in (no/invalid token)
- `403` — logged in but not allowed (wrong role)

---

## Slide 8 — Route-Level Protection

Different routes, different rules:

```javascript
router.get("/", auth, listProducts);                          // any user
router.post("/", auth, checkRole("admin", "moderator"), create);
router.delete("/:id", auth, checkRole("admin"), remove);
```

**Pattern:** Stack middleware left-to-right on each route.

---

## Slide 9 — Live Demo Part 1 (403)

1. Register + Login as `user`
2. `GET /api/admin/dashboard` → **403 Access denied**
3. Show response body: `required: ["admin"]`, `current: "user"`

**Takeaway:** Being authenticated ≠ being authorized.

---

## Slide 10 — Live Demo Part 2 (Admin)

1. Terminal: `node scripts/make-admin.js test@example.com`
2. Login again (new JWT with `role: "admin"`)
3. `GET /api/admin/dashboard` → **200**
4. `PATCH /api/admin/users/:id/role` → promote someone to moderator

---

## Slide 11 — Live Demo Part 3 (Products)

| Action | user | moderator | admin |
|--------|------|-----------|-------|
| GET products | ✅ | ✅ | ✅ |
| POST product | ❌ 403 | ✅ | ✅ |
| DELETE product | ❌ 403 | ❌ 403 | ✅ |

Run requests in Postman folder **Products**.

---

## Slide 12 — API Security: Helmet

```javascript
app.use(helmet());
```

Sets headers that help prevent:
- XSS
- Clickjacking
- MIME sniffing

**One line, big impact** — enable on every Express app.

---

## Slide 13 — API Security: Rate Limiting

```javascript
// Global: 100 requests / 15 min
app.use(globalLimiter);

// Auth routes: 10 attempts / 15 min
router.post("/login", authLimiter, ...);
```

**Why?** Slows brute-force attacks on login/register.

Demo: spam Login in Postman → eventually **429 Too Many Requests**.

---

## Slide 14 — API Security: Input Validation

```javascript
router.post("/register", registerRules, validate, handler);
```

`express-validator`:
- Rejects bad input before it hits the database
- Sanitizes strings (`.trim()`, `.escape()`)
- Returns structured **400** errors

Demo: **Register (Invalid — Validation Demo)** in Postman.

---

## Slide 15 — Defense in Depth

| Layer | Protects against |
|-------|------------------|
| Helmet | Browser-level attacks |
| Rate limit | Brute force / DoS |
| Validation | Bad/malicious input |
| JWT auth | Anonymous access |
| RBAC | Privilege escalation |

No single layer is enough — stack them.

---

## Slide 16 — Production Checklist

- [ ] Default role = lowest privilege
- [ ] Role changes require admin + audit log
- [ ] Never trust client-sent `role` on register
- [ ] Re-issue JWT (or use short expiry) after role change
- [ ] Rate limit auth + sensitive endpoints
- [ ] Validate all user input
- [ ] Return generic errors to clients, log details server-side

---

## Slide 17 — Recap & Q&A

**Key terms:** RBAC, middleware chain, 401 vs 403, defense in depth

**Files to explore:**
- `middleware/authorize.js`
- `middleware/security.js`
- `middleware/validators.js`
- `routes/products.routes.js`

**Postman:** Import `Backend-Auth-API.postman_collection.json` → folder **RBAC Demo**

---

## Instructor Notes

### Setup (5 min before class)

```bash
npm run dev
node scripts/make-admin.js test@example.com   # optional pre-step
```

### Suggested timing

| Section | Minutes |
|---------|---------|
| Auth vs authorization | 5 |
| Schema + JWT role | 10 |
| checkRole + routes | 10 |
| Live Postman demo | 15 |
| Helmet / rate limit / validation | 10 |
| Q&A | 5 |

### Common student questions

**Q: Why not check role from DB every time?**  
A: Faster with JWT, but stale if role changes. Production apps often use short-lived tokens or refresh tokens.

**Q: Can a user change their role in the JWT?**  
A: No — JWT is signed with `JWT_SECRET`. Tampering invalidates the signature.

**Q: Is RBAC enough for complex apps?**  
A: Often you need ABAC (attribute-based) or permission tables for fine-grained control. RBAC is the foundation.
