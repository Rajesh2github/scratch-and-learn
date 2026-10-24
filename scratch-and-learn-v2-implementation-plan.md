# Scratch and Learn 2.0 — Implementation Plan

**Product:** Scratch and Learn  
**Release:** Version 2.0  
**Platform:** Android, built with Expo / React Native  
**Target age:** 3–6 years  
**Architecture:** Offline-first, privacy-first  
**Scope:** Major redesign and expansion of the existing published app

---

## 1. Executive Summary

Scratch and Learn 2.0 will evolve the existing app into a playful early-learning experience for children aged 3–6. The update will introduce a redesigned learning hub, math activities, logic puzzles, and word-pronunciation games while preserving useful existing activities.

The app should remain usable without an account, backend, or internet connection for core learning activities. Core content and audio should ship with the app. Optional progress and preferences can be stored locally, with no unnecessary collection of personal information.

**Product promise:** *Learn something new every day, one little game at a time.*

### Product principles

- Offline-first: core games and required audio work in airplane mode.
- Privacy-first: no login and no unnecessary collection of personal information.
- Child-friendly: simple instructions, large tap targets, supportive feedback, and short activities.
- Reusable: add new games through shared components and data-driven content.
- Safe migration: preserve the current application ID and existing functionality.
- Accessible: do not rely only on color, sound, or dragging to communicate instructions.

---

## 2. Goals and Non-Goals

### Goals

1. Redesign the home screen into a clear learning hub.
2. Add math games for counting, addition, and subtraction.
3. Add logic games for matching, odd-one-out, and patterns.
4. Add word-learning activities with prerecorded pronunciation audio.
5. Create reusable game-session, question, answer, feedback, and results components.
6. Make core content and audio available offline.
7. Provide optional local progress, stars, and preferences.
8. Test the release thoroughly and comply with applicable Google Play requirements for children.

### Non-goals for Version 2.0

- User accounts, cloud sync, or a backend.
- Microphone-based speech recognition or speech scoring.
- Online question downloads or AI-generated questions at runtime.
- Ads, social features, leaderboards, or child-to-child communication.
- A full curriculum or claims of formal educational assessment.

These can be reconsidered in later releases only if there is a clear need and appropriate privacy, safety, and product review.

---

## 3. Target Age and Learning Outcomes

Age bands are starting points, not strict developmental expectations. Parents should be able to select a comfortable difficulty.

| Age | Suggested activities |
|---|---|
| 3–4 | Recognize colors and shapes, count 1–5, match pictures, identify familiar sounds and objects |
| 4–5 | Count 1–10, compare quantities, try simple addition, complete easy patterns, identify beginning sounds |
| 5–6 | Count further, introductory addition and subtraction, categorize objects, solve more challenging patterns, recognize simple words |

Start with visual and concrete examples. Introduce abstract numerals and symbols gradually.

---

## 4. Feature Priorities

**P0:** Required for Version 2.0 launch  
**P1:** Include if time and testing capacity permit  
**P2:** Later enhancement

| Priority | Feature | Scope |
|---|---|---|
| P0 | Home and navigation redesign | Learning hub, category screens, consistent back navigation |
| P0 | Shared game shell | Instructions, question, answers, feedback, progress, completion |
| P0 | Math: counting | Count pictured objects and choose the number |
| P0 | Math: addition | Introductory picture-based addition |
| P0 | Math: subtraction | Introductory picture-based subtraction |
| P0 | Logic: picture matching | Match identical or related pictures |
| P0 | Logic: odd-one-out | Identify the clearly different item |
| P0 | Logic: patterns | Complete simple visual sequences |
| P0 | Words: tap and hear | Play a prerecorded word pronunciation |
| P0 | Words: listen and choose | Hear a word and select the matching picture |
| P0 | Offline support | Bundled content, images, and core audio |
| P0 | Content validation | Validate answers, asset references, and puzzle ambiguity |
| P1 | Local progress | Save basic completion and stars on-device |
| P1 | Rewards | Encouraging stars, badges, and completion celebrations |
| P1 | Difficulty selection | Easy, medium, and challenging settings |
| P1 | Parent/settings area | Sound settings, optional progress summary, reset |
| P2 | Sorting and shadow puzzles | More visual logic activities |
| P2 | Early multiplication and sharing | Equal groups and simple sharing concepts |
| P2 | Additional languages | More recorded words and instructions |
| P2 | Speech practice | Only after feasibility and privacy review |

