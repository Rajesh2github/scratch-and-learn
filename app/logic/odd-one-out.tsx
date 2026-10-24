import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateOddOneOutQuestions } from '../../src/features/logic/logicEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function OddOneOutScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateOddOneOutQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Odd One Out"
      categoryName="Logic"
      themeColor="#ff9f43"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
