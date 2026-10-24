export interface TraceableCharacter {
  char: string;
  name: string;
  emoji: string;
  category: 'number' | 'letter';
  hint: string;
}

export const NUMBER_CHARACTERS: TraceableCharacter[] = [
  { char: '1', name: 'One', emoji: '🍎', category: 'number', hint: 'Straight line down!' },
  { char: '2', name: 'Two', emoji: '🦆', category: 'number', hint: 'Around and back on the railroad track!' },
  { char: '3', name: 'Three', emoji: '🦋', category: 'number', hint: 'Around a tree and around a tree!' },
  { char: '4', name: 'Four', emoji: '🚗', category: 'number', hint: 'Down and across and down once more!' },
  { char: '5', name: 'Five', emoji: '⭐', category: 'number', hint: 'Short neck, belly fat, number 5 wears a hat!' },
  { char: '6', name: 'Six', emoji: '🍒', category: 'number', hint: 'Down we go and make a loop!' },
  { char: '7', name: 'Seven', emoji: '🌈', category: 'number', hint: 'Across the sky and down from heaven!' },
  { char: '8', name: 'Eight', emoji: '🎈', category: 'number', hint: 'Make an S and do not wait, climb back up to make an 8!' },
  { char: '9', name: 'Nine', emoji: '🚀', category: 'number', hint: 'A loop and a line make number 9!' },
  { char: '10', name: 'Ten', emoji: '🔟', category: 'number', hint: 'One with a zero makes a hero!' },
];

export const LETTER_CHARACTERS: TraceableCharacter[] = [
  { char: 'A', name: 'Apple', emoji: '🍎', category: 'letter', hint: 'A is for Apple!' },
  { char: 'B', name: 'Ball', emoji: '⚽', category: 'letter', hint: 'B is for Ball!' },
  { char: 'C', name: 'Cat', emoji: '🐱', category: 'letter', hint: 'C is for Cat!' },
  { char: 'D', name: 'Dog', emoji: '🐶', category: 'letter', hint: 'D is for Dog!' },
  { char: 'E', name: 'Elephant', emoji: '🐘', category: 'letter', hint: 'E is for Elephant!' },
  { char: 'F', name: 'Fish', emoji: '🐟', category: 'letter', hint: 'F is for Fish!' },
  { char: 'G', name: 'Grapes', emoji: '🍇', category: 'letter', hint: 'G is for Grapes!' },
  { char: 'H', name: 'Hat', emoji: '🎩', category: 'letter', hint: 'H is for Hat!' },
  { char: 'I', name: 'Ice Cream', emoji: '🍦', category: 'letter', hint: 'I is for Ice Cream!' },
  { char: 'J', name: 'Juice', emoji: '🧃', category: 'letter', hint: 'J is for Juice!' },
  { char: 'K', name: 'Kite', emoji: '🪁', category: 'letter', hint: 'K is for Kite!' },
  { char: 'L', name: 'Lion', emoji: '🦁', category: 'letter', hint: 'L is for Lion!' },
  { char: 'M', name: 'Monkey', emoji: '🐵', category: 'letter', hint: 'M is for Monkey!' },
  { char: 'N', name: 'Nest', emoji: '🪺', category: 'letter', hint: 'N is for Nest!' },
  { char: 'O', name: 'Orange', emoji: '🍊', category: 'letter', hint: 'O is for Orange!' },
  { char: 'P', name: 'Panda', emoji: '🐼', category: 'letter', hint: 'P is for Panda!' },
  { char: 'Q', name: 'Queen', emoji: '👑', category: 'letter', hint: 'Q is for Queen!' },
  { char: 'R', name: 'Rocket', emoji: '🚀', category: 'letter', hint: 'R is for Rocket!' },
  { char: 'S', name: 'Sun', emoji: '☀️', category: 'letter', hint: 'S is for Sun!' },
  { char: 'T', name: 'Tiger', emoji: '🐯', category: 'letter', hint: 'T is for Tiger!' },
  { char: 'U', name: 'Umbrella', emoji: '☂️', category: 'letter', hint: 'U is for Umbrella!' },
  { char: 'V', name: 'Van', emoji: '🚐', category: 'letter', hint: 'V is for Van!' },
  { char: 'W', name: 'Watermelon', emoji: '🍉', category: 'letter', hint: 'W is for Watermelon!' },
  { char: 'X', name: 'Xylophone', emoji: '🎵', category: 'letter', hint: 'X is for Xylophone!' },
  { char: 'Y', name: 'Yo-yo', emoji: '🪀', category: 'letter', hint: 'Y is for Yo-yo!' },
  { char: 'Z', name: 'Zebra', emoji: '🦓', category: 'letter', hint: 'Z is for Zebra!' },
];
