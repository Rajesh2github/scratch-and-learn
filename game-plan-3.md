# Build a Kids Educational Driving Game — "Learn & Ride"

You are a senior React Native + Expo engineer and game developer.

I want to build a simple educational mobile game for young kids using **React Native + Expo + TypeScript**.

The game should combine a simple 3-lane driving game with educational learning.

The working project name is:

**Learn & Ride**

The goal is to create a fun, colorful, child-friendly game where a car or bike automatically moves forward and the child controls it by moving left/right to avoid obstacles and select the correct educational answer.

---

# 1. Core Game Concept

The player controls a:

* 🚗 Car
* 🏍️ Bike

The vehicle automatically moves forward.

The road has **3 lanes**.

The child controls the vehicle using:

* Left control
* Right control

The player should not be able to move outside the 3 lanes.

Example:

```text
┌────────┬────────┬────────┐
│ Lane 1 │ Lane 2 │ Lane 3 │
│        │        │        │
│   🍎   │   🐶   │   🍌   │
│        │        │        │
│        │   🚗   │        │
└────────┴────────┴────────┘

       ←         →
```

The game should feel like a simple endless runner, but the primary purpose is educational learning.

---

# 2. MVP Scope

Do NOT build the entire game at once.

First build a polished MVP with only:

### Screens

1. Home
2. Category Selection
3. Vehicle Selection
4. Game
5. Result

### Learning category

Only implement:

**Alphabet**

A-Z.

Do NOT implement Fruits, Animals, Numbers, etc. yet.

However, design the architecture so those categories can easily be added later.

---

# 3. Home Screen

Create a colorful, child-friendly home screen.

Show:

```text
🚗 Learn & Ride

Learn while you ride!

[ Start Game ]

[ Settings ]
```

Keep the UI simple.

Large buttons.

Large text.

Rounded cards.

Friendly animations.

Do not make the screen overcrowded.

---

# 4. Category Selection

Create a category screen.

For MVP:

```text
Choose Your Learning World

🔤 Alphabet
```

Other categories should appear as disabled/coming soon:

```text
🔢 Numbers       Coming Soon
🍎 Fruits        Coming Soon
🐶 Animals       Coming Soon
```

The architecture must support adding these later without changing the game engine.

---

# 5. Vehicle Selection

Allow the player to choose:

```text
Choose Your Ride

🚗 Car

🏍️ Bike
```

The selected vehicle should be used in the game.

For MVP, placeholder/vector/simple graphics are acceptable.

Do not spend excessive time creating complex artwork.

---

# 6. Game Screen

The game screen is the most important part.

Layout:

```text
┌──────────────────────────────┐
│ ⭐ 20              ❤️ ❤️ ❤️  │
│                              │
│        FIND: B               │
│                              │
│   🏠       🪧        🏠      │
│                              │
│                              │
│      🚧              🚧      │
│                              │
│            🚗                │
│                              │
│     ◀              ▶         │
└──────────────────────────────┘
```

The exact visual design can be improved, but the interaction should remain simple.

---

# 7. Question System

At the top of the game screen display a question.

Example:

```text
Find: B
```

The game generates 3 possible answers.

Example:

```text
A       B       C
```

Each answer appears in one of the three lanes.

The child must move the vehicle into the lane containing the correct answer.

---

# 8. Correct Answer

When the player reaches the correct answer:

* Detect collision/selection
* Show positive feedback
* Increase score
* Play a success animation
* Optionally play a success sound
* Generate the next question

Example:

```text
🎉 Great Job!

+10 ⭐
```

Then continue to the next question.

---

# 9. Wrong Answer

If the player hits an incorrect answer:

Do NOT make the experience frustrating.

Show:

```text
😊 Try Again!
```

The child should be able to continue playing.

For MVP, don't immediately end the game after one mistake.

---

# 10. Game Length

Each game should contain:

**10 questions**

Example:

```text
Question 1 / 10
Question 2 / 10
...
Question 10 / 10
```

After question 10:

Navigate to the Result screen.

---

# 11. Result Screen

Show:

```text
🎉 Great Job!

⭐ Score: 80

8 / 10 Correct

[ Play Again ]

[ Home ]
```

Make it visually rewarding.

Use simple animations.

---

# 12. Road & Movement

Implement a 3-lane road.

The vehicle should have a current lane:

```typescript
type Lane = 0 | 1 | 2;
```

Left:

```text
2 → 1 → 0
```

Right:

```text
0 → 1 → 2
```

The vehicle should smoothly animate between lanes.

Use:

**React Native Reanimated**

for movement.

Do not instantly teleport the vehicle between lanes.

---

# 13. Moving Objects

Educational objects should appear at the top of the road and move toward the player.

Conceptually:

```text
Object
  ↓
  ↓
  ↓
  ↓
🚗
```

Objects should have:

* Lane
* Position
* Type
* Value
* Correct/incorrect state

Example:

```typescript
type LearningObject = {
  id: string;
  lane: Lane;
  value: string;
  isCorrect: boolean;
  type: "answer";
};
```

