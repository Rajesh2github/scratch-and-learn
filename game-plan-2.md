# Scratch & Learn – Phase 2: Expand Into a Kids Learning Game Platform

The existing React Native + Expo application has already implemented the original **Scratch & Guess** game.

Do NOT rebuild the existing application.

Your task is to inspect the current project and extend it into a broader **kids learning application with multiple educational mini-games**.

The existing Scratch & Guess functionality must continue working exactly as it currently does.

---

# Primary Objective

Transform the application from:

```text id="wzrvbg"
Scratch & Learn
      │
      └── Scratch & Guess
```

into:

```text id="rhnlqn"
Kids Learning App
│
├── ✋ Scratch & Guess
│
├── 🔤 ABC Learning
│
├── 🔢 Numbers Fun
│
├── 🎨 Colors
│
├── 🐶 Animal Sounds
│
├── 🔍 Find the Object
│
├── 🧠 Memory Game
│
├── 🧩 Picture Puzzle
│
└── ✏️ Letter Tracing
```

However, do NOT implement everything blindly at once.

Follow the phased implementation plan described below.

---

# IMPORTANT: First Inspect the Existing Application

Before making any changes:

1. Inspect the complete project structure.
2. Identify the existing navigation architecture.
3. Identify the existing Scratch & Guess implementation.
4. Identify:

   * reusable components
   * data models
   * hooks
   * utilities
   * theme/colors
   * animation patterns
   * state management
5. Check the Expo and React Native versions.
6. Check all existing dependencies.
7. Do not replace existing working architecture unnecessarily.

The goal is to EXTEND the application, not rewrite it.

Before implementation, provide a concise summary of:

```text id="qk7x7b"
Current Architecture
Existing Features
Reusable Components
Recommended Extension Strategy
```

Then proceed with the implementation.

---

# New Home Screen

Update the home screen so it becomes a mini-game selection screen.

Example:

```text id="shvndd"
              🎓 Learn & Play

       What would you like to play?

     ┌─────────────────────┐
     │ ✋                  │
     │ Scratch & Guess     │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🔤                  │
     │ ABC Learning        │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🔢                  │
     │ Numbers Fun         │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🎨                  │
     │ Colors              │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🐶                  │
     │ Animal Sounds       │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🔍                  │
     │ Find the Object     │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🧠                  │
     │ Memory Game         │
     └─────────────────────┘

     ┌─────────────────────┐
     │ 🧩                  │
     │ Picture Puzzle      │
     └─────────────────────┘
```

Requirements:

* Large touch targets
* Child-friendly UI
* Responsive layout
* Smooth animations
* Consistent design with the existing app
* Reuse existing theme/design tokens
* Avoid unnecessary visual complexity

---

# PHASE 2A — ABC Learning

Implement this first.

Create an alphabet learning experience.

Display alphabet cards:

```text id="6q9a8r"
A   B   C   D
E   F   G   H
I   J   K   L
M   N   O   P
Q   R   S   T
U   V   W   X
Y   Z
```

When a child taps a letter:

```text id="5d5wye"
            A

           🍎

        A for Apple

            🔊
```

The app should eventually speak:

> "A for Apple"

For the initial implementation:

* Build the complete alphabet UI.
* Add letter data.
* Associate every letter with an object where possible.
* Make the audio architecture ready.
* Use placeholder/local audio only if real audio assets are available.
* Do not depend on remote audio.

Example data structure:

```ts id="xfq0xg"
interface AlphabetItem {
  letter: string;
  word: string;
  image: ImageSource;
  audio?: AudioSource;
}
```

Example:

```ts id="ww6saz"
{
  letter: "A",
  word: "Apple",
  image: appleImage,
}
```

Implement:

* Alphabet grid
* Letter detail screen/modal
* Previous/Next navigation
* Optional autoplay architecture
* Simple animations

---

# PHASE 2B — Numbers Learning

Create a Numbers Learning mode.

Example:

```text id="s4wtoc"
              3

           🍎 🍎 🍎

             Three

              🔊
```

Support numbers:

```text id="d1p12z"
1 → One
2 → Two
3 → Three
...
10 → Ten
```

The child should learn:

```text id="e5t6vi"
Number
   +
Quantity
   +
Word
   +
Sound
```

Create a reusable data structure.

Example:

```ts id="nqgl21"
interface NumberItem {
  value: number;
  word: string;
  image?: ImageSource;
  audio?: AudioSource;
}
```

Use playful visual representations.

---

# PHASE 2C — Find the Object

Create a simple visual recognition game.

Example:

```text id="2p1o79"
🔊 Find the Banana!

🍎    🐶    🍌    🚗

🐱    🥕    🐘    🍇

🍓    🚌    🐟    🍎
```

