# **CARETHREAD — FINAL TEAM BUILD PLAN**

### **Hack the Valley 11 · PointClickCare Challenge: Catch It Early**

**THE CHANGE FROM OUR PREVIOUS PLAN — READ THIS FIRST**

We are refining CareThread from an **AI dementia diary with voice chat and symptom tracking** into a **personalized care-handoff system powered by verified family memories and structured care observations**.

| Previous framing | Final framing |
| ----- | ----- |
| A digital diary that remembers someone's life | A care system that makes the right personal context available to the next caregiver |
| Three separate features: diary, AI companion and symptom tracking | One connected Memory-to-Care workflow |
| AI summarizes memories and monitors symptoms | AI drafts and retrieves verified personal context; deterministic code identifies changes in recorded care observations |
| A collection of memories and health metrics | A personalized, source-linked briefing for the next care visit |

**Our defining feature is the Care Brief.** Before a caregiver sees Nancy, CareThread compiles her verified personal context, relevant recent observations, changes from her usual baseline and outstanding follow-up items into one short briefing.

The goal is not to build the most features. It is to demonstrate one complete, useful workflow that existing fragmented systems make difficult.

---

## **1\. PRODUCT DEFINITION**

**Name:** CareThread

**Tagline:** Don't make the next caregiver start from zero.

**Target:** PointClickCare — Catch It Early; additionally, Healthcare Innovation & Well-being if eligible.

### **The problem**

People living with dementia may receive care from family members, nurses, personal support workers and home-care providers across different shifts. Important information about their relationships, preferences, recent experiences and daily functioning can be scattered across conversations, photos and care notes.

A family member knows something important about Nancy. A care worker records a change in her eating or mobility. The next caregiver may not have both pieces of context when preparing for the visit.

### **The solution**

CareThread connects three experiences:

1. **Family Memories:** Families contribute photographs, stories and personal information. AI drafts structured entries; an authorized family member verifies the details.  
2. **Ask My Story:** Nancy can ask questions about approved memories using a simple, voice-friendly interface. Answers are grounded in confirmed information, not invented memories.  
3. **Care Brief:** The next caregiver receives a concise briefing containing relevant verified personal context, recent structured observations, changes from baseline and follow-up needs.

After a visit, the caregiver can record what happened and leave an updated handoff.

### **Our actual innovation**

The innovation we want to demonstrate is **visit-specific compilation of personal context and care observations into an actionable handoff**.

We are not claiming that digital memory books, voice assistants or symptom tracking are individually new. Existing products already offer versions of those features. Our differentiation must come from the connected workflow, source attribution, separation of personal memories from clinical observations, and useful handoffs between family and care teams.

---

## **2\. THE EXACT DEMO SCENARIO**

We will use one fictional resident throughout: **Nancy Wilson**.

1. Nancy's son uploads a photograph from the day Nancy met her new grandson, Theo.  
2. Gemini proposes a caption and extracts possible details. Her son confirms the names, relationship, date and story.  
3. Nancy asks, “Who is the baby in this picture?” CareThread answers from the verified entry and can read the answer aloud.  
4. Separately, the care team has recorded several days of lower meal intake and increased mobility assistance.  
5. CareThread detects the configured change pattern, displays the supporting observations and requests human review.  
6. The next caregiver opens the Care Brief, sees Nancy's relevant personal context and care observations separately, records the follow-up and leaves an updated handoff.

**Important:** We must never imply that meeting Theo caused Nancy's health changes. Family memories provide personal context; only structured, time-stamped care observations feed the care-signal rules.

---

## **3\. MVP — BUILD ONLY THESE THREE SCREENS**

### **Screen A: Family Memories**

Required:

* Add a photograph and short story.  
* Enter or confirm the date, names, relationships and description.  
* Generate a draft caption or structured memory with Gemini.  
* Mark the entry as verified only after confirmation.  
* Display the saved memory in a timeline or gallery.

Show the source and verification status of every entry.

### **Screen B: Ask My Story**

Required:

* Display approved memories.  
* Allow a person to type a question about a memory.  
* Return an answer grounded in those records.  
* Offer read-aloud using browser text-to-speech.

Voice input is optional. If speech recognition proves unreliable, typed questions plus spoken answers still demonstrate the voice-friendly interaction.

If an answer cannot be supported by the approved records, the assistant should say that it does not know rather than fabricate a story.

### **Screen C: Today's Care Brief**

This is our signature screen.

Required sections:

* **Personal context:** verified information that may help the caregiver connect with Nancy.  
* **Recent observations:** recorded meal intake, mobility assistance and sleep disruption.  
* **What's changed:** the specific observations that deviate from Nancy's baseline.  
* **Review needed:** a transparent signal explaining why the configured rules suggest human review.  
* **Follow-up:** a way for the caregiver to record the observation or action taken and update the handoff.

