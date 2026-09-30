# Court of Blades and Banners

The public home of the game while it's in production: an overview of where the game stands, the Knights roster, and the form Knights use to submit their signature ability. Knights sign in with their ORK account; the organizer reviews every entry on the Review page.

Built like FORK: **Vite + React**, **Firebase Auth + Firestore**, and a **Netlify function** for "Sign in with ORK". It has its own Firebase project and Netlify site.

## Pages

| Path | Who | What it does |
| --- | --- | --- |
| `/` | Everyone | Game overview, production status, how Knights take part, submission count |
| `/knights` | Everyone | All 29 Knights by order, with which ones have submitted |
| `/signin` | Knights, organizer | Sign in with ORK (organizer can also use Google) |
| `/ability` | Signed-in Knights | The ten-question form with a live datasheet preview; save a draft or submit, edit any time |
| `/admin` | Organizer | Every entry, review status, private notes, link requests, CSV/JSON export |

Edit `src/data/content.js` to update the production status list on the Overview page.

## How sign-in works

1. The Knight enters their ORK username and password. The browser sends them to `/api/ork-login` (POST body only).
2. The function calls ORK `Authorization/Authorize`, then `Player/GetPlayer` for the persona, then `Authorization/DestroySession`. The password is never stored or logged.
3. It matches the player to `shared/knights.js`, first by ORK number, then by persona name.
4. It mints a Firebase custom token for uid `ork_<MundaneId>` with claims `orkId`, `persona`, `knightSlug` and `admin`, and the browser signs in with it.
5. A player who doesn't match (for example after a persona change) can ask to be linked. The request shows on the Review page, where you pick their Knight.

Failed logins are throttled: 5 per username and 20 per IP in 15 minutes (Netlify Blobs store `ork-login`), because the ORK has no lockout of its own.

**Check before launch:** the ORK numbers in `shared/knights.js` were read from the ORK Knights report. Spot-check a few against the ORK profiles.

## Data (Firestore)

| Collection | Contents | Who can read / write |
| --- | --- | --- |
| `responses/{slug}` | One Knight's answers, status, and your review fields | The Knight and the organizer; the Knight can't change `reviewStatus` or `adminNotes` |
| `progress/{slug}` | `{submitted, at}` only | Anyone reads; the Knight writes |
| `links/{uid}` | Manual account-to-Knight links | Organizer writes |
| `requests/{uid}` | Link requests from unmatched players | The player writes theirs; organizer reads and clears |

The organizer is any ORK account in `ADMIN_ORK_IDS`, or the Google account antifreke@gmail.com (set in `firestore.rules` and `src/lib/session.jsx`).

## Setup

1. **Firebase**
    1. Create a new Firebase project (for example `courtofblades`).
    2. Add a Web app and copy its config into the `VITE_FB_*` settings.
    3. Create a Firestore database (production mode).
    4. Authentication: turn on **Google** (for the organizer). Custom-token sign-in needs no switch.
    5. Add your Netlify domain under Authentication → Settings → Authorized domains.
    6. Project settings → Service accounts → Generate new private key. Use its `client_email` and `private_key` for the function.
    7. Publish the rules: paste `firestore.rules` into Firestore → Rules, or run `npx firebase-tools deploy --only firestore:rules --project <id>`.
2. **Netlify:** create a site from the GitHub repo. Add these environment variables (see `.env.example`):
    - Builds scope: `VITE_FB_API_KEY`, `VITE_FB_AUTH_DOMAIN`, `VITE_FB_PROJECT_ID`, `VITE_FB_STORAGE_BUCKET`, `VITE_FB_MESSAGING_SENDER_ID`, `VITE_FB_APP_ID`, and optionally `VITE_RULEBOOK_URL`.
    - Functions scope, marked secret: `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_ORK_IDS` (your ORK number), `ORK_API_KEY`.
    - `ORK_API_KEY_HEADER`: the header name FORK uses to send its key. Check FORK's `netlify/functions/lib/orkClient.js`, or copy that file over `netlify/functions/lib/orkClient.js` here (it exports the same `orkPost`).
    - Ask the ORK team for a key with client name "Court of Blades/1.0", or reuse FORK's.
3. **Deploy:** push to GitHub. Netlify builds on push. The footer shows `build <UTC time>` so you can confirm which build is live.

> **Deploy lesson from FORK:** replace every file from the zip (`git add -A`). With GitHub's web upload, drag whole folders. A partial upload builds old code without any error.

## Tests

- `npm test`: sign-in function tests (token verifies with the public key, password never in a URL, session always destroyed, roster matching, throttle blocks the 6th attempt, origin check).
- `npm run test:rules`: Firestore rules against the emulator (needs Java). These couldn't run where this was built, so run them once before launch.

## Local development

```
npm install
cp .env.example .env   # fill in the VITE_FB_* values
npx netlify dev        # site plus the /api/ork-login function on http://localhost:8888
```
