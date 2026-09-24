# Miracle Smile — Website Mockup Build Brief (for Claude Code)

You are Claude Code, an AI coding agent. Your job: generate a COMPLETE, polished,
multi-page **static website mockup** for a dental practice, in this directory.

## What this is

A sales mockup / portfolio demo Iman will use to show web work to the practice owner.
It is NOT the real business's site. Anything not confirmed below must be written as
obvious placeholder content (e.g. "[Sample testimonial — replace with real review]").

## Verified business facts (USE THESE EXACTLY — do not invent alternatives)

- **Business name:** A Miracle Smile by Dr. Dezham Dental Group ("A Miracle Smile")
- **Doctor:** Dr. Hassan M. Dezham, DDS (male; spell surname **Dezham**, never "Dejam")
- **Address:** 3009 K Street, Suite 255, Sacramento, CA 95816
- **Phone:** (916) 441-3311 · Fax: (916) 441-0630
- **Hours:** Monday–Thursday 8:00 AM–5:00 PM; Friday by appointment; Saturday–Sunday closed
- **Services (confirmed):** Dental implants · Orthodontics (clear aligners, traditional braces, lingual braces) ·
  Porcelain veneers · Crowns & bridgework · Root canal treatment · Professional teeth cleanings ·
  Teeth whitening · Tooth extractions · Bonding · Fillings · Sealants (children) ·
  Periodontal (gum) disease therapy · TMJ/TMD treatment · Oral cancer screenings · Emergency dental care
- **Doctor bio (confirmed):** DDS, The University of Texas Health Science Center at San Antonio;
  California dental license #52801 (active); board certification July 2004 (~22 years in practice);
  general dentist with cosmetic focus, known for an artistic approach combining beauty and strength
  in restorations. Sole practitioner.
- **Public ratings:** ~3.5★ aggregate online with low review volume — DO NOT fabricate glowing
  review scores or quote real patient reviews by name.

## Required pages (multi-page static site, clean URLs)

1. `index.html` — Hero with practice name/phone/CTA, trust signals (22 yrs, DDS, Sacramento),
   services overview grid, testimonial preview (sample-marked), hours/address card, footer.
2. `services.html` — Full services grid with a detail card/section per confirmed service.
3. `about.html` — About the practice + Dr. Dezham bio (use confirmed bio facts only).
4. `testimonials.html` — Sample testimonials page. Every entry visibly labeled as a sample/placeholder.
5. `booking.html` — Appointment request form: name, phone, email, preferred date/time, service,
   message. Front-end only — validate with JS, show a confirmation screen on submit
   ("Request received — this is a demo, no real booking was made"). Do NOT post data anywhere.
6. `contact.html` — Address, phone, fax, hours table, embedded Google Map of
   "3009 K St, Sacramento, CA 95816" (use a standard Google Maps embed iframe), driving directions link.

## Technical requirements

- Pure static: HTML + CSS + vanilla JS only. No build step, no frameworks, no CDNs that
  require keys. (Google Fonts is allowed.)
- Mobile-responsive (test mentally at 375px and 1280px). Accessible: semantic HTML,
  alt text, labels on all inputs, focus styles, color contrast.
- Modern dental aesthetic: clean, trustworthy, calm palette (e.g. soft teal/blue + warm neutrals),
  generous whitespace, professional typography. NO stock-photo URLs — use CSS/SVG
  illustrations and decorative shapes instead.
- Every page: shared header nav + footer, sticky mobile CTA ("Call (916) 441-3311").
- A visible small "Demo mockup" badge in the footer.
- No external form endpoints, no analytics, no trackers.

## What NOT to do

- Do not invent business details (address, phone, hours, doctor credentials).
- Do not copy text from amiraclesmile.com verbatim.
- Do not fabricate patient names/reviews; mark all sample content as sample.
- Do not add anything that costs money or phones home.

## Deliverable check

When done, verify: all links resolve, no 404s between pages, form validates and shows the
demo confirmation, site renders at mobile + desktop widths. Serve locally with
`python3 -m http.server 8080` so it can be screenshotted for review.
