## AI Travel Planner

Next.js 14 + Firebase + OpenAI app that lets travelers generate, save, edit, and share itineraries. Email/password auth secures a dashboard, itineraries are stored under `users/{uid}/trips/{tripId}`, and a trip detail page supports copy/share/regenerate.

### Tech Stack
- Next.js 14 (App Router) + TypeScript + TailwindCSS
- Firebase Auth + Firestore
- OpenAI Chat Completions API
- Deploy-ready for Vercel

### Local Setup
1) Install dependencies
```bash
npm install
```
2) Create `.env.local` from the template
```bash
cp .env.example .env.local
# fill in values before running
```
3) Run the app
```bash
npm run dev
```
4) Quality gates used here
```bash
npm run lint
npm run build
```

### Required Environment Variables (`.env.local`)
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Setup
1) Create a Firebase project and a web app to obtain the config values above.  
2) Enable **Email/Password** in **Authentication → Sign-in method**.  
3) Create a Firestore database (production or test mode).  
4) Recommended security rules (limits access to the owning user):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### OpenAI Setup
1) Create an API key at https://platform.openai.com/.  
2) Add the key to `OPENAI_API_KEY` in `.env.local`.  
3) The `/api/generate` route calls `gpt-4o-mini` with the structured prompt from the requirements.

### App Behavior
- `/` login/signup (Firebase Auth).
- `/dashboard` protected view with itinerary generator (destination, budget, dates, traveler type), instant display, save/edit/delete trips, and saved trip list.
- `/trip/[id]` detail view showing itinerary, date range, cost notes, copy/share, and regenerate via OpenAI.
- Firestore paths: `users/{uid}/trips/{tripId}`.

### Folder Structure
```
app/
  api/generate/route.ts    // OpenAI itinerary API
  dashboard/page.tsx       // Generator + saved trips
  trip/[id]/page.tsx       // Trip detail page
  layout.tsx, globals.css
components/                // AuthForm, Navbar, ItineraryPreview, TripCard, ItineraryForm
hooks/                     // useAuth, useTrips
lib/                       // firebase.ts, openai.ts, types.ts
```

### Deployment (Vercel)
1) Push this folder to your Git repo.  
2) In Vercel, import the project and select this directory.  
3) Add the environment variables above (keep `OPENAI_API_KEY` as a Secret).  
4) Build command: `npm run build`; Output: `.next`.  
5) Deploy; previews use the same env vars when attached in Vercel.

### Mobile (Expo) — Native iOS/Android Client
Located in `mobile/`. This React Native (Expo Router) app consumes the same Firebase project and the `/api/generate` endpoint from your Next.js backend.
1) `cd mobile && npm install`
2) Copy `.env.example` to `.env` (or `.env.local`) and set:
   - `EXPO_PUBLIC_API_BASE_URL` (e.g., your deployed Next.js URL; for local, use your LAN IP reachable from the device)
   - The same Firebase web keys as the web app.
3) Start Expo: `npm start` (then press `i`/`a` or use Expo Go).  
4) Auth + Firestore behave the same: trips stored at `users/{uid}/trips/{tripId}`; generation hits `/api/generate`.  
5) Build binaries: use EAS (`npm install -g eas-cli`; `eas build -p ios` / `eas build -p android`) with the env vars configured in your EAS project.

### Optional Architecture Snapshot
- Client pages (App Router) render forms and UI (Tailwind).  
- `useAuth` subscribes to Firebase Auth client-side.  
- `useTrips` streams Firestore `users/{uid}/trips`.  
- `/api/generate` → OpenAI (Chat Completions) → returns itinerary text.  
- Trips saved/edited/deleted in Firestore with per-user isolation.
