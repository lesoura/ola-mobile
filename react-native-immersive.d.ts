declare module 'react-native-immersive' {
  export function on(): void;
  export function off(): void;
  export function setBarMode(mode: 'immersive' | 'leanback' | 'sticky-immersive'): void;
}
