# Build a React Native Kids Learning Game — "Scratch & Learn"

You are a senior React Native engineer and product engineer.

Build a polished, kid-friendly educational mobile application using **React Native + Expo + TypeScript + Expo Router**.

The goal is to create a simple but engaging learning game where kids scratch an area of the screen to reveal an object and then select the correct answer from 4 options.

The application should be designed so that it can later be expanded with more categories, sounds, animations, progress tracking, difficulty levels, and additional educational content.

---

# 1. Product Concept

The app is called **Scratch & Learn**.

The main gameplay loop is:

```text
Choose Category
      ↓
Show Scratch Card
      ↓
Child scratches the screen
      ↓
Image gets revealed
      ↓
Question is displayed
      ↓
4 answer options
      ↓
Child selects an answer
      ↓
Correct → Celebration + reward
Wrong → Friendly feedback
      ↓
Next Question
```

The experience should feel like a **simple educational game for young children**, not like a traditional form/questionnaire.

The UI should be:

* colorful
* simple
* friendly
* large touch targets
* minimal text
* easy for a young child to understand
* responsive
* accessible
* smooth
* animation-friendly

Avoid excessive UI elements.

---

# 2. Technology Requirements

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* React Native Gesture Handler
* React Native Reanimated
* React Native Skia where appropriate for the scratch/reveal effect
* Expo-compatible audio solution
* AsyncStorage or another simple local persistence solution if needed

Do NOT introduce a backend for V1.

The app should work completely offline using local assets and local data.

Use functional components and hooks.

Use strict TypeScript.

Avoid unnecessary dependencies.

Before adding a dependency, verify that it is compatible with the current Expo SDK.

---

# 3. First Version Scope

Implement V1 with these categories:

### Fruits

Start with approximately 10 fruits:

* Apple
* Banana
* Mango
* Orange
* Watermelon
* Strawberry
* Pineapple
* Grapes
* Papaya
* Kiwi

The architecture must make it easy to add more categories later.

Also prepare the architecture for:

* Alphabets
* Numbers
* Animals
* Vegetables
* Vehicles
* Colors
* Shapes
* Everyday Objects

Do not fully implement all of these initially unless the architecture requires placeholder data.

---

# 4. Application Screens

Use Expo Router.

Create the following flow:

```text
Home
 │
 ├── Fruits
 │      ↓
 │   Game
 │      ↓
 │   Result
 │
 ├── Alphabets
 │
 ├── Numbers
 │
 └── Animals
```

For V1, Fruits should be fully functional.

Other categories can be marked as "Coming Soon".

---

# 5. Home Screen

Create a very simple child-friendly home screen.

Example:

```text
        🎨 Scratch & Learn

       What do you want to learn?

       🍎 Fruits

       🔤 Alphabets

       🔢 Numbers

       🐶 Animals

       🥕 Vegetables
```

Use large cards/buttons.

The cards should have:

* icon/image
* category name
* subtle animation
* large touch area

Avoid small buttons.

---

# 6. Scratch Game Screen

This is the most important screen.

Display a large scratch area.

Example:

```text
        Question 1 / 10

     ┌───────────────────┐
     │                   │
     │    SCRATCH HERE   │
     │                   │
     │    ▓▓▓▓▓▓▓▓▓▓     │
     │    ▓▓▓▓▓▓▓▓▓▓     │
     │    ▓▓▓▓▓▓▓▓▓▓     │
     │                   │
     └───────────────────┘

          What is this?

      ┌────────┐ ┌────────┐
      │ Apple  │ │ Banana │
      └────────┘ └────────┘

      ┌────────┐ ┌────────┐
      │ Mango  │ │ Orange │
      └────────┘ └────────┘
```

The scratch area should contain a covering layer.

When the child moves their finger across the screen, the covering layer should be erased/revealed along the finger path.

The hidden content should be the actual fruit image.

---

# 7. Scratch Interaction

Implement a real scratch-card experience.

Requirements:

