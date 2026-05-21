# Dheeraj Prajapati — Portfolio Website

## Overview
Single-page personal portfolio for a Creative Developer & Digital Strategist. Visually polished, animation-heavy site showcasing experience, skills, and video work.

## Tech Stack
- **HTML5** — semantic markup
- **CSS3** — custom properties, gradients, responsive queries, no preprocessor
- **JavaScript** — vanilla JS with **GSAP 3.12** (ScrollTrigger, ScrollToPlugin)
- **Deployment** — Vercel (`vercel.json` with caching & security headers)

## File Structure
```
/ (8 files)
├── index.html               # Main page (478 lines)
├── style.css                # All styles (964 lines)
├── script.js                # All JS (634 lines)
├── vercel.json              # Vercel deployment config
├── hero_poster.jpg          # Hero video poster (desktop)
├── hero_poster_mobile.jpg   # Hero video poster (mobile)
├── hero_video.mp4           # Hero background video (desktop)
└── hero_video_mobile.mp4    # Hero background video (mobile)
```

## Sections (in order)
| Section | ID | Key Features |
|---------|----|--------------|
| Loader | `#loader` | Simulated progress bar, status text, GSAP entrance |
| Canvas BG | `#cvs` | Particle system (15-25 particles, adaptive) |
| Nav | `#nav` | Fixed, scroll-aware background, hamburger on mobile |
| Mobile Menu | `#mobMenu` | Full-screen overlay, scramble hover effect on links |
| Hero | `#hero` | Dual video (desktop/mobile), gradient name, typewriter role rotation |
| About | `#about` | Image w/ glow, 4 animated stat counters |
| Experience | `#exp` | Timeline with 4 entries, staggered scroll reveal |
| Skills | `#skills` | 6 categories (Programming, Frontend, Testing, Cloud, Creative, Marketing) |
| Work | `#work` | Filterable video cards (7 categories), inline play/pause, modal |
| Education | `#edu` | B.Tech card with CGPA |
| Contact | `#contact` | Phone, email, social links, form (fake submit) |
| Footer | `#foot` | Copyright line |

## CSS Conventions
- Dark theme: `--bg: #030305`, accent colors via CSS custom properties
- Accent palette: cyan `#00f0ff`, magenta `#ff006e`, gold `#ffd700`, violet `#a855f7`
- Fonts: **Outfit** (body), **Space Grotesk** (headings), **JetBrains Mono** (mono/UI)
- Gradients used extensively for text, buttons, borders, hover effects
- Responsive breakpoints: 1024px, 768px, 480px
- `prefers-reduced-motion` support disables animations and canvas

## JS Conventions
- Vanilla JS + GSAP for all animations
- GSAP ScrollTrigger for scroll-reveal animations
- `requestAnimationFrame` for scroll handlers (nav, progress bar, back-to-top, sidebar)
- `IntersectionObserver` for canvas visibility and text scramble triggers
- Canvas particle system adapts to mobile/low-power devices
- Video cards: hover-to-preview, click play/pause, modal for full view
- Role typewriter cycles through 5 roles
- Text scramble effect on all `.scramble-text` section headers

## Known Placeholders / TODOs
- [ ] Social links all point to `#` — update with real URLs
- [ ] Email is `dheeraj@example.com` — use real email
- [ ] Contact form has no backend — shows fake "Message Sent!"
- [ ] All work showcase videos reference `hero_video.mp4` — replace with actual project videos
- [ ] No real social media/YouTube embeds — links only
