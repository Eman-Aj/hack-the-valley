# MemoryLane

MemoryLane is a person-centered care handoff prototype for the Hack the Valley PointClickCare challenge. It connects verified family memories with structured care observations so the next caregiver can see useful personal context, understand what has changed, and leave a clear handoff.

> **Demo only:** The app uses fictional residents and illustrative rules. It is not a clinical tool, does not diagnose, and does not replace a qualified care professional's judgment.

## Start here

The Next.js app is in [`ht-v-app`](.). From that directory, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create a production build locally, run `npm run build`; to serve it, run `npm start`.

### Optional Gemini setup

Gemini powers AI-assisted memory drafting, answers grounded in approved memories, and generated read-aloud audio. Create `ht-v-app/.env.local` and add your server-side API key:

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
# Optional; defaults to the model selected in the API routes.
GEMINI_MODEL=your_available_model_id
```

Keep `.env.local` private and out of Git. In Vercel, add the same variables under the project's environment variables, then redeploy. The key is read by API routes and must not be exposed in browser code. Without a key, seeded/demo content and non-AI UI flows remain available; AI requests return a configuration or fallback response.

## Features

### Home and demo selection

- `/` is the landing page with two separate entry points: the care-team workspace and Nancy's family/senior memory experience.
- The project is a role-based demo, not an authenticated multi-user service. No user account or login is required.

### Care team dashboard — `/caregiver`

- Shows six fictional residents and rule-derived care summaries.
- Links to each resident's detail timeline and today's care brief.
- Calls out that care signals are prompts for human review, not diagnoses.

### Resident detail — `/caregiver/resident/[residentId]`

- Shows resident observation timelines and baseline references for meal intake, mobility assistance, and sleep disruption.
- Separates units/domains so the values are easy to interpret.
- Explains rule-based changes and lets a caregiver inspect the supporting observations behind a finding.
- Includes a combined observation form for recording multiple domains together.
- Supports adding notes and observations in the demo.

### Today's Care Brief — `/caregiver/resident/[residentId]/brief`

- Brings together verified personal context, recent structured observations, changes from baseline, and follow-up information.
- Keeps family memories separate from care observations and AI-generated suggestions.
- Lets a caregiver record an interaction, action, observed response, and follow-up for the next handoff.
- Includes a question-activity summary without saving the text of questions.

### Nancy's senior memory book — `/memories`

- A simplified, senior-friendly scrolling page of approved memories.
- Presents large memory photos and readable descriptions, with the focused memory growing as the person scrolls.
- Provides prominent, simple controls to ask about the current picture and read the memory aloud.
- Includes an optional question panel with suggested questions, typed questions, and speech-to-text input.
- Answers are intended to use family-approved memory details. Photo interpretation does not establish identities or relationships.

### Family memory upload and review — `/family-memories`

- Lets a family contributor select a photo, add a story and date, and request an AI-generated draft.
- Sends the image as Base64 to the server route for drafting; it does not upload to a separate image bucket.
- Keeps AI output as a draft for the family to review and confirm before it is marked verified or shown to the senior.
- Shows saved memory cards with source, verification, sharing, and context information.

### Ask My Story — `/ask-story`

- Lets a person ask about Nancy's approved memories by typing or voice input.
- Grounds answers in verified, permitted memory records and supports spoken responses.
- Includes a text fallback when speech features or AI are unavailable.

### Voice and audio

- Speech-to-text is provided through the `/api/transcribe-audio` server route.
- Read-aloud uses the `/api/text-to-speech` route and Gemini audio generation where configured, with browser speech support as available.
- `/test-voice` and `/tts-test` are development/demo pages for checking voice and audio behavior.

## API routes

| Route | Purpose |
| --- | --- |
| `POST /api/draft-memory` | Draft structured memory details from a family story and uploaded Base64 image. |
| `POST /api/ask-story` | Answer a question using the supplied verified memory context and record question activity. |
| `POST /api/care-brief` | Build a concise care brief from seeded resident data and relevant verified memories. |
| `POST /api/health-signals` | Calculate deterministic care signals for a resident's observations. |
| `POST /api/transcribe-audio` | Transcribe submitted audio using the configured server-side AI service. |
| `POST /api/text-to-speech` | Generate spoken audio for supplied text. |
| `POST /api/log-lapse` | Accept a reported lapse event for the demo. |

API inputs and AI-generated structured outputs are validated with Zod schemas in `lib/validation.ts`.

## Data and demo limitations

- Resident profiles and initial observations are seeded, fictional TypeScript data in `lib/mock-db.ts`.
- New memories, observations, notes, and question activity are currently saved in browser `localStorage` for the demo. This is device/browser-local and is not shared between users or caregivers.
- There is no database, persistent image storage bucket, account system, or access-control layer yet. Clearing browser storage removes locally saved demo changes.
- The deterministic rules engine in `lib/signal-engine.ts` compares structured observations with configured baselines. Its thresholds are illustrative and not clinically validated.
- Gemini can draft or retrieve personal context, but it does not determine care signals, diagnose a condition, identify people in photos, or verify facts. A family member must review and confirm suggested memory details.
- The project should use fictional data only. Do not enter real patient or other sensitive health information.

## Project layout

```text
ht-v-app/
├── app/
│   ├── api/                 # Next.js server routes for AI and demo actions
│   ├── caregiver/           # Care team dashboard, resident pages, care briefs
│   ├── memories/            # Senior-friendly memory book
│   ├── family-memories/     # Family upload and verification
│   └── ask-story/           # Ask My Story experience
├── components/              # Page sections and reusable UI
├── lib/                     # Types, seed data, validation, rules, storage, AI helpers
├── public/                  # Static assets
├── .env.local               # Local secrets; create this yourself, do not commit it
└── package.json
```

## Built with

- Next.js App Router, React, and TypeScript
- CSS in `app/globals.css`
- Google Gemini through `@google/genai`
- Zod for validation
- Browser storage and browser speech capabilities for demo interactions

## Deployment

The app can be deployed to Vercel from the repository. Set the Vercel **Root Directory** to `ht-v-app`, configure `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in the deployment environment, and deploy. Keep the lockfile committed with dependency changes so Vercel installs the same versions.
