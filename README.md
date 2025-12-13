# React Appwrite Blog

A blog app I'm building to learn React and Appwrite. Still a work in progress.


---

## What's Done So Far

- ✅ Basic setup with React (Vite) and Tailwind
- ✅ Appwrite authentication (signup, login, logout)
- ✅ Basic layout with header and footer
- 🔄 Working on Redux integration
- ⏳ Planning: protected routes, blog posts CRUD, rich text editor

---

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS
- **Backend:** Appwrite (Authentication, Database, Storage)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **Form Handling:** React Hook Form
- **Rich Text:** TinyMCE, HTML React Parser

---

## 🎯 Project Goals

- Build a scalable and maintainable blogging platform
- Implement secure authentication using Appwrite
- Practice real-world React architecture and state management
- Follow professional Git workflows and clean commit history
- Prepare a portfolio-grade full-stack project

---

## 🧠 Engineering Focus

- **Scalable Structure:** Configuration, services, and components are separated to keep the codebase clean.
- **Environment Safety:** Environment variables are strictly handled to avoid runtime crashes.
- **Incremental Development:** Features are built and committed step-by-step on a `dev` branch before merging into `main`.
- **Production Mindset:** Emphasis on readability, modularity, and future extensibility.

---

## 🛠️ Setup

**You'll need:** Node.js (v18+), npm, Git, and an Appwrite account

**1. Clone and install**
```bash
git clone https://github.com/HiteshShonak/React-Appwrite-Blog-Project.git
cd React-Appwrite-Blog-Project
npm install
```

**2. Create `.env` file**
Add your Appwrite credentials:
```env
VITE_APPWRITE_URL=""
VITE_APPWRITE_PROJECT_ID=""
VITE_APPWRITE_DATABASE_ID=""
VITE_APPWRITE_TABLE_ID=""
VITE_APPWRITE_BUCKET_ID=""
```

**3. Run it**
```bash
npm run dev
```
Opens at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── Components/
│   ├── Home.jsx              # Home page component
│   ├── Header/
│   │   └── Header.jsx        # Navigation header
│   └── Footer/
│       └── Footer.jsx        # Footer component
├── appwrite/
│   ├── auth.js               # Authentication service (Login, Signup, Logout)
│   └── config.js             # Appwrite configuration (empty - using conf.js)
├── conf/
│   └── conf.js               # Environment variables configuration
├── assets/                   # Static assets (images, icons, etc.)
├── App.jsx                   # Root component with layout
├── App.css                   # App-wide styles
├── main.jsx                  # Application entry point
├── index.css                 # Global styles
```

### Key Files Explained

- **`src/appwrite/auth.js`** - AuthService class handling user authentication with Appwrite
- **`src/conf/conf.js`** - Centralized configuration for environment variables
- **`src/main.jsx`** - React Router setup and application initialization

---

## Development Workflow

I'm using a `dev` branch for development and merging stable features to `main`. Trying to keep commits clean and organized.

---

**Made with ❤️ by Hitesh Shonak** • [GitHub](https://github.com/HiteshShonak)