### Initial content targets

These are planning targets, not fixed requirements:

- Math: 3 game types with approximately 60 validated question configurations.
- Logic: 3 game types with approximately 60 validated puzzle configurations.
- Words: 2–3 game types with approximately 100 picture-word entries.
- Audio: every launch word and essential spoken instruction.
- Rewards: a small reusable set of animations, stars, and badges.

Use reusable templates to create variations. Every generated question must have a valid answer and, where relevant, exactly one defensible correct choice.

---

## 5. Navigation and Screen Plan

Recommended flow:

1. App launch
2. Home / Learning Hub
3. Category selection
4. Game selection or difficulty selection
5. Game session
6. Results and rewards
7. Return home or play again

### S01 — Home / Learning Hub

- Friendly mascot and short welcome.
- Large category cards: Math, Logic, Words, and existing activities.
- Visible sound control.
- Optional “Continue learning” indicator.
- Keep the main categories easy to reach without complex menus.

### S02 — Category Selection

- Illustrated activity cards with short labels.
- Optional difficulty selection.
- Clear back navigation.
- No long text instructions.

### S03 — Shared Game Screen

- Short written and/or spoken instruction.
- Central illustration or interaction area.
- Two to four answer options depending on difficulty.
- Replay-audio control where relevant.
- Friendly correct-answer and retry feedback.
- Visible exit and sound controls.

### S04 — Results and Celebration

- Celebrate finishing, not only perfect scores.
- Show stars earned and a simple summary.
- Offer “Play Again” and “Home”.
- No forced signup, sharing, or advertising.

### S05 — Parent / Settings Area

- Sound and speech preferences.
- Optional local progress summary.
- Reset progress with confirmation.
- Privacy policy and app information.
- Use an appropriate parent gate for potentially destructive or external actions, without collecting parent identity.

---

## 6. Game Specifications

### 6.1 Math Adventure

#### Game A: Count the Objects — P0

Example: show five apples and ask, “How many apples can you see?”

- Ages 3–4: quantities 1–5.
- Ages 4–5: quantities 1–10.
- Ages 5–6: larger quantities where suitable.
- Show two to four answer choices.
- Offer a gentle counting hint after an incorrect answer.

#### Game B: Add the Objects — P0

Example: show two apples and three apples, combine the groups, then ask for the total.

- Start with small quantities.
- Animate objects joining together.
- Progress from pictures to numerals as appropriate.
- Keep answer choices distinct and valid.

#### Game C: Take Some Away — P0

Example: show five birds; two fly away. Ask how many remain.

- Use visual subtraction first.
- Avoid negative results in introductory levels.
- Introduce number-only questions only at higher difficulty.

#### Game D: Equal Groups and Sharing — P1/P2

Examples: two plates with three cookies each, or sharing six toys equally between two animals.

- Teach repeated groups and equal sharing visually.
- Do not begin with abstract multiplication or division equations.
- Add only after the core games are stable.

### 6.2 Logic Puzzles

| Game | Example | Skill |
|---|---|---|
| Picture Match — P0 | Match two identical pictures | Visual recognition |
| Odd One Out — P0 | Three fruits and one vehicle | Categorization |
| What Comes Next? — P0 | Red, blue, red, blue, ? | Pattern recognition |
| Shadow Match — P2 | Match an object to its silhouette | Shape recognition |
| Sort the Objects — P2 | Group animals and food | Classification |

Puzzle content must avoid ambiguity. For odd-one-out questions, use one obvious distinguishing property rather than multiple plausible interpretations.

### 6.3 Word Learning

#### Game A: Tap and Hear — P0

- Show a familiar object and its word.
- Play a prerecorded pronunciation when the child taps the speaker.
- Include replay controls.
- Start with familiar animals, objects, colors, and fruits.

#### Game B: Listen and Choose — P0

- Play a word such as “cat”.
- Show two to four picture choices.
- Let the child select the matching picture.
- Allow replay at any time.

#### Game C: Beginning Sounds — P1

- Introduce a letter and its sound with a familiar image.
- Distinguish letter names from letter sounds.
- Use age-appropriate, carefully reviewed audio and content.

### Audio strategy

Bundle short, licensed audio files for all core words and essential instructions. This provides consistent pronunciation and offline playback. Text-to-speech may be considered as an optional fallback only after checking language quality, device support, and offline behavior.

