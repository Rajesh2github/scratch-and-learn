import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateCountingQuestions } from '../../src/features/math/mathEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function CountingScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateCountingQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Count the Objects"
      categoryName="Math"
      themeColor="#6BCB77"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
