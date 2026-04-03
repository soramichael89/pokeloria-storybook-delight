export interface Character {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky';
  image?: string;
}
