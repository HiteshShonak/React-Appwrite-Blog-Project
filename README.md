# React Appwrite Blog

A full-stack blogging platform built with React and Appwrite, featuring user authentication, post management, and interactive social features.

---

## Features

### Core Functionality
- **User Authentication** - Complete signup/login system with session management
- **Blog Post Management** - Create, read, update, and delete blog posts with rich text editing (TinyMCE)
- **Protected Routes** - Route-level authentication guards for secure content access
- **User Dashboard** - Personal dashboard showing user's posts (active and drafts)
- **Author Profiles** - Dedicated profile pages for each author with their published posts

### Social & Engagement
- **Comments System** - Users can comment on posts with full CRUD operations
- **Rating System** - Star-based rating (1-5 stars) with average rating display
- **View Tracking** - Unique post view counter with cookie-based tracking
- **Profile Pictures** - User avatar upload and management with Appwrite Storage

### Additional Pages
- About Us, Contact, FAQ
- Custom 404 Not Found page

### Technical Implementation
- Redux Toolkit for global state management
- React Hook Form for form validation
- React Router with protected route wrappers
- Responsive design with Tailwind CSS
- Custom CSS variables for theming

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
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── AllPosts.jsx
│   ├── AddPost.jsx
│   ├── EditPost.jsx
│   ├── Post.jsx
│   ├── AboutUs.jsx
│   ├── Contact.jsx
│   ├── FAQ.jsx
│   └── NotFound.jsx
├── Components/          # Reusable components
│   ├── AuthLayout.jsx   # Route protection wrapper
│   ├── Comments.jsx     # Comment system
│   ├── Rating.jsx       # Star rating component
│   ├── PostCard.jsx     # Post display card
│   ├── RTE.jsx          # TinyMCE rich text editor
│   ├── ProfilePictureManager.jsx
│   ├── BioEditModal.jsx
│   ├── AuthorProfile.jsx
│   ├── Header/
│   ├── Footer/
│   ├── post-form/
│   └── Container/
├── Store/               # Redux state management
│   ├── store.js
│   └── authSlice.js
├── appwrite/            # Appwrite services
│   ├── auth.js          # Authentication
│   └── config.js        # Database & Storage
├── utils/
│   └── cookieUtils.js   # View tracking utilities
├── conf/                # Configuration
└── assets/              # Static files
```

---

## Development Workflow

I'm using a `dev` branch for development and merging stable features to `main`. Trying to keep commits clean and organized.

---

**Made with ❤️ by Hitesh Shonak** • [GitHub](https://github.com/HiteshShonak)