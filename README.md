# STARSS STUDIO — Official Website

Official website of **STARSS STUDIO**, an independent development studio.
Slogan: **FROM MIND TO REALITY.** — Founder & Developer: **Bintang Iqbal H.**

A static website built with **HTML5, CSS3 and vanilla JavaScript**. No frameworks, no build step, no backend, no database and no paid services — it can be hosted for free on **GitHub Pages**.

---

## 1. Project overview

- 9 main pages + a custom `404.html`
- Charcoal-and-metallic-silver identity using only the official palette
- Self-hosted Inter font (no external font service), lightweight CSS/JS, animations that respect `prefers-reduced-motion`
- Works without JavaScript (content and navigation are plain HTML; JS only adds behaviour)
- Content is **never invented**: projects, news, showcase images and contact details are empty until you add real, verified ones. Empty states are shown instead.

## 2. Project structure

```
starss-studio-website/
├── index.html            Home
├── about.html            About Us
├── philosophy.html       Our Philosophy
├── projects.html         Our Projects
├── development.html      Development
├── news.html             News & Updates
├── showcase.html         Showcase (gallery + lightbox)
├── identity.html         Our Identity (logo, palette, typography)
├── contact.html          Contact
├── 404.html              Custom "Page Not Found"
├── sitemap.xml
├── robots.txt
├── README.md
└── assets/
    ├── css/style.css     All styles (one shared stylesheet)
    ├── js/main.js        All behaviour (nav, reveal, gallery, news, ...)
    ├── data/             ← YOUR CONTENT LIVES HERE
    │   ├── site-config.js   contact email + official links
    │   ├── projects.js      released projects
    │   ├── news.js          news articles
    │   └── showcase.js      gallery images
    ├── fonts/            Inter (Latin subset, WOFF) + license note
    ├── images/
    │   ├── logo.png         OFFICIAL LOGO (original, untouched)
    │   ├── logo.webp / logo-640.webp   optimized copies of the same logo
    │   ├── emblem.*         square crop of the symbol, for the header
    │   ├── favicon.png, apple-touch-icon.png
    │   ├── hero/  projects/  showcase/   put your images here
    └── icons/
```

## 3. Editing website content

| What | Where |
|---|---|
| Page text (About, Philosophy, Development, Identity, …) | the matching `.html` file — plain text inside the tags |
| Released projects | `assets/data/projects.js` |
| News articles | `assets/data/news.js` |
| Showcase images | `assets/data/showcase.js` |
| Email / social links | `assets/data/site-config.js` |
| Colors, spacing, fonts | top of `assets/css/style.css` (`:root` variables) |

> The navigation bar and footer are written directly in every HTML page (so they work without JavaScript). If you add or rename a page, update the `<nav>` in the header **and** the footer links in every page.

### Replace the official logo
1. Prepare the new logo as a square PNG (same name): `assets/images/logo.png`.
2. Optional but recommended: also replace the optimized copies `logo.webp` (≈1250 px) and `logo-640.webp` (640 px).
3. The small header emblem is `assets/images/emblem.png` / `emblem.webp` / `emblem-2x.webp` (96 px and 192 px), and the browser icons are `favicon.png` (512 px) and `apple-touch-icon.png` (180 px). Replace these as well if the symbol changes.
4. Never stretch, recolor or redraw the logo — see the Brand Usage Guidelines on the Identity page.

### Add a released project
Open `assets/data/projects.js`, copy the template shown in the comment into the array, fill in **real** information and keep `verified: true`.

```js
STARSS.projects = [
  {
    title: "Project Name",
    category: "game",                       // "game" | "software" | "android"
    description: "Short, accurate description.",
    image: "assets/images/projects/project-name.webp",   // optional
    imageAlt: "What the image shows",
    version: "1.0.0",                       // optional
    status: "Released",                     // optional
    officialUrl: "https://…",               // optional (store / official page)
    verified: true                          // must be true, otherwise it stays hidden
  }
];
```
Projects appear automatically on **Our Projects** (grouped by category, with filters) and the first three on the **Home** page. The empty states disappear by themselves. Only add projects that are truly released.

### Add a news article
Open `assets/data/news.js` and add an entry (see the template in the file): `slug`, `title`, `date` (`YYYY-MM-DD`), `category`, `summary`, `content` (a list of paragraphs), optional `image`, and `verified: true`. Each article gets its own address: `news.html#your-slug`. The latest three show on the Home page.

### Add showcase images
1. Upload images to `assets/images/showcase/` (WebP or JPG, about 1600 px wide; optional ~800 px thumbnails).
2. Add an entry to `assets/data/showcase.js` with `src`, a meaningful `alt`, optional `title`/`caption`/`thumb`, and `verified: true`.
The gallery has hover effects and a keyboard-accessible lightbox (arrow keys, Esc, swipe on phones). Use only real STARSS STUDIO material — no stock images.

