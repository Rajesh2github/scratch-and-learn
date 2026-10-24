import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateSubtractionQuestions } from '../../src/features/math/mathEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function SubtractionScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateSubtractionQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Take Some Away"
      categoryName="Math"
      themeColor="#FF6B6B"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
