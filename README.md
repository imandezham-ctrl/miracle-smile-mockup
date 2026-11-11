# A Miracle Smile website

Static site for A Miracle Smile by Dr. Dezham Dental Group, 3009 K Street, Suite 255, Sacramento.
Built on the same layout system as the Top Flight Aviation site. Deploys on Vercel as-is (no build step).

- Pages: `index.html` (home, new patients, emergency, FAQ), `services.html`, `about.html` (Dr. Dezham),
  `contact.html` (hours, map, message form), `book.html` (appointment request), `404.html`
- Styles and scripts: `assets/css/site.css`, `assets/js/site.js` (search index is at the bottom of site.js)
- Photos: `assets/media/`, see `MEDIA-CHECKLIST.md`. Missing photos show a teal gradient, not a broken image.
- Shared header/menu and footer: edit them in `index.html`, then run `python3 tools/sync-shared.py`
- Form email: `api/submit.js` (Vercel function → Resend). Set `RESEND_API_KEY` and `FORM_TO` in Vercel;
  optional `FORM_FROM` once a sending domain is verified. Until it's set up, forms tell visitors to call.

Preview locally: `python3 -m http.server 8080` and open http://localhost:8080 (forms need Vercel to send).

Before launch, have the office confirm: hours, suite number, fax, which insurance plans to mention,
parking directions, and the quote on the About page (currently a placeholder).