Do not add microphone-based speech scoring in Version 2.0.

---

## 7. Recommended Technical Architecture

### Architecture principles

- Separate content, game logic, presentation, audio, and persistence.
- Keep math and puzzle algorithms pure and independently testable.
- Use a common game-session lifecycle.
- Register games through configuration rather than adding screen-specific conditionals everywhere.
- Bundle content and asset references with the application.
- Adapt the existing project structure instead of replacing it wholesale.

### Proposed folder structure

Adapt names to the current repository after auditing it.

```text
src/
├── app/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CategoryScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── navigation/
├── features/
│   ├── math/
│   │   ├── engines/
│   │   ├── games/
│   │   └── content/
│   ├── logic/
│   │   ├── engines/
│   │   ├── games/
│   │   └── content/
│   └── words/
│       ├── games/
│       ├── content/
│       └── audio/
├── components/
│   ├── GameShell.tsx
│   ├── QuestionPrompt.tsx
│   ├── AnswerGrid.tsx
│   ├── PictureCard.tsx
│   ├── AudioButton.tsx
│   ├── FeedbackOverlay.tsx
│   └── ProgressIndicator.tsx
├── domain/
│   ├── gameTypes.ts
│   ├── questionValidation.ts
│   ├── scoring.ts
│   └── difficulty.ts
├── services/
│   ├── audioService.ts
│   └── progressRepository.ts
├── storage/
│   ├── preferencesStore.ts
│   └── progressStore.ts
├── content/
│   ├── games.json
│   ├── math.json
│   ├── logic.json
│   └── words.json
├── assets/
│   ├── images/
│   ├── audio/
│   └── animations/
└── tests/
```

If the project uses Expo Router, preserve it. If it uses React Navigation, keep the existing navigation library unless there is a separate, justified migration.

### Recommended technology choices

| Concern | Recommendation |
|---|---|
| Framework | Existing Expo and React Native versions |
| Language | TypeScript with strict checking |
| Navigation | Existing navigation system |
| Content | Bundled JSON or TypeScript modules |
| Small local preferences | AsyncStorage |
| Local progress | AsyncStorage initially; SQLite only if complexity grows |
| Audio | `expo-audio`, after confirming compatibility with the current Expo SDK |
| Animation | Existing animation library or React Native Animated |
| Unit tests | Existing test runner; Jest or compatible alternative |
| Component tests | React Native Testing Library |
| End-to-end tests | Maestro or existing E2E tooling |
| Build | Existing EAS Build / Play Console workflow, if already configured |

Do not install all recommended libraries automatically. Audit the existing dependency versions and add only what is needed.

---

## 8. Shared Game Engine

The shared engine should handle:

1. Starting a session and loading content.
2. Showing the current question.
3. Validating an answer.
4. Showing correct-answer or retry feedback.
5. Tracking question index, attempts, and score.
6. Handling hints and audio replay.
7. Completing a session and calculating rewards.
8. Recording results locally if saving is enabled.
9. Exiting or restarting safely.

### Core types

```ts
export type GameCategory = "math" | "logic" | "words";
export type Difficulty = "easy" | "medium" | "hard";

export type GameDefinition = {
  id: string;
  category: GameCategory;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  contentVersion: number;
};

export type AnswerOption = {
  id: string;
  label: string;
  imageAsset?: string;
  audioAsset?: string;
};

export type Question = {
  id: string;
  gameId: string;
  prompt: string;
  instructionAudio?: string;
  imageAsset?: string;
  audioAsset?: string;
  options: AnswerOption[];
  correctOptionId: string;
  hint?: string;
};

export type SessionResult = {
  sessionId: string;
  gameId: string;
  startedAt: number;
  completedAt: number;
  totalQuestions: number;
  correctFirstTry: number;
  attempts: number;
  starsEarned: number;
};
```

Some interactions—such as sequence puzzles, sorting, and counting objects—may need specialized question types. Avoid forcing every interaction into a multiple-choice structure.

### Game registry concept

```ts
type GameModule = {
  definition: GameDefinition;
  loadQuestions: () => Question[];
  validateContent: (questions: Question[]) => boolean;
};

const gameRegistry: Record<string, GameModule> = {
  "math-counting": countingGameModule,
  "math-addition": additionGameModule,
  "logic-patterns": patternGameModule,
  "logic-odd-one-out": oddOneOutGameModule,
  "words-listen-choose": listenChooseGameModule,
};
```

