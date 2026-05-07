# ⚡ ShopFlow — Production-Ready MERN E-Commerce

A full-stack, production-grade e-commerce application built with MongoDB, Express.js, React, and Node.js.

---

## 🗂️ Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/           # DB, Cloudinary, Stripe configs
│   ├── constants/        # App-wide enums and constants
│   ├── controllers/      # Thin route handlers (delegate to services)
│   ├── middlewares/      # Auth, error handling, upload, validation
│   ├── models/           # Mongoose schemas (User, Product, Order, Cart, Wishlist, Coupon)
│   ├── routes/           # Express routers
│   ├── services/         # All business logic lives here
│   ├── utils/            # AppError, logger, queryBuilder, seeder
│   ├── validators/       # express-validator rule chains
│   └── server.js         # App entry point
│
└── frontend/
    └── src/
        ├── components/   # Reusable UI (Navbar, Footer, ProductCard, CheckoutForm, FilterSidebar)
        ├── layouts/      # MainLayout, AdminLayout
        ├── pages/        # Route-level page components
        │   └── admin/    # Dashboard, Products, Orders, Users
        ├── services/     # Axios instance with interceptors
        ├── store/        # Redux Toolkit (auth, cart, product slices)
        ├── styles/       # global.css (full design system)
        └── App.js        # Router, route guards, app shell
```

---

## 🚀 Features

| Feature | Details |
|---|---|
| Auth | JWT access tokens + HTTP-only refresh token cookies, auto-refresh |
| Products | Search (full-text), filter (category, price, rating, stock), sort, pagination |
| Cart | Add, update quantity, remove, clear, coupon/discount codes |
| Wishlist | Add, remove, clear |
| Orders | Create from cart, order history, status tracking |
| Payments | Stripe PaymentIntents + Webhook confirmation (server-side) |
| Reviews | Per-product, one per user, star rating |
| Admin | Dashboard with analytics, manage products/orders/users |
| Uploads | Cloudinary image upload (products + avatars) |
| Security | Helmet, rate limiting, mongo-sanitize, input validation |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (test mode)
- Cloudinary account

### 1. Clone and Install

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your values in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# Fill in your Stripe publishable key
```

**Required `backend/.env` values:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

**Required `frontend/.env` values:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **Admin:** `admin@ecommerce.com` / `Admin1234`
- **User:** `john@example.com` / `User1234`
- 6 sample products

### 4. Run Development Servers

```bash
# Runs both backend (port 5000) and frontend (port 3000) simultaneously
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Private |
| POST | `/api/auth/refresh` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/change-password` | Private |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/featured` | Public |
| GET | `/api/products/categories` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Cart
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cart` | Private |
| POST | `/api/cart/add` | Private |
| PUT | `/api/cart/update` | Private |
| DELETE | `/api/cart/item/:productId` | Private |
| DELETE | `/api/cart/clear` | Private |
| POST | `/api/cart/coupon` | Private |

### Orders & Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders` | Private |
| GET | `/api/orders/my-orders` | Private |
| GET | `/api/orders/:id` | Private |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |
| POST | `/api/payments/create-intent/:orderId` | Private |
| POST | `/api/payments/webhook` | Stripe |

---

## 💳 Stripe Test Cards

| Card | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| Auth Required | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 9995` |

Use any future expiry date and any 3-digit CVC.

---

## 🏗️ Architecture Decisions

### Data Flow
```
HTTP Request
  → Rate Limiter / Helmet (security)
  → CORS
  → Body Parser / Cookie Parser
  → Route Match
  → Auth Middleware (JWT verify)
  → Validation Middleware (express-validator)
  → Controller (extract params, call service)
  → Service (business logic, DB calls)
  → Model (Mongoose)
  → Database (MongoDB)
  → Response (JSON)
  → Error Handler (if thrown)
```

### Why Thin Controllers?
Controllers only extract request data and call services. This makes services independently testable and keeps responsibilities clean.

### Token Strategy
- **Access token** (15 min): stored in memory / `localStorage`, sent as `Authorization: Bearer` header
- **Refresh token** (7 days): stored in HTTP-only cookie, not accessible to JavaScript
- **Auto-refresh**: Axios response interceptor automatically retries on 401 with a fresh access token

### Payment Flow
1. Frontend creates order → backend validates cart, decrements stock, clears cart
2. Frontend requests PaymentIntent → backend creates Stripe PI with order metadata
3. Stripe.js confirms payment on frontend (card never touches your server)
4. Stripe sends `payment_intent.succeeded` webhook → backend marks order as paid
5. This server-side confirmation is fraud-proof — the frontend cannot fake it

---

## 📦 Scripts Reference

```bash
npm run install:all    # Install all dependencies
npm run dev            # Run both servers (requires concurrently)
npm run dev:backend    # Backend only (nodemon)
npm run dev:frontend   # Frontend only (CRA)
npm run seed           # Import sample data
npm run seed:destroy   # Wipe all data
```

---

## 🔐 Security Features

- **Helmet** — sets secure HTTP headers
- **Rate Limiting** — 100 req / 15 min per IP on `/api`
- **Mongo Sanitize** — prevents NoSQL injection
- **express-validator** — server-side input validation
- **JWT HTTP-only cookies** — refresh tokens not accessible to JavaScript
- **bcryptjs (cost 12)** — secure password hashing
- **CORS whitelist** — only your frontend origin allowed
- **Raw body for Stripe webhooks** — signature verified server-side

---

## 📄 License

MIT — free to use for personal and commercial projects.