The child taps the correct object.

Requirements:

* Randomized object positions.
* Large touch targets.
* No duplicate correct answers unless intentionally needed.
* Friendly success animation.
* Friendly retry feedback.
* Multiple rounds.

Architecture:

```ts id="2cv0mi"
interface FindObjectQuestion {
  target: GameItem;
  options: GameItem[];
}
```

Reuse game logic where appropriate.

---

# PHASE 2D — Animal Sounds

Create an Animal Sounds game.

Example:

```text id="wj5ou8"
             🔊

           "Moooo!"

       Which animal is this?

      🐶     🐄

      🐱     🦁
```

The child hears a sound and chooses the correct animal.

Support:

* Dog
* Cat
* Cow
* Lion
* Elephant
* Horse
* Sheep
* Duck

Audio architecture must support local audio assets.

If assets are not currently available:

* create the structure
* use placeholders
* clearly document how audio files should be added

Do not download audio from remote URLs during gameplay.

---

# PHASE 2E — Color Learning and Matching

Create a color learning mode.

Example:

```text id="6rqajq"
             🔴

             RED

             🔊
```

Also create a simple quiz:

```text id="slh6q8"
       Find something RED

      🍎   🍌   🥦   🫐
```

Colors:

* Red
* Blue
* Green
* Yellow
* Orange
* Purple
* Pink

Keep the UI simple.

---

# PHASE 3A — Memory Game

Create a simple card matching game.

Start with 4 cards.

Example:

```text id="i0jdh0"
┌─────┐ ┌─────┐
│  ?  │ │  ?  │
└─────┘ └─────┘

┌─────┐ ┌─────┐
│  ?  │ │  ?  │
└─────┘ └─────┘
```

When cards match:

```text id="idgk9t"
🐶  🐶

🎉 Match!
```

Requirements:

* Flip animation.
* Only allow two cards open simultaneously.
* Matched cards remain visible.
* Track completion.
* Add a positive completion screen.

Future difficulty levels:

```text id="rwrpda"
Easy → 4 cards
Medium → 8 cards
Hard → 12 cards
```

Implement Easy mode first.

---

# PHASE 3B — Picture Puzzle

Create a simple picture puzzle.

Start with a 2x2 puzzle.

```text id="gzz0dm"
┌─────┬─────┐
│     │     │
├─────┼─────┤
│     │     │
└─────┴─────┘
```

Use images such as:

* Animals
* Fruits
* Vehicles

The puzzle pieces should be shuffled.

The child should be able to move pieces.

Choose the most reliable interaction approach:

* Tap piece → tap destination
  OR
* Drag and drop

Prioritize:

1. Child usability
2. Reliability
3. Performance

Do not implement a complex drag system if a tap-to-swap system provides a better experience.

---

# PHASE 4 — Letter Tracing

This is a future feature.

Do NOT implement this until the earlier phases are stable.

Prepare the architecture for:

```text id="8jvebr"
        A

      •     •
       \   /
        \ /
         |
```

The child traces the letter using their finger.

Potential implementation technologies:

* React Native Skia
* SVG paths
* Gesture Handler
* Reanimated

When implementing later:

* Define the expected tracing path.
* Track the child's finger.
* Measure approximate path accuracy.
* Provide gentle visual feedback.
* Do not require pixel-perfect accuracy.

This feature should feel encouraging.

---

# Shared Architecture

Create reusable systems where appropriate.

Suggested structure:

```text id="l8kzzb"
src/
│
├── components/
│   ├── GameCard/
│   ├── AnswerOption/
│   ├── ProgressBar/
│   ├── Celebration/
│   ├── GameHeader/
│   └── ...
│
├── games/
│   ├── scratch/
│   ├── alphabet/
│   ├── numbers/
│   ├── find-object/
│   ├── animal-sounds/
│   ├── colors/
│   ├── memory/
│   └── puzzle/
│
├── data/
│   ├── alphabet.ts
│   ├── numbers.ts
│   ├── animals.ts
│   ├── colors.ts
│   └── ...
│
├── hooks/
│
├── utils/
│
├── constants/
│
└── types/
```

Adapt this to the existing architecture instead of blindly moving files.

Do not duplicate:

* question generation
* answer validation
* option shuffling
* scoring
* animations

when a shared solution makes sense.

However, do not force unrelated games into the same abstraction.

---

# Audio Architecture

Create a reusable audio abstraction.

Example:

```text id="5dgwkk"
playSound(sound)

playWord(word)

playSuccessSound()

playFailureSound()
```

The implementation should be isolated from game components.

