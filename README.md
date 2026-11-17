# CFMR Webinar Series — GitHub Pages website

This is a static HTML/CSS/JavaScript website. The home page is `index.html` and every webinar has a folder in `sessions/`. There is no build process, CMS, or database.

## Directory layout

```text
index.html                         Homepage
content/about.txt                 SHARED About the webinar / About CFMR content
assets/css/theme.css              All eight official colors
assets/css/site.css               Design shared by every page
assets/css/session.css            Session-specific presentation
assets/images/webinar-logo.png    Webinar logo (shared)
assets/images/cfmr-logo.svg       CFMR association logo (shared)
assets/images/organizers/         Optional organizer portraits (shared)
assets/js/shared-about.js        Shared About-section renderer
assets/js/session-data.js         Plain-text loader for sessions and About content
assets/js/home-sessions.js      Homepage session listings
assets/js/session-page.js         Session details and speaker profiles
assets/js/config.js               Calendar subscription URLs
sessions/programme.txt            Ordering of upcoming and previous sessions
sessions/<session-slug>/
    index.html                     Session page template
    session.txt                    Session details, speaker bios, abstracts
    speaker_01.jpg                 Speaker pictures for that session only
    speaker_02.jpg
    session_01.ics                 Optional event download
```

## Change About the webinar and About CFMR everywhere at once

**Edit only `content/about.txt`.** The homepage and all individual session pages fetch this same file and render the same two sections in the same order and layout. They also share the same CSS. You can change the webinar description, organizer names, affiliations, biographies, portraits, newsletter and YouTube links, CFMR text, and CFMR / membership URLs.

The file has these blocks:

```ini
[webinar]
description:
  Description shown on every page.
newsletter_url: https://your-newsletter-subscription-page.example/
youtube_url: https://www.youtube.com/@your-channel

[organizer1]
name: First organizer
institution: Laboratory / institution
picture_name: organizer_01.jpg
short_bio:
  Short organizer bio.

[organizer2]
name: Second organizer
institution: Laboratory / institution
picture_name: organizer_02.jpg
short_bio:
  Short organizer bio.

[cfmr]
paragraph1:
  First paragraph on the association.
paragraph2:
  Second paragraph.
paragraph3:
  Membership information.
website_url: https://www.cfmr-roches.org/
membership_url: https://www.cfmr-roches.org/user/register
```

Put organizer pictures in `assets/images/organizers/` using the **filename only** in `picture_name`. The files are optional: until you supply pictures, neutral “Photo to add” placeholders appear (no fictional portraits). The webinar and CFMR logos already reside in `assets/images/` and do not need to be copied into session folders. Both logos are displayed at 148 pixels wide in their respective About sections. The webinar section has a warm, light background with the heading **About the webinar** below the logo and two buttons beneath the organizers: rust “Subscribe to the newsletter” and white “Watch the previous sessions on YouTube”. The About CFMR section uses the same button styles: rust “Visit the CFMR website” and white “Become a CFMR member”. **The two link fields are initially blank:** until you enter real HTTPS addresses for `newsletter_url` and `youtube_url`, the buttons are visible but disabled. Do not publish them as working subscription links before configuring the destinations.

The shared About sections appear directly below the Previous session on the homepage and below the speakers on each session page, replacing the old “About the series” text. The navigation links point to the appropriate section on each page.

## Update an individual webinar

Edit `sessions/<session-slug>/session.txt` and add speaker portraits and `.ics` files in that **same session folder**. Keep the current `[session]`, `[overview]` and `[speakerN]` data structure. The session listings on the homepage update from the same data. To reorder/add sessions, edit `sessions/programme.txt`. Folder names can include letters, numbers, hyphens and underscores (e.g. `session_01`). Multi-line values in `session.txt` must indent their continuation lines by two spaces. When the `[previous]` section is empty, the homepage displays: “Future webinars will be shared here with the online recording of the session.” The session overview is rendered as one full-width paragraph: the question in bold, followed immediately by the description. No HTML editing is needed for these fields.

## Colors and calendar

All official CFMR colors remain centralized in `assets/css/theme.css`. Red is reserved for social media. Series-wide calendar subscription links are configured in `assets/js/config.js` and are separate from individual session `.ics` files.

## Preview locally at port 8000

Open Terminal **in the folder containing this `index.html`** and run:

```bash
python3 -m http.server 8000
```

Visit <http://localhost:8000/>. Keep the server open; it serves edits as soon as you save files. If the browser shows an older version, press **Command + Shift + R** on Mac. If another server is already using 8000, stop it first with **Control + C** in its terminal.

Do not open `index.html` directly from Finder; browsers block the `.txt` fetches with `file://` URLs.

## Publish

Upload the **contents** of the project folder, not the ZIP itself, to the root of your GitHub repository. In Settings → Pages, select deploy from branch `main`, folder `/(root)`. Include `content/about.txt` and `assets/js/shared-about.js` when updating an existing site; both the homepage and session pages use them.

**Before publishing:** Replace example sessions, speaker portraits, organizer names and bios, and calendar links with confirmed details.

## Buttons in both shared About sections

Both sections use matching buttons, controlled by `content/about.txt`:

- `[webinar] newsletter_url:` — rust primary button, **Subscribe to the newsletter**.
- `[webinar] youtube_url:` — white secondary button, **Watch the previous sessions on YouTube**.
- `[cfmr] website_url:` — rust primary button, **Visit the CFMR website**.
- `[cfmr] membership_url:` — white secondary button, **Become a CFMR member**.

The rust color is `#C56F45` from `assets/css/theme.css`. URL fields left empty are shown as disabled rather than opening a guessed link.

The homepage and all session pages use `assets/js/shared-about.js`.

## Current visual styling

Both About sections have the shared warm-beige `--rust-wash` background from `assets/css/theme.css`. The “About the webinar” heading is split after “About the”; the second line reads “webinar”. The About content remains centralized in `content/about.txt`.

The ZIP is deployment-clean: local preview launchers and unused placeholder readme files are excluded. For local testing, from the extracted folder run `python3 -m http.server 8000`, then open `http://localhost:8000/`.
