# Student Evaluation System — Next.js (App Router)

A modern **Next.js App Router** application powered by **Sequelize** for managing student evaluations.

---

## 🚀 Tech Stack

- **Next.js (App Router)**
- **React** + **TypeScript**
- **Sequelize ORM**
- **MySQL-compatible Database**
- **JWT** authentication

---

## ✅ Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A running **SQL database** accessible via the credentials below.

---

## ⚙️ Setup Instructions

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create environment file**
   Create a `.env` file in the root directory with the following keys:

   ```dotenv
   # Database Credentials
   DB_NAME=
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=

   # Others
   JWT_SECRET=
   NEXT_PUBLIC_APP_NAME=
   ```

   > ⚠️ Do not commit this file to version control.

3. **Seed the database (mandatory before first run)**

   ```bash
   npm run seed
   ```

   This populates your database with the initial data required by the app.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The app should now be available at **[http://localhost:3000](http://localhost:3000)**.

---

## 🗄️ Database Setup

This project uses **Sequelize** to manage models, migrations, and seeders.

### Run seeders

```bash
npm run seed
```

---

## 📜 Common Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
npm run seed       # Populate the database
```

---

## 🧰 Troubleshooting

- **Database connection issues**: Verify `DB_HOST`, `DB_PORT`, and credentials.
- **Seeding errors**: Ensure migrations are completed before seeding.
- **JWT issues**: Make sure `JWT_SECRET` is a secure, random string.

---

## 📄 License

Specify your project’s license here (e.g., MIT).

---

**Note:** Always create the `.env` file before running `npm run seed`. This step is required to successfully populate your database.