Requirements:

* Expo-compatible.
* Support local assets.
* Clean up resources correctly.
* Prevent multiple overlapping sounds when inappropriate.
* Gracefully handle missing audio files.

Do not add complicated audio state management.

---

# Game Design Principles

Every game should follow these principles:

### Positive feedback

Correct:

```text id="vt4tgd"
🎉 Great Job!
⭐ Amazing!
👏 Fantastic!
```

Wrong:

```text id="ozczfj"
😊 Try Again!
💪 You Can Do It!
```

Never use negative messages like:

```text id="azm5fm"
Wrong!
You Failed!
Game Over!
```

---

# Rewards

Create a simple reusable reward system.

Initially support:

```text id="rhjrqg"
⭐ Stars
🎉 Celebration
👏 Positive feedback
```

Do not create a complex economy.

Later we may add:

* Badges
* Streaks
* Unlockable games
* Progress

---

# Performance Requirements

This application is for mobile devices and children.

Prioritize:

* smooth interactions
* quick screen transitions
* responsive touch handling
* minimal unnecessary re-renders

Specific requirements:

* Memoize expensive components where useful.
* Avoid global state unless necessary.
* Keep game state local when possible.
* Use Reanimated for gesture-heavy animations.
* Keep the JS thread free during animations where possible.
* Reuse image assets efficiently.
* Do not optimize prematurely.

The Scratch game must not regress.

---

# Accessibility

Every game should have:

* meaningful accessibility labels
* large touch targets
* non-color-only feedback
* accessible buttons
* clear focus/pressed states where supported

---

# Navigation

Preserve the existing navigation approach.

The new game selection should support routes conceptually similar to:

```text id="dhvgyf"
/scratch
/alphabet
/numbers
/colors
/animal-sounds
/find-object
/memory
/puzzle
```

Adapt route naming to the existing Expo Router structure.

Do not break existing deep links or routes.

---

# Implementation Order

Follow this exact priority:

## Step 1 — Audit Existing App

Inspect and document:

* Current project structure
* Existing dependencies
* Existing game architecture
* Existing navigation
* Reusable components

Do not rewrite working code.

---

## Step 2 — Update Home Screen

Create the new mini-game selection UI.

Scratch & Guess must remain accessible.

Other games can initially be marked:

```text id="gufquy"
Coming Soon
```

until implemented.

---

## Step 3 — Implement ABC Learning

Complete and test.

---

## Step 4 — Implement Numbers Learning

Complete and test.

---

## Step 5 — Implement Find the Object

Complete and test.

---

## Step 6 — Implement Animal Sounds

Complete the architecture and game.

If real audio assets are unavailable, make missing assets obvious but ensure the app does not crash.

---

## Step 7 — Implement Colors

Learning + matching.

---

## Step 8 — Implement Memory Game

Start with Easy mode.

---

## Step 9 — Implement Picture Puzzle

Start with 2x2.

---

# Do Not Implement Yet

Do NOT implement these until explicitly requested:

* Backend
* Authentication
* User accounts
* Cloud sync
* Ads
* Payments
* Complex analytics
* Parent dashboard
* Social features
* Online multiplayer

This application should remain:

```text id="8l66dz"
Simple
Offline-first
Fast
Kid-friendly
```

---

# Testing

Before completing each game:

1. Verify navigation.
2. Verify restart.
3. Verify answer validation.
4. Verify completion flow.
5. Verify no crashes when assets are missing.
6. Verify touch targets.
7. Verify animations.
8. Run TypeScript checks.
9. Run lint.
10. Run available tests.

Add unit tests for reusable logic such as:

* shuffling
* question generation
* scoring
* matching logic
* puzzle completion

---

# Final Deliverable

Do not simply provide code.

After implementation, provide:

## 1. Updated Architecture

Explain the new structure.

## 2. Games Implemented

Clearly list completed games.

## 3. Games Pending

Clearly list future features.

## 4. Dependencies

List:

* dependencies reused
* dependencies added
* reason for each new dependency

## 5. Testing

Report:

* TypeScript status
* lint status
* test status
* manual verification performed

## 6. Recommended Next Feature

Recommend the next highest-value game or improvement.

---

# Critical Rule

The existing Scratch & Guess implementation is already working.

Do not rewrite or regress it.

The goal of this phase is:

```text id="p9htf7"
Existing Working App
        +
New Mini Games
        +
Reusable Architecture
        +
Consistent Kid-Friendly Experience
        =
A Small Kids Learning Platform
```

Always prioritize:

1. Working functionality
2. Simple child-friendly UX
3. Maintainable architecture
4. Smooth performance

over adding many incomplete features.
