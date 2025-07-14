# 🛒 MERN Amazon Clone

A full-featured Amazon-like eCommerce web application built using the **MERN stack** with professional features including product search, reviews, cart, checkout, PayPal/Paymob payment integration, order tracking, and user authentication.

---

## 🖼️ Screenshots

### 🏠 Home Page

![amazon_clone](/client/public/images/homePage.png)

### login page

![Login](/client/public/images/sign.png)

### Forgot Password

![Forgot Password](/client/public/images/forgot.png)

### VerifyCode

![Verify Code](/client/public/images/verifyCode.png)

### reset Password

![Reset Password](/client/public/images/reset.png)

### Register Page

![Register](/client/public/images/signUp.png)

### Verify Email

![Verify Email](/client/public/images/verifyEm.png)

### 📦 Product Details

![productDetails](/client/public/images/detail.png)

### 🔎 Search Results

![searchResults](/client/public/images/search.png)

### 🛍️ Shopping Cart

![cart](/client/public/images/cart.png)

### 🚚 Shipping Address

![shipping](/client/public/images/ship.png)

### 💳 Payment Method Selection

![paymentMethod](/client/public/images/paymt.png)

### 🧾 Place Order

![placeOrder](/client/public/images/place.png)

### 📄 Order Summary & Payment

![orderSummary](/client/public/images/summary.png)

### 💰 Paymob Wallet Integration

![paymob](/client/public/images/payment.png)

### 👤 User Profile

![profilePage](/client/public/images/profilePage.png)

### 📜 Order History

![orderHistory](/client/public/images/order.png)

---

## 🚀 Features

- Full eCommerce flow: Browse, search, cart, checkout, and order.
- Product reviews and ratings.
- Multi-language support (e.g., English & Arabic).
- User authentication and role-based authorization.
- Admin panel for product/category/brand management.
- Real-time cart with guest/session support.
- PayPal & Paymob (Card & Mobile Wallet) payment integration.
- Order tracking and delivery status.
- Secure login, JWT tokens, protected routes.
- Modern UI with Tailwind CSS + Responsive design.

---

## 🧰 Tech Stack

### 🖥️ Frontend

- React, Redux Toolkit, RTK Query
- Tailwind CSS, React Router DOM
- `react-hook-form` – Form validation
  ```js
  import { useForm } from 'react-hook-form';
  ```
- `react-hot-toast` – Notifications
  ```js
  import toast from 'react-hot-toast';
  ```

### 💻 Backend

- Node.js, Express.js, MongoDB, Mongoose
- JWT Authentication (`jsonwebtoken`, `bcryptjs`)
- CORS, Helmet, Cookie-Parser

  ```js
  import cors from 'cors';
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  ```

- Nodemailer for email verification/reset

  ```js
  import nodemailer from 'nodemailer';
  ```

- Joi for input validation

  ```js
  import Joi from 'joi';
  ```

- `express-async-handler` for clean async routes

  ```js
  import asyncHandler from 'express-async-handler';
  ```

- Custom middlewares: `isAuth`, `isAdmin`
  ```js
  app.use('/admin', isAuth, isAdmin);
  ```

---

## 🛠️ How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mern-amazon-clone.git
cd mern-amazon-clone
```

### 2. Install Backend

```bash
cd server
npm install
npm start
```

> Create a `.env` file:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### 3. Install Frontend

```bash
cd client
npm install
npm start
```

---

## 🧪 Testing Tools

- Postman – API testing
- DevTools – Inspecting local storage/session
- Redux DevTools – State management inspection

---

## 📦 Folder Structure

```
/client           → React frontend
/server           → Express backend
  /routes         → All route files (auth, products, cart, orders)
  /controllers    → Logic for each route
  /models         → Mongoose schemas
  /middleware     → isAuth, isAdmin, errorHandler
  /utils          → helper functions (email, tokens, etc)
```

---

## ✅ Deployment

You can deploy on:

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / Heroku
- **MongoDB:** MongoDB Atlas

---

## 🙌 Author

Built with ❤️ by [Ahmed Abdelkader Salem](https://github.com/Ahmed-abdelkader-salim)  
Final-year Computer Science student | MERN stack developer  
Location: Abu Kabir, Sharqia, Egypt

---
