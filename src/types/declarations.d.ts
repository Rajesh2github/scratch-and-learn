declare module 'react-native-confetti-cannon' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface ConfettiCannonProps extends ViewProps {
    count: number;
    origin: { x: number; y: number };
    autoStart?: boolean;
    autoStartDelay?: number;
    colors?: string[];
    fallSpeed?: number;
    fadeOut?: boolean;
    explosionSpeed?: number;
    onAnimationEnd?: () => void;
    onAnimationStart?: () => void;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {}
}
