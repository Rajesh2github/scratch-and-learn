import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateAdditionQuestions } from '../../src/features/math/mathEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function AdditionScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateAdditionQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Add the Objects"
      categoryName="Math"
      themeColor="#4D96FF"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
