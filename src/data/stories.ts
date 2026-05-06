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
  /** Pages de l'animation 3D : [recto1, verso1, recto2, verso2, ...] (14 entrées = 7 pages recto/verso) */
  bookPages?: string[];
}