* Detect finger movement using Gesture Handler.
* Track the user's touch path.
* Reveal the underlying image along the path.
* Make the scratch effect smooth.
* Avoid excessive React state updates during every gesture event.
* Prefer Reanimated/Skia/shared values for high-frequency interaction.
* Keep JS thread work minimal.
* Make the scratch experience work smoothly on lower-end devices.

The scratch brush should have a reasonably large radius so children don't need precise finger movements.

For example:

```text
Finger
  ↓
●
████████████
████  ● ████
████████████
```

The revealed region should follow the user's finger.

---

# 8. Scratch Completion

Calculate approximately how much of the scratch area has been revealed.

When enough of the area has been scratched, for example around 50–70%, automatically reveal the remaining image.

Do not force the child to scratch every pixel.

The goal is fun, not precision.

After automatic reveal:

```text
       🍎

      Apple
```

Then allow the child to answer.

---

# 9. Question System

Each question should have:

```ts
interface Question {
  id: string;
  category: Category;
  answer: string;
  image: ImageSource;
  options: string[];
}
```

Keep question data separate from UI.

Example:

```ts
{
  id: "apple",
  category: "fruits",
  answer: "Apple",
  image: ...,
  options: [
    "Apple",
    "Banana",
    "Mango",
    "Orange"
  ]
}
```

The question engine should randomly select questions.

The correct answer should not always appear in the same option position.

Shuffle the options.

Avoid generating duplicate options.

---

# 10. Answer Interaction

Display 4 large answer buttons.

Requirements:

* large touch targets
* rounded cards
* child-friendly typography
* clear pressed state
* disabled after selection
* prevent multiple selections

When the child selects an answer:

### Correct

Show:

```text
🎉 Great Job!

⭐
```

Use a small celebration animation.

Optionally play a success sound.

### Wrong

Do NOT punish the child.

Show friendly feedback:

```text
😊 Try Again!
```

Optionally give a subtle shake animation.

Allow the child to select another answer.

Do not immediately move to the next question after a wrong answer.

---

# 11. Correct Answer Flow

When the correct answer is selected:

```text
Correct
   ↓
Highlight correct answer
   ↓
Celebration animation
   ↓
Optional sound
   ↓
Short delay
   ↓
Next question
```

Use a smooth transition.

Do not make the animation too long.

---

# 12. Progress

Show simple progress at the top.

Example:

```text
Question 3 / 10

████████░░
```

Keep it visually simple.

Do not expose complex statistics to the child.

---

# 13. Result Screen

After 10 questions:

```text
        🎉 Amazing!

       You finished!

          ⭐⭐⭐⭐⭐

        8 / 10

      Great job!

     [Play Again]

     [Home]
```

Use positive language regardless of score.

For example:

* Amazing!
* Great Job!
* Well Done!
* Keep Learning!
* Fantastic!

Never make the child feel bad for getting answers wrong.

---

# 14. Data Architecture

Create a scalable data structure.

Suggested structure:

```text
src/
  data/
    fruits.ts
    alphabets.ts
    numbers.ts
    animals.ts
    vegetables.ts

  types/
    game.ts

  components/
    ScratchCard/
    AnswerOption/
    ProgressBar/
    CategoryCard/
    Celebration/

  hooks/
    useGame.ts
    useScratch.ts

  utils/
    shuffle.ts
    game.ts

  constants/
    colors.ts
    sizes.ts
```

Adjust the structure if a better architecture makes sense.

Do not over-engineer.

---

# 15. ScratchCard Component

Create a reusable component:

```tsx
<ScratchCard
  image={question.image}
  onComplete={handleScratchComplete}
/>
```

It should:

* accept the image
* handle gestures
* render the cover
* reveal the image
* calculate reveal progress
* notify the parent when enough has been scratched

Keep game logic outside the scratch component.

---

# 16. Game Hook

Create a reusable game hook:

```ts
const {
  question,
  currentIndex,
  totalQuestions,
  selectAnswer,
  nextQuestion,
  score,
  isComplete,
} = useGame(...)
```

The hook should manage:

* current question
* score
* answer selection
* question progression
* completion
* restart

Keep UI components mostly presentational.

---

# 17. Animations

