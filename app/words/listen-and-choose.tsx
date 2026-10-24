import React, { useCallback } from 'react';
import { GameShell } from '../../src/components/GameShell';
import { generateListenAndChooseQuestions } from '../../src/features/words/wordEngine';
import { recordGameSession } from '../../src/storage/progress';
import { Difficulty } from '../../src/domain/types';

export default function ListenAndChooseScreen() {
  const loadQuestions = useCallback((difficulty: Difficulty) => {
    return generateListenAndChooseQuestions(6, difficulty);
  }, []);

  return (
    <GameShell
      title="Listen & Choose"
      categoryName="Words"
      themeColor="#ff9f43"
      getQuestions={loadQuestions}
      onComplete={(result) => {
        recordGameSession(result);
      }}
    />
  );
}
