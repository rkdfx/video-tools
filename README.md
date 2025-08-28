
# VTools

This is a React app built with Vite and styled with Tailwind CSS. The goal is to provide a set of tools, starting with a video to GIF converter.

## 🚀 Live Demo

Visit the live demo: [https://rkdfx.github.io/video-tools](https://rkdfx.github.io/video-tools)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Features

- **Video to GIF Converter**: Convert video files to animated GIFs
  - Preset options (Small, Short, Long)
  - Customizable FPS and width settings
  - Real-time conversion progress
  - Download converted GIFs
  - Powered by ffmpeg.wasm for client-side processing

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

## Planned Tools
- Video to GIF converter ✅
- More video processing tools (coming soon)

## How to add new tools
Add new React components in the `src` directory and update the navigation as needed.

## Tech Stack

- React + Vite
- Tailwind CSS
- ffmpeg.wasm
- GitHub Pages

---

This README will be updated as new tools are added.