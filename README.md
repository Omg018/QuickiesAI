# ⚡ QuickiesAI - Your All-in-One AI Toolkit

## 🚀 Project Overview

quickiesai is a comprehensive, full-stack AI platform designed to streamline creative, content, and professional tasks into a single, seamless application. Our goal is to consolidate multiple powerful AI functionalities—including image manipulation, content generation, and document review—to provide quick, powerful, and intelligent solutions for everyday digital needs.

## ✨ Core Features & Roadmap

The application is modular and actively under development. Features marked with `[ ]` are planned or in-progress.

### ✍️ Content & Writing Suite (`/ai/write-article`)

| Feature | Description | Status |
|---------|-------------|--------|
| Blog Title Generator | Automatically craft multiple engaging, SEO-friendly titles based on a topic. | [ ] In Progress |
| Article Writer | Generate full, structured articles, drafts, or long-form content from a simple prompt. | [ ] In Progress |

### 🖼️ Image & Media Tools (`/ai/generate-images`)

| Feature | Description | Status |
|---------|-------------|--------|
| Image Generator | Create stunning, unique visual assets from simple text descriptions (Text-to-Image). | [ ] In Progress |
| Background Removal | Quickly isolate subjects and remove unwanted backgrounds from images. | [ ] In Progress |
| Object Removal | Select and seamlessly erase specific objects from a photograph. | [ ] In Progress |

### 💼 Professional Toolkit (`/ai/review-resume`)

| Feature | Description | Status |
|---------|-------------|--------|
| Resume Reviewer | Submit your CV/Resume for AI-driven feedback on formatting, keywords, and overall strength. | [ ] In Progress |

## 💻 Technology Stack

quickiesai is built on a modern, high-performance stack:

* **Frontend:** React
* **Routing:** React Router DOM
* **Authentication:** Clerk (for secure, easy sign-in)
* **Styling:** Tailwind CSS (for utility-first responsive design)
* **APIs:** Various third-party LLM and Image Processing APIs (e.g., Gemini)

## ⚙️ Getting Started (Setup)

This section details how to get the project running on your local machine for development purposes.

### Prerequisites

You will need the following installed:

* Node.js (LTS version)
* npm or yarn
* Git

### Installation Steps

1. **Clone the repository:**
```bash
git clone [YOUR_REPO_URL_HERE]
cd quickiesai
```

2. **Install dependencies:**
```bash
npm install
# OR
yarn install
```

3. **Set up Environment Variables:** Create a `.env.local` file in the root directory and add your API keys. You must have keys for Clerk and your various AI services (like the Gemini API).
```env
# CLERK Authentication Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_SECRET_KEY=sk_live_...

# AI Service Keys (Example)
VITE_GEMINI_API_KEY=AIza...
# VITE_OTHER_SERVICE_API_KEY=...
```

4. **Run the development server:**
```bash
npm run dev
# OR
yarn dev
```

The application should now be running at `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please check the issues tab for specific tasks. For major changes, please open an issue first to discuss the proposed changes.