Use Reanimated where appropriate.

Add subtle animations:

### Category cards

Small scale animation on press.

### Answer buttons

Press scale animation.

### Correct answer

Small bounce/celebration.

### Wrong answer

Subtle horizontal shake.

### Next question

Fade/slide transition.

Avoid excessive animation.

Performance is important.

---

# 18. Audio

Prepare the architecture for audio.

For V1, audio can be optional.

The future experience should support:

```text
🍎
     ↓
🔊 "Apple"
```

Eventually:

```text
A
↓
Apple
↓
🔊 "A for Apple"
```

Keep audio functionality isolated so it can easily be enabled later.

---

# 19. Assets

For development, create a clear asset structure:

```text
assets/
  images/
    fruits/
      apple.png
      banana.png
      mango.png
      ...
  sounds/
    fruits/
      apple.mp3
      banana.mp3
      ...
```

If actual image/audio assets are not available, create a clean mechanism using placeholders and clearly document where assets need to be added.

Do not depend on remote image URLs for the core game.

The V1 app should work offline.

---

# 20. Child-Friendly UX

Important requirements:

* Large buttons
* Large images
* Minimal text
* No complicated menus
* No small controls
* No unnecessary scrolling during gameplay
* Avoid accidental navigation
* Friendly feedback
* No negative language
* Use animations carefully
* Make the primary action obvious

The child should be able to understand the game without reading detailed instructions.

---

# 21. Accessibility

Implement basic React Native accessibility:

* accessible buttons
* meaningful accessibility labels
* sufficient touch target size
* meaningful image descriptions
* avoid relying only on color to communicate correctness

For example:

```tsx
<Pressable
  accessible
  accessibilityRole="button"
  accessibilityLabel="Apple"
>
```

---

# 22. Performance Requirements

Performance is important.

Avoid:

```text
setState()
setState()
setState()
```

for every touch movement.

The scratch interaction can generate hundreds/thousands of gesture events.

Use:

* Reanimated shared values
* Skia where appropriate
* native-driven animation
* memoization where useful

Avoid unnecessary re-renders.

Use stable callbacks.

Do not prematurely optimize normal UI components.

The primary performance focus should be the scratch interaction.

---

# 23. Offline First

V1 should not require:

* API
* authentication
* database
* backend
* network connection

All questions and assets should be local.

Later we may introduce:

* remote content
* analytics
* parent dashboard
* cloud sync

but NOT in V1.

---

# 24. Future Features — Design for Them

Do not implement these yet unless required by the architecture.

The architecture should allow:

### Difficulty

```text
Easy
Medium
Hard
```

### Categories

```text
Fruits
Animals
Vegetables
Numbers
Alphabets
Colors
Shapes
Vehicles
```

### Rewards

```text
Stars
Badges
Streaks
Unlocked categories
```

### Audio

```text
Word pronunciation
Alphabet pronunciation
Instructions
Success sounds
```

### Languages

Eventually:

```text
English
Hindi
Other languages
```

### Parent Mode

Potential future features:

* learning progress
* category progress
* time spent
* questions answered
* settings
* sound control

Keep these out of V1.

---

# 25. Visual Design

Create a playful but clean design.

Use:

* rounded cards
* large illustrations
* friendly typography
* soft shadows
* simple backgrounds
* playful icons
* subtle animations

Avoid making the UI visually overwhelming.

The game area should be the primary focus.

Use a consistent design system for:

* spacing
* typography
* border radius
* button sizes
* colors

Create reusable constants/tokens where useful.

---

# 26. Navigation

Use Expo Router.

Suggested structure:

```text
app/
  _layout.tsx
  index.tsx

  game/
    [category].tsx

  result.tsx
```

If a different Expo Router structure is cleaner, use it.

The category should be passed through navigation rather than hardcoded.

For example:

```text
/game/fruits
/game/animals
/game/numbers
```

---

# 27. Important Development Approach

Do NOT attempt to build the entire application blindly in one huge implementation.

Follow this sequence:

### Step 1

Inspect the existing project.

Determine:

* Expo version
* React Native version
* TypeScript configuration
* existing dependencies
* existing folder structure

