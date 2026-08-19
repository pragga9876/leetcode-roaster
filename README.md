# 🌶️ LeetCode Roaster

A full-stack web application built with **Next.js** that fetches a user's LeetCode problem-solving statistics via GraphQL and uses **Groq AI (Llama 3)** to generate a savage, personalized roast in contemporary Hinglish, presented in a 1920s Art Deco print aesthetic.

---

## 📌 Executive Summary & Development History

This repository was developed through an iterative process of building, deploying, visual redesigning, and API debugging:

1. **Initial Deployment Errors (Cloudflare Pages):** Started deployment on Cloudflare Pages, encountering Turbopack build errors (`the name 'ai' is defined multiple times`) due to variable scope collisions, as well as git sync issues.
2. **Platform Migration (Vercel):** Shifted deployment to **Vercel** for smoother integration with Next.js App Router and serverless Node.js functions.
3. **API Rate-Limiting & Quota Issues (Gemini):** Hit severe rate-limiting (`429 Too Many Requests`) and model syntax errors (`404 Model Not Found`) using the Google Gemini free tier SDK. 
4. **Migration to Groq AI SDK:** Switched the AI provider to **Groq** (`groq-sdk` running `llama-3.1-8b-instant`), providing ultra-fast inference speeds, high free-tier rate limits (14,400 requests/day), and zero cost.
5. **Architectural & Security Realignment:** Addressed why plain HTML/CSS/JS with a `.env` file is insecure for client-side API keys, transitioning to server-side Next.js route handlers (`app/api/roast/route.ts`).
6. **Aesthetic Pivot (1920s Vintage Print / Ephemera):** Redesigned the UI from standard dark tech templates into a 1920s Art Deco vintage print style featuring cream paper textures, serif typography, and solid block shadows.
7. **Client-Side Export Feature:** Integrated `html2canvas-pro` to allow users to export and download their generated roast card as a high-DPI PNG image directly from the browser.

---

## 🔐 Deep-Dive: Why `.env` in Plain Frontend JS Fails (Security & Architecture)

A critical concept when learning full-stack development is understanding why putting an API key in a `.env` file and adding `.env` to `.gitignore` is **NOT enough** to protect secrets if your code runs purely in the browser.

### Server vs. Client Code Execution

* **Server (Backend / Node.js):** Runs on a private cloud machine (like Vercel). Code execution, environment variables, and raw API keys here are **100% hidden** from the public.
* **Client (Frontend / Browser):** Runs on the user's local device. **Everything** delivered to the browser (HTML, CSS, JS) is publicly inspectable.

### Why `.env` + `.gitignore` Alone Doesn't Protect Frontend Keys

1. **What `.gitignore` actually does:** It only prevents your `.env` file from being uploaded to **GitHub**. It does **not** hide secrets from a user's web browser.
2. **How frontend bundlers work:** If you write plain browser JavaScript or a React app without a backend, any build tool reading `.env` variables literally **copies and pastes** the text of your secret key directly into the JavaScript bundle sent to the browser.
3. **How easy it is to steal:** Anyone opening your website can press `F12` (Inspect Element) $\rightarrow$ **Sources** or **Network** tab, search for `gsk_...` or `AIza...`, and steal your key to use at your expense.

### Why Next.js Folder Routing (`app/api/...`) Fixes This

Next.js uses folder-based routing. Creating `app/api/roast/route.ts` creates a dedicated **server-side endpoint**. 

When a file lives inside `app/api/`:
* Next.js **never** sends that code or its environment variables to the browser.
* `process.env.GROQ_API_KEY` is read strictly on Vercel's private server.
* The browser only receives the finished JSON response (the roast text), keeping the API key hidden.
* Server-to-server requests bypass browser **CORS (Cross-Origin Resource Sharing)** restrictions that normally block direct browser requests to external services like LeetCode or Groq.

#### Security & Architecture Comparison Matrix

| Method | Hidden from GitHub? | Hidden from Users/Hackers? | Bypasses CORS? | Works Safely? |
| :--- | :--- | :--- | :--- | :--- |
| **Plain JS + Hardcoded Key** | ❌ No | ❌ No (Public in source) | ❌ No | ❌ Broken & Unsecure |
| **Plain JS + `.env` + `.gitignore`** | ✅ Yes | ❌ No (Bundled into browser JS) | ❌ No | ❌ Unsecure |
| **Next.js Backend Route (`app/api/`)** | ✅ Yes | ✅ **Yes (Stays on server)** | ✅ **Yes** | ✅ **Production Ready** |

---

## 🏗️ Tech Stack & Classification

This project uses the **Next.js Full-Stack Architecture**. 

> **Note on Tech Stack Classification:** This is **not** a MERN stack project. MERN requires **M**ongoDB (Database) and **E**xpress (Backend Framework). This app uses Next.js App Router to handle both frontend UI and backend API routes seamlessly without Express or a database.

* **Framework:** Next.js (App Router) + React + TypeScript
* **Styling:** Tailwind CSS + Custom CSS (Playfair Display & Courier Prime Typography)
* **Backend Runtime:** Serverless Node.js Route Handlers (`app/api/`)
* **Export Library:** `html2canvas-pro` (DOM to PNG conversion)
* **Deployment & CI/CD:** Vercel integrated with GitHub
* **External APIs:**
  * **LeetCode GraphQL API** (User problem-solving metrics)
  * **Groq AI SDK (`groq-sdk`)** (Inference using `llama-3.1-8b-instant`)

---

## 📂 Project Structure & File Map