The module names above are placeholders. Implement and validate each module before registering it.

Keep answer evaluation separate from UI code:

```ts
export function evaluateAnswer(
  question: Question,
  selectedOptionId: string
): boolean {
  return selectedOptionId === question.correctOptionId;
}
```

---

## 9. Offline Content, Assets, and Storage

### Content

- Bundle core questions and learning packs with the app.
- Use stable asset keys resolved through a typed asset registry.
- Do not construct dynamic `require()` paths from arbitrary JSON strings.
- Validate all content during tests or a build-time validation step.
- Version content so changes can be tested and tracked.

### Preferences

```ts
type AppPreferences = {
  soundEnabled: boolean;
  speechEnabled: boolean;
  selectedDifficulty: Difficulty;
  progressSavingEnabled: boolean;
};
```

Use defaults when no settings exist. Validate stored data before use.

### Local progress

```ts
type LocalProgress = {
  schemaVersion: number;
  gamesCompleted: number;
  totalStarsEarned: number;
  unlockedBadgeIds: string[];
  gameStats: Record<string, {
    sessionsCompleted: number;
    bestStars: number;
    lastPlayedAt?: number;
  }>;
};
```

Keep persistence minimal. Save at session completion and when preferences change rather than writing every tap.

### Audio catalog

```ts
type AudioEntry = {
  id: string;
  assetKey: string;
  language: string;
  kind: "word" | "instruction" | "feedback";
};
```

### Storage rules

- Use namespaced, versioned keys, such as `scratch-learn:preferences:v1`.
- Validate stored objects when loading them.
- Add migrations if the persisted data structure changes.
- Handle missing or corrupt data without crashing.
- Provide a reset-progress action with confirmation.
- If progress saving is disabled, do not persist gameplay history.
- Test upgrading from the currently published version.

---

## 10. Design System and Child-Friendly Interaction

### Visual direction

- Warm, light backgrounds and colorful activity cards.
- Friendly illustrations and a small set of recurring mascots.
- Large text and touch targets.
- Consistent icons and meaning across games.
- Brief animations rather than flashing effects.
- Low visual clutter and predictable navigation.

### Interaction rules

| Event | Expected behavior |
|---|---|
| Correct answer | Immediate positive feedback and short animation |
| Incorrect answer | Gentle retry or hint; no harsh buzzer |
| Audio playback | Replay whenever needed |
| Sound disabled | No gameplay audio until re-enabled |
| App backgrounded | Pause audio and preserve safe session state |
| Game exit | Avoid accidental loss; confirm only when necessary |
| Missing audio | Provide a usable visual/text fallback |
| Small screen | Avoid clipped content and tiny controls |
| Reduced animation preference, if supported | Avoid unnecessary motion |

Do not rely on color alone to communicate correct answers. Make core interactions usable without sound, and provide audio support without requiring it.

---

## 11. Milestones and Timeline

Estimated timeline for one developer working part-time: **8–12 weeks**, depending on current code quality, asset readiness, and testing capacity.

| Milestone | Estimated timing | Deliverable |
|---|---|---|
| 1. Repository audit | Week 1 | Technical audit, baseline, scope |
| 2. Design and navigation | Weeks 2–3 | Home, category screens, GameShell |
| 3. Math and logic | Weeks 4–5 | Six core game types |
| 4. Word learning and audio | Week 6 | Offline pronunciation activities |
| 5. Progress and polish | Weeks 7–8 | Preferences, optional progress, rewards |
| 6. QA and release | Weeks 9–12 | Tested production candidate and rollout |

### Milestone 1 — Audit

- Record Expo SDK, React Native, TypeScript, navigation, and package manager versions.
- Inventory screens, content, images, audio, and animations.
- Inspect Android application ID, version, target SDK, permissions, and build configuration.
- Review persistence, tests, build scripts, and dependencies.
- Capture baseline startup behavior, app size, and known issues.
- Identify functionality that must not regress.

**Exit criteria:** approved repository-specific architecture and migration plan.

### Milestone 2 — Design and navigation

- Build home and category screens.
- Define design tokens, cards, typography, buttons, and spacing.
- Implement GameShell and session lifecycle.
- Add feedback, completion, and sound controls.
- Keep existing activities accessible.

**Exit criteria:** one sample game can be completed from home to results.

### Milestone 3 — Math and logic