Do not overwrite existing configuration unnecessarily.

### Step 2

Create the application foundation.

Implement:

* Expo Router
* Home screen
* category structure
* game navigation
* TypeScript models
* fruit data

### Step 3

Implement the basic game without scratch.

First make this work:

```text
Home
 ↓
Fruits
 ↓
Question
 ↓
4 answers
 ↓
Score
 ↓
Next
 ↓
Result
```

### Step 4

Implement ScratchCard.

This is the most technically challenging part.

Make it work independently.

### Step 5

Integrate ScratchCard into the game.

### Step 6

Add animations.

### Step 7

Add optional audio architecture.

### Step 8

Polish UI and accessibility.

### Step 9

Test the application.

---

# 28. Testing

Add tests for important pure logic.

At minimum test:

* option shuffling
* correct answer detection
* score calculation
* question progression
* game completion
* restart behavior

The scratch rendering itself does not need exhaustive unit testing, but the scratch completion logic should be testable where practical.

---

# 29. Code Quality

Follow these rules:

* TypeScript everywhere
* Avoid `any`
* Small reusable components
* Meaningful names
* No unnecessary abstractions
* No duplicated game logic
* Keep data separate from UI
* Keep navigation separate from game state
* Keep scratch implementation isolated
* Keep audio implementation isolated
* Use comments only where they explain WHY
* Do not add comments that simply repeat the code

---

# 30. Important: Do Not Over-Engineer

This is a learning project.

Do NOT introduce:

* Redux
* React Query
* backend
* authentication
* GraphQL
* complicated dependency injection
* unnecessary state management libraries
* complicated design systems

unless there is a real requirement.

React state + hooks should be sufficient for V1.

---

# 31. Developer Experience

Add clear scripts if needed:

```bash
npm start
npm run android
npm run ios
npm run lint
npm test
```

Make sure the project starts successfully.

Resolve TypeScript and lint errors before finishing.

---

# 32. Final Verification

Before declaring the implementation complete:

1. Run TypeScript checks.
2. Run ESLint.
3. Run tests.
4. Start Expo.
5. Verify navigation.
6. Verify category selection.
7. Verify scratch gesture.
8. Verify image reveal.
9. Verify all 4 answers.
10. Verify correct answer behavior.
11. Verify wrong answer behavior.
12. Verify score.
13. Verify result screen.
14. Verify restart.
15. Verify there are no obvious unnecessary re-renders.

If something cannot be verified because an emulator/device is unavailable, clearly mention it.

---

# 33. Important Gemini CLI Behavior

Before modifying files:

* Inspect the existing project.
* Understand the current architecture.
* Reuse existing dependencies when possible.
* Do not replace working configuration unnecessarily.
* Do not install a library if the existing project already has an appropriate solution.
* Prefer Expo-compatible libraries.

When making implementation decisions, explain the reasoning briefly.

If the scratch effect requires choosing between different technologies such as SVG, Canvas, Skia, or another approach, choose the solution that gives the best combination of:

1. Smooth performance
2. Expo compatibility
3. Maintainability
4. Simple architecture

---

# 34. Deliverable

Build the working V1 application.

The final V1 should provide this complete experience:

```text
                  HOME
                    │
                    ▼
              Select Fruits
                    │
                    ▼
              Question 1/10
                    │
                    ▼
             ┌─────────────┐
             │             │
             │   SCRATCH   │
             │             │
             │     🍎      │
             │             │
             └─────────────┘
                    │
             Scratch to reveal
                    │
                    ▼
               What is this?
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Apple                Banana
          │
          ▼
       Correct!
          │
          ▼
          ⭐
          │
          ▼
       Question 2
          │
         ...
          │
          ▼
        Result
          │
          ▼
      Play Again
```

The most important goal is:

**Make the core gameplay loop fun, smooth, simple, and technically solid before adding more features.**

After V1 is working, stop and provide a concise summary of:

* files created/changed
* dependencies added
* architecture decisions
* scratch implementation approach
* how to run the app
* known limitations
* recommended next improvements