Keep personal memories, care observations and AI-generated suggestions visually distinct.

---

## **4\. TECH STACK — KEEP IT SIMPLE**

| Tool | Purpose |
| ----- | ----- |
| Next.js \+ React \+ TypeScript | Web application and API routes |
| Tailwind CSS | Interface styling |
| Lucide React | Icons |
| Recharts | Care-observation timeline |
| Zod | Input and AI-response validation |
| Google Gemini API via `@google/genai` | Draft memory descriptions and answer questions from approved records |
| TypeScript rules engine | Compare observations with the resident's baseline |
| Seeded TypeScript data \+ React state | Reproducible demo residents and observations |
| Browser text-to-speech | Read approved answers aloud |

Do not add a database, remote healthcare integration, complex authentication, Tiger Data, Backboard or a large analytics dashboard during this MVP. They are not necessary to prove the concept.

### **Setup commands**

Run these only after the permitted hacking window opens:

npx create-next-app@latest carethread \--typescript \--tailwind \--eslint \--app \--src-dir \--import-alias "@/\*" \--use-npm

cd carethread

npm install @google/genai recharts lucide-react zod

npm run dev

Check that the app opens at `http://localhost:3000` before modifying the scaffold.

Create `.env.local` for the Gemini configuration:

GEMINI\_API\_KEY=your\_api\_key\_here  
GEMINI\_MODEL=your\_available\_model\_id

Use the API key only in server-side code. Never commit it to GitHub.

If Gemini fails, manual entry and the seeded demo must continue to work.

### **Repository structure**

carethread/  
└── src/  
    ├── app/  
    │   ├── api/  
    │   │   ├── draft-memory/route.ts  
    │   │   └── ask-story/route.ts  
    │   ├── page.tsx  
    │   ├── layout.tsx  
    │   └── globals.css  
    ├── components/  
    │   ├── AppShell.tsx  
    │   ├── FamilyMemoryForm.tsx  
    │   ├── MemoryGallery.tsx  
    │   ├── AskMyStory.tsx  
    │   ├── CareBrief.tsx  
    │   ├── ResidentTimeline.tsx  
    │   └── FollowUpForm.tsx  
    └── lib/  
        ├── types.ts  
        ├── demo-data.ts  
        ├── validation.ts  
        ├── memory-retrieval.ts  
        ├── signal-engine.ts  
        └── storage.ts

---

## **5\. SHARED DATA CONTRACTS**

Agree on these structures before splitting work across the team.

**Resident**

* `id`  
* `displayName`  
* `preferredName`  
* `baseline`  
* `sharingSettings`

**MemoryEntry**

* `id`  
* `residentId`  
* `createdAt`  
* `eventDate`  
* `image`  
* `familyStory`  
* `proposedCaption`  
* `verifiedFacts`  
* `verificationStatus`  
* `contributorId`  
* `sharingPermissions`

**CareObservation**

* `id`  
* `residentId`  
* `timestamp`  
* `signalType`  
* `value`  
* `unit`  
* `sourceRole`  
* `sourceNote`  
* `reviewStatus`

**CareSignal**

* `id`  
* `residentId`  
* `status`  
* `triggeringObservationIds`  
* `explanation`  
* `reviewStatus`

**InteractionOutcome**

* `id`  
* `residentId`  
* `timestamp`  
* `caregiverId`  
* `actionRecorded`  
* `observedResponse`  
* `followUpNotes`

Use fictional names and data throughout. A memory's verification status and sharing permissions must be explicit, not inferred by AI.

---

## **6\. CARE-SIGNAL RULES**

The care signal must use deterministic code, not an LLM-generated medical assessment.

For the MVP, track three structured domains:

* Meal intake as a percentage.  
* Mobility assistance on a defined 0–3 scale.  
* Sleep disruption on a defined 0–5 scale.

Create approximately 10–14 days of observations for Nancy and five other fictional residents. Define illustrative thresholds in code and label them as demonstration rules, not clinically validated cutoffs.

The engine must distinguish:

* `needs_review`  
* `monitor`  
* `no_pattern_detected`  
* `insufficient_data`

The review signal should identify the exact observations that caused it. Missing data must not be treated as normal.

Do not calculate a fabricated probability of a fall, predict dementia progression, recommend medication changes or claim to prevent emergencies. A signal is a prompt for qualified human review.

---

## **7\. HOW GEMINI SHOULD WORK**

Gemini has two jobs, nothing more.

**Job 1: Draft a memory**

* Input: a fictional image and family-provided context.  
* Output: a proposed caption and structured fields.  
* The family confirms factual details.  
* Only confirmed details become trusted memory records.