- Implement counting, addition, subtraction, matching, odd-one-out, and patterns.
- Add difficulty constraints and validated content.
- Test answer uniqueness, correct answers, and invalid content handling.

**Exit criteria:** six game types work offline and pass core unit tests.

### Milestone 4 — Words and audio

- Implement the audio catalog and playback service.
- Add Tap and Hear and Listen and Choose.
- Add beginning sounds if content and testing capacity permit.
- Verify bundled audio in airplane mode.

**Exit criteria:** word-learning flows work without network access and degrade safely if an asset is unavailable.

### Milestone 5 — Progress and polish

- Add optional local progress and preferences.
- Add stars, badges, and completion feedback.
- Implement storage validation and migrations.
- Refine responsive layouts, illustrations, and accessibility.

**Exit criteria:** preferences and progress behave consistently across app restarts and upgrades.

### Milestone 6 — QA and release

- Run unit, component, integration, and device tests.
- Test airplane mode, app restarts, and upgrade from the previous release.
- Verify policy declarations and store assets.
- Complete internal/closed testing as appropriate.
- Prepare staged rollout and rollback steps.

**Exit criteria:** no known release-blocking issues; all required release checks complete.

### Scope control

If the timeline slips, defer advanced rewards, speech recognition, and parent summaries before cutting core offline behavior or regression testing.

---

## 12. Testing Plan

### Unit tests

- Every generated math question has a valid answer.
- Answer options are unique and include the correct option.
- Difficulty rules do not produce invalid values.
- Addition/subtraction respect configured ranges.
- Logic puzzles have one defensible answer.
- Scoring and star calculations are correct.
- Missing or corrupt saved data does not crash the app.
- Asset references resolve correctly.

### Integration and end-to-end tests

| Scenario | Expected result |
|---|---|
| First launch | Home appears without login |
| Start a game | First question renders correctly |
| Submit an answer | Feedback and session state update |
| Complete a game | Results and rewards appear |
| Replay | A new or reset session starts correctly |
| Disable sound | No audio plays until re-enabled |
| Airplane mode | Core games and bundled audio work |
| Kill and relaunch | App starts safely; preferences and saved progress are handled |
| Upgrade from previous release | Existing activities remain accessible |
| Reset progress | Saved progress is cleared after confirmation |
| Missing asset or invalid content | Safe fallback rather than crash |
| Rapid repeated taps | No duplicate submissions or skipped states |

### Device coverage

Test on:
- A low-memory Android phone.
- A typical current Android phone.
- A larger-screen Android device or tablet.
- Supported Android versions.
- Different screen sizes and audio states.

Conduct supervised usability sessions with adults present. Observe whether children can choose a game, understand its instruction, answer, and return home. Avoid collecting identifiable child research data.

### Definition of done

A feature is complete when it:
- Meets functional requirements.
- Has age-appropriate, validated content.
- Works offline.
- Has tests for core behavior.
- Has been checked on a physical device.
- Has no known release-blocking defects.
- Introduces no unintended permissions or data collection.

---

## 13. Google Play Release Checklist

### Technical checks

- [ ] Increment `versionCode` and app version.
- [ ] Build a signed production Android App Bundle (`.aab`).
- [ ] Preserve the existing application ID.
- [ ] Verify current Google Play target API requirements before release.
- [ ] Confirm the Expo SDK and native dependencies support the required target SDK.
- [ ] Test the release build on physical devices.
- [ ] Verify all core games and audio work in airplane mode.
- [ ] Check startup, app size, memory, and audio behavior.
- [ ] Review all permissions and remove unnecessary ones.
- [ ] Test upgrading from the currently published version.
- [ ] Keep a known-good build and rollback plan.

### Children’s privacy and policy

- [ ] Review target audience and content declarations.
- [ ] Ensure age groups accurately reflect the redesigned app.
- [ ] Review Google Play Families Policy requirements.
- [ ] Audit every SDK for data collection, identifiers, network calls, and advertising behavior.
- [ ] Ensure the privacy policy matches the actual shipped app and included SDKs.
- [ ] Complete the Data safety form accurately.
- [ ] Review the content rating questionnaire.
- [ ] Protect external links and parent-only functions appropriately.
- [ ] Do not add microphone-based speech recording in Version 2.0.
- [ ] Verify licenses for illustrations, fonts, music, and audio.

No-login does not automatically mean no data practices need to be disclosed. Check the behavior of the actual release build and all included SDKs.