---

# 14. Collision Detection

Implement basic collision detection between:

* Player vehicle
* Learning object
* Obstacles

For MVP, collision detection can be lane-based plus vertical-position based.

Do NOT introduce a physics engine.

Keep the implementation simple and deterministic.

---

# 15. Obstacles

Add basic obstacles.

For MVP only:

🚧 Road barrier

Example:

```text
Lane 1      Lane 2      Lane 3

            🚧

                         🚗
```

The player must avoid obstacles.

Do not make the game excessively difficult.

The educational objective is more important than the challenge.

---

# 16. Game World

Add simple environmental objects to make the game feel like a world instead of a quiz.

Examples:

🏠 Houses

🏨 Hotels

🪧 Billboards

🌳 Trees

🛣️ Road signs

For example:

```text
        🏠
        A

🪧 B              🏨

       🚧

            🚗
```

These objects can contain educational letters.

Keep the implementation lightweight.

Use placeholder assets where necessary.

---

# 17. Alphabet Data

Create a reusable data structure.

Example:

```typescript
type LearningItem = {
  id: string;
  value: string;
  displayName: string;
  image?: string;
  sound?: string;
};

const alphabetItems: LearningItem[] = [
  {
    id: "a",
    value: "A",
    displayName: "A"
  },
  {
    id: "b",
    value: "B",
    displayName: "B"
  }
];
```

Eventually the same structure should support:

```text
Alphabet
Numbers
Fruits
Animals
Colors
Shapes
```

Do NOT hardcode alphabet logic inside the game engine.

---

# 18. Question Generator

Create a reusable question generator.

Example:

```typescript
type GameQuestion = {
  target: LearningItem;
  options: LearningItem[];
  correctIndex: number;
};
```

The generator should:

1. Select a target item
2. Select incorrect options
3. Randomize their lane positions
4. Mark the correct answer
5. Return the question

Make sure the correct answer is not always in the same lane.

---

# 19. Difficulty

Create a difficulty configuration even if MVP only uses Easy.

Example:

```typescript
type DifficultyConfig = {
  speed: number;
  obstacleFrequency: number;
  answerCount: number;
};
```

Initial configuration:

```text
Easy
- 3 lanes
- Slow speed
- 3 answers
- Few/no obstacles
```

This will allow us to add Medium and Hard later.

---

# 20. Audio Architecture

Prepare the architecture for audio.

Do not spend a lot of time creating audio assets.

The game should eventually support:

Question:

"Find the letter B."

Correct:

"Great job!"

Wrong:

"Try again."

Create an abstraction such as:

```typescript
playSound("correct");
playSound("wrong");
playSound("question");
```

Use placeholder/no-op implementations if audio assets are not available.

---

# 21. Progress Storage

The game should work completely offline.

No backend.

No login.

No network dependency.

Store progress locally.

Use:

**AsyncStorage**

Store:

* Highest score
* Completed games
* Category progress
* Stars

Example:

```typescript
type GameProgress = {
  alphabet: {
    highestScore: number;
    completedGames: number;
    stars: number;
  };
};
```

---

# 22. Architecture

Use a clean architecture.

Suggested structure:

```text
app/
├── index.tsx
├── category.tsx
├── vehicle.tsx
├── game.tsx
└── result.tsx

src/
├── components/
│   ├── Road.tsx
│   ├── Player.tsx
│   ├── LearningObject.tsx
│   ├── Obstacle.tsx
│   ├── Building.tsx
│   ├── Billboard.tsx
│   ├── ScoreBoard.tsx
│   └── GameControls.tsx
│
├── game/
│   ├── gameEngine.ts
│   ├── collision.ts
│   ├── laneManager.ts
│   ├── questionGenerator.ts
│   └── difficulty.ts
│
├── data/
│   ├── alphabet.ts
│   ├── numbers.ts
│   ├── fruits.ts
│   └── animals.ts
│
├── hooks/
│   ├── useGame.ts
│   └── useGameProgress.ts
│
├── services/
│   ├── audio.ts
│   └── storage.ts
│
├── types/
│   └── game.ts
│
└── constants/
    └── gameConfig.ts
```

If using Expo Router, follow Expo Router conventions rather than blindly following the above structure.

---

# 23. Technical Requirements

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* React Native Reanimated
* React Native Gesture Handler if required
* AsyncStorage

Avoid adding unnecessary dependencies.

Before installing a new dependency, determine whether the functionality can be implemented using existing React Native/Expo APIs.

---

# 24. Performance Requirements

The game must be smooth.

Target:

**60 FPS**

Avoid:

* Excessive React re-renders
* Updating React state every animation frame
* Creating unnecessary objects during animation
* Heavy images
* Large unoptimized assets

Use Reanimated/shared values for animation where appropriate.

The game loop should not cause the entire Game screen to re-render every frame.

Separate:

```text
Game state
```

from:

```text
Animation state
```

as much as possible.

---

# 25. Child-Friendly UX

The target users are young children.

