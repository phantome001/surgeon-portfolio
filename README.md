# Surgeon Portfolio - Secure Medical Web Application

A production-grade, OWASP Top 10 compliant web application for a surgical specialist.

## 🛡️ Security Features

- **Defense in Depth**: Multiple security layers at every level
- **Authentication**: NextAuth.js v5 with scrypt password hashing, account lockout
- **Encryption**: AES-256-GCM for sensitive data at rest
- **Validation**: Zod schemas on all inputs (client + server)
- **Rate Limiting**: Upstash Redis on all API endpoints
- **Headers**: Full OWASP security headers including CSP with nonce
- **XSS Prevention**: React auto-escaping + DOMPurify for rich text
- **SQL Injection Prevention**: Prisma ORM only (no raw SQL)

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Auth.js) |
| Validation | Zod |
| Rate Limiting | Upstash Redis |
| Email | Resend |
| Encryption | Node.js crypto (AES-256-GCM) |

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Upstash Redis account (free tier available)
- Resend account (free tier available)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.local.template .env.local
   ```

   Edit `.env.local` with your actual values:
   - PostgreSQL connection string
   - `AUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `ENCRYPTION_KEY` (generate: `openssl rand -hex 32`)
   - Upstash Redis credentials
   - Resend API key

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Create initial doctor user** (via Prisma Studio or seed script)
   ```bash
   npx prisma studio
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
surgeon-app/
├── app/
│   ├── (public)/           # Public routes
│   │   ├── page.tsx        # Home page
│   │   ├── videos/         # Surgical videos
│   │   └── contact/        # Contact form
│   ├── (auth)/             # Authentication
│   │   ├── login/
│   │   └── register/
│   ├── (patient)/          # Patient portal
│   │   ├── dashboard/
│   │   └── appointments/
│   ├── (admin)/            # Doctor admin
│   │   └── dashboard/
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── appointments/   # Appointment CRUD
│   │   ├── chat/           # Messaging
│   │   └── contact/        # Contact form
│   └── layout.tsx
├── components/
│   ├── layout/             # Header, Footer
│   ├── forms/              # Form components
│   └── ui/                 # Reusable UI
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── encryption.ts       # AES-256-GCM + scrypt
│   ├── ratelimit.ts        # Upstash helpers
│   ├── sanitize.ts         # DOMPurify wrapper
│   └── validations/        # Zod schemas
├── prisma/
│   └── schema.prisma
├── middleware.ts           # Auth + security headers
└── next.config.ts          # Security headers config
```

## 🔐 Security Checklist

- [ ] Passwords hashed with scrypt
- [ ] JWT sessions expire after 8 hours
- [ ] HttpOnly + Secure + SameSite=Strict cookies
- [ ] Account lockout after 5 failed attempts
- [ ] All inputs validated with Zod
- [ ] Prisma ORM only (no raw SQL)
- [ ] React auto-escaping for all user content
- [ ] HTML sanitization with DOMPurify where needed
- [ ] All security headers present (HSTS, CSP, etc.)
- [ ] Rate limiting on all API routes
- [ ] Sensitive fields encrypted at rest
- [ ] TypeScript strict mode (no `any`)
- [ ] No secrets in NEXT_PUBLIC_ variables

## 🧪 Testing

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Security audit
npm audit

# Build
npm run build
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new patient account
- `POST /api/api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Appointments
- `GET /api/appointments` - List appointments (role-based)
- `POST /api/appointments` - Book new appointment (patient)
- `GET /api/appointments/[id]` - Get single appointment
- `PATCH /api/appointments/[id]` - Update status (doctor)
- `DELETE /api/appointments/[id]` - Cancel appointment

### Contact
- `POST /api/contact` - Submit contact form (public, rate-limited)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all variables from `.env.local` are set in Vercel:
- `DATABASE_URL` (with `?sslmode=require`)
- `AUTH_SECRET`
- `NEXTAUTH_URL` (your production domain)
- `ENCRYPTION_KEY`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`
- `RESEND_API_KEY`

## 📄 License

Private - All rights reserved

## ⚠️ Medical Disclaimer

This application is for managing non-urgent medical appointments only.
For medical emergencies, users should call 911 or visit their nearest emergency room.