### Store listing and rollout

- [ ] Update screenshots to show the new learning hub and games.
- [ ] Update short and full descriptions.
- [ ] Refresh promotional graphics where necessary.
- [ ] Write release notes covering math, logic, and word-learning activities.
- [ ] Run internal testing and closed testing where appropriate.
- [ ] Verify production track, countries, pricing, and distribution settings.
- [ ] Submit for review and allow for review time.
- [ ] Use a staged rollout where available and appropriate.
- [ ] Monitor Play Console crash and Android vitals reports after release.

### Official references

- Google Play target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Target audience and app content: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play Console: https://play.google.com/console/

Verify current requirements in Play Console before submission, as policies and target API deadlines can change.

---

## 14. Sprint 1 Checklist

Complete this vertical slice before building every game.

- [ ] Audit the current Expo app and preserve a working baseline.
- [ ] Define navigation, design tokens, and reusable GameShell.
- [ ] Build one counting game using bundled question data.
- [ ] Implement answer evaluation, feedback, and completion.
- [ ] Add bundled audio and verify airplane-mode behavior.
- [ ] Write unit and component tests for the first game.
- [ ] Validate the architecture before adding other game modules.

**Sprint 1 success criterion:** a child can open the app, start the counting game, answer questions, hear the relevant audio, complete the session, and return home with no internet connection.

---

## 15. Gemini CLI Implementation Workflow

Do not ask Gemini CLI to regenerate the entire application or replace the current structure immediately. Use the following staged workflow.

### Step 1 — Audit only

Ask Gemini CLI to inspect the repository and report:
- Expo SDK, React Native, TypeScript, navigation, and package manager versions.
- Existing screens, games, assets, audio, and content.
- Android application ID, version, target SDK, permissions, and build configuration.
- State management, persistence, tests, and build scripts.
- Dependencies affecting offline behavior or app size.
- Existing functionality that must be preserved.

**Instruction:** Do not modify any files during the audit.

### Step 2 — Propose the architecture

Ask it to propose:
- A repository-specific folder structure.
- Minimal necessary dependency changes.
- Typed content models and game-session interfaces.
- Local preferences/progress storage and migrations.
- Offline audio strategy.
- File-by-file implementation phases.
- Unit, component, offline, and regression testing.
- Risks and questions requiring approval.

Do not begin the full redesign until the audit and architecture are reviewed.

### Step 3 — Implement in small changes

Recommended order:
1. Design tokens and navigation.
2. GameShell and one counting game.
3. Tests and offline validation.
4. Math and logic modules.
5. Word audio modules.
6. Local preferences and rewards.
7. Regression testing and Play Store preparation.

Review the diff and run relevant tests after each phase. Avoid unrelated refactoring.

### Initial Gemini CLI prompt

> You are a senior Expo / React Native / TypeScript engineer working on an existing production app called Scratch and Learn, already published on Google Play.
>
> The goal is to evolve it into an offline-first educational app for children aged 3–6. Planned features are counting, introductory addition and subtraction, visual logic puzzles, and word-pronunciation games. The app must remain usable without login or a backend.
>
> Preserve the existing application ID, working features, and current navigation unless a migration is justified. Do not introduce unnecessary analytics, ads, data collection, or sensitive permissions. Bundle core content and audio. Separate game logic, content, presentation, audio, and storage. Do not overwrite existing code before understanding it.
>
> **First task: audit only.** Inspect the repository and report the Expo SDK, React Native and TypeScript versions, navigation, folder structure, existing activities and assets, Android configuration, permissions, persistence, tests, and build scripts. Identify compatibility risks and existing functionality that must be preserved.
>
> Do not modify any files during this audit.
>
> After the audit, propose a repository-specific architecture, minimal dependencies, typed game and content models, storage and audio strategy, phased file-level changes, testing plan, and risks. Wait for approval before implementing the redesign.
>
> Distinguish facts discovered in the repository from recommendations.

---

## 16. Final Recommendation

Build Scratch and Learn 2.0 as a new learning experience inside the existing app—not as a complete rewrite.

The first milestone should prove the architecture through one fully working counting game, including bundled content, answer validation, audio, feedback, completion, and offline testing. Once that vertical slice is reliable, reuse the same foundation for addition, subtraction, logic puzzles, and word pronunciation.

Prioritize educational quality, offline reliability, child-friendly interactions, and safe migration over maximizing the number of features in the first release.
