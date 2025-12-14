# React Appwrite Blog

A blog app I'm building to learn React and Appwrite. Still a work in progress.


---

## What's Done So Far

- ✅ React (Vite) + Tailwind CSS setup with custom CSS variables
- ✅ Appwrite authentication service (signup, login, logout, getCurrentUser)
- ✅ Redux Toolkit integration (store, authSlice with login/logout actions)
- ✅ Reusable components (Button, Input, Container)
- ✅ Header with dynamic navigation (shows different links based on auth status)
- ✅ Footer with links and responsive design
- ✅ LogoutBtn component with Redux dispatch integration
- ✅ Appwrite database service (CRUD for blog posts - create, read, update, delete)
- ✅ React Router setup with protected routes logic
- ✅ User session management with useEffect in App.jsx
- 🔄 Working on: Pages folder structure (currently empty)
- ⏳ Planning: Login/Signup forms, post pages, TinyMCE integration, image uploads

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
│   ├── Button.jsx            # Reusable button component with custom styling
│   ├── Input.jsx             # Reusable input component with forwardRef
│   ├── Home.jsx              # Home page component
│   ├── index.js              # Components barrel export
│   ├── Container/
│   │   └── Container.jsx     # Layout container wrapper
│   ├── Header/
│   │   ├── Header.jsx        # Navigation with auth-based routing
│   │   └── LogoutBtn.jsx     # Logout button with Redux dispatch
│   └── Footer/
│       └── Footer.jsx        # Footer with links and social media
├── Store/
│   ├── store.js              # Redux store configuration
│   └── authSlice.js          # Auth state slice (login/logout reducers)
├── appwrite/
│   ├── auth.js               # Authentication service (signup, login, logout)
│   └── config.js             # Database & Storage service (posts CRUD, file uploads)
├── conf/
│   └── conf.js               # Environment variables configuration
├── pages/                    # (Empty - future page components)
├── assets/                   # Images and static files
├── App.jsx                   # Root component with auth check
├── App.css                   # Custom CSS variables
├── main.jsx                  # Entry point with Redux Provider & Router
└── index.css                 # Global Tailwind styles
```

### Key Features Implemented

- **Redux State Management:** Global auth state with login/logout actions
- **Protected Routes:** Header navigation changes based on authentication status
- **Appwrite Services:** Complete auth & database services for posts CRUD
- **Reusable Components:** Button and Input components with custom props
- **Session Persistence:** Auto-login on app load via getCurrentUser

---

## Development Workflow

I'm using a `dev` branch for development and merging stable features to `main`. Trying to keep commits clean and organized.

---

**Made with ❤️ by Hitesh Shonak** • [GitHub](https://github.com/HiteshShonak)