# How to Run Lighthouse for Accurate Performance Scores

## Critical: Use Production Build, Not Dev Server

The Lighthouse report you shared showed:

- **Performance 67** with **FCP 2.1s** and **LCP 4.4s**
- **Development builds** in the payload: `react-dom-client.development.js`, `react-router/dist/development/`
- **Vite dev client** (`/@vite/client` ~178 KiB) in the network payload
- **Unminified JS** (~1,900 KiB) and **unminified CSS** (Tailwind)

Those findings mean the audit was run against **`npm run dev`** (development server), not the production build. In dev mode:

- React and react-router are **development** builds (larger, unminified)
- Vite injects the HMR/client script
- No minification or tree-shaking
- Source maps and extra code for debugging

**To get a realistic Performance score (and target 95+):**

### 1. Build for production

```bash
npm run build
```

### 2. Run Lighthouse on the production output

**Option A – Local preview (recommended for quick checks)**

```bash
npm run preview
```

Then open the URL shown (e.g. `http://localhost:4173`) and run Lighthouse in Chrome DevTools (Lighthouse tab → Analyze page load). Prefer the **/guide/stroke-basics** page if you’re optimizing that route.

**Option B – Deployed site (most realistic)**

Deploy the `dist/` folder to Cloudflare Pages (or your host), then run Lighthouse on the **production URL** (e.g. `https://neurowiki.ai`).

### 3. Run in a clean environment

- Use **Incognito** (or a profile with **extensions disabled**). Extensions (e.g. VPN, M*Modal) can add 1 MB+ of script and skew “Reduce unused JavaScript” and total payload.
- Close other tabs to reduce CPU contention.

### 4. What to expect after switching to production

- **Minify JavaScript** and **Minify CSS** should pass (production build is minified).
- **Unused JavaScript** and **Total payload** should drop a lot (no dev React, no Vite client).
- **FCP** and **LCP** should improve; the reported ~4.6 MB payload should fall to well under 1 MB for the initial load.

Re-run Lighthouse on **production** (preview or deployed) and use that report to tune further (e.g. lazy loading, compression) toward a **95+** score.

---

## Enable text compression (for deployed production)

If Lighthouse reports **"No compression applied"** or **"Document request latency"** with an estimated saving (e.g. 3 KiB for HTML, more for JS/CSS):

- **Cloudflare Pages:** In the Cloudflare dashboard, **Speed → Optimization**: enable **Brotli** (and/or **Auto Minify** for HTML, CSS, JS if not already applied at build time). Compression is often on by default for static assets; if not, turn it on.
- **Other hosts:** Enable gzip or Brotli on the server/CDN for `text/html`, `text/css`, and `application/javascript` (and ensure your production build is being served from the correct directory, e.g. `dist/`).
