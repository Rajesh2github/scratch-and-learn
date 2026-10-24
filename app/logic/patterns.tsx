import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generatePatternQuestions } from '../../src/features/logic/logicEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function PatternsScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generatePatternQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="What Comes Next?"
      categoryName="Logic"
      themeColor="#5f27cd"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
