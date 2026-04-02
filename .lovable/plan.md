
# InnovaHack Chapter 1 — Landing Page + Registration

## Design System
- **Style**: Editorial / Quirky Orbit inspired — bold uppercase typography, newspaper-grid layouts, bordered cards, black & white with accent colors (electric blue, deep purple, hot pink)
- **Typography**: Inter font, heavy use of bold/black weights, uppercase headings
- **Cards**: Bordered with colored accent frames (like the reference images)
- **Layout**: Asymmetric masonry-style grids, generous spacing

## Landing Page Sections
1. **Hero**: Giant bold "INNOVAHACK CHAPTER 1" headline (Quirky Orbit style), subtitle "HACK. GET HIRED. GET FUNDED.", two CTA buttons (Register Now, Partner With Us)
2. **Navigation Bar**: Editorial style with bordered layout — HOME, ABOUT, TRACKS, SPONSORS, FAQ links + social links row (like reference)
3. **Category Tags Row**: Bordered pill tags for domains — Gen AI, FinTech, HealthTech, Blockchain, Startup Track (with counts)
4. **Credibility Stats**: Bold numbers in editorial grid — 10,000+ Applicants, Top 1% Selection, 30 Hour Hackathon, Hiring + Startup Opportunities
5. **Domains Section**: Asymmetric grid cards with colored accent borders (like Quirky Orbit article cards), each showing domain name, icon, and brief description
6. **Process Flow**: Step-based editorial layout — Apply → Screening → Elite Hack → Demo Day → Opportunities
7. **Outcomes Section**: Cards highlighting hiring exposure, startup incubation, investor access, national recognition
8. **Sponsors & Partners**: Category-based grid (Title Sponsor, Domain Sponsors, Hiring Partners, etc.) with placeholder slots
9. **Fee Justification**: Clean section explaining ₹100 commitment fee
10. **FAQ Section**: Accordion-style Q&A
11. **Final CTA**: "Apply Now – Limited Seats" with bold typography

## Registration Flow (Multi-Step Form)
- Step 1: Personal Details (Name, Email, Phone)
- Step 2: Academic/Professional Info (College/Company, Year/Experience)
- Step 3: Skills & Links (multi-select skills, GitHub, LinkedIn, Resume upload)
- Step 4: Participation Type (Solo/Duo/Trio/Quad, team details)
- Step 5: Confirmation page (no payment for now)
- Progress indicator at top

## Pages & Routes
- `/` — Landing page
- `/register` — Multi-step registration form
- `/about`, `/tracks`, `/sponsors`, `/faq` — Informational pages (basic structure)

## Key Implementation Details
- All static/client-side for now (no Supabase yet)
- Framer Motion for smooth animations
- Mobile-responsive editorial grid
- Form data stored in local state (ready for Supabase integration later)
- Bold, premium copy following the brief's tone guidelines