**Job 2: Answer a question about approved memories**

* Retrieve relevant verified entries.  
* Give the model only the information it needs.  
* Require the response to be grounded in that information.  
* If the answer is not supported, say so.

Do not let the model infer a person's identity from an image, manufacture family relationships or turn its interpretation of a photo into a clinical fact.

The care-signal engine must remain fully functional when Gemini is unavailable.

---

## **8\. TEAM DIVISION**

### **Person 1 — Technical lead and integration**

Owns the app scaffold, shared data contracts, navigation, integration and final end-to-end workflow.

### **Person 2 — Family Memories**

Owns photo upload, memory forms, Gemini draft generation, verification and gallery.

### **Person 3 — Care Signals**

Owns the synthetic observation histories, baseline calculations, deterministic rules, resident timeline and human-review signal.

### **Person 4 — Care Brief and demo**

Owns Ask My Story, the Care Brief layout, follow-up recording, QA and presentation. Helps with integration when the UI is stable.

With three members, combine the technical lead and one UI role.

**All team members must agree on the shared data contracts before building their components.** Use small Git commits and integrate early. Nobody should create a separate competing version of the main application.

---

## **9\. EXECUTION TIMELINE**

Assuming the stricter Discord hacking window of Friday, October 16 at 10 PM through Sunday, October 18 at 8 AM ET:

| Time | Deliverable |
| ----- | ----- |
| Fri 10 PM–midnight | Scaffold, shared types, repository and seeded Nancy profile |
| Sat midnight–4 AM | Family memory form, verification and gallery |
| Sat 4–7 AM | Ask My Story with grounded answers and read-aloud |
| Sat 7–10 AM | Structured observations, baseline rules and review signal |
| Sat 10 AM–1 PM | Care Brief and follow-up recording |
| Sat 1–3 PM | Integration, UI consistency and bug fixes |
| Sat 3–5 PM | End-to-end testing and Devpost preparation |
| Sat 5–6 PM | Submit initial Devpost entry ahead of the 9 PM deadline |
| Sat 6–9 PM | Fixes and contingency buffer |
| Sat 9 PM–Sun 3 AM | Regression testing and demo refinement |
| Sun 3–5 AM | Full rehearsal and clean application restart |
| Sun 5–7:15 AM | Final fixes and submission |
| Sun 7:15–8 AM | Emergency buffer |

**Schedule warning:** The Discord message you shared says the coding window starts at 10 PM, but the official Devpost rules currently say 8 PM Friday, and its dates page also lists an 8 AM Sunday cutoff. Confirm the start time with an organizer. Until clarified, don't create the actual project code or design assets before the later 10 PM start.

---

## **10\. DEFINITION OF DONE**

Before submission, verify that:

*  A family member can upload a photo and save a verified memory.  
*  AI-generated memory details remain drafts until verified.  
*  Ask My Story answers from approved memories and admits when it doesn't know.  
*  Browser read-aloud works, or a clear text fallback is available.  
*  Adding a care observation updates the resident's timeline.  
*  The rules engine detects the seeded change patterns and explains why.  
*  Missing data is treated as insufficient evidence.  
*  Today's Care Brief separates personal context from clinical observations.  
*  A caregiver can record follow-up and update the handoff.  
*  The app starts cleanly with reproducible seeded data.  
*  Gemini failure does not break the core demo.  
*  No secrets or real patient information appear in the repository.  
*  The full demonstration works without editing code during the pitch.

---

## **11\. THE FOUR-MINUTE JUDGING DEMO**

**0:00–0:35 — The problem.** Introduce Nancy and explain how family knowledge and care observations can be disconnected.

**0:35–1:20 — Create the memory.** Upload the photograph of Nancy meeting Theo, show the AI draft and verify the family details.

**1:20–1:50 — Ask My Story.** Ask who the baby is and show the grounded answer being read aloud.

**1:50–2:45 — Care Brief.** Display the recent structured observations, the baseline change and the exact evidence behind the human-review signal.

**2:45–3:30 — Complete the loop.** Record the caregiver's follow-up and show how that update appears in the care handoff.

**3:30–4:00 — Close.** Explain how CareThread preserves personal context while helping caregivers notice and review changes in everyday observations.

### **The pitch line**

“CareThread helps care teams remember the person while noticing what has changed.”

---

## **FINAL DECISION**

Build CareThread around the **personalized Care Brief**, not a general AI diary.

Family memories provide verified personal context. Ask My Story makes those memories accessible. Structured observations support early recognition. The Care Brief brings the relevant information together for the next caregiver, and follow-up keeps the record current.

This is the focused version to implement. Do not add more features unless the complete family-to-caregiver-to-handoff workflow already works reliably.

