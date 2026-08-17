# LeetCode Roast Cards 🔥

A full-stack web application built with Next.js 15, React, and Google Gemini AI that fetches a user's LeetCode profile metrics, skill breakdowns (Arrays, Trees, DP, etc.), and generates a dynamic, AI-powered roast card exportable as a PNG image.

## Features

- **LeetCode GraphQL Integration:** Fetches live submission stats and detailed topic tag breakdowns directly from LeetCode.
- **AI-Powered Roasts:** Leverages Google Gemini 2.5 Flash to generate context-aware, sarcastic roasts targeting specific data structure weaknesses.
- **DOM to Image Export:** Uses `modern-screenshot` for clean client-side PNG downloads without canvas parsing errors.
- **Serverless Architecture:** Built-in Next.js App Router API endpoints to prevent client-side CORS issues.

## Tech Stack

- **Framework:** Next.js (App Router, React)
- **Language:** TypeScript / JavaScript
- **Styling:** Tailwind CSS
- **AI Model:** Google Gemini API (`@google/genai`)
- **Export Utility:** `modern-screenshot`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API Key

### Environment Variables

Create a `.env.local` file in the root directory and add your key:

\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.