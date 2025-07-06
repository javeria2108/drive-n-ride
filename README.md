
# 🚕 Ride Booking System

A minimal ride-hailing backend system designed for small city testing. This project manages users (passengers & drivers) and allows passengers to request rides while drivers can accept and complete them.

---

## 📌 Features

- 👤 User management with roles: `passenger` and `driver`
- 📍 Ride booking with pickup & drop locations
- 🚗 Ride types: `bike`, `car`, `rickshaw`
- 💰 Fare calculation with optional discounts
- 📊 Ride status management: requested, accepted, in-progress, completed, cancelled
- ⭐ Ratings & cancellation tracking


## ⚙️ Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Language       | TypeScript                     |
| Backend        | Next.js                        |
| ORM / DB Layer | Prisma ORM                     |
| Database       | PostgreSQL NeonDB              |
| Auth           | NextAuth        |
| Deployment     | Vercel                         |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/javeria2108/drive-n-ride.git
cd drive-n-ride
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file based on `.env.example`.

```bash
DATABASE_URL = YOUR_DB_URL_HERE
NEXTAUTH_SECRET = ADD YOUR SECRET 32 CHARACTERS KEY  
NEXTAUTH_URL= http://localhost:3000 
```

Add your database connection URL, secret keys, etc.

### 4. Set Up the Database

Run Prisma or your migration tool:

```bash
npx prisma migrate dev --name init
```

Or manually create tables using SQL.

### 5. Start the Server

```bash
npm run dev
```

## 📋 Role-based Logic

* **Passenger** can:

  * Request a ride
  * Cancel a ride before acceptance
  * Rate driver after ride

* **Driver** can:

  * Accept a ride
  * Mark as in-progress / completed
  * Reject only before in-progress

---



## 🧑‍💻 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repo
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Submit a PR

---

## 🛡️ License

This project is open-source under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

Built as part of a lightweight ride-hailing prototype for smaller cities. Contributions and feedback are highly appreciated!

---

