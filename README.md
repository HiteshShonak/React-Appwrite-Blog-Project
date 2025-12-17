# Blog Ideas and Stories

**A modern, full-stack blogging platform built with React and Appwrite** — enabling creators to share their ideas and stories with a polished, performant, and feature-rich experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Appwrite](https://img.shields.io/badge/Appwrite-21.5.0-F02E65?logo=appwrite)

---

## 🌟 Overview

**Blog Ideas and Stories** is a production-ready blogging platform that combines the power of React's component-based architecture with Appwrite's backend services. Built with performance, user experience, and scalability in mind, it offers everything needed for a modern content platform.

### ✨ Key Highlights

- 🚀 **Lightning Fast** - Optimized performance with Redux-based caching
- 🎨 **Beautiful UI** - Polished, responsive design with Tailwind CSS and smooth animations
- 🔐 **Secure** - Route-level authentication, session management, and protected content
- 💬 **Interactive** - Real-time comments, ratings, and social engagement features
- 📧 **Email Integration** - Contact form with actual email delivery via EmailJS
- 🖼️ **Image Optimization** - Automatic WebP conversion and compression for all uploads
- 📱 **Fully Responsive** - Seamless experience across desktop, tablet, and mobile devices

---

## 🎯 Features

### 📝 Content Management

- **Rich Text Editor** - TinyMCE integration with full formatting, media embedding, and preview
- **Draft & Publish System** - Save posts as drafts or publish them directly
- **Featured Images** - Upload, crop, and compress images with automatic WebP conversion
- **CRUD Operations** - Complete create, read, update, delete functionality for posts
- **View Tracking** - Unique view counter with cookie-based duplicate prevention
- **Trending Posts** - Dynamic trending section based on ratings and engagement

### 👤 User Experience

- **User Authentication** - Secure signup/login with email and password
- **Session Persistence** - Auto-login on return visits with JWT token management
- **Personal Dashboard** - View all your posts (active and drafts) with quick actions
- **Author Profiles** - Public profile pages with bio, avatar, and published articles
- **Profile Customization** 
  - Upload and crop profile pictures with real-time preview
  - Edit bio with character limit and instant updates
  - Username-based profile URLs

### 💬 Social & Engagement

- **Comments System** 
  - Author attribution with profile links
  - Like/unlike functionality with heart animation
  - Delete own comments with confirmation modal
  - Author avatars with clickable profile links
  
- **Rating System**
  - 5-star rating system with hover effects
  - Average rating display with precision
  - One rating per user with update capability
  - Visual rating breakdown

### 🎨 Performance & Optimization

- **Redux State Caching** - Smart data fetching that caches:
  - All posts list (prevents redundant API calls)
  - Trending posts with pre-fetched ratings
  - User dashboard posts
  - Current user session data
  
- **Image Compression** - Browser-side compression using `browser-image-compression`:
  - Avatars: Max 50KB, 500px, WebP format
  - Post images: Max 1MB, 1920px, WebP format with quality preservation
  - Automatic filename sanitization and timestamp stamping
  
- **Skeleton Screens** - Professional loading states for better perceived performance
- **Smooth Transitions** - CSS animations for page changes and interactions

### 📧 Communication

- **Contact Form** - Functional contact page with EmailJS integration
  - Real-time form validation with React Hook Form
  - Sends actual emails to site administrator
  - Success/error notifications with auto-dismiss
  - Responsive design with floating labels

### 📄 Additional Pages

- **Home** - Hero section with trending posts carousel and call-to-action
- **All Posts** - Grid layout with search and filtering capabilities
- **About Us** - Company/project information
- **FAQ** - Frequently asked questions with expandable sections
- **404 Not Found** - Custom error page with navigation

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Latest React with modern hooks and concurrent features
- **Redux Toolkit 2.11.1** - Centralized state management with slices for auth, posts, dashboard, home, and users
- **React Router DOM 7.10.1** - Client-side routing with protected routes
- **React Hook Form 7.68.0** - Performant form validation and handling
- **TinyMCE 6.3.0** - WYSIWYG rich text editor
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **React Easy Crop** - Image cropping with touch support

### Backend (BaaS)
- **Appwrite 21.5.0** - Backend services for:
  - Authentication (email/password)
  - Database (posts, comments, ratings, user profiles)
  - Storage (images and media files)
  - Real-time subscriptions

### Additional Libraries
- **EmailJS** - Contact form email delivery service
- **html-react-parser 5.2.10** - Parse HTML content safely
- **browser-image-compression** - Client-side image compression
- **Vite 7.2.4** - Fast build tool and dev server

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

## 📁 Project Architecture

```
src/
├── pages/                      # Route-level page components
│   ├── Home.jsx               # Landing page with trending section
│   ├── AllPosts.jsx           # Post grid with Redux caching
│   ├── Post.jsx               # Single post view with comments & ratings
│   ├── AddPost.jsx            # Create new post with TinyMCE
│   ├── EditPost.jsx           # Edit existing post
│   ├── Dashboard.jsx          # User dashboard with post management
│   ├── Login.jsx              # Login page
│   ├── Signup.jsx             # Registration page
│   ├── AboutUs.jsx            # About page
│   ├── Contact.jsx            # Contact form with EmailJS
│   ├── FAQ.jsx                # FAQ page
│   └── NotFound.jsx           # 404 error page
│
├── Components/                 # Reusable UI components
│   ├── AuthLayout.jsx         # Protected route HOC
│   ├── AuthorProfile.jsx      # Public author profile page
│   ├── Comments.jsx           # Comment system with likes
│   ├── Rating.jsx             # Star rating component
│   ├── PostCard.jsx           # Post preview card
│   ├── RTE.jsx                # Rich text editor wrapper
│   ├── AvatarCropper.jsx      # Image cropping modal
│   ├── ProfilePictureManager.jsx  # Avatar upload & management
│   ├── BioEditModal.jsx       # Bio editing modal
│   ├── Login.jsx              # Login form component
│   ├── Signup.jsx             # Signup form component
│   ├── Button.jsx             # Reusable button
│   ├── Input.jsx              # Form input with validation
│   ├── Select.jsx             # Dropdown select
│   ├── Container/             # Layout wrapper
│   ├── Header/                # Navigation header
│   ├── Footer/                # Site footer
│   └── post-form/             # Post creation/edit form
│       └── PostForm.jsx
│
├── Store/                      # Redux state management
│   ├── store.js               # Redux store configuration
│   ├── authSlice.js           # Auth state (user session)
│   ├── postSlice.js           # Posts cache (AllPosts page)
│   ├── homeSlice.js           # Trending posts cache
│   ├── dashboardSlice.js      # User posts cache
│   └── usersSlice.js          # Users data cache
│
├── appwrite/                   # Appwrite service layer
│   ├── auth.js                # Authentication methods
│   └── config.js              # Database & Storage API wrapper
│       ├── Posts CRUD
│       ├── Comments CRUD
│       ├── Ratings CRUD
│       ├── User Profiles
│       ├── File Upload/Delete
│       ├── View Counter
│       └── Trending Algorithm
│
├── utils/                      # Utility functions
│   ├── cookieUtils.js         # Cookie management for view tracking
│   ├── compressImage.js       # Image compression & WebP conversion
│   └── canvasUtils.js         # Canvas operations for image cropping
│
├── conf/                       # Environment configuration
│   └── conf.js                # Centralized env variables
│
└── assets/                     # Static files (images, icons)
```

---

## 🔧 Environment Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager
- Appwrite instance (cloud or self-hosted)
- EmailJS account (for contact form)

### Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/HiteshShonak/React-Appwrite-Blog-Project.git
cd React-Appwrite-Blog-Project
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:

```env
# Appwrite Configuration
VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_TABLE_ID=your_posts_collection_id
VITE_APPWRITE_BUCKET_ID=your_storage_bucket_id
VITE_APPWRITE_COMMENTS_COLLECTION_ID=your_comments_collection_id
VITE_APPWRITE_RATINGS_COLLECTION_ID=your_ratings_collection_id
VITE_APPWRITE_USER_PROFILES_COLLECTION_ID=your_profiles_collection_id

# TinyMCE
VITE_TINYMCE_API_KEY=your_tinymce_api_key

# EmailJS (for contact form)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

**4. Set up Appwrite Backend**

Create collections in your Appwrite database:

- **Posts Collection**: Title, Content (50000 chars), featuredImage, Status, UserId, AuthorName, Views
- **Comments Collection**: content (1000 chars), postId, userId, authorName, likedBy (array)
- **Ratings Collection**: postId, userId, stars (integer)
- **User Profiles Collection**: UserId, ProfileImageFileId, Bio (500 chars), Username

Create indexes:
- Comments: `postId` (ascending)
- Ratings: `postId` (ascending)
- Posts: `UserId` (ascending), `Status` (ascending)

**5. Run development server**
```bash
npm run dev
```
Opens at `http://localhost:5173`

**6. Build for production**
```bash
npm run build
```

---

## 📊 Performance Optimizations

### Implemented Strategies

1. **Redux Caching** - Posts fetched once, stored globally, prevents redundant API calls
2. **Image Compression** - WebP conversion, 50KB avatars, 1MB post images with quality preservation
3. **Smart Loading** - Skeleton screens and conditional fetching
4. **View Tracking** - Cookie-based duplicate prevention with 24-hour expiry

---

## 🚀 Deployment

Compatible with Vercel, Netlify, AWS Amplify, and GitHub Pages. Configure environment variables in your hosting platform.

---

## 🎨 Design Philosophy

**Mobile-First** • **Accessible** • **Performant** • **User-Centric** • **Clean Code**

---

## 🔐 Security

Route-level authentication • JWT session management • Form validation • XSS protection • Secure uploads

---

## 👨‍💻 Development

Branch Strategy: `main` (production) • `dev` (development)

**Made with ❤️ by Hitesh Shonak** • [GitHub](https://github.com/HiteshShonak)

---

**Version 1.0.0** - Production Ready ✨