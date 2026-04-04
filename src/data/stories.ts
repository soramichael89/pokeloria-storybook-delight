export interface StoryPage {
  text: string;
  type: 'text' | 'text-image' | 'immersive';
  image?: string;
}

export interface Story {
  id: string;
  title: string;
  theme: string;
  emoji: string;
  colorKey: 'peach' | 'lavender' | 'sage' | 'sky' | 'winter' | 'snow';
  coverImage: string;
  pages: StoryPage[];
}
