# Mumbai Restaurant Sentiment & DVSMA Analytics Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **AI-powered analytics platform for 10,000+ Mumbai restaurants featuring sentiment analysis, explainable AI (SHAP/LIME), geospatial visualization, and Gemini 2.5 Flash integration.**

![Screenshot Placeholder](https://placehold.co/1200x600/0f172a/6366f1?text=Mumbai+Restaurant+Analytics+Dashboard)

---

## ✨ Features

- **📊 Interactive Dashboard** — Real-time sentiment distribution, rating analytics, cuisine insights, and neighborhood trends
- **⚔️ Comparative Analytics** — Side-by-side comparison of up to 3 restaurants with radar charts (food, service, ambience, value) and head-to-head metrics
- **🔥 Trending Insights & Hidden Gems** — Algorithmic discovery of top-rated venues, high-sentiment movers, and high-rating/low-review hidden gems
- **🗺️ Geospatial Map Visualization** — Interactive Leaflet map with clustered restaurant markers, sentiment-based heatmaps, and drill-down capabilities
- **🧠 Explainable AI (XAI)** — SHAP and LIME token attribution showing which keywords drive positive/negative sentiment predictions
- **✨ Gemini 2.5 Flash Integration** — AI-powered restaurant analysis, review extraction, and natural language insights
- **🔍 Advanced Persistent Filters** — Price range slider, multi-select cuisines, rating threshold, review count filters, and search
- **📥 CSV & Executive Report Export** — Instant client-side CSV spreadsheet and executive summary report generation
- **🌗 Dark / Light Theme Toggle** — Smooth CSS custom property transitions saved persistently to localStorage
- **⚡ Progressive Web App (PWA)** — Offline app shell caching, web app manifest, and installable experience
- **📈 Data Explorer** — Browse raw dataset with pagination, sorting, and inline sentiment explanations

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript 5.2, Vite 5.1 |
| **Visualization** | Recharts (charts), Leaflet + React Leaflet (maps) |
| **AI/ML** | Google Gemini 2.5 Flash API, SHAP/LIME explanations |
| **Data Processing** | PapaParse (CSV parsing) |
| **Styling** | Modern CSS with CSS Variables, Lucide React icons |
| **Build Tools** | Vite (bundling), TypeScript Compiler |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bda.git
   cd bda
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

---

## 🔧 Environment Setup

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)
5. Add it to your `.env` file:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyC...your_key_here
   ```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI-powered features |
| `VITE_BASE_PATH` | No | Base path for deployment (default: `/`) |

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the browser via Vite's `import.meta.env`.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle with type checking |
| `npm run typecheck` | Run TypeScript type checking without building |
| `npm run build:prod` | Production build (alias for `build`) |
| `npm run preview` | Preview production build locally |
| `npm run preview:prod` | Preview production build (alias) |

---

## 🌐 Deployment

This project is deployment-ready for multiple platforms. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed platform-specific instructions.

### Quick Deploy Options

| Platform | Method | Documentation |
|----------|--------|---------------|
| **Vercel** | One-click or CLI | [Vercel Guide](DEPLOYMENT.md#vercel-deployment) |
| **Netlify** | Drag-and-drop or CLI | [Netlify Guide](DEPLOYMENT.md#netlify-deployment) |
| **GitHub Pages** | GitHub Actions | [GitHub Pages Guide](DEPLOYMENT.md#github-pages-deployment) |
| **Docker** | Container + nginx | [Docker Guide](DEPLOYMENT.md#docker-deployment) |
| **Self-Hosted** | nginx/Apache | [Self-Hosted Guide](DEPLOYMENT.md#self-hosted-deployment) |

### Deployment Checklist

- [ ] Set `VITE_GEMINI_API_KEY` in your deployment platform's environment variables
- [ ] Update the canonical URL in `index.html` to your production domain
- [ ] Replace placeholder images in meta tags with actual screenshots
- [ ] Test SPA routing (all routes should serve `index.html`)
- [ ] Verify security headers are applied (use browser DevTools Network tab)

---

## 📊 Data Files

The project uses CSV datasets located in `public/`:

- **`mumbai_restaurant_final.csv`** — Primary dataset with 10,000+ restaurants including sentiment labels, ratings, XAI drivers, and geospatial data
- **Columns:** restaurant_id, name, area, cuisine_type, rating, food_rating, service_rating, ambience_rating, value_rating, sentiment_label, customer_comment, xai_positive_drivers, xai_negative_drivers, latitude, longitude

CSV files are parsed client-side using PapaParse for zero backend dependency.

---

## 🗂️ Project Structure

```
bda/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline for builds and deployments
├── public/
│   ├── mumbai_restaurant_final.csv
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Overview tab with charts
│   │   ├── MapView.tsx         # Geospatial visualization
│   │   ├── XAIExplainer.tsx    # SHAP/LIME explanations
│   │   ├── GeminiChat.tsx      # AI chat interface
│   │   ├── SearchView.tsx      # Search and filter UI
│   │   ├── DataExplorer.tsx    # Raw data browser
│   │   └── ErrorBoundary.tsx   # React error boundary
│   ├── services/
│   │   └── gemini.ts           # Gemini API integration
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── .nvmrc                      # Node version lock (18)
├── index.html                  # HTML entry point with meta tags
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── vercel.json                 # Vercel deployment config
├── netlify.toml                # Netlify deployment config
├── DEPLOYMENT.md               # Detailed deployment guide
└── README.md                   # This file
```

---

## 🐛 Troubleshooting

### Issue: Gemini AI tab shows "API key not configured" message

**Solution:**
1. Ensure you've created a `.env` file in the project root
2. Add `VITE_GEMINI_API_KEY=your_key_here` to the file
3. Restart the dev server (`npm run dev`)
4. Check browser console for warnings

### Issue: Map tiles not loading

**Solution:**
- Check your network connection (map tiles load from OpenStreetMap CDN)
- Verify the CSP policy in `index.html` allows `img-src https:`
- Clear browser cache and reload

### Issue: CSV parsing errors in console

**Solution:**
- Ensure `public/mumbai_restaurant_final.csv` exists and is not corrupted
- Check that the CSV has headers matching the expected column names
- Verify the file is UTF-8 encoded

### Issue: Blank page after deployment

**Solution:**
- Check browser console for errors
- Verify `VITE_GEMINI_API_KEY` is set in deployment platform environment variables
- Ensure SPA routing is configured (see `vercel.json` or `netlify.toml`)
- Check that the base path matches your deployment URL

### Issue: TypeScript errors during build

**Solution:**
- Run `npm run typecheck` to see detailed error messages
- Ensure all dependencies are installed (`npm install`)
- Check that `tsconfig.json` has correct paths and settings

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `chore:` — Build/config changes
- `refactor:` — Code refactoring

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Restaurant data synthesized from publicly available Mumbai dining trends
- Map tiles provided by [OpenStreetMap](https://www.openstreetmap.org/)
- Icons by [Lucide](https://lucide.dev/)
- AI capabilities powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

---

## 📧 Contact

For questions or support, please open an issue on [GitHub](https://github.com/yourusername/bda/issues).

---

**Made with ❤️ for Mumbai's vibrant food culture**
