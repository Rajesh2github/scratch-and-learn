import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateTapAndHearQuestions } from '../../src/features/words/wordEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function TapAndHearScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateTapAndHearQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Tap & Hear"
      categoryName="Words"
      themeColor="#FF6B6B"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