```text
leetcode-roaster/
├── app/
│   ├── api/
│   │   └── roast/
│   │       └── route.ts   # 🧠 BACKEND: Fetches LeetCode stats & queries Groq AI
│   ├── globals.css        # 🎨 Tailwind CSS & vintage typography styles
│   ├── layout.tsx         # 📐 Root HTML layout
│   └── page.tsx           # 🖥️ FRONTEND: Vintage UI, form state, and PNG export handling
├── .env.local             # 🔒 LOCAL SECRETS: Local Groq API key (Git-ignored)
├── next.config.ts         # ⚙️ Next.js framework configuration
├── package.json           # 📦 Dependencies (groq-sdk, html2canvas-pro, next, react)
└── README.md              # 📖 Project documentation

```

---

## 🔌 How the APIs Work (Step-by-Step Data Flow)

```
[ User Browser ]
       │
       │ (1) POST /api/roast { username: "pragga5678" }
       ▼
[ Next.js Backend Server (`app/api/roast/route.ts`) ]
       │
       ├─► (2) POST [https://leetcode.com/graphql](https://leetcode.com/graphql)  ───► Fetches Easy/Med/Hard stats
       │
       └─► (3) Groq AI API (`groq-sdk`)           ───► Generates Hinglish Roast
       │
       │ (4) Returns JSON { username, easy, med, hard, roast }
       ▼
[ User Browser UI Updates & Displays Card ]
       │
       └─► (Optional) Click "Download PNG" ───────► html2canvas-pro renders card image

```

### Detailed Technical Execution

1. **Frontend Trigger (`app/page.tsx`):**
When a user inputs a handle and clicks **Generate Roast**, a client-side `fetch()` call hits `/api/roast`.
2. **LeetCode Data Extraction (`app/api/roast/route.ts`):**
The server issues a POST request to `https://leetcode.com/graphql` querying the user's solved problem breakdown (Easy, Medium, Hard).
3. **AI Generation (`app/api/roast/route.ts`):**
The server initializes the Groq SDK using `process.env.GROQ_API_KEY`, feeds the stats into a custom persona prompt, and calls `llama-3.1-8b-instant`.
4. **Response Delivery & Export:**
The server returns the clean JSON response. The frontend renders the vintage card, and `html2canvas-pro` converts the card `ref` into a downloadable PNG file upon user request.

---

## 🎨 Design System: 1920s Art Deco / Vintage Print

The visual design is inspired by 1920s print ephemera and catalog posters:

* **Background:** Cream / Off-white (`#f4eee1` and `#faf6ed`).
* **Palette:** Deep Navy (`#1b2845`), Vintage Crimson (`#b82619`), Charcoal Borders (`#1a1a1a`).
* **Typography:** `Playfair Display` (Serif headlines) combined with `Courier Prime` (Monospace body text).
* **Borders & Shadows:** Hard 2px solid dark borders with retro 6px block offset shadows (`boxShadow: '6px 6px 0px 0px #1a1a1a'`).

---

## 🤖 Is This an "AI Wrapper"?

**Yes, fundamentally this application is an AI wrapper.**

An **AI wrapper** is any software application that relies on an external third-party AI model (like OpenAI, Gemini, or Groq) to provide its core value proposition rather than hosting or training a custom machine learning model from scratch.

### Why This App Adds Real Value Beyond Raw AI Chat:

* **Automation:** It automatically queries LeetCode's GraphQL API so users don't have to copy-paste stats.
* **Structured UX:** It wraps prompt engineering into a single-click interaction.
* **Presentation:** It presents the output in a stylized, theme-consistent card and offers instant PNG image exporting for social sharing.

---

## 🔮 Future Expansion & Graduating Beyond a Basic Wrapper

To transform this application from a simple utility tool into a scalable, high-traffic web platform, the next logical engineering phase is **Database & Persistence**.

### Recommended Upgrade Path: Database & Leaderboard

Adding a database is the most feasible first step because it requires no Machine Learning complexity—just standard full-stack web development.

1. **Database Stack:** [Supabase](https://supabase.com) or [Neon](https://neon.tech) (Free-tier PostgreSQL) combined with [Prisma ORM](https://www.prisma.io).
2. **New Features to Build:**
* **Global Hall of Fame / Leaderboard:** Display a page ranking the "Most Savage Roasts" or "Top Solved Users".
* **Permanent Sharing URLs:** Route pages like `/roast/[username]` so users can share direct links to their saved roasts without re-running API queries.
* **Community Upvoting:** Allow visitors to upvote or downvote roasts to sort the public leaderboard dynamically.



---

## 🛠️ Maintenance & Future Edits Guide

* **To change the AI's tone, slang, or prompt rules:**
* Open `app/api/roast/route.ts` and modify the `content` string inside `groq.chat.completions.create`.


* **To adjust UI styling, colors, or fonts:**
* Open `app/page.tsx` for component structure/inline styles, or `app/globals.css` for custom fonts and color variables.


* **To update API keys or AI models:**
* Local key: Update `GROQ_API_KEY` inside `.env.local`.
* Production key: Update **Vercel Dashboard $\rightarrow$ Settings $\rightarrow$ Environment Variables**.
* Model ID: Update `model: 'llama-3.1-8b-instant'` inside `app/api/roast/route.ts`.



---

## 🚀 Local Development Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/pragga9876/leetcode-roaster.git](https://github.com/pragga9876/leetcode-roaster.git)
cd leetcode-roaster

```


2. **Install dependencies:**
```bash
npm install

```


3. **Configure Local Environment:**
Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=gsk_your_actual_groq_key_here

```


4. **Run local dev server:**
```bash
npm run dev

```


Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Deploying Changes to Vercel

Deployment is fully automated via GitHub integration. Pushing commits to the `main` branch automatically triggers a fresh production build on Vercel:

```bash
git add .
git commit -m "Describe your changes here"
git push origin main

```