### Configure real contact links
Open `assets/data/site-config.js`:
```js
contact: { email: "hello@your-domain.com" },
links: [ { label: "GitHub", url: "https://github.com/your-username" } ]
```
Anything left empty stays hidden. With an email set, the three inquiry cards get "Send an email" buttons. There is intentionally **no contact form** (it would need a backend service).

### Edit SEO metadata
Each page has its own `<title>`, `<meta name="description">`, canonical URL and Open Graph tags inside `<head>`. Edit them in the page file. **Before going public, replace the placeholder address** `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` with your real one in:
- the `canonical`, `og:url` and `og:image` tags of every page,
- `sitemap.xml` and `robots.txt`.

(On a phone you can open each file in the GitHub editor and use the editor's search/replace. As a fallback, `main.js` points `canonical` and `og:url` to the live address automatically while the placeholder is still there, but search engines and social previews work best when the real address is written in the files.)

---

## 4. Publish with GitHub Pages (free)

1. Create a GitHub account and a **new public repository** (for example `starss-studio-website`).
2. Upload **the contents** of this folder (the `index.html` must be at the top level of the repository, not inside another folder).
3. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)** and press **Save**.
4. Wait 1–2 minutes. Your site will be at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
5. Replace the address placeholders (see "Edit SEO metadata").

All links and assets use **relative paths**, so the site works from a repository sub-path such as `/starss-studio-website/`.

### The 404 page
GitHub Pages automatically serves `404.html` for unknown addresses. The page detects the repository sub-path by itself. If you publish a *user site* (repository named `USERNAME.github.io`), open `404.html` and set `var BASE = "/";` near the top. For a project site you may set `var BASE = "/your-repository/";` explicitly. With a custom domain the automatic detection already works.

### Using a custom domain later
1. Buy/choose a domain, then in **Settings → Pages → Custom domain** enter it and save (GitHub creates a `CNAME` file).
2. At your domain provider add the DNS records GitHub lists (A records for the apex domain, or a `CNAME` record to `YOUR-USERNAME.github.io` for `www`).
3. Tick **Enforce HTTPS** once it becomes available.
4. Update the address in the canonical/Open Graph tags, `sitemap.xml` and `robots.txt`. With a custom domain the site is served from the root, so set `BASE = "/"` in `404.html` if it does not look right.

---

## 5. Guide for managing the site from an Android phone

**Create the repository (GitHub website in Chrome)**
1. Open `github.com` in Chrome, sign in, and tap **+ → New repository**. Name it, choose **Public**, tap **Create repository**.
2. Open the menu (⋮) and enable **Desktop site** — the upload buttons are easier to find.

**Upload the website**
1. Download and **extract** the ZIP on your phone (Files app → long-press the ZIP → *Extract*).
2. In your repository tap **Add file → Upload files** and select everything inside the extracted `starss-studio-website` folder. GitHub's web uploader does not keep folders when you pick files one by one; if folders are missing, use a file manager/app that supports folder upload (for example the GitHub app, or the free **Termux** with `git`), or upload folder by folder using **Add file → Create new file** with names like `assets/css/style.css`.
3. Tap **Commit changes**.

**Turn on GitHub Pages** — follow steps 3–4 of "Publish with GitHub Pages" above.

**Edit content later**
1. Open the file in the repository (for example `assets/data/projects.js`) and tap the **pencil ✎** icon.
2. Make your change, then tap **Commit changes**. The site updates in about a minute.
3. To upload an image: open the folder (e.g. `assets/images/projects/`), tap **Add file → Upload files**, choose the image, commit. Then reference it in `projects.js`.

**Tips**
- Keep images small (WebP/JPG, under ~300 KB for thumbnails).
- Use straight quotes `"` in the `.js` files, and keep the commas between entries.
- If a page looks unchanged, refresh with a hard reload (or open in a private tab) — browsers cache files.

---

## 6. Accessibility, performance and browser notes

- Semantic HTML, skip link, visible focus indicators, ARIA on the menu, filters and lightbox, descriptive alt text.
- Animations use CSS `transform`/`opacity` only; `prefers-reduced-motion` disables them and everything stays visible.
- Below-the-fold images use `loading="lazy"`; image dimensions are set to avoid layout shift.
- Soft page cross-fade uses the CSS View Transitions API where supported and is simply ignored elsewhere.

## 7. Credits

- Font: **Inter** by The Inter Project Authors — SIL Open Font License 1.1 (see `assets/fonts/README.txt`).
- Logo and brand identity: © STARSS STUDIO.
