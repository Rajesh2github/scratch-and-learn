import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateMatchingQuestions } from '../../src/features/logic/logicEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function MatchingScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateMatchingQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Picture Match"
      categoryName="Logic"
      themeColor="#54a0ff"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
