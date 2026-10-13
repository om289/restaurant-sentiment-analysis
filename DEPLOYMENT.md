# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Mumbai Restaurant Analytics Dashboard to various hosting platforms.

---

## 📋 Table of Contents

1. [Vercel (Recommended)](#vercel-recommended)
2. [Netlify](#netlify)
3. [GitHub Pages](#github-pages)
4. [Docker](#docker)
5. [Self-Hosted (Nginx/Apache)](#self-hosted-nginxapache)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vercel (Recommended)

Vercel provides the best developer experience with automatic builds, instant rollbacks, and free HTTPS.

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Click the "Deploy with Vercel" button
2. Connect your GitHub account
3. Choose repository name and visibility
4. **Add Environment Variable:**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
5. Click "Deploy"
6. Wait 2-3 minutes for build completion
7. Visit your deployed URL 🎉

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? (press enter for default)
# - Directory? ./ (press enter)
# - Override settings? N

# Add environment variable via dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Add VITE_GEMINI_API_KEY = your_api_key
# 5. Redeploy: vercel --prod
```

### Configuration (`vercel.json`)

The project includes a `vercel.json` file with:
- **SPA Routing:** All routes redirect to `/index.html` for client-side routing
- **Security Headers:** X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## 🟦 Netlify

Netlify offers drag-and-drop deployment and automatic CI/CD from Git.

### Option 1: Drag-and-Drop

```bash
# Build the project locally
npm run build

# 1. Go to https://app.netlify.com/drop
# 2. Drag the dist/ folder into the upload area
# 3. Wait for deployment to complete
# 4. Go to Site settings → Build & deploy → Environment
# 5. Add VITE_GEMINI_API_KEY = your_api_key
# 6. Trigger redeploy from Deploys tab
```

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init

# Follow prompts:
# - Create & configure a new site? Y
# - Team? (select your team)
# - Site name? (enter or press enter for random)
# - Build command? npm run build
# - Publish directory? dist

# Add environment variable
netlify env:set VITE_GEMINI_API_KEY "your_api_key_here"

# Deploy to production
netlify deploy --prod
```

### Option 3: GitHub Integration

1. Push code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your API key
7. Click "Deploy site"

### Configuration (`netlify.toml`)

The project includes a `netlify.toml` file with:
- **Build settings:** Automatic detection of build command and publish directory
- **SPA Routing:** Redirects all routes to `/index.html`
- **Security Headers:** Matches Vercel configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

---

## 🐙 GitHub Pages

Deploy directly from your GitHub repository with GitHub Actions.

### Prerequisites
- Code pushed to GitHub repository
- GitHub Pages enabled in repository settings

### Step 1: Update Vite Config

If deploying to a subdirectory (e.g., `https://username.github.io/repo-name/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repo-name/', // Replace with your repository name
  // ... rest of config
});
```

Or use environment variable in GitHub Actions (recommended):
```yaml
env:
  VITE_BASE_PATH: ${{ github.event.repository.name }}
```

### Step 2: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (will be created by workflow)
4. Folder: `/ (root)`
5. Save

### Step 3: Add Gemini API Key to Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VITE_GEMINI_API_KEY`
4. Value: Your Gemini API key
5. Click "Add secret"

### Step 4: Deploy with GitHub Actions

The project includes `.github/workflows/deploy.yml` which automatically:
- Runs on every push to `main` branch
- Installs dependencies
- Runs type checking
- Builds production bundle
- Deploys to `gh-pages` branch (optional, see below)

**To enable GitHub Pages deployment:**

Uncomment the deployment step in `.github/workflows/deploy.yml`:

```yaml
# Uncomment this step to deploy to GitHub Pages:
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

### Manual GitHub Pages Deployment

If you prefer manual deployment:

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add deploy script to package.json
# "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

---

## 🐳 Docker

Containerize the application with Nginx for production deployment.

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf` in project root:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

### Build and Run

```bash
# Build Docker image
docker build -t mumbai-restaurant-dashboard .

# Run container
docker run -d \
  -p 8080:80 \
  --name restaurant-dashboard \
  mumbai-restaurant-dashboard

# Visit http://localhost:8080
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## 🖥️ Self-Hosted (Nginx/Apache)

Deploy to your own server with Nginx or Apache.

### Nginx Configuration

Create `/etc/nginx/sites-available/restaurant-dashboard`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/restaurant-dashboard;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/restaurant-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache Configuration

Create `/etc/apache2/sites-available/restaurant-dashboard.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/restaurant-dashboard

    <Directory /var/www/restaurant-dashboard>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
</VirtualHost>
```

Enable site:
```bash
sudo a2enmod rewrite headers deflate
sudo a2ensite restaurant-dashboard
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### Deployment Steps

```bash
# On your local machine: Build production bundle
npm run build

# Upload dist/ folder to server
scp -r dist/* user@yourserver:/var/www/restaurant-dashboard/

# Or use rsync
rsync -avz --delete dist/ user@yourserver:/var/www/restaurant-dashboard/

# Set correct permissions on server
sudo chown -R www-data:www-data /var/www/restaurant-dashboard
sudo chmod -R 755 /var/www/restaurant-dashboard
```

### SSL/HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx  # For Nginx
# OR
sudo apt install certbot python3-certbot-apache  # For Apache

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# OR
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## 🐛 Troubleshooting

### Blank Page After Deployment

**Symptoms:** White/blank page, no errors in browser console

**Causes & Solutions:**

1. **Incorrect Base Path** (GitHub Pages)
   ```typescript
   // vite.config.ts - ensure correct base path
   base: process.env.VITE_BASE_PATH || '/',
   ```

2. **Build Files Not Found**
   - Check that `dist/` folder was uploaded correctly
   - Verify server document root points to correct directory
   - Check file permissions (should be readable by web server)

3. **Environment Variables Not Set**
   - Rebuild after setting `VITE_GEMINI_API_KEY`
   - Vite env vars are compiled at BUILD time, not runtime
   - Changes to `.env` require rebuild: `npm run build`

### 404 Errors on Page Refresh

**Symptoms:** Direct navigation to `/map` or `/xai` returns 404

**Cause:** Server not configured for SPA routing

**Solutions:**

- **Vercel/Netlify:** Already configured via `vercel.json` / `netlify.toml`
- **Nginx:** Add `try_files $uri $uri/ /index.html;`
- **Apache:** Enable `mod_rewrite` and add rewrite rules (see above)
- **GitHub Pages:** Ensure base path is correctly set

### API Errors / "Failed to fetch"

**Symptoms:** Gemini AI tab shows errors, XAI explanations don't load

**Causes & Solutions:**

1. **Missing API Key**
   - Check environment variables in hosting dashboard
   - Redeploy after adding `VITE_GEMINI_API_KEY`

2. **Invalid API Key**
   - Verify key at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Check for extra spaces or quotes in environment variable value
   - Key should start with `AIza...` or similar

3. **CSP Blocking API Calls**
   - Check browser console for CSP errors
   - Ensure `connect-src` includes `https://generativelanguage.googleapis.com`
   - Update CSP in `index.html` or server headers

4. **CORS Errors**
   - Gemini API should NOT have CORS issues (server-side)
   - If seeing CORS errors, check network tab for actual error (might be auth issue disguised as CORS)

### Large Bundle Size Warning

**Symptoms:** Build warning about chunk size >500KB

**Expected Behavior:** This is normal for the map/charts vendor bundles

**If bundle is excessively large:**
```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer

# Update vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [react(), visualizer()],

# Build and open stats.html
npm run build
open stats.html
```

### Memory Errors During Build

**Symptoms:** `JavaScript heap out of memory` during `npm run build`

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Or add to package.json scripts:
"build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
```

### Map Tiles Not Loading

**Symptoms:** Gray tiles or broken map images

**Causes:**
1. **Network blocked:** Check firewall/proxy settings for `tile.openstreetmap.org`
2. **CSP too strict:** Ensure `img-src` allows `https:` or OpenStreetMap domains
3. **Rate limiting:** OpenStreetMap tiles have usage limits; consider using MapTiler or Mapbox for production

---

## 📊 Performance Optimization

### Enable Brotli Compression (Nginx)

```nginx
# Install brotli module
sudo apt install nginx-module-brotli

# Add to nginx.conf
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### CDN Integration

Use a CDN (Cloudflare, AWS CloudFront) for:
- Faster global delivery
- DDoS protection
- Automatic caching
- Free SSL

### Monitoring

Consider adding:
- **Vercel Analytics:** `npm install @vercel/analytics`
- **Sentry:** Error tracking for production
- **Google Analytics / Plausible:** Usage analytics

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured (`VITE_GEMINI_API_KEY`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] `.env` file is in `.gitignore` (never commit API keys)
- [ ] Base path set correctly for subdirectory deployments
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] SPA routing configured (all routes return `index.html`)
- [ ] SSL/HTTPS enabled (Let's Encrypt or hosting provider)
- [ ] Error boundary tested (simulate React error to verify)
- [ ] Mobile responsiveness verified
- [ ] Browser console clear of errors

---

## 🆘 Need Help?

- **GitHub Issues:** [Open an issue](../../issues) for bugs or questions
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Netlify Support:** [netlify.com/support](https://www.netlify.com/support/)
- **Community:** [Stack Overflow](https://stackoverflow.com/questions/tagged/vite) (tag: `vite`, `react`, `deployment`)

---

**Happy Deploying! 🚀**
