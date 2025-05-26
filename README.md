
# H&S Safety Copilot

## Overview

The H&S Safety Copilot is an AI-powered enterprise-grade application designed for a reputed oil & natural gas company. It assists with health and safety inspections to help reduce workplace incidents. The Copilot leverages the Google Gemini API for multimodal understanding (text, images, documents) to support various H&S scenarios.

## Features

The application supports Health and Safety inspectors in the following scenarios:

1.  **Analyze New Safety Rules:** Upload and summarize new local safety regulations. Ask questions to the AI to understand the impact of new regulations on worksite inspections.
2.  **Prepare the Checklist:** Update existing safety checklists with new steps and checks to ensure compliance with new regulations.
3.  **H&S Risks Detection:** Analyze images of workers performing activities (e.g., near high voltage equipment) to identify dangerous situations. Include the picture and AI-generated comments in the checklist/notes.
4.  **Review Contractor’s H&S Safety Plan:** Retrieve information about external contractors and their Project Health & Safety Plan. Summarize the Scope of Work to ensure compliance and identify potential safety violations.
5.  **Create a Safety Violations Report:** Consolidate the checklist, notes, scope of work, and analyzed pictures to generate a draft safety violations report.
6.  **Draft an Urgent Email:** Given the severity of identified violations, draft an urgent message to the Head of H&S, including a bulleted list of all violations found.

## Technology Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (via CDN)
*   **State Management:** Zustand
*   **Routing:** React Router
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Module Loading:** ES Modules with Import Maps (for initial structure), transitioning to Vite for local development.
*   **Icons:** Lucide React
*   **Markdown:** `react-markdown` with `remark-gfm`

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** (LTS version recommended, e.g., 18.x or 20.x) - Includes npm (Node Package Manager). You can download it from [nodejs.org](https://nodejs.org/).
*   **Git:** For cloning the repository.
*   A modern web browser (e.g., Chrome, Firefox, Edge).

## Getting Started

Follow these steps to set up and run the application locally:

### 1. Clone the Repository

Clone the project to your local machine:

```bash
git clone <repository-url>
cd <repository-name>
```

Replace `<repository-url>` with the actual URL of the GitHub repository and `<repository-name>` with the name of the cloned folder.

### 2. Create `package.json`

If one doesn't exist, initialize a `package.json` file:

```bash
npm init -y
```

### 3. Install Dependencies

Install the necessary project dependencies using npm:

```bash
npm install react react-dom react-router-dom zustand @google/genai uuid lucide-react react-markdown remark-gfm
```

Install development dependencies, including Vite, the React plugin for Vite, and TypeScript types:

```bash
npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/uuid
```

### 4. Set Up Environment Variable (`.env` file)

The application requires a Google Gemini API key to function.

1.  Create a file named `.env` in the root of your project.
2.  Add your Gemini API key to this file:

    ```env
    API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
    ```

    **Important:**
    *   Replace `YOUR_ACTUAL_GEMINI_API_KEY` with your real API key.
    *   If this is a public repository, ensure `.env` is added to your `.gitignore` file to prevent committing your API key.

### 5. Create Vite Configuration (`vite.config.ts`)

Vite is a modern frontend build tool that provides a fast development server and handles TypeScript/JSX compilation. Create a file named `vite.config.ts` in the project root with the following content:

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env file variables based on the current mode (development, production)
  // process.cwd() points to the project root.
  // The third argument '' (empty string) ensures all variables are loaded without a VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This makes the API_KEY from your .env file available
      // as process.env.API_KEY in your client-side React code.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      open: true, // Automatically open the app in the browser on server start
      port: 3000   // Optional: specify a port for the dev server
    }
  };
});
```

This configuration uses Vite's `loadEnv` utility to load variables from your `.env` file and the `define` option to make `process.env.API_KEY` accessible in your application code, as expected by `services/geminiService.ts`.

### 6. Adjust `index.html` (Optional but Recommended)

*   The existing `index.html` file uses an import map (`<script type="importmap">...</script>`) to load dependencies from `esm.sh`. If you have installed all dependencies via `npm` (Step 3), Vite will bundle them from your `node_modules` directory. You can **comment out or remove the entire `<script type="importmap">...</script>` block** from `index.html` for a cleaner setup with Vite.
*   Ensure your `index.html` file correctly references your main TypeScript entry file:
    ```html
    <script type="module" src="/index.tsx"></script>
    ```
    This should already be the case.

### 7. Add Scripts to `package.json`

Open your `package.json` file and add the following scripts to easily run and build your application:

```json
{
  "name": "hs-safety-copilot",
  "version": "1.0.0",
  "description": "H&S Safety Copilot Application",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@google/genai": "^1.0.1",
    "lucide-react": "^0.511.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^7.6.1",
    "remark-gfm": "^4.0.1",
    "uuid": "^11.1.0",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.3.0",
    "vite": "^5.1.0"
  }
}
```
*(Note: The dependencies and devDependencies versions listed above are examples based on the import map and common practice. Your `npm install` commands from Step 3 will populate these sections automatically with the versions you installed.)*
You may also want to add `tailwindcss` and `autoprefixer` to your `devDependencies` and create a `postcss.config.js` and `tailwind.config.js` if you plan to customize Tailwind further, though the CDN link in `index.html` will work for basic Tailwind usage.

### 8. Run the Development Server

Now you can start the Vite development server:

```bash
npm run dev
```

This command will:
1.  Start the Vite dev server.
2.  Compile your TypeScript/JSX code.
3.  Inject the `API_KEY` from your `.env` file.
4.  Open the application in your default web browser (usually at `http://localhost:3000`).

You should now see the H&S Safety Copilot application running locally!

## Project Structure (Key Files & Folders)

```
/
├── public/                  # Static assets (if any, not explicitly used yet)
├── src/
│   ├── App.tsx              # Main application component with routing
│   ├── index.tsx            # React entry point
│   ├── components/          # Reusable UI components (layout, shared)
│   │   ├── layout/
│   │   ├── shared/
│   ├── constants.ts         # Application-wide constants
│   ├── hooks/               # Custom React hooks (e.g., useFileHandler)
│   ├── pages/               # Page components for each scenario/feature
│   ├── services/            # Services (e.g., geminiService.ts for API calls)
│   ├── store/               # Zustand store for state management (appStore.ts)
│   └── types.ts             # TypeScript type definitions
├── .env                     # Environment variables (API_KEY) - **DO NOT COMMIT SENSITIVE KEYS**
├── .gitignore               # Specifies intentionally untracked files that Git should ignore
├── index.html               # Main HTML entry point for the application
├── metadata.json            # Application metadata
├── package.json             # Project metadata and npm scripts
├── README.md                # This file
├── tsconfig.json            # TypeScript compiler options (Vite usually generates one)
└── vite.config.ts           # Vite configuration file
```

## Contributing

(Details on contributing to the project can be added here if applicable, e.g., coding standards, pull request process.)

---

This guide should help you get the H&S Safety Copilot up and running on your local machine. If you encounter any issues, please double-check the prerequisites and environment variable setup.