Therefore:

* Large touch targets
* Large text
* Simple navigation
* Minimal text
* Bright/friendly visual design
* No complicated menus
* No confusing icons without labels
* Positive feedback
* Avoid frustrating punishment
* Avoid flashing/strobing animations
* Keep interactions predictable

The game should feel fun, not like a test.

---

# 26. Accessibility

Where practical:

* Support screen-reader labels
* Ensure buttons have accessible labels
* Don't rely only on color to communicate correctness
* Use sufficiently large text
* Provide audio feedback architecture
* Avoid excessive motion

---

# 27. Code Quality

Follow these rules:

* TypeScript strict typing
* Reusable components
* Small focused functions
* No giant GameScreen component
* No hardcoded learning content in UI
* No magic numbers where constants make sense
* Avoid unnecessary abstractions
* Avoid premature optimization
* Keep game engine logic separate from UI
* Add comments only where they explain non-obvious game logic

---

# 28. Testing

Add tests for the most important logic.

At minimum test:

### Question generator

* Generates valid questions
* Correct answer exists
* Incorrect answers are different
* Options are randomized

### Lane manager

* Left movement works
* Right movement works
* Cannot move beyond lane 0
* Cannot move beyond lane 2

### Collision

* Correct answer collision
* Wrong answer collision
* Obstacle collision

### Score

* Correct answer increases score
* Wrong answer doesn't incorrectly increase score

---

# 29. Important Development Rule

Before writing code:

1. Inspect the existing project.
2. Understand the Expo version.
3. Understand installed dependencies.
4. Check whether Expo Router is already configured.
5. Check existing styling conventions.
6. Check whether Reanimated is installed/configured.
7. Check TypeScript configuration.

Do not blindly overwrite existing configuration.

If this is a new project, create a clean Expo TypeScript project.

---

# 30. Implementation Strategy

Implement in small stages.

### Stage 1

Create:

* Home
* Category
* Vehicle selection
* Game
* Result

Navigation must work.

### Stage 2

Implement:

* 3-lane road
* Player
* Left/right movement

### Stage 3

Implement:

* Moving learning objects
* Alphabet questions
* Correct/incorrect detection

### Stage 4

Implement:

* Obstacles
* Collision detection
* Score
* 10-question game

### Stage 5

Implement:

* Buildings
* Billboards
* Trees
* Basic visual polish

### Stage 6

Implement:

* Local progress
* Animations
* Accessibility
* Tests

Do not move to the next stage until the previous stage works.

---

# 31. Placeholder Assets

If professional game assets are unavailable, create simple placeholder graphics using:

* Emoji where appropriate
* SVG
* Simple shapes
* Lightweight generated/vector assets

Do not spend the majority of development time searching for assets.

The architecture and gameplay are more important initially.

---

# 32. Future Features

Design the architecture so we can later add:

```text
🔤 Alphabet
🔢 Numbers
🍎 Fruits
🥕 Vegetables
🐶 Animals
🚗 Vehicles
🎨 Colors
🔷 Shapes
🐦 Birds
```

Additional gameplay:

```text
Collect correct item
Collect letters in sequence
Match object with word
Find missing number
Find same object
Count objects
Memory challenges
```

Additional game features:

```text
Multiple environments
More vehicles
Vehicle customization
Stars
Achievements
Levels
Daily challenges
Parent progress dashboard
Voice instructions
Multiple languages
```

Do NOT implement these now.

---

# 33. Future Game World

Eventually I want the game to feel like a small educational world.

Example:

```text
             🏙️ LEARNING CITY

       🏠 A          🏨 B

   🌳                 🪧 C

        🚧       🚧

              🚗

        ←          →
```

Different learning categories can have different environments:

```text
Alphabet → Learning City
Numbers → Number Highway
Fruits → Fruit Valley
Animals → Animal Safari
```

Design the code so the environment can eventually be configured independently from the learning content.

---

# 34. Deliverables

At the end of the implementation provide:

1. Working Expo application
2. Clean project structure
3. Fully playable Alphabet MVP
4. Car and Bike selection
5. 3-lane movement
6. Question generation
7. Correct/wrong detection
8. Obstacles
9. Score
10. 10-question game
11. Result screen
12. Local progress storage
13. Basic animations
14. Unit tests for core game logic
15. README with:

* Setup
* Run commands
* Architecture
* Game mechanics
* How to add a new learning category
* How to add a new vehicle
* How to add a new environment

---

# 35. Very Important

Do NOT generate everything in one huge implementation.

First:

**Analyze → Plan → Implement Stage 1 → Run/verify → Continue**

After each major stage:

* Check TypeScript errors
* Run lint
* Run tests
* Run Expo
* Fix errors
* Verify the actual gameplay

Do not claim something works without checking it.

If you find an architectural issue during implementation, stop and explain the issue before introducing a large workaround.

The final result should be a **simple, maintainable, smooth and fun educational game**, not an over-engineered game engine.

Start by inspecting the project and creating a concise implementation plan. Then begin with Stage 1.
